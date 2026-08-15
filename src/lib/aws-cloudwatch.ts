import {
  CloudWatchLogsClient,
  PutLogEventsCommand,
  CreateLogGroupCommand,
  CreateLogStreamCommand,
  DescribeLogStreamsCommand,
} from '@aws-sdk/client-cloudwatch-logs';

const region = process.env.AWS_REGION || 'us-west-1';
const logGroupName = '/aws/leave-management-portal/logs';
const logStreamName = 'application-audit-stream';

export const cloudWatchClient = new CloudWatchLogsClient({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

let logGroupInitialized = false;

async function ensureLogStreamExists() {
  if (logGroupInitialized) return;

  try {
    // 1. Create Log Group if needed
    try {
      await cloudWatchClient.send(new CreateLogGroupCommand({ logGroupName }));
    } catch (e: any) {
      if (e.name !== 'ResourceAlreadyExistsException') console.warn('CloudWatch LogGroup info:', e.message);
    }

    // 2. Create Log Stream if needed
    try {
      await cloudWatchClient.send(
        new CreateLogStreamCommand({ logGroupName, logStreamName })
      );
    } catch (e: any) {
      if (e.name !== 'ResourceAlreadyExistsException') console.warn('CloudWatch LogStream info:', e.message);
    }

    logGroupInitialized = true;
  } catch (error) {
    console.error('Error initializing AWS CloudWatch Logs:', error);
  }
}

export async function logToAWSCloudWatch(message: string, level: 'INFO' | 'WARN' | 'ERROR' = 'INFO') {
  const timestamp = Date.now();
  const formattedMessage = `[AWS-CLOUDWATCH] [${level}] ${message}`;
  console.log(formattedMessage);

  try {
    await ensureLogStreamExists();

    const command = new PutLogEventsCommand({
      logGroupName,
      logStreamName,
      logEvents: [
        {
          message: JSON.stringify({
            timestamp: new Date().toISOString(),
            level,
            message,
            environment: 'Production AWS Cloud',
          }),
          timestamp,
        },
      ],
    });

    await cloudWatchClient.send(command);
    console.log('✅ Log successfully streamed to AWS CloudWatch!');
  } catch (error: any) {
    console.warn('AWS CloudWatch Log Warning:', error.message);
  }
}
