import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, signToken } from '@/lib/auth';
import { LeaveType, Role } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, department, managerId } = await req.json();

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
    const userRole = Role.EMPLOYEE; // Public self-registration is strictly EMPLOYEE role

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        department,
        managerId: managerId || null,
        role: userRole,
        leaveBalances: {
          create: [
            { leaveType: LeaveType.CASUAL, allocated: 12, used: 0 },
            { leaveType: LeaveType.SICK, allocated: 10, used: 0 },
            { leaveType: LeaveType.EARNED, allocated: 15, used: 0 },
            { leaveType: LeaveType.PARENTAL, allocated: 90, used: 0 },
            { leaveType: LeaveType.SECONDARY_PARENTAL, allocated: 14, used: 0 },
            { leaveType: LeaveType.SPECIAL_MEDICAL, allocated: 30, used: 0 },
            { leaveType: LeaveType.MENSTRUAL, allocated: 12, used: 0 },
            { leaveType: LeaveType.ADOPTION, allocated: 60, used: 0 },
            { leaveType: LeaveType.CHARITABLE, allocated: 5, used: 0 },
            { leaveType: LeaveType.UNPAID, allocated: 0, used: 0 },
          ],
        },
      },
    });

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      department: user.department,
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
