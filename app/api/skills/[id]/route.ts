import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET one skill
export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const skill = await prisma.skill.findUnique({
      where: { id },
      include: { projects: true },
    });

    if (!skill) {
      return NextResponse.json(
        { success: false, error: "Skill not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: skill });
  } catch (error) {
    console.error("GET /api/skills/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch skill" },
      { status: 500 }
    );
  }
}

// DELETE a skill
export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await prisma.skill.delete({ where: { id } });

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error("DELETE /api/skills/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete skill" },
      { status: 500 }
    );
  }
}
