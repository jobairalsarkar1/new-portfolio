import Link from "next/link";

export default function ModernNav() {
  return (
    <nav className="modern-nav" aria-label="Modern portfolio navigation">
      <Link href="/" className="modern-mark">
        JAS
      </Link>
      <div className="modern-nav-links">
        <a href="#work">Work</a>
        <a href="#experience">Experience</a>
        <a href="#contact">Contact</a>
      </div>
    </nav>
  );
}
