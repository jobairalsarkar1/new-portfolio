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
      "The largest is the Hospital Information System and ERP for Asgar Ali Hospital. It is a TypeScript monorepo with React on the frontend and tRPC procedures on a Node.js backend, so types are checked all the way from the database to the screen. I work across the frontend, the backend and the shared layers, and have spent a lot of time on patient appointments and scheduling, turning complex flows into simpler ones for patients and staff.\n\n" +
      "The hospital is moving from an older Oracle database to PostgreSQL without stopping daily operations. I worked on the change data capture pipeline, built on Kafka, that keeps both databases in sync while modules move over one at a time.\n\n" +
      "On a retail and supply chain ERP that runs a retail chain's shops and warehouses, I work on B2B sales, from bulk partner orders through approval to dispatch and invoices, and on the partner API that outside systems use to place orders and settle returns. I built the vendor ledger and payable bills, the team performance dashboard, and the reports the analytics team works from, and I work on its deployment on AWS with monitoring and backups.\n\n" +
      "I also led the build of a group accounting system: multi-company, double-entry bookkeeping for a group of companies, from the general ledger to consolidation and financial statements. It was built with an AI agent workflow that I directed. I set the plan, made the accounting and design decisions, reviewed and approved every change, and deployed it to AWS. The database refuses entries that do not balance, voucher numbers have no gaps, and the audit log is tamper-evident.\n\n" +
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
    stack: ["TypeScript", "React", "Node.js", "tRPC", "NestJS", "PostgreSQL", "Oracle", "Kafka/CDC", "Kysely", "Prisma", "Redis", "Astro", "AWS"],
  },
  {
    company: "Picture TV",
    role: "Full Stack Developer",
    duration: "Jun 2025 to Jan 2026",
    place: "New York, Remote",
    note: "Built a content driven marketplace platform from the ground up with image and video selling, event booking, blogging, JWT magic links, role based access, Stripe payments, Cloudinary uploads, and admin tooling.",
    overview:
      "At Picture TV, I worked as a full stack developer on a contract basis, building a content driven marketplace platform from the ground up. The platform was designed to support buying and selling images and videos, along with event booking, blogging, and media focused features, so it involved a mix of product thinking and solid engineering.\n\nI was involved throughout the entire lifecycle, from planning and structuring the system to implementing core features and refining the user experience. The stack included Next.js, React, Tailwind CSS, Prisma, and MongoDB, along with integrations like Stripe for payments and Cloudinary for media handling.\n\nOne of the key areas I focused on was authentication and access control. I implemented a JWT based system with magic links and role based access, making sure different types of users could interact with the platform securely and appropriately. Payments were another important part of the system, where I worked on integrating Stripe to handle transactions in a reliable way.\n\nI also built out an admin dashboard that allowed managing users, events, blog content, and uploaded media. This became a central tool for controlling the platform and keeping everything organized behind the scenes.\n\nOverall, the work was a balance of building features quickly while still thinking about scalability and maintainability. It pushed me to handle a wide range of responsibilities across the stack and make decisions that directly impacted how the product evolved.",
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
    note: "Built and maintained full stack features with Next.js, React, Express, PostgreSQL, and Prisma while contributing to Azure AI Video Indexer, Stripe subscriptions, Cloudflare delivery, and backend scalability work.",
    overview:
      "During my internship at Logic Matrix, I contributed to full stack development across frontend and backend features. I built and refined work using Next.js, React, Express.js, Tailwind CSS, PostgreSQL, and Prisma, while learning how production systems evolve through reviews, debugging, and team discussions.\n\nOne of the most valuable areas was Azure AI Video Indexer. I helped integrate video processing, transcription, and automated insight workflows so the application could surface useful media intelligence to users.\n\nI also contributed to Stripe based subscription flows, authentication related work, and performance improvements using Cloudflare. Those areas helped me understand how payments, infrastructure, media processing, and user facing features connect inside real products.\n\nThe internship pushed me to think beyond isolated tickets. I became more conscious of backend scalability, maintainability, data flow, and how engineering decisions affect the product over time.",
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
    note: "Delivered end to end web applications for clients using Next.js, React, Node.js, PostgreSQL, MongoDB, authentication systems, admin dashboards, Stripe payments, and Cloudinary media handling.",
    overview:
      "Before joining structured engineering teams, I worked as a freelance full stack developer and delivered web applications for different clients and use cases. I handled the full project lifecycle, from requirement gathering and planning to architecture, development, deployment, and client communication.\n\nMost of the work used Next.js, React, Node.js, Prisma, MongoDB, and PostgreSQL. Depending on the project, I built authentication systems, admin dashboards, Stripe payment flows, and Cloudinary based media handling.\n\nFreelancing taught me how to understand business needs before writing code, make practical technical decisions, manage scope, and deliver software that people could actually use.\n\nThat period gave me a strong foundation in ownership. It taught me how to move from an idea to a shipped product, how to make tradeoffs when time and budget matter, and how to keep the user and business goal at the center of the work.",
    signal: "Client delivery",
    start: "2023-06",
    end: "2024-10",
    stack: ["Next.js", "React", "Node.js", "PostgreSQL", "MongoDB", "Stripe", "Cloudinary"],
  },
];
