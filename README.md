# Jobair Al Sarkar Portfolio

Personal portfolio for [jobairalsarkar.com](https://jobairalsarkar.com), built with Next.js, React, TypeScript, Tailwind CSS, Prisma, and PostgreSQL.

The site presents my work as a Full Stack Software Engineer focused on scalable backend systems, modern web interfaces, production platforms, and real business workflows.

## Overview

This project includes two public portfolio experiences and a private dashboard for managing content.

- Modern portfolio homepage with an interactive visual background
- Older `/about`, `/projects`, `/contact`, and `/v1` pages kept for archive and supporting routes
- Project and skill data managed through API routes and Prisma
- Dashboard for managing projects, skills, images, users, and contact messages
- Contact form with saved messages and email delivery
- Resume download from the hero section

## Current Public Experience

The main homepage uses the modern portfolio flow:

1. Hero section with resume download
2. Categorized skills and stack overview
3. Experience section with detailed work stories
4. Selected work section with expandable project cards
5. Contact section

The modern page is powered by components in:

```txt
app/modern/components
```

The root homepage reuses the same modern experience:

```txt
app/page.tsx
```

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
/                         Modern portfolio homepage
/modern                   Modern portfolio route
/about                    Older about page
/projects                 Project archive
/projects/[slug]          Project detail page
/contact                  Older contact page
/v1                       Older 3D portfolio page
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
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
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
