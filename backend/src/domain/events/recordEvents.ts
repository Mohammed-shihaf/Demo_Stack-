import { EventEmitter } from 'events';

export class RecordEventBus extends EventEmitter {}

export const recordEventBus = new RecordEventBus();

export const RECORD_EVENTS = {
  RECORD_CREATED: 'record:created',
  RECORD_UPDATED: 'record:updated',
  RECORD_DELETED: 'record:deleted',
} as const;

export default {
  recordEventBus,
  RECORD_EVENTS,
};
