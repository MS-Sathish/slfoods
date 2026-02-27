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

    // Check if shops already exist with this email
    const existingShops = await Shop.find({ email: normalizedEmail }).select("+password");

    // If email exists, verify password matches (for adding another shop)
    if (existingShops.length > 0) {
      const isMatch = await existingShops[0].comparePassword(password);
      if (!isMatch) {
        return NextResponse.json(
          { success: false, error: "Email already registered. Use correct password to add another shop." },
          { status: 400 }
        );
      }

      // Check if a shop with the same name already exists for this user
      const duplicateShopName = existingShops.find(
        s => s.shopName.toLowerCase() === shopName.toLowerCase()
      );
      if (duplicateShopName) {
        return NextResponse.json(
          { success: false, error: "You already have a shop with this name" },
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
