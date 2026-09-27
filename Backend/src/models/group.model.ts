import mongoose, { Schema, Document } from 'mongoose';

export interface IGroup extends Document {
  name: string;
  avatar?: string;
  adminId: string;
  members: string[];
  createdAt: Date;
  updatedAt: Date;
}

const GroupSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    avatar: { type: String, default: '' },
    adminId: { type: String, required: true, index: true },
    members: [{ type: String, required: true }]
  },
  { timestamps: true }
);

// High-performance compound indexes for instant user group loading
GroupSchema.index({ members: 1, updatedAt: -1 });
GroupSchema.index({ adminId: 1, createdAt: -1 });

export const GroupModel = mongoose.model<IGroup>('Group', GroupSchema);

