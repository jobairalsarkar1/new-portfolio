import Link from "next/link";
import { profile } from "../_lib/content";

export default function SiteFooter() {
  return (
    <footer className="footer">
      <p>
        © {new Date().getFullYear()} {profile.name}. Set in Inter, built with
        Next.js. Press <kbd>⌘K</kbd> to get around.
      </p>
      <p>
        Looking for the previous design? <Link href="/v2">Visit version two</Link>.
      </p>
    </footer>
  );
}
