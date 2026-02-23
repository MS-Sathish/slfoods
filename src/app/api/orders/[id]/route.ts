import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import { Order, Shop } from "@/lib/db/models";
import { verifyToken } from "@/lib/auth";
import { OrderStatus } from "@/types";

// GET /api/orders/[id] - Get single order
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

    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    const order = await Order.findById(id).populate(
      "shop",
      "shopName ownerName mobile address"
    );

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Check if shop owner is accessing their own order
    if (
      payload.type === "shop" &&
      order.shop._id.toString() !== payload.id
    ) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Get order error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

// PATCH /api/orders/[id] - Update order status (admin only)
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
    const { status } = body;

    const validStatuses: OrderStatus[] = [
      "pending",
      "confirmed",
      "packed",
      "out_for_delivery",
      "delivered",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status" },
        { status: 400 }
      );
    }

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Update status and timestamp
    order.status = status;
    const now = new Date();

    switch (status) {
      case "confirmed":
        order.confirmedAt = now;
        break;
      case "packed":
        order.packedAt = now;
        break;
      case "out_for_delivery":
        order.outForDeliveryAt = now;
        break;
      case "delivered":
        order.deliveredAt = now;
        // Add order amount to shop's pending balance
        await Shop.findByIdAndUpdate(order.shop, {
          $inc: { pendingBalance: order.totalAmount },
        });
        break;
      case "cancelled":
        order.cancelledAt = now;
        break;
    }

    await order.save();

    return NextResponse.json({
      success: true,
      message: "Order status updated",
      data: order,
    });
  } catch (error) {
    console.error("Update order error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update order" },
      { status: 500 }
    );
  }
}
