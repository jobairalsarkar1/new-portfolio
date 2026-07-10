import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { FaExternalLinkAlt, FaGithub } from "react-icons/fa";
import { FiArrowLeft, FiMail } from "react-icons/fi";
import BenzeneField from "@/app/modern/components/BenzeneField";
import ModernNav from "@/app/modern/components/ModernNav";
import { getCloudinaryBlurUrl } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type ProjectPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await prisma.project.findFirst({
    where: {
      OR: [{ slug }, { id: slug }],
    },
    select: {
      name: true,
      description: true,
      coverImage: true,
    },
  });

  if (!project) {
    return {
      title: "Work not found | Jobair Al Sarkar",
    };
  }

  return {
    title: `${project.name} | Jobair Al Sarkar`,
    description: project.description.replace(/[#_*`>[\]()]/g, "").slice(0, 150),
    openGraph: {
      title: `${project.name} | Jobair Al Sarkar`,
      description: project.description
        .replace(/[#_*`>[\]()]/g, "")
        .slice(0, 150),
      images: [project.coverImage],
    },
  };
}

export default async function ModernWorkDetail({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await prisma.project.findFirst({
    where: {
      OR: [{ slug }, { id: slug }],
    },
    include: {
      skills: {
        orderBy: {
          priority: "desc",
        },
      },
    },
  });

  if (!project) {
    notFound();
  }

  const heroImage = project.heroImage || project.coverImage;

  return (
    <main className="modern-shell">
      <BenzeneField />
      <div className="modern-noise" />
      <ModernNav />

      <article className="modern-work-detail">
        <div className="modern-work-back-row">
          <Link href="/#work" className="modern-secondary">
            <FiArrowLeft />
            Back to work
          </Link>
        </div>

        <section className="modern-work-hero">
          <div className="modern-work-hero-copy">
            <p className="modern-kicker">Selected work</p>
            <h1>{project.name}</h1>
            <p>
              A closer look at the product, system, and implementation details
              behind this project.
            </p>

            {project.skills.length > 0 && (
              <div className="modern-work-skill-list" aria-label="Skills used">
                {project.skills.map((skill) => (
                  <span
                    key={skill.id}
                    className={`modern-work-skill ${skill.needsBg ? "needs-bg" : ""}`}
                  >
                    <span>
                      <Image
                        src={skill.iconUrl}
                        alt={skill.name}
                        width={18}
                        height={18}
                      />
                    </span>
                    {skill.name}
                  </span>
                ))}
              </div>
            )}

            <div className="modern-actions">
              {project.link && (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noreferrer"
                  className="modern-primary"
                >
                  Visit site <FaExternalLinkAlt />
                </a>
              )}
              {project.gitLink && (
                <a
                  href={project.gitLink}
                  target="_blank"
                  rel="noreferrer"
                  className="modern-secondary"
                >
                  GitHub <FaGithub />
                </a>
              )}
              {project.canContact && (
                <Link href="/#contact" className="modern-secondary">
                  Discuss this <FiMail />
                </Link>
              )}
            </div>
          </div>

          <div className="modern-work-hero-media">
            <Image
              src={heroImage}
              alt=""
              fill
              priority
              sizes="(max-width: 900px) 100vw, 44vw"
              className="modern-work-hero-backdrop"
              aria-hidden="true"
            />
            <Image
              src={heroImage}
              alt={project.name}
              fill
              priority
              sizes="(max-width: 900px) 100vw, 44vw"
              className="modern-work-hero-image"
              placeholder="blur"
              blurDataURL={getCloudinaryBlurUrl(heroImage)}
            />
          </div>
        </section>

        <section className="modern-work-body">
          <div className="modern-work-body-head">
            <p>Case study</p>
            <h2>Project notes</h2>
          </div>

          <div className="modern-work-case-grid">
            <div className="modern-markdown">
              <ReactMarkdown>{project.description}</ReactMarkdown>
            </div>

            <aside className="modern-work-sidebar" aria-label="Project summary">
              <div className="modern-work-sidebar-card">
                <span>Project</span>
                <strong>{project.name}</strong>
                <p>
                  Detailed implementation notes, product capabilities, and stack
                  choices from the saved case study.
                </p>
              </div>

              {project.skills.length > 0 && (
                <div className="modern-work-sidebar-card">
                  <span>Stack</span>
                  <div className="modern-work-sidebar-skills">
                    {project.skills.slice(0, 10).map((skill) => (
                      <span key={skill.id}>{skill.name}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="modern-work-sidebar-card">
                <span>Links</span>
                <div className="modern-work-sidebar-actions">
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noreferrer"
                      className="modern-secondary"
                    >
                      Visit site <FaExternalLinkAlt />
                    </a>
                  )}
                  {project.gitLink && (
                    <a
                      href={project.gitLink}
                      target="_blank"
                      rel="noreferrer"
                      className="modern-secondary"
                    >
                      GitHub <FaGithub />
                    </a>
                  )}
                  {project.canContact && (
                    <Link href="/#contact" className="modern-secondary">
                      Discuss this <FiMail />
                    </Link>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </section>
      </article>
    </main>
  );
}
