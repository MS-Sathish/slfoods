import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db/connection";
import { Order, Payment, Shop } from "@/lib/db/models";
import { verifyToken } from "@/lib/auth";

// GET /api/shop/dashboard - Get shop dashboard stats
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

    if (!payload || payload.type !== "shop") {
      return NextResponse.json(
        { success: false, error: "Shop access required" },
        { status: 403 }
      );
    }

    const shopId = new mongoose.Types.ObjectId(payload.id);

    // Calculate pending balance from delivered orders and payments
    const deliveredOrders = await Order.aggregate([
      { $match: { shop: shopId, status: "delivered" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalDeliveredAmount = deliveredOrders[0]?.total || 0;

    const payments = await Payment.aggregate([
      { $match: { shop: shopId } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalPayments = payments[0]?.total || 0;

    const pendingBalance = totalDeliveredAmount - totalPayments;

    // Sync the calculated balance to shop model for consistency
    await Shop.findByIdAndUpdate(payload.id, {
      pendingBalance: Math.max(0, pendingBalance),
    });

    // Get last order
    const lastOrder = await Order.findOne({ shop: payload.id })
      .sort({ createdAt: -1 })
      .select("status createdAt");

    // Get total orders count
    const totalOrders = await Order.countDocuments({ shop: payload.id });

    return NextResponse.json({
      success: true,
      data: {
        pendingBalance: Math.max(0, pendingBalance),
        lastOrderStatus: lastOrder?.status,
        lastOrderDate: lastOrder?.createdAt,
        totalOrders,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard" },
      { status: 500 }
    );
  }
}
