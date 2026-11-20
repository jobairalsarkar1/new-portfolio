import type { Experience } from "./experience";
import type { WorkItem } from "./projects";
import { noteHref, type Note } from "./writing";

export type MeNode = {
  id: "me";
  type: "me";
  label: string;
  role: string;
  location: string;
};

export type RoleNode = {
  id: string;
  type: "role";
  label: string;
  role: string;
  duration: string;
  place: string;
  summary: string;
  deepDive?: string;
};

export type ProjectNode = {
  id: string;
  type: "project";
  label: string;
  slug: string;
  coverImage: string;
  excerpt: string;
};

export type SkillNode = {
  id: string;
  type: "skill";
  label: string;
  primary: boolean;
};

export type NoteNode = {
  id: string;
  type: "note";
  label: string;
  short: string;
  href: string;
  summary: string;
};

export type GraphNode = MeNode | RoleNode | ProjectNode | SkillNode | NoteNode;
export type GraphLink = { source: string; target: string };
export type Graph = { nodes: GraphNode[]; links: GraphLink[] };

// Skill names come from two places (hand written experience data and the
// dashboard), so fold the common spellings onto one key.
const ALIASES: Record<string, string> = {
  reactjs: "react",
  expressjs: "express",
  kafkacdc: "kafka",
  cdc: "kafka",
  postgres: "postgresql",
  tailwind: "tailwindcss",
  html5: "html",
  css3: "css",
  jwtauth: "jwt",
  nextjs15: "nextjs",
};

const LABELS: Record<string, string> = {
  react: "React",
  express: "Express",
  kafka: "Kafka / CDC",
  nodejs: "Node.js",
  nextjs: "Next.js",
  tailwindcss: "Tailwind CSS",
  postgresql: "PostgreSQL",
  mongodb: "MongoDB",
  javascript: "JavaScript",
  typescript: "TypeScript",
  trpc: "tRPC",
  html: "HTML",
  css: "CSS",
  jwt: "JWT auth",
  threejs: "Three.js",
  python: "Python",
  flask: "Flask",
  sqlite: "SQLite",
  websocket: "WebSocket",
  stripe: "Stripe",
};

const PRIMARY = new Set(["typescript", "react", "nextjs", "nodejs", "trpc", "postgresql", "kafka"]);

export function skillKey(name: string) {
  const key = name.toLowerCase().replace(/[^a-z0-9#+]/g, "");
  return ALIASES[key] ?? key;
}

export function buildGraph({
  name,
  role,
  location,
  experience,
  projects,
  notes,
}: {
  name: string;
  role: string;
  location: string;
  experience: Experience[];
  projects: WorkItem[];
  notes: Note[];
}): Graph {
  const nodes: GraphNode[] = [{ id: "me", type: "me", label: name, role, location }];
  const links: GraphLink[] = [];
  const skills = new Map<string, SkillNode>();
  const linked = new Set<string>();

  const link = (source: string, target: string) => {
    const id = `${source}->${target}`;
    if (source === target || linked.has(id)) return;
    linked.add(id);
    links.push({ source, target });
  };

  const skill = (raw: string) => {
    const key = skillKey(raw);
    if (!key) return null;
    if (!skills.has(key)) {
      skills.set(key, {
        id: `skill:${key}`,
        type: "skill",
        label: LABELS[key] ?? raw,
        primary: PRIMARY.has(key),
      });
    }
    return skills.get(key)!.id;
  };

  experience.forEach((item, index) => {
    const id = `role:${index}`;
    nodes.push({
      id,
      type: "role",
      label: item.company,
      role: item.role,
      duration: item.duration.replace(" to ", " – "),
      place: item.place,
      summary: item.note,
      deepDive: item.deepDive,
    });
    link("me", id);
    item.stack.forEach((tool) => {
      const skillId = skill(tool);
      if (skillId) link(id, skillId);
    });
  });

  projects.forEach((project) => {
    const id = `project:${project.slug}`;
    nodes.push({
      id,
      type: "project",
      label: project.name,
      slug: project.slug,
      coverImage: project.coverImage,
      excerpt: project.excerpt,
    });
    link("me", id);
    project.skills.forEach((tool) => {
      const skillId = skill(tool);
      if (skillId) link(id, skillId);
    });
  });

  notes.forEach((note) => {
    const id = `note:${note.slug}`;
    const href = noteHref(note);
    nodes.push({
      id,
      type: "note",
      label: note.title,
      short: note.short,
      href,
      summary: note.summary,
    });

    const roleIndex = experience.findIndex((item) => item.deepDive === href);
    if (roleIndex >= 0) link(`role:${roleIndex}`, id);

    note.topics.forEach((topic) => {
      const key = skillKey(topic);
      if (skills.has(key)) link(id, skills.get(key)!.id);
    });
  });

  nodes.push(...skills.values());
  return { nodes, links };
}
