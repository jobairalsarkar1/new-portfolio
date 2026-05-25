import BenzeneField from "./modern/components/BenzeneField";
import ContactSection from "./modern/components/ContactSection";
import ExperienceSection from "./modern/components/ExperienceSection";
import HeroSection from "./modern/components/HeroSection";
import ModernNav from "./modern/components/ModernNav";
import SkillsStrip from "./modern/components/SkillsStrip";
import WorkSection from "./modern/components/WorkSection";

export default function Home() {
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
