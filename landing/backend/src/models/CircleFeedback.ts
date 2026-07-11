import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const AVATAR_IDS = [
  'hyped',
  'amazed',
  'in-love',
  'curious',
  'inspired',
  'happy',
  'ready',
  'impressed',
  'intrigued',
  'thoughtful',
  'thrilled',
  'believer',
] as const;

const CATEGORIES = ['concept', 'suggestion', 'feature', 'feedback', 'hype', 'other'] as const;

const circleFeedbackSchema = new Schema(
  {
    avatarId: { type: String, required: true, enum: AVATAR_IDS },
    name: { type: String, required: true, maxlength: 64, trim: true },
    message: { type: String, required: true, minlength: 8, maxlength: 280, trim: true },
    category: { type: String, required: true, enum: CATEGORIES },
    fireCount: { type: Number, default: 0, min: 0 },
    memberNumber: { type: Number, required: true, min: 1 },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  },
);

export type CircleFeedbackDoc = InferSchemaType<typeof circleFeedbackSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
};

export function toCircleFeedbackJson(doc: {
  _id: { toString(): string };
  avatarId: string;
  name: string;
  message: string;
  category: string;
  fireCount: number;
  memberNumber: number;
  createdAt: Date;
}) {
  return {
    id: doc._id.toString(),
    avatarId: doc.avatarId,
    name: doc.name,
    message: doc.message,
    category: doc.category,
    fireCount: doc.fireCount,
    memberNumber: doc.memberNumber,
    createdAt: doc.createdAt.toISOString(),
  };
}

export const CircleFeedbackModel = mongoose.model('CircleFeedback', circleFeedbackSchema);
