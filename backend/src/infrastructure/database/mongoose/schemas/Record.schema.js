'use strict';

const mongoose = require('mongoose');

const RecordSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

RecordSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id ? ret._id.toString() : '';
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const RecordModel = mongoose.models.Record || mongoose.model('Record', RecordSchema);

module.exports = {
  RecordSchema,
  RecordModel,
};
