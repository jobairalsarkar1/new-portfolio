import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Edge cache: cache response globally for 60 seconds
export const revalidate = 60;

// GET all users
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch users" }, { status: 500 });
  }
}
