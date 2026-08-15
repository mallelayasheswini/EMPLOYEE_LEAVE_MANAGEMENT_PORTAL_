import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Role } from '@/lib/types';
import { formatDate, formatLeaveType } from '@/lib/utils';

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
    const { managerComment } = await req.json();

    if (!managerComment || !managerComment.trim()) {
      return NextResponse.json(
        { error: 'A rejection reason (manager comment) is required when rejecting a leave request.' },
        { status: 400 }
      );
    }

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id },
    });

    if (!leaveRequest) {
      return NextResponse.json({ error: 'Leave request not found.' }, { status: 404 });
    }

    if (leaveRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: `Request cannot be rejected because it is already ${leaveRequest.status}.` },
        { status: 400 }
      );
    }

    const startStr = formatDate(leaveRequest.startDate);
    const endStr = formatDate(leaveRequest.endDate);
    const typeStr = formatLeaveType(leaveRequest.leaveType);
    const trimmedComment = managerComment.trim();

    const [updated] = await prisma.$transaction([
      prisma.leaveRequest.update({
        where: { id },
        data: {
          status: 'REJECTED',
          managerComment: trimmedComment,
        },
      }),
      prisma.notification.create({
        data: {
          userId: leaveRequest.userId,
          title: 'Leave Application Rejected ❌',
          message: `Your ${typeStr} request for ${startStr} to ${endStr} (${leaveRequest.days} day(s)) was rejected. Reason: "${trimmedComment}"`,
          type: 'DANGER',
        },
      }),
    ]);

    return NextResponse.json({
      message: 'Leave request rejected. Rejection reason notification sent to employee.',
      leave: updated,
    });
  } catch (error) {
    console.error('Reject Leave Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
