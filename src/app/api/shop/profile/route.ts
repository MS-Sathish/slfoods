import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import { Shop } from "@/lib/db/models";
import { verifyToken } from "@/lib/auth";

// GET /api/shop/profile - Get current shop profile
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);

    if (!payload || payload.type !== "shop") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    const shop = await Shop.findById(payload.id);

    if (!shop) {
      return NextResponse.json(
        { success: false, error: "Shop not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        _id: shop._id,
        shopName: shop.shopName,
        ownerName: shop.ownerName,
        email: shop.email,
        mobile: shop.mobile,
        address: shop.address,
        status: shop.status,
        creditLimit: shop.creditLimit,
        pendingBalance: shop.pendingBalance,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get profile" },
      { status: 500 }
    );
  }
}
