import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import { Shop, Order, Payment } from "@/lib/db/models";
import { verifyToken } from "@/lib/auth";

// GET /api/admin/shops - Get all shops
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);

    if (!payload || payload.type !== "admin") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    if (status && status !== "all") {
      query.status = status;
    }

    const shops = await Shop.find(query).sort({ createdAt: -1 });

    // Get order counts and balances for each shop
    const shopsWithStats = await Promise.all(
      shops.map(async (shop) => {
        const orderCount = await Order.countDocuments({ shop: shop._id });

        const deliveredTotal = await Order.aggregate([
          { $match: { shop: shop._id, status: "delivered" } },
          { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ]);

        const paymentsTotal = await Payment.aggregate([
          { $match: { shop: shop._id } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);

        const pendingBalance =
          (deliveredTotal[0]?.total || 0) - (paymentsTotal[0]?.total || 0);

        return {
          ...shop.toObject(),
          orderCount,
          pendingBalance: Math.max(0, pendingBalance),
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: shopsWithStats,
    });
  } catch (error) {
    console.error("Get shops error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch shops" },
      { status: 500 }
    );
  }
}
