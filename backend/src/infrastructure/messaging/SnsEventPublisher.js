'use strict';

const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');

class SnsEventPublisher {
  constructor({ region = 'us-east-1', endpoint, topicArn } = {}) {
    this.topicArn = topicArn || 'arn:aws:sns:us-east-1:000000000000:records-topic';
    this.publishedEvents = [];
    if (process.env.NODE_ENV !== 'test' && endpoint) {
      try {
        this.client = new SNSClient({
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

  async publishRecordCreated(record) {
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
    } catch (err) {
      console.warn(`[SnsEventPublisher] Publish error: ${err.message}`);
      return payload;
    }
  }
}

module.exports = SnsEventPublisher;
