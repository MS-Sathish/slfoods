import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import { Order, Payment, Shop } from "@/lib/db/models";
import { verifyToken } from "@/lib/auth";

// GET /api/admin/dashboard - Get admin dashboard stats
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

    // Get current month start
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Total sales this month (delivered orders)
    const monthlySales = await Order.aggregate([
      {
        $match: {
          status: "delivered",
          deliveredAt: { $gte: monthStart },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalSalesThisMonth = monthlySales[0]?.total || 0;

    // Total orders this month
    const totalOrdersThisMonth = await Order.countDocuments({
      createdAt: { $gte: monthStart },
    });

    // Total payments this month
    const monthlyPayments = await Payment.aggregate([
      {
        $match: {
          createdAt: { $gte: monthStart },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalPaymentsThisMonth = monthlyPayments[0]?.total || 0;

    // Calculate total pending balance
    const allDelivered = await Order.aggregate([
      { $match: { status: "delivered" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const allPayments = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const pendingBalance =
      (allDelivered[0]?.total || 0) - (allPayments[0]?.total || 0);

    // Pending orders count
    const pendingOrders = await Order.countDocuments({
      status: { $in: ["pending", "confirmed", "packed", "out_for_delivery"] },
    });

    // Active shops count
    const activeShops = await Shop.countDocuments({ status: "approved" });

    // Today's orders
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: todayStart },
    });

    // Recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("shop", "shopName");

    // Pending approval shops
    const pendingShops = await Shop.countDocuments({ status: "pending" });

    return NextResponse.json({
      success: true,
      data: {
        totalSalesThisMonth,
        totalOrdersThisMonth,
        totalPaymentsThisMonth,
        pendingBalance: Math.max(0, pendingBalance),
        pendingOrders,
        activeShops,
        todayOrders,
        pendingShops,
        recentOrders,
      },
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard" },
      { status: 500 }
    );
  }
}
