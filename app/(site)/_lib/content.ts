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
    title: "Understand the work first",
    text: "Before I write code, I learn who does the work, what information they use, and where they get stuck. Redesigning hospital scheduling taught me that a clear flow beats a clever one.",
  },
  {
    title: "Change systems without stopping them",
    text: "Old systems still run real work. I prefer moving them step by step, like copying changes from Oracle to PostgreSQL as they happen, so nobody's day is interrupted.",
  },
  {
    title: "Catch mistakes before users do",
    text: "With TypeScript, tRPC and Prisma, the database, the server and the screens all agree on the shape of the data. Many bugs show up while I'm coding instead of in front of users.",
  },
  {
    title: "Own it from start to finish",
    text: "From the first conversation to launch and the support after it. Freelancing taught me to manage scope, make tradeoffs, and ship things people actually use.",
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
