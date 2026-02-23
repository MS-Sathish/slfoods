import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export interface AdminDocument extends Document {
  name: string;
  email: string;
  password: string;
  role: "owner" | "staff";
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

interface AdminModel extends Model<AdminDocument> {
  createWithHashedPassword(data: {
    name: string;
    email: string;
    password: string;
    role?: "owner" | "staff";
  }): Promise<AdminDocument>;
}

const adminSchema = new Schema<AdminDocument, AdminModel>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ["owner", "staff"],
      default: "staff",
    },
  },
  {
    timestamps: true,
  }
);

// Compare password method
adminSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Static method to create admin with hashed password
adminSchema.statics.createWithHashedPassword = async function (data: {
  name: string;
  email: string;
  password: string;
  role?: "owner" | "staff";
}): Promise<AdminDocument> {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(data.password, salt);

  return this.create({
    ...data,
    password: hashedPassword,
  });
};

// Hash password before saving using mongoose middleware
adminSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const Admin: AdminModel =
  (mongoose.models.Admin as AdminModel) || mongoose.model<AdminDocument, AdminModel>("Admin", adminSchema);

export default Admin;
