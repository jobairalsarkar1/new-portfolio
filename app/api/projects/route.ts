import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Edge cache: cache response globally for 60 seconds
export const revalidate = 60;

// GET all projects
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: { skills: true },
    });

    return NextResponse.json({ success: true, data: projects });
  } catch (error) {
    console.error("GET /api/projects error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch projects" }, { status: 500 });
  }
}

// POST new project
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, coverImage, link, gitLink, description, skillIds } = body;

    if (!name || !coverImage || !description) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const newProject = await prisma.project.create({
      data: {
        name,
        coverImage,
        link,
        gitLink,
        description,
        skills: skillIds
          ? { connect: skillIds.map((id: string) => ({ id })) }
          : undefined,
      },
      include: { skills: true },
    });

    return NextResponse.json({ success: true, data: newProject }, { status: 201 });
  } catch (error) {
    console.error("POST /api/projects error:", error);
    return NextResponse.json({ success: false, error: "Failed to create project" }, { status: 500 });
  }
}
