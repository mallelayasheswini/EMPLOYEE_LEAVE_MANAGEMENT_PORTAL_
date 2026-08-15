import { LeaveType } from './types';
import prisma from './prisma';

/**
 * Calculates the number of calendar days between start and end dates (inclusive).
 */
export function calculateLeaveDays(startDateStr: string, endDateStr: string): number {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  // Normalize time to midnight UTC for clean day difference
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const diffTime = end.getTime() - start.getTime();
  if (diffTime < 0) return 0;

  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
}

/**
 * Checks if the requested date range overlaps with any existing non-cancelled and non-rejected request for the user.
 */
export async function checkLeaveOverlap(
  userId: string,
  startDateStr: string,
  endDateStr: string,
  excludeRequestId?: string
): Promise<boolean> {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  const existingRequests = await prisma.leaveRequest.findMany({
    where: {
      userId,
      status: {
        in: ['PENDING', 'APPROVED'],
      },
      id: excludeRequestId ? { not: excludeRequestId } : undefined,
    },
  });

  for (const req of existingRequests) {
    const reqStart = new Date(req.startDate);
    const reqEnd = new Date(req.endDate);

    // Overlap occurs if requested start <= req end AND requested end >= req start
    if (start <= reqEnd && end >= reqStart) {
      return true;
    }
  }

  return false;
}

/**
 * Checks if user has sufficient available leave balance for limited leave types (CASUAL, SICK, EARNED).
 * Available balance = allocated - used.
 * UNPAID leave has no upper limit.
 */
export async function checkSufficientBalance(
  userId: string,
  leaveType: LeaveType,
  requestedDays: number
): Promise<{ hasBalance: boolean; available: number; error?: string }> {
  if (leaveType === LeaveType.UNPAID) {
    return { hasBalance: true, available: 999 };
  }

  const balance = await prisma.leaveBalance.findUnique({
    where: {
      userId_leaveType: {
        userId,
        leaveType,
      },
    },
  });

  if (!balance) {
    return {
      hasBalance: false,
      available: 0,
      error: `No leave balance record found for ${leaveType} leave.`,
    };
  }

  const available = balance.allocated - balance.used;

  if (requestedDays > available) {
    return {
      hasBalance: false,
      available,
      error: `Insufficient ${leaveType} leave balance. Requested: ${requestedDays} day(s), Available: ${available} day(s).`,
    };
  }

  return { hasBalance: true, available };
}
