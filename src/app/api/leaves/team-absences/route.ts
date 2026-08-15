import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authUser = getUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    if (!startDateParam || !endDateParam) {
      return NextResponse.json({ absences: [], totalCount: 0 });
    }

    const start = new Date(startDateParam);
    const end = new Date(endDateParam);

    // Query active approved/pending leave requests that overlap with the selected dates
    const overlappingRequests = await prisma.leaveRequest.findMany({
      where: {
        status: { in: ['APPROVED', 'PENDING'] },
        startDate: { lte: end },
        endDate: { gte: start },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            department: true,
          },
        },
      },
      orderBy: { startDate: 'asc' },
    });

    const absences = overlappingRequests.map((r) => ({
      id: r.id,
      employeeName: r.user.name,
      department: r.user.department,
      leaveType: r.leaveType,
      status: r.status,
      startDate: r.startDate,
      endDate: r.endDate,
      days: r.days,
      isCurrentUser: r.userId === authUser.userId,
    }));

    return NextResponse.json({
      absences,
      totalCount: absences.length,
    });
  } catch (error) {
    console.error('Fetch Team Absences Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
