import mongoose, { Schema, Document } from 'mongoose';

export interface ICall extends Document {
  callerId: string;
  receiverId: string;
  callType: 'voice' | 'video';
  status: 'completed' | 'missed' | 'rejected' | 'cancelled';
  duration: number; // in seconds
  startedAt: Date;
  endedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CallSchema: Schema = new Schema(
  {
    callerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    callType: { type: String, enum: ['voice', 'video'], required: true },
    status: { 
      type: String, 
      enum: ['completed', 'missed', 'rejected', 'cancelled'], 
      required: true 
    },
    duration: { type: Number, default: 0 },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// High-performance compound indexes for user call logs and active call lookups
CallSchema.index({ callerId: 1, createdAt: -1 });
CallSchema.index({ receiverId: 1, createdAt: -1 });
CallSchema.index({ callerId: 1, receiverId: 1, createdAt: -1 });

export const CallModel = mongoose.model<ICall>('Call', CallSchema);

