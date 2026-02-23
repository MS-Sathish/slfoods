import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { OrderStatus } from "@/types";

export interface OrderItemSubdoc {
  product: Types.ObjectId;
  productName: string;
  quantity: number;
  rate: number;
  unitType: string;
  total: number;
}

export interface OrderDocument extends Document {
  orderNumber: string;
  shop: Types.ObjectId;
  items: OrderItemSubdoc[];
  totalAmount: number;
  status: OrderStatus;
  notes?: string;
  preferredDeliveryDate?: Date;
  deliveryAddress: {
    street: string;
    area: string;
    city: string;
  };
  createdAt: Date;
  updatedAt: Date;
  confirmedAt?: Date;
  packedAt?: Date;
  outForDeliveryAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
}

const orderItemSchema = new Schema<OrderItemSubdoc>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0.1,
    },
    rate: {
      type: Number,
      required: true,
    },
    unitType: {
      type: String,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const orderSchema = new Schema<OrderDocument>(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
    shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "packed",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ] as OrderStatus[],
      default: "pending",
    },
    notes: {
      type: String,
      trim: true,
    },
    preferredDeliveryDate: {
      type: Date,
    },
    deliveryAddress: {
      street: { type: String, required: true },
      area: { type: String, required: true },
      city: { type: String, required: true },
    },
    confirmedAt: Date,
    packedAt: Date,
    outForDeliveryAt: Date,
    deliveredAt: Date,
    cancelledAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
orderSchema.index({ shop: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ createdAt: -1 });


const Order: Model<OrderDocument> =
  mongoose.models.Order || mongoose.model<OrderDocument>("Order", orderSchema);

export default Order;
