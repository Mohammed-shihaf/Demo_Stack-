import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { SesPort } from '../../application/use-cases/RecordUseCases';

export class SesEmailNotifier implements SesPort {
  public fromEmail: string;
  public sentEmails: any[];
  public client: SESClient | null;

  constructor(options: { region?: string; endpoint?: string; fromEmail?: string } = {}) {
    this.fromEmail = options.fromEmail || 'notifications@example.com';
    this.sentEmails = [];
    if (process.env.NODE_ENV !== 'test' && options.endpoint) {
      try {
        this.client = new SESClient({
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

  async sendRecordCreatedNotification(record: any, recipientEmail: string = 'admin@example.com'): Promise<any> {
    const emailRecord = {
      from: this.fromEmail,
      to: recipientEmail,
      subject: `Notification: New Record Created - ${record.title}`,
      body: `Record ID: ${record.id}\nTitle: ${record.title}\nDescription: ${record.description}\nCreated At: ${record.createdAt}`,
      timestamp: new Date().toISOString(),
    };
    this.sentEmails.push(emailRecord);

    if (!this.client) return emailRecord;

    try {
      const command = new SendEmailCommand({
        Source: this.fromEmail,
        Destination: {
          ToAddresses: [recipientEmail],
        },
        Message: {
          Subject: {
            Data: emailRecord.subject,
            Charset: 'UTF-8',
          },
          Body: {
            Text: {
              Data: emailRecord.body,
              Charset: 'UTF-8',
            },
          },
        },
      });
      const response = await this.client.send(command);
      return { ...emailRecord, messageId: response.MessageId };
    } catch (err: any) {
      console.warn(`[SesEmailNotifier] SendEmail error: ${err.message}`);
      return emailRecord;
    }
  }
}

export default SesEmailNotifier;
