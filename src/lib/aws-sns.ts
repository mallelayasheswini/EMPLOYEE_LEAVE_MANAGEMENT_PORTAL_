import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

const region = process.env.AWS_REGION || 'us-west-1';

export const snsClient = new SNSClient({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export async function publishAlertToAWS_SNS(subject: string, message: string) {
  try {
    const command = new PublishCommand({
      Message: JSON.stringify({
        subject,
        message,
        source: 'Employee Leave Portal AWS Integration',
        timestamp: new Date().toISOString(),
      }),
      Subject: subject,
      TopicArn: process.env.AWS_SNS_TOPIC_ARN || undefined,
    });

    if (process.env.AWS_SNS_TOPIC_ARN) {
      const response = await snsClient.send(command);
      console.log(`✅ AWS SNS Notification Published! MessageId: ${response.MessageId}`);
      return { success: true, messageId: response.MessageId };
    } else {
      console.log(`[AWS SNS ALERT] ${subject}: ${message}`);
      return { success: true, simulated: true };
    }
  } catch (error: any) {
    console.warn('AWS SNS Publish Warning:', error.message);
    return { success: false, error: error.message };
  }
}
