import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { uploadFileToS3 } from '@/lib/aws-s3';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const authUser = getUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No document file provided for upload.' }, { status: 400 });
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds maximum 5MB limit.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const s3Result = await uploadFileToS3(buffer, file.name, file.type || 'application/octet-stream');

    return NextResponse.json({
      message: 'Document uploaded to AWS S3 successfully!',
      attachmentUrl: s3Result.url,
      s3Key: s3Result.s3Key,
      fileName: file.name,
    });
  } catch (error) {
    console.error('AWS S3 Upload Route Error:', error);
    return NextResponse.json({ error: 'Failed to upload document to AWS S3.' }, { status: 500 });
  }
}
