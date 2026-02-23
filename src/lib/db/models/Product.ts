import mongoose, { Schema, Document, Model } from "mongoose";
import { Product as ProductType, ProductCategory, UnitType } from "@/types";

export interface ProductDocument extends Omit<ProductType, "_id">, Document {}

const productSchema = new Schema<ProductDocument>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    nameTamil: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "mixture",
        "bhel",
        "chevda",
        "dhal",
        "chips",
        "murukku",
        "boondi",
        "papdi",
        "sabudana",
        "sweets",
        "biscuits",
        "others",
      ] as ProductCategory[],
      required: true,
    },
    rate: {
      type: Number,
      required: [true, "Rate is required"],
      min: 0,
    },
    unitType: {
      type: String,
      enum: ["kg", "packet", "box"] as UnitType[],
      default: "kg",
    },
    defaultQuantity: {
      type: Number,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    image: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
productSchema.index({ category: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ name: "text" });

const Product: Model<ProductDocument> =
  mongoose.models.Product ||
  mongoose.model<ProductDocument>("Product", productSchema);

export default Product;
