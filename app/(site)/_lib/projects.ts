import { cache } from "react";
import { prisma } from "@/lib/prisma";

export type WorkItem = {
  id: string;
  name: string;
  slug: string;
  coverImage: string;
  excerpt: string;
  skills: string[];
  priority: number;
};

// Projects below this priority are listed under "Earlier and smaller
// projects". Change a project's priority in the dashboard to move it.
export const EARLIER_BELOW = 55;

// Locally and during the build a missing database should not break the page.
// In production, throwing keeps the last good cached page instead of caching
// an empty one.
function handleFailure(error: unknown, label: string) {
  console.error(`Failed to load ${label}:`, error);
  const isServing =
    process.env.NODE_ENV === "production" &&
    process.env.NEXT_PHASE !== "phase-production-build";
  if (isServing) throw error;
}

export function plainText(markdown: string) {
  return markdown
    .split("\n")
    .filter((line) => !line.trim().startsWith("#"))
    .map((line) => line.replace(/^\s*(?:[-*+]|\d+\.|>)\s+/, ""))
    .join(" ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`~|]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function excerpt(markdown: string, length = 150) {
  const text = plainText(markdown);
  if (text.length <= length) return text;

  return `${text.slice(0, text.lastIndexOf(" ", length))}…`;
}

export const getProjects = cache(async () => {
  try {
    return await prisma.project.findMany({
      include: { skills: { orderBy: { priority: "desc" } } },
      orderBy: { priority: "desc" },
    });
  } catch (error) {
    handleFailure(error, "projects");
    return [];
  }
});

export const getProject = cache(async (slug: string) => {
  try {
    return await prisma.project.findFirst({
      where: { OR: [{ slug }, { id: slug }] },
      include: { skills: { orderBy: { priority: "desc" } } },
    });
  } catch (error) {
    handleFailure(error, `project ${slug}`);
    return null;
  }
});

export async function getWorkItems(): Promise<WorkItem[]> {
  const projects = await getProjects();

  return projects.map((project) => ({
    id: project.id,
    name: project.name,
    slug: project.slug,
    coverImage: project.coverImage,
    excerpt: excerpt(project.description),
    skills: project.skills.map((skill) => skill.name),
    priority: project.priority,
  }));
}
