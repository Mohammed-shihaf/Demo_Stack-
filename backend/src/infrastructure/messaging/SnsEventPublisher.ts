import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { SnsPort } from '../../application/use-cases/RecordUseCases';

export class SnsEventPublisher implements SnsPort {
  public topicArn: string;
  public publishedEvents: any[];
  public client: SNSClient | null;

  constructor(options: { region?: string; endpoint?: string; topicArn?: string } = {}) {
    this.topicArn = options.topicArn || 'arn:aws:sns:us-east-1:000000000000:records-topic';
    this.publishedEvents = [];
    if (process.env.NODE_ENV !== 'test' && options.endpoint) {
      try {
        this.client = new SNSClient({
          region: options.region || 'us-east-1',
          endpoint: options.endpoint,
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
          },
        });
      } catch (e) {
        this.client = null;
      }
    } else {
      this.client = null;
    }
  }

  async publishRecordCreated(record: any): Promise<any> {
    const payload = {
      eventType: 'RECORD_CREATED',
      data: record,
      timestamp: new Date().toISOString(),
    };
    this.publishedEvents.push(payload);

    if (!this.client || !this.topicArn) return payload;

    try {
      const command = new PublishCommand({
        TopicArn: this.topicArn,
        Message: JSON.stringify(payload),
        Subject: `New Record Created: ${record.title}`,
      });
      const response = await this.client.send(command);
      return { ...payload, messageId: response.MessageId };
    } catch (err: any) {
      console.warn(`[SnsEventPublisher] Publish error: ${err.message}`);
      return payload;
    }
  }
}

export default SnsEventPublisher;
