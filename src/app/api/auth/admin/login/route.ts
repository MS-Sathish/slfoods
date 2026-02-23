import { NextRequest, NextResponse } from "next/server";
import { generateAdminToken, getAdminConfig } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Get admin config at runtime
    const adminConfig = getAdminConfig();

    // Check against environment variables
    if (email !== adminConfig.email || password !== adminConfig.password) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate token
    const token = generateAdminToken();

    return NextResponse.json({
      success: true,
      data: {
        admin: {
          _id: "admin",
          name: adminConfig.name,
          email: adminConfig.email,
          role: "owner",
        },
        token,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to login" },
      { status: 500 }
    );
  }
}
