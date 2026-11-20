export type Note = {
  slug: string;
  title: string;
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
    summary:
      "How change data capture, Kafka partitions, and a little queueing theory move data from Oracle to PostgreSQL while staff keep working. With a live model you can push until it breaks.",
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
