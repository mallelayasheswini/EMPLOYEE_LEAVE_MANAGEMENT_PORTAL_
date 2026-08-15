import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { Role } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'employee-leave-portal-super-secret-jwt-key-2026';

export interface TokenPayload {
  userId: string;
  email: string;
  role: Role;
  name: string;
  department: string;
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export function comparePassword(password: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(password, hashed);
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as TokenPayload;
    // Sanity check: Ensure userId matches a valid 24-character hexadecimal MongoDB BSON ObjectId
    if (payload && payload.userId && !/^[0-9a-fA-F]{24}$/.test(payload.userId)) {
      return null; // Reject legacy SQLite UUID tokens cleanly
    }
    return payload;
  } catch (error) {
    return null;
  }
}

export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export function getUserFromRequest(req: NextRequest): TokenPayload | null {
  // Check cookie first
  const cookieToken = req.cookies.get('token')?.value;
  if (cookieToken) {
    const payload = verifyToken(cookieToken);
    if (payload) return payload;
  }

  // Fallback to Bearer token in Auth Header
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return verifyToken(token);
  }

  return null;
}
