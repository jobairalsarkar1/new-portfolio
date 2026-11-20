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
        Looking for the old site? <Link href="/v1">Visit version one</Link>.
      </p>
    </footer>
  );
}
