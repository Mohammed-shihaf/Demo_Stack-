'use strict';

const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

class SesEmailNotifier {
  constructor({ region = 'us-east-1', endpoint, fromEmail = 'notifications@example.com' } = {}) {
    this.fromEmail = fromEmail;
    this.sentEmails = [];
    if (process.env.NODE_ENV !== 'test' && endpoint) {
      try {
        this.client = new SESClient({
          region,
          endpoint,
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

  async sendRecordCreatedNotification(record, recipientEmail = 'admin@example.com') {
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
    } catch (err) {
      console.warn(`[SesEmailNotifier] SendEmail error: ${err.message}`);
      return emailRecord;
    }
  }
}

module.exports = SesEmailNotifier;
