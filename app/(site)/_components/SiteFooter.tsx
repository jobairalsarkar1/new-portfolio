import { FaGithub, FaLinkedin } from "react-icons/fa";
import { profile } from "../_lib/content";

export default function SiteFooter() {
  return (
    <footer className="footer">
      <div className="footer-row">
        <p>
          © {new Date().getFullYear()} {profile.name}. Press <kbd>⌘K</kbd> to
          get around.
        </p>
        <div className="footer-social">
          <a href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub">
            <FaGithub aria-hidden />
          </a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
            <FaLinkedin aria-hidden />
          </a>
        </div>
      </div>
      <p>
        Looking for the previous design?{" "}
        <a href="/v2" target="_blank" rel="noopener">
          Visit version two
        </a>
        .
      </p>
    </footer>
  );
}
