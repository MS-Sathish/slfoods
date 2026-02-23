import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import { Payment, Shop } from "@/lib/db/models";
import { verifyToken } from "@/lib/auth";

// POST /api/payments - Record a new payment
export async function POST(request: NextRequest) {
  try {
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

    await connectDB();

    const { shop, amount, mode, reference, notes } = await request.json();

    if (!shop || !amount || !mode) {
      return NextResponse.json(
        { success: false, error: "Shop, amount, and mode are required" },
        { status: 400 }
      );
    }

    // Create payment
    const payment = await Payment.create({
      shop,
      amount,
      mode,
      reference,
      notes,
      receivedBy: payload.id,
    });

    // Update shop's pending balance (reduce by payment amount)
    await Shop.findByIdAndUpdate(shop, {
      $inc: { pendingBalance: -amount },
    });

    return NextResponse.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error("Payment error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to record payment" },
      { status: 500 }
    );
  }
}

// GET /api/payments - Get all payments (admin only)
export async function GET(request: NextRequest) {
  try {
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

    await connectDB();

    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get("shop");

    const query = shopId ? { shop: shopId } : {};

    const payments = await Payment.find(query)
      .populate("shop", "shopName ownerName")
      .populate("receivedBy", "name")
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json({
      success: true,
      data: payments,
    });
  } catch (error) {
    console.error("Get payments error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}
