import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = getUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id },
    });

    if (!leaveRequest) {
      return NextResponse.json({ error: 'Leave request not found.' }, { status: 404 });
    }

    // Verify ownership
    if (leaveRequest.userId !== authUser.userId && authUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden. You can only cancel your own leave requests.' },
        { status: 403 }
      );
    }

    // Can only cancel PENDING requests
    if (leaveRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: `Cannot cancel a leave request that is already ${leaveRequest.status}.` },
        { status: 400 }
      );
    }

    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    return NextResponse.json({
      message: 'Leave request cancelled successfully.',
      leave: updated,
    });
  } catch (error) {
    console.error('Cancel Leave Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
