import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const waitlistSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 320,
    },
    source: { type: String, default: 'landing', maxlength: 32 },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  },
);

export type WaitlistDoc = InferSchemaType<typeof waitlistSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
};

export const WaitlistModel = mongoose.model('WaitlistEntry', waitlistSchema);
