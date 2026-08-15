import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, hashPassword } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { LeaveType, Role } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const authUser = getUserFromRequest(req);
    if (!authUser || authUser.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    const { name, email, password, department, role } = await req.json();

    if (!name || !email || !password || !department) {
      return NextResponse.json(
        { error: 'Name, email, password, and department are required.' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const assignedRole = role === 'ADMIN' ? Role.ADMIN : Role.EMPLOYEE;

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        department,
        role: assignedRole,
        leaveBalances: {
          create: [
            { leaveType: LeaveType.CASUAL, allocated: 12, used: 0 },
            { leaveType: LeaveType.SICK, allocated: 10, used: 0 },
            { leaveType: LeaveType.EARNED, allocated: 15, used: 0 },
            { leaveType: LeaveType.UNPAID, allocated: 0, used: 0 },
          ],
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: `Account for ${user.name} created successfully with role ${user.role}.`,
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Admin Create User Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
