export const profile = {
  name: "Jobair Al Sarkar",
  role: "Software Engineer",
  company: "FringeCore_",
  location: "Dhaka, Bangladesh",
  timeZone: "Asia/Dhaka",
  email: "jobair.a.sarkar@gmail.com",
  phone: "+8801766961460",
  resume: "/assets/resume/jobair-al-sarkar-resume.pdf",
  github: "https://github.com/jobairalsarkar1",
  linkedin: "https://www.linkedin.com/in/jobair-al-sarkar/",
};

export const navigation = [
  { id: "experience", label: "Experience", href: "/#experience" },
  { id: "work", label: "Work", href: "/#work" },
  { id: "writing", label: "Writing", href: "/writing" },
  { id: "approach", label: "Approach", href: "/#approach" },
  { id: "contact", label: "Contact", href: "/#contact" },
];

export const homeSections = navigation.filter((item) => item.href.startsWith("/#"));

export const principles = [
  {
    title: "Understand the operation first",
    text: "Before writing code I map who does the work, what data they touch, and where it hurts. Redesigning hospital scheduling taught me that the right flow beats the clever one.",
  },
  {
    title: "Modernize without stopping the floor",
    text: "Legacy systems carry real operations. I prefer incremental migrations, like streaming changes from Oracle into PostgreSQL, so nobody notices the ground moving.",
  },
  {
    title: "Types from database to button",
    text: "Shared types across the stack with TypeScript, tRPC and Prisma turn whole categories of bugs into compile errors and make large codebases safe to change.",
  },
  {
    title: "Own it all the way to production",
    text: "Requirements, architecture, deployment, and the conversation after launch. Freelancing taught me scope, tradeoffs, and shipping things people actually use.",
  },
];

export const toolbox = [
  {
    title: "Languages",
    items: ["TypeScript", "JavaScript", "Python", "Java", "C#"],
  },
  {
    title: "Frontend",
    items: ["React", "Next.js", "React Native", "Tailwind CSS", "Three.js"],
  },
  {
    title: "Backend & systems",
    items: [
      "Node.js",
      "tRPC",
      "Express",
      "Django",
      "Flask",
      ".NET",
      "Prisma",
      "Kafka / CDC pipelines",
      "Monorepo architecture",
    ],
  },
  {
    title: "Data",
    items: ["PostgreSQL", "Oracle", "MongoDB", "MySQL"],
  },
  {
    title: "Cloud & delivery",
    items: [
      "Docker",
      "Turborepo",
      "Azure",
      "Azure OpenAI",
      "Cloudflare",
      "Stripe",
      "Cloudinary",
      "Git & GitHub",
    ],
  },
];

export const dailyDrivers = new Set([
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "tRPC",
  "PostgreSQL",
  "Kafka / CDC pipelines",
]);
