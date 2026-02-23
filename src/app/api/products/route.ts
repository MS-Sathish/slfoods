import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import { Product } from "@/lib/db/models";

// GET /api/products - Get all products
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const activeOnly = searchParams.get("active") !== "false";

    // Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    if (activeOnly) {
      query.isActive = true;
    }

    if (category && category !== "all") {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { nameTamil: { $regex: search, $options: "i" } },
      ];
    }

    const products = await Product.find(query).sort({ category: 1, name: 1 });

    return NextResponse.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch products",
      },
      { status: 500 }
    );
  }
}

// POST /api/products - Create a new product (admin only)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const product = await Product.create(body);

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create product",
      },
      { status: 500 }
    );
  }
}
