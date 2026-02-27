import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import { Shop } from "@/lib/db/models";
import { generateShopToken, generateAdminToken, getAdminConfig } from "@/lib/auth";

// POST /api/auth/login - Unified login for both shop and admin
export async function POST(request: NextRequest) {
  try {
    const { email, password, shopId } = await request.json();

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
            mobile: adminConfig.mobile,
            role: "owner",
          },
          token,
        },
      });
    }

    // Try to find shops with this email
    await connectDB();
    const shops = await Shop.find({ email: normalizedEmail }).select("+password");

    if (shops.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password against the first shop (all shops under same email share password)
    const isMatch = await shops[0].comparePassword(password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if all shops are blocked
    const nonBlockedShops = shops.filter(s => s.status !== "blocked");
    if (nonBlockedShops.length === 0) {
      return NextResponse.json(
        { success: false, error: "All your shops have been blocked. Please contact support." },
        { status: 403 }
      );
    }

    // If shopId is provided, select that specific shop
    let selectedShop = nonBlockedShops[0];
    if (shopId) {
      const requestedShop = nonBlockedShops.find(s => s._id.toString() === shopId);
      if (requestedShop) {
        selectedShop = requestedShop;
      }
    }

    // Format all shops for response (without password)
    const allShops = nonBlockedShops.map(shop => ({
      _id: shop._id,
      shopName: shop.shopName,
      ownerName: shop.ownerName,
      email: shop.email,
      mobile: shop.mobile,
      address: shop.address,
      status: shop.status,
      creditLimit: shop.creditLimit,
      pendingBalance: shop.pendingBalance,
      mustChangePassword: shop.mustChangePassword || false,
    }));

    const token = generateShopToken(selectedShop);

    return NextResponse.json({
      success: true,
      data: {
        type: "shop",
        shop: {
          _id: selectedShop._id,
          shopName: selectedShop.shopName,
          ownerName: selectedShop.ownerName,
          email: selectedShop.email,
          mobile: selectedShop.mobile,
          address: selectedShop.address,
          status: selectedShop.status,
          creditLimit: selectedShop.creditLimit,
          pendingBalance: selectedShop.pendingBalance,
          mustChangePassword: selectedShop.mustChangePassword || false,
        },
        shops: allShops, // Return all shops for this user
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Login failed" },
      { status: 500 }
    );
  }
}
