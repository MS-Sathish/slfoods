import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import { Shop } from "@/lib/db/models";
import { generateShopToken, generateAdminToken, getAdminConfig } from "@/lib/auth";

// POST /api/auth/login - Unified login for both shop and admin
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // First check if admin login (from environment variables)
    const adminConfig = getAdminConfig();
    if (normalizedEmail === adminConfig.email.toLowerCase()) {
      if (password !== adminConfig.password) {
        return NextResponse.json(
          { success: false, error: "Invalid email or password" },
          { status: 401 }
        );
      }

      const token = generateAdminToken();
      return NextResponse.json({
        success: true,
        data: {
          type: "admin",
          admin: {
            _id: "admin",
            name: adminConfig.name,
            email: adminConfig.email,
            role: "owner",
          },
          token,
        },
      });
    }

    // Try to find shop (include password field for comparison)
    await connectDB();
    const shop = await Shop.findOne({ email: normalizedEmail }).select("+password");
    if (shop) {
      const isMatch = await shop.comparePassword(password);
      if (!isMatch) {
        return NextResponse.json(
          { success: false, error: "Invalid email or password" },
          { status: 401 }
        );
      }

      if (shop.status === "blocked") {
        return NextResponse.json(
          { success: false, error: "Your shop has been blocked. Please contact support." },
          { status: 403 }
        );
      }

      const token = generateShopToken(shop);
      return NextResponse.json({
        success: true,
        data: {
          type: "shop",
          shop: {
            _id: shop._id,
            shopName: shop.shopName,
            ownerName: shop.ownerName,
            email: shop.email,
            mobile: shop.mobile,
            address: shop.address,
            status: shop.status,
            creditLimit: shop.creditLimit,
            mustChangePassword: shop.mustChangePassword || false,
          },
          token,
        },
      });
    }

    // No user found
    return NextResponse.json(
      { success: false, error: "Invalid email or password" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Login failed" },
      { status: 500 }
    );
  }
}
