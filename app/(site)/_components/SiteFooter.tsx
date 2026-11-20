import Link from "next/link";
import { profile } from "../_lib/content";
import LocalTime from "./LocalTime";

export default function SiteFooter() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <p className="footer-colophon">
          Set in Inter. The surface at the top of the home page is a damped
          wave equation solved with finite differences and drawn as ridge lines
          in perspective. It runs live in your browser, nothing is
          prerecorded.
        </p>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} {profile.name}</span>
          <span>
            Dhaka, <LocalTime />
          </span>
          <nav className="footer-links" aria-label="Elsewhere">
            <a href={profile.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href={profile.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <a href={profile.resume} download>
              Résumé
            </a>
            <Link href="/writing">Writing</Link>
            <Link href="/v1">v1</Link>
          </nav>
          <a href="#top" className="footer-top">
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
