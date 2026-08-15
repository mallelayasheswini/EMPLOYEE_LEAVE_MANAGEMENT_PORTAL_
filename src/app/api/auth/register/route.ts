import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, signToken } from '@/lib/auth';
import { LeaveType, Role } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, department, gender, managerId } = await req.json();

    if (!name || !email || !password || !department) {
      return NextResponse.json(
        { error: 'Name, email, password, and department are required.' },
        { status: 400 }
      );
    }

    const userGender = (gender || 'FEMALE').toUpperCase();

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
    const userRole = Role.EMPLOYEE; // Public self-registration is strictly EMPLOYEE role

    // Base statutory leave balances for all employees (Unpaid Leave set to 14 Days)
    const initialBalances: Array<{ leaveType: string; allocated: number; used: number }> = [
      { leaveType: LeaveType.CASUAL, allocated: 12, used: 0 },
      { leaveType: LeaveType.SICK, allocated: 10, used: 0 },
      { leaveType: LeaveType.EARNED, allocated: 15, used: 0 },
      { leaveType: LeaveType.PARENTAL, allocated: 90, used: 0 },
      { leaveType: LeaveType.SECONDARY_PARENTAL, allocated: 14, used: 0 },
      { leaveType: LeaveType.SPECIAL_MEDICAL, allocated: 30, used: 0 },
      { leaveType: LeaveType.ADOPTION, allocated: 60, used: 0 },
      { leaveType: LeaveType.CHARITABLE, allocated: 5, used: 0 },
      { leaveType: LeaveType.UNPAID, allocated: 14, used: 0 },
    ];

    // Menstrual leave allocated ONLY for Female employees
    if (userGender === 'FEMALE') {
      initialBalances.push({ leaveType: LeaveType.MENSTRUAL, allocated: 12, used: 0 });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        department,
        gender: userGender,
        managerId: managerId || null,
        role: userRole,
        leaveBalances: {
          create: initialBalances,
        },
      },
    });

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      department: user.department,
      gender: userGender,
      role: userRole as Role,
    };

    const token = signToken(tokenPayload);

    const response = NextResponse.json(
      {
        message: 'Registration successful',
        user: tokenPayload,
      },
      { status: 201 }
    );

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
