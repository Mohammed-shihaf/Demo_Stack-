import assert from 'assert';
import { recordEventBus, RECORD_EVENTS } from '../src/domain/events/recordEvents';
import { SnsEventPublisher } from '../src/infrastructure/messaging/SnsEventPublisher';
import { SesEmailNotifier } from '../src/infrastructure/messaging/SesEmailNotifier';

describe('TypeScript Domain Events & Messaging Tests', () => {
  it('Domain EventBus emits and catches RECORD_CREATED event', (done) => {
    const testRecord = { id: 'bus-1', title: 'Bus Record', description: 'Event Bus Test' };

    recordEventBus.once(RECORD_EVENTS.RECORD_CREATED, (data) => {
      assert.strictEqual(data.id, 'bus-1');
      assert.strictEqual(data.title, 'Bus Record');
      done();
    });

    recordEventBus.emit(RECORD_EVENTS.RECORD_CREATED, testRecord);
  });

  it('SnsEventPublisher tracks published events in offline/test fallback mode', async () => {
    const publisher = new SnsEventPublisher({ topicArn: 'arn:aws:sns:mock' });
    publisher.client = null;
    const res = await publisher.publishRecordCreated({ id: 'sns-1', title: 'SNS Record' });
    assert.strictEqual(res.eventType, 'RECORD_CREATED');
    assert.strictEqual(publisher.publishedEvents.length, 1);
  });

  it('SesEmailNotifier records sent notifications in offline/test fallback mode', async () => {
    const notifier = new SesEmailNotifier({ fromEmail: 'no-reply@test.com' });
    notifier.client = null;
    const res = await notifier.sendRecordCreatedNotification(
      { id: 'ses-1', title: 'SES Record', description: 'Desc', createdAt: new Date().toISOString() },
      'user@test.com'
    );
    assert.strictEqual(res.to, 'user@test.com');
    assert.strictEqual(notifier.sentEmails.length, 1);
  });
});
