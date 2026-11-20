import { cache } from "react";
import { prisma } from "@/lib/prisma";

export type WorkItem = {
  id: string;
  name: string;
  slug: string;
  coverImage: string;
  excerpt: string;
  skills: string[];
};

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
    console.error("Failed to load projects:", error);
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
    console.error(`Failed to load project ${slug}:`, error);
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
  }));
}
