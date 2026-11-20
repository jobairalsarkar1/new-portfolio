import ContactSection from "./components/ContactSection";
import ExperienceSection from "./components/ExperienceSection";
import HeroSection from "./components/HeroSection";
import ModernBackdrop from "./components/ModernBackdrop";
import ModernFooter from "./components/ModernFooter";
import ModernNav from "./components/ModernNav";
import SkillsStrip from "./components/SkillsStrip";
import WorkSection from "./components/WorkSection";

export default function ModernPortfolio() {
  return (
    <main id="top" className="modern-shell">
      <ModernBackdrop />

      <ModernNav />
      <HeroSection />
      <SkillsStrip />
      <ExperienceSection />
      <WorkSection />
      <ContactSection />
      <ModernFooter />
    </main>
  );
}
