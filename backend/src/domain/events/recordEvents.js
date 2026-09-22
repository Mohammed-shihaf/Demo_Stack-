'use strict';

const EventEmitter = require('events');

class RecordEventBus extends EventEmitter {}

const recordEventBus = new RecordEventBus();

const RECORD_EVENTS = {
  RECORD_CREATED: 'record:created',
  RECORD_UPDATED: 'record:updated',
  RECORD_DELETED: 'record:deleted',
};

module.exports = {
  recordEventBus,
  RECORD_EVENTS,
};
