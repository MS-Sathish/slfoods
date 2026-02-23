import { NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import { Product, Admin, Shop } from "@/lib/db/models";
import { productSeeds } from "@/lib/db/seed-products";

export async function POST() {
  try {
    await connectDB();

    // Clear ALL existing data
    await Product.deleteMany({});
    await Admin.deleteMany({});
    await Shop.deleteMany({});

    // Insert products
    const products = await Product.insertMany(
      productSeeds.map((product) => ({
        ...product,
        isActive: true,
      }))
    );

    // Create default admin
    await Admin.create({
      name: "Suresh Perumal",
      email: "admin@shreelaxmi.com",
      password: "admin123", // Will be hashed by pre-save hook
      role: "owner",
    });

    // Create test shop
    await Shop.create({
      shopName: "Demo Kirana Store",
      ownerName: "Demo User",
      email: "shop@test.com",
      mobile: "9876543210",
      password: "shop123", // Will be hashed by pre-save hook
      address: {
        street: "Gat No 30, Rautwadi, Dattanagar",
        area: "Mulshi, Lavale",
        city: "Pune",
      },
      status: "approved",
      creditLimit: 50000,
    });
    const shopCreated = true;

    return NextResponse.json({
      success: true,
      message: `Seeded ${products.length} products, admin and test shop`,
      data: {
        productsCount: products.length,
        adminCreated: true,
        shopCreated,
        credentials: {
          admin: { email: "admin@shreelaxmi.com", password: "admin123" },
          shop: { email: "shop@test.com", password: "shop123" },
        },
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to seed database",
      },
      { status: 500 }
    );
  }
}
