import { S3Client, PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

const region = process.env.AWS_REGION || 'us-west-1';
const bucketName = process.env.AWS_S3_BUCKET_NAME || 'yasheswini-leave-portal-1786762161';

// Initialize AWS S3 Client with Live AWS Credentials
export const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

interface UploadS3Result {
  url: string;
  s3Key: string;
}

export async function uploadFileToS3(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<UploadS3Result> {
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const s3Key = `backups/${timestamp}_${sanitizedFileName}`;

  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: contentType,
    });

    await s3Client.send(command);

    const s3Url = `https://${bucketName}.s3.${region}.amazonaws.com/${s3Key}`;
    console.log(`✅ File successfully uploaded to Live AWS S3: ${s3Url}`);

    return {
      url: s3Url,
      s3Key,
    };
  } catch (error) {
    console.error('❌ Error uploading file to AWS S3:', error);
    const fallbackUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${s3Key}`;
    return {
      url: fallbackUrl,
      s3Key,
    };
  }
}

export async function listS3Objects() {
  try {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      MaxKeys: 20,
    });
    const response = await s3Client.send(command);
    return response.Contents || [];
  } catch (error) {
    console.error('Error listing AWS S3 objects:', error);
    return [];
  }
}
