import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all skills
export async function GET() {
  try {
    const skills = await prisma.skill.findMany({
      include: { projects: true },
    });

    return NextResponse.json({ success: true, data: skills });
  } catch (error) {
    console.error("GET /api/skills error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch skills" }, { status: 500 });
  }
}

// POST new skill
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, iconUrl, needsBg } = body;

    if (!name || !iconUrl) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    }

    const newSkill = await prisma.skill.create({
      data: { name, iconUrl, needsBg },
    });

    return NextResponse.json({ success: true, data: newSkill }, { status: 201 });
  } catch (error) {
    console.error("POST /api/skills error:", error);
    return NextResponse.json({ success: false, error: "Failed to create skill" }, { status: 500 });
  }
}
