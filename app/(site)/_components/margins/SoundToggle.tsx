"use client";

import { useEffect, useState } from "react";
import { FiVolume2, FiVolumeX } from "react-icons/fi";
import { onSoundChange, readSoundPreference, restoreSound, setSound } from "./sound";

export default function SoundToggle({ className }: { className?: string }) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    setOn(readSoundPreference());
    const stopRestore = restoreSound();
    const stopListening = onSoundChange(setOn);
    return () => {
      stopRestore();
      stopListening();
    };
  }, []);

  return (
    <button
      type="button"
      className={className}
      aria-pressed={on}
      aria-label={on ? "Turn sound off" : "Turn sound on"}
      title={on ? "Sound on" : "Sound off"}
      onClick={() => setSound(!on)}
    >
      {on ? <FiVolume2 aria-hidden /> : <FiVolumeX aria-hidden />}
    </button>
  );
}
