import BenzeneField from "./BenzeneField";
import ModernEffects from "./ModernEffects";

export default function ModernBackdrop() {
  return (
    <>
      <BenzeneField />
      <div className="modern-noise" />
      <ModernEffects />
    </>
  );
}
