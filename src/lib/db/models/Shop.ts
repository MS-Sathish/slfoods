import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";
import { Shop as ShopType, ShopStatus } from "@/types";

export interface ShopDocument extends Omit<ShopType, "_id">, Document {
  password: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const shopSchema = new Schema<ShopDocument>(
  {
    shopName: {
      type: String,
      required: [true, "Shop name is required"],
      trim: true,
    },
    ownerName: {
      type: String,
      required: [true, "Owner name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    address: {
      street: { type: String, required: true },
      area: { type: String, required: true },
      city: { type: String, required: true },
    },
    gstNumber: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "blocked"] as ShopStatus[],
      default: "pending",
    },
    creditLimit: {
      type: Number,
      default: 0,
    },
    pendingBalance: {
      type: Number,
      default: 0,
    },
    mustChangePassword: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
shopSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
shopSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Index for faster queries
shopSchema.index({ email: 1 });
shopSchema.index({ status: 1 });

const Shop: Model<ShopDocument> =
  mongoose.models.Shop || mongoose.model<ShopDocument>("Shop", shopSchema);

export default Shop;
