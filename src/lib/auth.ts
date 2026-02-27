import jwt from "jsonwebtoken";
import { Shop } from "@/lib/db/models";
import { ShopDocument } from "@/lib/db/models/Shop";

const getJwtSecret = () => process.env.JWT_SECRET || "lakshmi-chips-secret-key-change-in-production";

// Admin config from environment variables (read at runtime)
export const getAdminConfig = () => ({
  email: process.env.ADMIN_EMAIL || "admin@lakshmichips.com",
  password: process.env.ADMIN_PASSWORD || "admin123",
  name: process.env.ADMIN_NAME || "Admin",
  mobile: process.env.ADMIN_MOBILE || "",
});

// Generate JWT token for shop
export function generateShopToken(shop: ShopDocument): string {
  return jwt.sign(
    {
      id: shop._id,
      type: "shop",
      email: shop.email,
    },
    getJwtSecret(),
    { expiresIn: "30d" }
  );
}

// Generate JWT token for admin (using env config)
export function generateAdminToken(): string {
  const adminConfig = getAdminConfig();
  return jwt.sign(
    {
      id: "admin",
      type: "admin",
      email: adminConfig.email,
      role: "owner",
    },
    getJwtSecret(),
    { expiresIn: "7d" }
  );
}

// Verify JWT token
export interface TokenPayload {
  id: string;
  type: "shop" | "admin";
  email: string;
  role?: "owner" | "staff";
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as TokenPayload;
  } catch {
    return null;
  }
}

// Get current shop from token
export async function getShopFromToken(
  token: string
): Promise<ShopDocument | null> {
  const payload = verifyToken(token);
  if (!payload || payload.type !== "shop") return null;

  return Shop.findById(payload.id);
}

// Get current admin from token (returns env config)
export function getAdminFromToken(token: string) {
  const payload = verifyToken(token);
  if (!payload || payload.type !== "admin") return null;

  const adminConfig = getAdminConfig();
  return {
    _id: "admin",
    name: adminConfig.name,
    email: adminConfig.email,
    mobile: adminConfig.mobile,
    role: "owner" as const,
  };
}
