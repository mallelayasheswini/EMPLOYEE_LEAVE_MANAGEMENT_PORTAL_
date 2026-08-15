import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { calculateLeaveDays, checkLeaveOverlap, checkSufficientBalance } from '@/lib/validations';
import { LeaveType } from '@/lib/types';
import { formatLeaveType, formatDate } from '@/lib/utils';
import { sendLeaveNotificationEmail } from '@/lib/email';
import { logToAWSCloudWatch } from '@/lib/aws-cloudwatch';
import { publishAlertToAWS_SNS } from '@/lib/aws-sns';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authUser = getUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status');

    const whereClause: any = {
      userId: authUser.userId,
    };

    if (statusFilter && statusFilter !== 'ALL') {
      whereClause.status = statusFilter;
    }

    const leaves = await prisma.leaveRequest.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ leaves });
  } catch (error) {
    console.error('Fetch Leaves Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = getUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { leaveType, startDate, endDate, reason, attachmentUrl, s3Key } = await req.json();

    if (!leaveType || !startDate || !endDate || !reason) {
      return NextResponse.json(
        { error: 'Leave type, start date, end date, and reason are required.' },
        { status: 400 }
      );
    }

    // Validate LeaveType
    if (!Object.values(LeaveType).includes(leaveType)) {
      return NextResponse.json({ error: 'Invalid leave type specified.' }, { status: 400 });
    }

    // 1. Calculate duration
    const days = calculateLeaveDays(startDate, endDate);
    if (days <= 0) {
      return NextResponse.json(
        { error: 'End date must be on or after start date.' },
        { status: 400 }
      );
    }

    // 2. Check overlap
    const isOverlapping = await checkLeaveOverlap(authUser.userId, startDate, endDate);
    if (isOverlapping) {
      return NextResponse.json(
        { error: 'You already have an active or pending leave request overlapping with these dates.' },
        { status: 400 }
      );
    }

    // 3. Check sufficient balance (for CASUAL, SICK, EARNED)
    const balanceCheck = await checkSufficientBalance(authUser.userId, leaveType, days);
    if (!balanceCheck.hasBalance) {
      return NextResponse.json(
        { error: balanceCheck.error || 'Insufficient leave balance.' },
        { status: 400 }
      );
    }

    // 4. Save leave request as PENDING
    const newRequest = await prisma.leaveRequest.create({
      data: {
        userId: authUser.userId,
        leaveType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        days,
        reason: reason.trim(),
        status: 'PENDING',
        attachmentUrl: attachmentUrl || null,
        s3Key: s3Key || null,
      },
    });

    const typeStr = formatLeaveType(leaveType);

    // 🌐 AWS CloudWatch Logging & AWS SNS Alert Publishing
    await Promise.allSettled([
      logToAWSCloudWatch(
        `Leave Request Created: Employee ${authUser.name} (${authUser.email}) submitted ${typeStr} for ${days} day(s).`,
        'INFO'
      ),
      publishAlertToAWS_SNS(
        'New Leave Application Alert',
        `Employee ${authUser.name} (${authUser.department}) applied for ${days} day(s) of ${typeStr}.`
      ),
    ]);

    // 5. Notify all Admins in Database (including Yasheswini Mallela)
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true, email: true, name: true },
    });

    if (adminUsers.length > 0) {
      await prisma.notification.createMany({
        data: adminUsers.map((a) => ({
          userId: a.id,
          title: 'New Leave Request Submitted 📩',
          message: `${authUser.name} submitted a ${typeStr} request for ${days} day(s). Action required.`,
          type: 'INFO',
        })),
      });

      // 6. Trigger Email Notification to Admin (Yasheswini Mallela)
      const primaryAdmin = adminUsers.find((a) => a.email.toLowerCase() === 'yasheswinireddy18@gmail.com') || adminUsers[0];

      await sendLeaveNotificationEmail({
        managerEmail: primaryAdmin.email,
        managerName: primaryAdmin.name,
        employeeName: authUser.name,
        employeeEmail: authUser.email,
        department: authUser.department,
        leaveType: typeStr,
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        days,
        reason: reason.trim(),
      });
    }

    return NextResponse.json(
      {
        message: 'Leave application submitted successfully. Pending admin review.',
        leave: newRequest,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Apply Leave Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
