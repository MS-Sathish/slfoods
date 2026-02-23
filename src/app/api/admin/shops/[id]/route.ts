import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import { Shop, Order, Payment } from "@/lib/db/models";
import { verifyToken } from "@/lib/auth";
import { ShopStatus } from "@/types";

// GET /api/admin/shops/[id] - Get single shop with details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
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

    const shop = await Shop.findById(id);
    if (!shop) {
      return NextResponse.json(
        { success: false, error: "Shop not found" },
        { status: 404 }
      );
    }

    // Get stats
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

    // Get recent orders
    const recentOrders = await Order.find({ shop: shop._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("orderNumber totalAmount status createdAt");

    // Get recent payments
    const recentPayments = await Payment.find({ shop: shop._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("amount mode createdAt");

    return NextResponse.json({
      success: true,
      data: {
        ...shop.toObject(),
        orderCount,
        totalOrderValue: deliveredTotal[0]?.total || 0,
        totalPayments: paymentsTotal[0]?.total || 0,
        pendingBalance: Math.max(0, pendingBalance),
        recentOrders,
        recentPayments,
      },
    });
  } catch (error) {
    console.error("Get shop error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch shop" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/shops/[id] - Update shop status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
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

    const body = await request.json();
    const { status, creditLimit } = body;

    const shop = await Shop.findById(id);
    if (!shop) {
      return NextResponse.json(
        { success: false, error: "Shop not found" },
        { status: 404 }
      );
    }

    if (status) {
      const validStatuses: ShopStatus[] = ["pending", "approved", "blocked"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { success: false, error: "Invalid status" },
          { status: 400 }
        );
      }
      shop.status = status;
    }

    if (creditLimit !== undefined) {
      shop.creditLimit = creditLimit;
    }

    await shop.save();

    return NextResponse.json({
      success: true,
      message: "Shop updated successfully",
      data: shop,
    });
  } catch (error) {
    console.error("Update shop error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update shop" },
      { status: 500 }
    );
  }
}
