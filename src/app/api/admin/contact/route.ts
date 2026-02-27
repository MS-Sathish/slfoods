import { NextResponse } from "next/server";
import { getAdminConfig } from "@/lib/auth";

// GET /api/admin/contact - Get admin contact info (public)
export async function GET() {
  const adminConfig = getAdminConfig();

  return NextResponse.json({
    success: true,
    data: {
      name: adminConfig.name,
      mobile: adminConfig.mobile,
    },
  });
}
