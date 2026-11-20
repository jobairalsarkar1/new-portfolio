import Link from "next/link";
import { profile } from "../_lib/content";
import LocalTime from "./LocalTime";

export default function SiteFooter() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <p className="footer-colophon">
          Set in Inter. The moving surface at the top of the home page is real
          physics: the equation for waves on water, solved live in your browser
          and drawn in 3D. Nothing is prerecorded.
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
