import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { uploadFileToS3, listS3Objects } from '@/lib/aws-s3';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authUser = getUserFromRequest(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized Admin Access' }, { status: 403 });
    }

    const objects = await listS3Objects();
    return NextResponse.json({
      bucket: process.env.AWS_S3_BUCKET_NAME,
      region: process.env.AWS_REGION,
      backups: objects.map((o) => ({
        key: o.Key,
        size: o.Size,
        lastModified: o.LastModified,
        url: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${o.Key}`,
      })),
    });
  } catch (error) {
    console.error('AWS S3 List Error:', error);
    return NextResponse.json({ error: 'Failed to list AWS S3 backups' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = getUserFromRequest(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized Admin Access' }, { status: 403 });
    }

    // 1. Fetch complete MongoDB dataset
    const [users, leaves, balances] = await Promise.all([
      prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true, department: true, createdAt: true },
      }),
      prisma.leaveRequest.findMany({
        include: { user: { select: { name: true, email: true, department: true } } },
      }),
      prisma.leaveBalance.findMany(),
    ]);

    const backupData = {
      timestamp: new Date().toISOString(),
      triggeredBy: authUser.email,
      environment: 'AWS Cloud Integration Live',
      summary: {
        totalUsers: users.length,
        totalLeaveRequests: leaves.length,
        totalBalanceRecords: balances.length,
      },
      data: {
        users,
        leaveRequests: leaves,
        leaveBalances: balances,
      },
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const buffer = Buffer.from(jsonString, 'utf-8');
    const fileName = `leave_portal_backup_${Date.now()}.json`;

    // 2. Upload directly to Live AWS S3 Cloud Bucket
    const s3Result = await uploadFileToS3(buffer, fileName, 'application/json');

    return NextResponse.json({
      message: 'System database backed up directly to Live AWS S3 Cloud Bucket!',
      s3Url: s3Result.url,
      s3Key: s3Result.s3Key,
      bucket: process.env.AWS_S3_BUCKET_NAME,
      region: process.env.AWS_REGION,
      timestamp: backupData.timestamp,
    });
  } catch (error) {
    console.error('AWS S3 Backup POST Error:', error);
    return NextResponse.json({ error: 'Failed to upload backup to AWS S3.' }, { status: 500 });
  }
}
