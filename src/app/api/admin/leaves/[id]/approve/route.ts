import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Role, LeaveType } from '@/lib/types';
import { formatDate, formatLeaveType } from '@/lib/utils';
import { logToAWSCloudWatch } from '@/lib/aws-cloudwatch';
import { publishAlertToAWS_SNS } from '@/lib/aws-sns';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = getUserFromRequest(req);
    if (!authUser || authUser.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    const { id } = params;

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!leaveRequest) {
      return NextResponse.json({ error: 'Leave request not found.' }, { status: 404 });
    }

    if (leaveRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: `Request cannot be approved because it is already ${leaveRequest.status}.` },
        { status: 400 }
      );
    }

    // Check balance for limited leave types
    if (leaveRequest.leaveType !== LeaveType.UNPAID) {
      const balance = await prisma.leaveBalance.findUnique({
        where: {
          userId_leaveType: {
            userId: leaveRequest.userId,
            leaveType: leaveRequest.leaveType,
          },
        },
      });

      if (!balance) {
        return NextResponse.json(
          { error: `Leave balance record not found for user ${leaveRequest.user.name}.` },
          { status: 400 }
        );
      }

      const available = balance.allocated - balance.used;
      if (leaveRequest.days > available) {
        return NextResponse.json(
          {
            error: `Cannot approve. User has insufficient balance. Available: ${available} day(s), Requested: ${leaveRequest.days} day(s).`,
          },
          { status: 400 }
        );
      }
    }

    const startStr = formatDate(leaveRequest.startDate);
    const endStr = formatDate(leaveRequest.endDate);
    const typeStr = formatLeaveType(leaveRequest.leaveType);

    // Execute atomic approval transaction and create employee notification
    const [updatedRequest, updatedBalance] = await prisma.$transaction([
      prisma.leaveRequest.update({
        where: { id },
        data: { status: 'APPROVED' },
      }),
      prisma.leaveBalance.update({
        where: {
          userId_leaveType: {
            userId: leaveRequest.userId,
            leaveType: leaveRequest.leaveType,
          },
        },
        data: {
          used: {
            increment: leaveRequest.days,
          },
        },
      }),
      prisma.notification.create({
        data: {
          userId: leaveRequest.userId,
          title: 'Leave Application Approved 🎉',
          message: `Your ${typeStr} request for ${startStr} to ${endStr} (${leaveRequest.days} day(s)) has been approved by the manager.`,
          type: 'SUCCESS',
        },
      }),
    ]);

    // 🌐 Stream Audit Event to AWS CloudWatch & AWS SNS
    await Promise.allSettled([
      logToAWSCloudWatch(
        `Leave Request Approved by Admin ${authUser.name} for Employee ${leaveRequest.user.name} (${typeStr}, ${leaveRequest.days} days).`,
        'INFO'
      ),
      publishAlertToAWS_SNS(
        'Leave Approval Confirmation',
        `Leave request for ${leaveRequest.user.name} was approved by Admin ${authUser.name}.`
      ),
    ]);

    return NextResponse.json({
      message: 'Leave request approved successfully. Notification sent to employee.',
      leave: updatedRequest,
      balance: updatedBalance,
    });
  } catch (error) {
    console.error('Approve Leave Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
