import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import { Order, Product, Shop } from "@/lib/db/models";
import { verifyToken } from "@/lib/auth";

// GET /api/orders - Get orders (for shop or admin)
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

    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");
    const shopIdParam = searchParams.get("shopId");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    // If shop owner, only show their orders
    if (payload.type === "shop") {
      // Get the shopId to query for
      let targetShopId = payload.id;

      // If shopId param is provided, verify ownership
      if (shopIdParam && shopIdParam !== payload.id) {
        const tokenShop = await Shop.findById(payload.id).select("email");
        const requestedShop = await Shop.findById(shopIdParam).select("email");

        if (!tokenShop || !requestedShop || tokenShop.email !== requestedShop.email) {
          return NextResponse.json(
            { success: false, error: "Access denied to this shop" },
            { status: 403 }
          );
        }
        targetShopId = shopIdParam;
      }

      query.shop = targetShopId;
    }

    // Filter by status if provided
    if (status && status !== "all") {
      query.status = status;
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("shop", "shopName ownerName mobile address");

    return NextResponse.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create a new order (shop owner only)
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

    if (!payload || payload.type !== "shop") {
      return NextResponse.json(
        { success: false, error: "Only shop owners can place orders" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { items, notes, deliveryAddress, preferredDeliveryDate, shopId } = body;

    // Get the shop to place order for
    let targetShopId = payload.id;

    // If shopId is provided, verify ownership
    if (shopId && shopId !== payload.id) {
      const tokenShop = await Shop.findById(payload.id).select("email");
      const requestedShop = await Shop.findById(shopId).select("email");

      if (!tokenShop || !requestedShop || tokenShop.email !== requestedShop.email) {
        return NextResponse.json(
          { success: false, error: "Access denied to this shop" },
          { status: 403 }
        );
      }
      targetShopId = shopId;
    }

    // Get shop details
    const shop = await Shop.findById(targetShopId);
    if (!shop) {
      return NextResponse.json(
        { success: false, error: "Shop not found" },
        { status: 404 }
      );
    }

    if (shop.status !== "approved") {
      return NextResponse.json(
        { success: false, error: "Shop is not approved" },
        { status: 403 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Order must have at least one item" },
        { status: 400 }
      );
    }

    // Build order items with product details
    const orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return NextResponse.json(
          { success: false, error: `Product not found: ${item.product}` },
          { status: 400 }
        );
      }

      const itemTotal = product.rate * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        productName: product.name,
        quantity: item.quantity,
        rate: product.rate,
        unitType: product.unitType,
        total: itemTotal,
      });
    }

    // Generate order number
    const orderCount = await Order.countDocuments();
    const orderNumber = `ORD${String(orderCount + 1001).padStart(6, "0")}`;

    // Create order
    const order = await Order.create({
      orderNumber,
      shop: shop._id,
      items: orderItems,
      totalAmount,
      status: "pending",
      notes,
      deliveryAddress: deliveryAddress || shop.address,
      preferredDeliveryDate,
    });

    return NextResponse.json({
      success: true,
      message: "Order placed successfully",
      data: order,
    });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create order",
      },
      { status: 500 }
    );
  }
}
