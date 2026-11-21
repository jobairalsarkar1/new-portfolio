import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown, { type Components } from "react-markdown";
import { getCloudinaryBlurUrl } from "@/lib/cloudinary";
import { excerpt, getProject, getProjects } from "../../_lib/projects";

export const revalidate = 300;

type PageProps = {
  params: Promise<{ slug: string }>;
};

function headingId(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function textOf(children: React.ReactNode): string {
  if (typeof children === "string" || typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(textOf).join("");
  if (children && typeof children === "object" && "props" in children) {
    return textOf((children as { props: { children?: React.ReactNode } }).props.children);
  }
  return "";
}

const markdownComponents: Components = {
  h2: ({ children }) => <h2 id={headingId(textOf(children))}>{children}</h2>,
  a: ({ href, children }) => {
    const external = href?.startsWith("http");
    return (
      <a href={href} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
        {children}
      </a>
    );
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) return { title: "Work not found | Jobair Al Sarkar" };

  const description = excerpt(project.description, 155);
  return {
    title: `${project.name} | Jobair Al Sarkar`,
    description,
    openGraph: {
      title: `${project.name} | Jobair Al Sarkar`,
      description,
      images: [project.heroImage || project.coverImage],
    },
  };
}

export default async function WorkPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const projects = await getProjects();
  const index = projects.findIndex((item) => item.id === project.id);
  const nextProject = projects.length > 1 ? projects[(index + 1) % projects.length] : null;

  const image = project.heroImage || project.coverImage;
  return (
    <article className="article">
      <header className="article-header">
        <p className="row-meta">
          Case study {index + 1} of {projects.length}
        </p>
        <h1>{project.name}</h1>
        {project.skills.length > 0 && (
          <p className="article-dek">{project.skills.map((skill) => skill.name).join(", ")}</p>
        )}
        <ul className="intro-links">
          {project.link && (
            <li>
              <a href={project.link} target="_blank" rel="noreferrer">
                Live site
              </a>
            </li>
          )}
          {project.gitLink && (
            <li>
              <a href={project.gitLink} target="_blank" rel="noreferrer">
                Source code
              </a>
            </li>
          )}
          {project.canContact && (
            <li>
              <Link href="/#contact">Build something like this</Link>
            </li>
          )}
        </ul>
      </header>

      <div className="article-cover">
        <Image
          src={image}
          alt={project.name}
          fill
          priority
          sizes="(max-width: 720px) 100vw, 680px"
          placeholder="blur"
          blurDataURL={getCloudinaryBlurUrl(image)}
        />
      </div>

      <div className="article-body prose">
        <ReactMarkdown components={markdownComponents}>{project.description}</ReactMarkdown>
      </div>

      {nextProject && nextProject.id !== project.id && (
        <p className="article-next">
          Next case study:{" "}
          <Link href={`/work/${nextProject.slug}`} className="inline-link">
            {nextProject.name}
          </Link>
        </p>
      )}
    </article>
  );
}
