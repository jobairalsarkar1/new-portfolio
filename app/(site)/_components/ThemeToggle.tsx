"use client";

import { useEffect } from "react";
import { FiMoon, FiSun } from "react-icons/fi";
import { applyTheme, storedTheme, toggleTheme } from "../_lib/theme";

export default function ThemeToggle() {
  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const followSystem = () => {
      if (!storedTheme()) applyTheme(query.matches ? "dark" : "light", false);
    };

    query.addEventListener("change", followSystem);
    return () => query.removeEventListener("change", followSystem);
  }, []);

  return (
    <button
      type="button"
      className="icon-button"
      aria-label="Toggle light and dark theme"
      onClick={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        toggleTheme({
          x: bounds.left + bounds.width / 2,
          y: bounds.top + bounds.height / 2,
        });
      }}
    >
      <FiMoon className="show-light" aria-hidden />
      <FiSun className="show-dark" aria-hidden />
    </button>
  );
}
