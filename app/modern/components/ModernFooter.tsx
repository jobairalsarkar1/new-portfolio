import { FiArrowUp } from "react-icons/fi";

export default function ModernFooter() {
  return (
    <footer className="modern-footer">
      <span>© {new Date().getFullYear()} Jobair Al Sarkar</span>
      <span className="modern-footer-note">
        Next.js, TypeScript, and a lattice that reacts to you.
      </span>
      <a href="#top" className="modern-footer-top" data-magnetic>
        Back to top <FiArrowUp />
      </a>
    </footer>
  );
}
