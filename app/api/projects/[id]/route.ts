import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function requireAdmin() {
  const session = await auth();

  return Boolean(session?.user?.email && session?.user?.role === "ADMIN");
}

// GET one project
export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    const project = await prisma.project.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: { skills: true },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    console.error("GET /api/projects/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch project" },
      { status: 500 },
    );
  }
}

// UPDATE a project
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const isAdmin = await requireAdmin();

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();
    const {
      name,
      coverImage,
      heroImage,
      link,
      gitLink,
      canContact,
      description,
      priority,
      skillIds,
    } = body;

    if (!name || !coverImage || !heroImage || !description) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 },
      );
    }

    const slug = generateSlug(name);
    const slugOwner = await prisma.project.findUnique({
      where: { slug },
    });

    if (slugOwner && slugOwner.id !== id) {
      return NextResponse.json(
        { success: false, error: "Another project already uses this name" },
        { status: 409 },
      );
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        name,
        slug,
        coverImage,
        heroImage,
        link: link || null,
        gitLink: gitLink || null,
        canContact: canContact ?? false,
        description,
        priority: priority ?? 0,
        skills: Array.isArray(skillIds)
          ? { set: skillIds.map((skillId: string) => ({ id: skillId })) }
          : undefined,
      },
      include: { skills: true },
    });

    return NextResponse.json({ success: true, data: updatedProject });
  } catch (error) {
    console.error("PUT /api/projects/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update project" },
      { status: 500 },
    );
  }
}

// DELETE a project
export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const isAdmin = await requireAdmin();

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    await prisma.project.delete({ where: { id } });

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error("DELETE /api/projects/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete project" },
      { status: 500 },
    );
  }
}
