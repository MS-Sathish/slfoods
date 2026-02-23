import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import Shop from "@/lib/db/models/Shop";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin token
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { tempPassword } = body;

    if (!tempPassword || tempPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the shop
    const shop = await Shop.findById(id);
    if (!shop) {
      return NextResponse.json(
        { success: false, error: "Shop not found" },
        { status: 404 }
      );
    }

    // Update the shop with new password (will be hashed by pre-save middleware)
    // and set mustChangePassword flag
    shop.password = tempPassword;
    shop.mustChangePassword = true;
    await shop.save();

    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Failed to reset password:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
