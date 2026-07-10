import Link from "next/link";

export default function ModernNav() {
  return (
    <nav className="modern-nav" aria-label="Modern portfolio navigation">
      <Link href="/" className="modern-mark">
        JAS
      </Link>
      <div className="modern-nav-links">
        <Link href="/#work">Work</Link>
        <Link href="/#experience">Experience</Link>
        <Link href="/#contact">Contact</Link>
      </div>
    </nav>
  );
}
