export type Experience = {
  company: string;
  role: string;
  duration: string;
  start: string;
  end: string | null;
  place: string;
  note: string;
  overview: string;
  signal: string;
  stack: string[];
  deepDive?: string;
  products?: { name: string; href?: string }[];
};

export const experience: Experience[] = [
  {
    company: "FringeCore_",
    role: "Software Engineer",
    duration: "Nov 2025 to Present",
    place: "Dhaka, Bangladesh",
    note: "Full stack engineer on four systems: a hospital information system and ERP, a retail and supply chain ERP, a group accounting system, and the Ekhon TV news site.",
    overview:
      "At FringeCore_ I work across several systems for organizations in Bangladesh, from a hospital to a retail chain to a TV news channel.\n\n" +
      "The largest is the Hospital Information System and ERP for Asgar Ali Hospital. It is a TypeScript monorepo with React on the frontend and tRPC procedures on a Node.js backend, so types are checked all the way from the database to the screen. I delivered three of its core modules, appointment management, patient registration and user access control, and turned complex scheduling flows into simpler ones for patients and staff. I also built the desktop-style shell that staff work in, where every open workflow gets its own tab and keeps its state, so nobody loses their place when switching between patients, and the auto-update system for the desktop app: a Cloudflare Worker that serves release information and a download service for the Windows and Linux installers.\n\n" +
      "The hospital is moving from an older Oracle database to PostgreSQL without stopping daily operations. I built the change data capture pipeline, on Kafka, that streams every change from Oracle into PostgreSQL, keeping the new database in sync with the old one while modules move over one at a time.\n\n" +
      "On a retail and supply chain ERP that runs a retail chain's shops and warehouses, I built the B2B sales module, from bulk partner orders through approval to dispatch and invoices. I also built the partner API that outside systems use to place orders and settle returns, the vendor ledger and payable bills, the team performance dashboard, and the reports the analytics team works from. I also work on its deployment on AWS, with monitoring and backups.\n\n" +
      "I also owned the build of a group accounting system: multi-company, double-entry bookkeeping for a group of companies, from the general ledger to consolidation and financial statements. It was built with an AI agent workflow that I directed. I set the plan, made the accounting and design decisions, reviewed and approved every change, and deployed it to AWS. The database refuses entries that do not balance, voucher numbers have no gaps, and the audit log is tamper-evident.\n\n" +
      "On Ekhon TV, the website of a Bangladeshi TV news channel, I work on the site's pages and its article search, and I build the advertising that funds it: ad network integrations, sponsor campaigns, and placements that fit any screen and fall back to news when an ad does not load.",
    signal: "Hospital systems",
    start: "2025-11",
    end: null,
    deepDive: "/writing/oracle-to-postgres-cdc",
    products: [
      { name: "Asgar Ali Hospital HIS and ERP" },
      { name: "a Retail and Supply Chain ERP" },
      { name: "a Group Accounting System" },
      { name: "Ekhon TV", href: "https://ekhon.tv" },
    ],
    stack: ["TypeScript", "React", "Node.js", "tRPC", "NestJS", "PostgreSQL", "Oracle", "Kafka/CDC", "Electron", "Kysely", "Prisma", "Redis", "Astro", "AWS"],
  },
  {
    company: "Picture TV",
    role: "Full Stack Developer",
    duration: "Jun 2025 to Jan 2026",
    place: "New York, Remote",
    note: "Built the web platform for a New York media company from the ground up: an image and video marketplace, event booking, a blog, magic link sign-in with roles, Stripe payments, and the admin dashboard.",
    overview:
      "At Picture TV, a New York media company, I worked as a full stack developer on contract and built their web platform from the ground up: a marketplace for buying and selling images and videos, with event booking and a blog.\n\n" +
      "I planned the structure of the system and built its core features with Next.js, React, Tailwind CSS, Prisma and MongoDB, using Stripe for payments and Cloudinary for media.\n\n" +
      "I built sign-in with JWT and magic links, with roles so each kind of user sees only what they should, and the Stripe payment flows. I also built the admin dashboard the team uses to manage users, events, blog posts and uploaded media.",
    signal: "Marketplace",
    start: "2025-06",
    end: "2026-01",
    products: [{ name: "Picture TV Media", href: "https://www.picturetv.net" }],
    stack: ["Next.js", "React", "Prisma", "MongoDB", "Stripe", "Cloudinary", "JWT auth"],
  },
  {
    company: "Logic Matrix",
    role: "Software Engineer Intern",
    duration: "Feb 2025 to May 2025",
    place: "Virginia, Remote",
    note: "Built full stack features for Redaxify with Next.js, Express, and PostgreSQL, integrated Azure AI Video Indexer and Azure OpenAI, and implemented Stripe subscriptions and faster media delivery with Cloudflare.",
    overview:
      "During my internship at Logic Matrix I built full stack features for Redaxify, an AI platform for redacting and indexing video and documents, using Next.js, React, Express.js, Tailwind CSS, PostgreSQL and Prisma.\n\n" +
      "I integrated Azure AI Video Indexer and Azure OpenAI for transcription, summaries and automated insights about each video, with secure Azure Storage for uploads and playback.\n\n" +
      "I also implemented role based access, sign-in and Stripe subscription billing, and improved media delivery with Cloudflare.",
    signal: "AI video product",
    start: "2025-02",
    end: "2025-05",
    products: [{ name: "Redaxify", href: "https://redaxify.com" }],
    stack: ["Next.js", "Express", "PostgreSQL", "Prisma", "Azure AI Video Indexer", "Stripe", "Cloudflare"],
  },
  {
    company: "Self Employed",
    role: "Full Stack Developer",
    duration: "Jun 2023 to Oct 2024",
    place: "Remote",
    note: "Built web applications for clients from the first requirements to launch, with sign-in, admin dashboards, Stripe payments, and media uploads, using Next.js, React, Node.js, PostgreSQL, and MongoDB.",
    overview:
      "Before joining engineering teams, I worked as a freelance full stack developer and built web applications for clients, from the first requirements through architecture, development, deployment and handover.\n\n" +
      "Most of the work used Next.js, React, Node.js, Prisma, MongoDB and PostgreSQL. Depending on the project, I built sign-in systems, admin dashboards, Stripe payment flows and Cloudinary media handling.",
    signal: "Client delivery",
    start: "2023-06",
    end: "2024-10",
    stack: ["Next.js", "React", "Node.js", "PostgreSQL", "MongoDB", "Stripe", "Cloudinary"],
  },
];
