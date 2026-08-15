import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const region = process.env.AWS_REGION || 'us-west-1';

export const sesClient = new SESClient({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

interface AwsSesEmailParams {
  toEmail: string;
  subject: string;
  htmlContent: string;
}

export async function sendEmailViaAWS_SES({ toEmail, subject, htmlContent }: AwsSesEmailParams) {
  const senderEmail = process.env.ADMIN_NOTIFY_EMAIL || 'yasheswinireddy18@gmail.com';

  const command = new SendEmailCommand({
    Source: senderEmail,
    Destination: {
      ToAddresses: [toEmail],
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: 'UTF-8',
      },
      Body: {
        Html: {
          Data: htmlContent,
          Charset: 'UTF-8',
        },
      },
    },
  });

  try {
    const response = await sesClient.send(command);
    console.log(`✅ Email sent via AWS SES to ${toEmail}. MessageId: ${response.MessageId}`);
    return { success: true, messageId: response.MessageId };
  } catch (error: any) {
    console.warn(`AWS SES Email Info (${error.message}). System using primary SMTP transporter.`);
    return { success: false, error: error.message };
  }
}
