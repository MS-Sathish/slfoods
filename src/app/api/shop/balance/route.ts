import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import { Order, Payment, Shop } from "@/lib/db/models";
import { verifyToken } from "@/lib/auth";

// GET /api/shop/balance - Get shop balance and ledger
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

    // Get all delivered orders
    const orders = await Order.find({
      shop: payload.id,
      status: "delivered",
    })
      .select("orderNumber totalAmount deliveredAt createdAt")
      .sort({ deliveredAt: -1 });

    // Get all payments
    const payments = await Payment.find({ shop: payload.id })
      .select("amount mode reference createdAt")
      .sort({ createdAt: -1 });

    // Calculate totals
    const totalOrdersAmount = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalPaymentsAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const pendingBalance = totalOrdersAmount - totalPaymentsAmount;

    // Sync the calculated balance to shop model for consistency
    await Shop.findByIdAndUpdate(payload.id, {
      pendingBalance: Math.max(0, pendingBalance),
    });

    // Build ledger entries
    const ledgerEntries = [
      ...orders.map((order) => ({
        type: "order" as const,
        date: order.deliveredAt || order.createdAt,
        description: `Order #${order.orderNumber}`,
        amount: order.totalAmount,
        reference: order.orderNumber,
      })),
      ...payments.map((payment) => ({
        type: "payment" as const,
        date: payment.createdAt,
        description: `Payment (${payment.mode.toUpperCase()})`,
        amount: -payment.amount,
        reference: payment.reference || "",
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Get last payment
    const lastPayment = payments[0];

    return NextResponse.json({
      success: true,
      data: {
        pendingBalance: Math.max(0, pendingBalance),
        totalOrdersValue: totalOrdersAmount,
        totalPayments: totalPaymentsAmount,
        lastPayment: lastPayment
          ? {
              amount: lastPayment.amount,
              date: lastPayment.createdAt,
              mode: lastPayment.mode,
            }
          : null,
        ledger: ledgerEntries,
      },
    });
  } catch (error) {
    console.error("Balance error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch balance" },
      { status: 500 }
    );
  }
}
