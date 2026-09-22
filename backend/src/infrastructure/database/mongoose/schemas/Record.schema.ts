import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRecordDocument extends Document {
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export const RecordSchema = new Schema<IRecordDocument>(
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
  transform: (doc: any, ret: any) => {
    ret.id = ret._id ? ret._id.toString() : '';
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const RecordModel: Model<IRecordDocument> =
  mongoose.models.Record || mongoose.model<IRecordDocument>('Record', RecordSchema);

export default {
  RecordSchema,
  RecordModel,
};
