export type Note = {
  slug: string;
  title: string;
  short: string;
  summary: string;
  context: string;
  published: string;
  readingTime: string;
  topics: string[];
  interactive?: boolean;
};

export const notes: Note[] = [
  {
    slug: "oracle-to-postgres-cdc",
    title: "Keeping two hospital databases in sync without stopping the hospital",
    short: "CDC deep dive",
    summary:
      "How we copy every change from an old Oracle database into a new PostgreSQL one while the hospital keeps running, explained in plain words. With a live model you can play with.",
    context: "From my work at FringeCore_",
    published: "2026-11-20",
    readingTime: "7 min read",
    topics: ["CDC", "Kafka", "PostgreSQL", "Oracle", "Queueing"],
    interactive: true,
  },
];

export function noteHref(note: Note) {
  return `/writing/${note.slug}`;
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}
