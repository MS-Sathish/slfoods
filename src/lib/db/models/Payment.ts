import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { PaymentMode } from "@/types";

export interface PaymentDocument extends Document {
  shop: Types.ObjectId;
  amount: number;
  mode: PaymentMode;
  reference?: string;
  notes?: string;
  receivedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<PaymentDocument>(
  {
    shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [1, "Amount must be at least 1"],
    },
    mode: {
      type: String,
      enum: ["cash", "upi", "bank", "bank_transfer", "credit"] as PaymentMode[],
      required: true,
    },
    reference: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    receivedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
paymentSchema.index({ shop: 1, createdAt: -1 });
paymentSchema.index({ createdAt: -1 });

const Payment: Model<PaymentDocument> =
  mongoose.models.Payment ||
  mongoose.model<PaymentDocument>("Payment", paymentSchema);

export default Payment;
