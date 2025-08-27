import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// GET all projects
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: { skills: true },
      orderBy: { priority: "desc" },
    });

    return NextResponse.json({ success: true, data: projects });
  } catch (error) {
    console.error("GET /api/projects error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch projects" }, { status: 500 });
  }
}

// Utility function to create slugs
function generateSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}


// POST new project
export async function POST(req: Request) {
  try {
    // Authorization Check
    const session = await auth();
    if (!session?.user?.email || session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, coverImage, heroImage, link, gitLink, canContact, description, priority, skillIds } = body;

    if (!name || !coverImage || !heroImage || !description) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const slug = generateSlug(name);

    const newProject = await prisma.project.create({
      data: {
        name,
        slug,
        coverImage,
        heroImage,
        link,
        gitLink,
        canContact: canContact ?? false,
        description,
        priority: priority ?? 0,
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
