// backend/src/models/User.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name?: string;
  email: string;
  password?: string;
  referralCode: string;
  referredBy?: string | null;
  credits: number;
  hasConverted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String },
    referralCode: { type: String, required: true, index: true, unique: true },
    referredBy: { type: String, default: null },
    credits: { type: Number, default: 0 },
    hasConverted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

/**
 * Synchronous pre-validate hook — do NOT accept or call `next`.
 * This avoids "next is not a function" errors with newer Mongoose hook behavior.
 */
userSchema.pre("validate", function (this: IUser) {
  if (!this.referralCode) {
    this.referralCode = Math.random().toString(36).slice(2, 9).toUpperCase();
  }
});

export default mongoose.models.User || mongoose.model<IUser>("User", userSchema);
