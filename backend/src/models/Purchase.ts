import mongoose, { Schema, Document } from "mongoose";

export interface IPurchase extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  createdAt: Date;
}

const purchaseSchema = new Schema<IPurchase>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IPurchase>("Purchase", purchaseSchema);