import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Role } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authUser = getUserFromRequest(req);
    if (!authUser || authUser.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    const [totalEmployees, totalRequests, pendingRequests, approvedRequests, rejectedRequests] =
      await Promise.all([
        prisma.user.count({ where: { role: Role.EMPLOYEE } }),
        prisma.leaveRequest.count(),
        prisma.leaveRequest.count({ where: { status: 'PENDING' } }),
        prisma.leaveRequest.count({ where: { status: 'APPROVED' } }),
        prisma.leaveRequest.count({ where: { status: 'REJECTED' } }),
      ]);

    // Breakdown by Leave Type
    const leaveTypeCounts = await prisma.leaveRequest.groupBy({
      by: ['leaveType'],
      _count: { id: true },
    });

    // Breakdown by Department
    const employees = await prisma.user.findMany({
      where: { role: Role.EMPLOYEE },
      select: {
        department: true,
        _count: {
          select: { leaveRequests: true },
        },
      },
    });

    const deptMap: Record<string, number> = {};
    employees.forEach((emp) => {
      deptMap[emp.department] = (deptMap[emp.department] || 0) + 1;
    });

    const recentRequests = await prisma.leaveRequest.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true, department: true },
        },
      },
    });

    return NextResponse.json({
      stats: {
        totalEmployees,
        totalRequests,
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        leaveTypeCounts,
        departments: Object.entries(deptMap).map(([department, count]) => ({ department, count })),
        recentRequests,
      },
    });
  } catch (error) {
    console.error('Admin Stats Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
