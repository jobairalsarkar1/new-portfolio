import BenzeneField from "./components/BenzeneField";
import ContactSection from "./components/ContactSection";
import ExperienceSection from "./components/ExperienceSection";
import HeroSection from "./components/HeroSection";
import ModernNav from "./components/ModernNav";
import SkillsStrip from "./components/SkillsStrip";
import WorkSection from "./components/WorkSection";

export default function ModernPortfolio() {
  return (
    <main className="modern-shell">
      <BenzeneField />
      <div className="modern-noise" />

      <ModernNav />
      <HeroSection />
      <SkillsStrip />
      <ExperienceSection />
      <WorkSection />
      <ContactSection />
    </main>
  );
}
