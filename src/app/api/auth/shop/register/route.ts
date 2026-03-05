import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import { Shop } from "@/lib/db/models";
import { generateShopToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { shopName, ownerName, email, mobile, password, address, gstNumber } = body;

    // Validate required fields
    if (!shopName || !ownerName || !email || !mobile || !password || !address) {
      return NextResponse.json(
        { success: false, error: "All required fields must be provided" },
        { status: 400 }
      );
    }

    if (!address.street || !address.area || !address.city) {
      return NextResponse.json(
        { success: false, error: "Complete address is required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedShopName = shopName.trim();

    // Check if shops already exist with this email
    const existingShops = await Shop.find({ email: normalizedEmail }).select("+password");

    // If email exists
    if (existingShops.length > 0) {
      // First check if same shop name already exists (regardless of password)
      const duplicateShop = existingShops.find(
        s => s.shopName.toLowerCase().trim() === normalizedShopName.toLowerCase()
      );

      if (duplicateShop) {
        if (duplicateShop.status === "pending") {
          return NextResponse.json(
            { success: false, error: "This shop is already registered and waiting for admin approval." },
            { status: 400 }
          );
        }
        if (duplicateShop.status === "approved") {
          return NextResponse.json(
            { success: false, error: "This shop is already registered. Please login instead." },
            { status: 400 }
          );
        }
        if (duplicateShop.status === "blocked") {
          return NextResponse.json(
            { success: false, error: "This shop has been blocked. Please contact admin." },
            { status: 400 }
          );
        }
      }

      // Verify password matches (for adding a different shop with same email)
      const isMatch = await existingShops[0].comparePassword(password);
      if (!isMatch) {
        return NextResponse.json(
          { success: false, error: "Email already registered. Use correct password to add another shop." },
          { status: 400 }
        );
      }
    }

    // Create new shop
    const shop = await Shop.create({
      shopName,
      ownerName,
      email: normalizedEmail,
      mobile,
      password,
      address,
      gstNumber,
      status: "pending", // Requires admin approval
    });

    // Generate token
    const token = generateShopToken(shop);

    return NextResponse.json({
      success: true,
      message: "Shop registered successfully. Waiting for admin approval.",
      data: {
        shop: {
          _id: shop._id,
          shopName: shop.shopName,
          ownerName: shop.ownerName,
          email: shop.email,
          mobile: shop.mobile,
          address: shop.address,
          gstNumber: shop.gstNumber,
          status: shop.status,
          createdAt: shop.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Register shop error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to register shop",
      },
      { status: 500 }
    );
  }
}
