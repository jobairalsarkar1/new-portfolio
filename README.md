# Jobair Al Sarkar Portfolio

Personal portfolio for [jobairalsarkar.com](https://jobairalsarkar.com), built with Next.js, React, TypeScript, Tailwind CSS, Prisma, and PostgreSQL.

The site presents my work as a Full Stack Software Engineer focused on scalable backend systems, modern web interfaces, production platforms, and real business workflows.

## Overview

A simple, single column portfolio with one crafted centerpiece, plus an older archived version and a private dashboard for managing content.

- Living words in the intro: a few words come alive on hover or tap (a heartbeat, packets on a pipeline, two databases syncing, a TV switching on, a video playhead on Redaxify, a camera flash on Picture TV Media)
- A text art chart of my career behind the icon next to the Experience heading, printed with block characters
- The previous design is kept at `/v2`
- Live details: local time in Dhaka and how far it is from the visitor, and how long I have been building software
- Experience, work (from the database), writing, stack, and contact on one page
- Writing section, starting with an interactive Kafka/CDC deep dive (Poisson arrivals, keyed partitions, M/M/1 consumers)
- Case study pages rendered from markdown stored in the database
- Three margin effects that react to the cursor and rotate with the visitor's time of day: a pond overnight (wave equation), wind chimes by day (Verlet chains), and ink in water in the evening (stable fluids). Visitors can pick one from the switcher or the command menu, and can turn on sound that is synthesized live: chimes with the uneven overtones of a free metal rod, bubble drops (Minnaert resonance) and a soft stir for the ink
- Command menu (`⌘K` / `Ctrl K`), light and dark themes
- Older `/about`, `/projects`, `/contact`, and `/v1` pages kept as an archive

Everything for the public site lives in:

```txt
app/(site)
  _components   UI, the text database (AsciiDatabase) and the pipeline model (PipelineSim)
  _lib          content, experience data, project queries, writing, theme helpers
  site.css      design tokens and styles for both themes
  work/[slug]   case study page
  writing       writing index and articles
```

Pages are statically generated and revalidated every five minutes. Creating, editing, or deleting a project from the dashboard revalidates them right away.

## Dashboard

The dashboard lives under:

```txt
app/(dashboard)/jas-dashboard
```

It supports:

- Creating projects
- Editing projects
- Deleting projects
- Managing skills
- Managing uploaded images
- Viewing contact messages
- Managing users

Project descriptions are written with a custom markdown editor:

```txt
components/dashboard/ProjectDescriptionEditor.tsx
```

The editor supports writing, preview, split view, quick formatting, and case study templates.

## Tech Stack

| Area | Tools |
| --- | --- |
| Framework | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS, custom CSS |
| Database | PostgreSQL, Prisma |
| Auth | NextAuth |
| Media | Cloudinary, Next Image |
| Email | Nodemailer, Gmail SMTP |
| 3D and Visuals | Three.js, React Three Fiber, custom SVG interactions |
| Dashboard | React, API routes, Prisma models |

## Content Model

Main Prisma models:

- `Project`
- `Skill`
- `Image`
- `ContactMessage`
- `User`

Project descriptions are stored as markdown in the database and rendered on public project detail pages.

## Key Routes

```txt
/                         Portfolio homepage
/work/[slug]              Case study page
/writing                  Writing index
/writing/oracle-to-postgres-cdc   Interactive CDC deep dive
/about                    Older about page
/projects                 Project archive
/projects/[slug]          Older project detail page
/contact                  Older contact page
/v1                       First 3D portfolio
/v2                       Previous design
/jas-dashboard            Dashboard home
/jas-dashboard/projects   Project management
```

## Local Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Run checks:

```bash
npm run lint
npx tsc --noEmit
```

## Environment Variables

The app expects environment variables for database access, auth, Cloudinary, and email delivery. Common values include:

```txt
DATABASE_URL=
AUTH_SECRET=
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
GMAIL_SMTP_USER=
GMAIL_APP_PASSWORD=
CONTACT_RECEIVER_EMAIL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Contact

- Website: [jobairalsarkar.com](https://jobairalsarkar.com)
- Email: [jobair.a.sarkar@gmail.com](mailto:jobair.a.sarkar@gmail.com)
- GitHub: [github.com/jobairalsarkar1](https://github.com/jobairalsarkar1)
- LinkedIn: [linkedin.com/in/jobair-al-sarkar](https://www.linkedin.com/in/jobair-al-sarkar/)

## License

This is a personal portfolio project. All rights reserved.
