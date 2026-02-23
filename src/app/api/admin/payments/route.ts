import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import { Payment, Shop } from "@/lib/db/models";
import { verifyToken } from "@/lib/auth";

// GET /api/admin/payments - Get all payments
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
    const shopId = searchParams.get("shop");
    const limit = parseInt(searchParams.get("limit") || "50");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    if (shopId) {
      query.shop = shopId;
    }

    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("shop", "shopName ownerName mobile")
      .populate("receivedBy", "name");

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

// POST /api/admin/payments - Create new payment entry
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { shopId, amount, mode, reference, notes } = body;

    if (!shopId || !amount || !mode) {
      return NextResponse.json(
        { success: false, error: "Shop, amount, and mode are required" },
        { status: 400 }
      );
    }

    // Verify shop exists
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return NextResponse.json(
        { success: false, error: "Shop not found" },
        { status: 404 }
      );
    }

    const payment = await Payment.create({
      shop: shopId,
      amount,
      mode,
      reference,
      notes,
      receivedBy: payload.id,
    });

    // Update shop's pending balance (reduce by payment amount)
    await Shop.findByIdAndUpdate(shopId, {
      $inc: { pendingBalance: -amount },
    });

    // Populate for response
    await payment.populate("shop", "shopName ownerName mobile");
    await payment.populate("receivedBy", "name");

    return NextResponse.json({
      success: true,
      message: "Payment recorded successfully",
      data: payment,
    });
  } catch (error) {
    console.error("Create payment error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create payment",
      },
      { status: 500 }
    );
  }
}
