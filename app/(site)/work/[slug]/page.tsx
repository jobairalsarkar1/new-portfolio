import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown, { type Components } from "react-markdown";
import { FaGithub } from "react-icons/fa";
import { FiArrowLeft, FiArrowUpRight } from "react-icons/fi";
import { getCloudinaryBlurUrl } from "@/lib/cloudinary";
import Reveal from "../../_components/Reveal";
import { excerpt, getProject, getProjects, plainText } from "../../_lib/projects";

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
  const headings = project.description
    .split("\n")
    .filter((line) => /^##\s+/.test(line))
    .map((line) => plainText(line.replace(/^##\s+/, "")));

  return (
    <article id="top">
      <header className="container case-header">
        <Link href="/#work" className="case-back">
          <FiArrowLeft aria-hidden /> All work
        </Link>
        <h1 className="case-title">{project.name}</h1>

        <dl className="case-meta">
          {project.skills.length > 0 && (
            <div>
              <dt>Stack</dt>
              <dd>
                <ul className="tags">
                  {project.skills.map((skill) => (
                    <li key={skill.id}>{skill.name}</li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
          <div>
            <dt>Links</dt>
            <dd>
              {project.link && (
                <a href={project.link} target="_blank" rel="noreferrer">
                  Live site <FiArrowUpRight aria-hidden />
                </a>
              )}
              {project.gitLink && (
                <a href={project.gitLink} target="_blank" rel="noreferrer">
                  Source <FaGithub aria-hidden />
                </a>
              )}
              {!project.link && !project.gitLink && <span>Private build</span>}
            </dd>
          </div>
          <div>
            <dt>Case</dt>
            <dd>
              {String(index + 1).padStart(2, "0")} of {String(projects.length).padStart(2, "0")}
            </dd>
          </div>
        </dl>

        <div className="case-cover">
          <Image
            src={image}
            alt={project.name}
            fill
            priority
            sizes="(max-width: 1320px) 100vw, 1240px"
            placeholder="blur"
            blurDataURL={getCloudinaryBlurUrl(image)}
          />
        </div>
      </header>

      <div className="container case-body">
        <nav className="case-toc" aria-label="On this page">
          {headings.length > 1 && (
            <>
              <p>On this page</p>
              <ol>
                {headings.map((heading) => (
                  <li key={heading}>
                    <a href={`#${headingId(heading)}`}>{heading}</a>
                  </li>
                ))}
              </ol>
            </>
          )}
        </nav>

        <div>
          <div className="prose" data-reveal>
            <ReactMarkdown components={markdownComponents}>{project.description}</ReactMarkdown>
          </div>

          {project.canContact && (
            <div className="case-cta" data-reveal>
              <p>Need something like this built?</p>
              <Link href="/#contact" className="button button-solid">
                Let’s talk
              </Link>
            </div>
          )}
        </div>
      </div>

      {nextProject && nextProject.id !== project.id && (
        <nav className="case-next" aria-label="Next case study">
          <Link href={`/work/${nextProject.slug}`} className="container">
            <span className="eyebrow">
              <span>Next</span>Case study
            </span>
            <strong>{nextProject.name}</strong>
            <span className="work-arrow" aria-hidden>
              <FiArrowUpRight />
            </span>
          </Link>
        </nav>
      )}

      <Reveal />
    </article>
  );
}
