"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiArrowRight,
  FiCopy,
  FiDownload,
  FiExternalLink,
  FiMail,
  FiSearch,
  FiVolume2,
} from "react-icons/fi";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { HiOutlineSwatch } from "react-icons/hi2";
import { navigation, profile } from "../_lib/content";
import { toggleTheme } from "../_lib/theme";
import { EFFECTS, setMarginMode } from "./margins/Margins";
import { setSound, soundEnabled } from "./margins/sound";

type Command = {
  id: string;
  group: "Go to" | "Actions" | "Elsewhere";
  label: string;
  keywords?: string;
  icon: React.ReactNode;
  run: () => void | "keep-open";
};

type CommandMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function CommandMenu({ open, onOpenChange }: CommandMenuProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [status, setStatus] = useState<string | null>(null);

  const commands = useMemo<Command[]>(() => {
    const goTo = (id: string) => {
      if (pathname === "/") {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        history.replaceState(null, "", `#${id}`);
      } else {
        router.push(`/#${id}`);
      }
    };

    return [
      {
        id: "top",
        group: "Go to",
        label: "Home",
        icon: <FiArrowRight />,
        run: () => (pathname === "/" ? goTo("top") : router.push("/")),
      },
      ...navigation.map<Command>((item) => ({
        id: item.id,
        group: "Go to",
        label: item.label,
        keywords: item.id === "writing" ? "blog notes articles cdc kafka" : undefined,
        icon: <FiArrowRight />,
        run: () => (item.href.startsWith("/#") ? goTo(item.id) : router.push(item.href)),
      })),
      {
        id: "theme",
        group: "Actions",
        label: "Switch theme",
        keywords: "dark light mode color",
        icon: <HiOutlineSwatch />,
        run: () => toggleTheme(),
      },
      ...[{ id: "auto", label: "Auto (changes with the time of day)" }, ...EFFECTS].map<Command>((effect) => ({
        id: `margins-${effect.id}`,
        group: "Actions",
        label: `Margins: ${effect.label}`,
        keywords: "background margin effect ink pond strings threads",
        icon: <HiOutlineSwatch />,
        run: () => setMarginMode(effect.id as "auto" | "ink" | "pond" | "threads"),
      })),
      {
        id: "margin-sound",
        group: "Actions",
        label: "Margins: Turn sound on or off",
        keywords: "audio sound music strings water mute",
        icon: <FiVolume2 />,
        run: () => setSound(!soundEnabled()),
      },
      {
        id: "copy-email",
        group: "Actions",
        label: "Copy email address",
        keywords: "contact mail",
        icon: <FiCopy />,
        run: () => {
          navigator.clipboard
            .writeText(profile.email)
            .then(() => setStatus("Email copied to clipboard"))
            .catch(() => setStatus(profile.email));
          return "keep-open";
        },
      },
      {
        id: "email",
        group: "Actions",
        label: "Write an email",
        keywords: "contact mail",
        icon: <FiMail />,
        run: () => {
          window.location.href = `mailto:${profile.email}`;
        },
      },
      {
        id: "resume",
        group: "Actions",
        label: "Download résumé",
        keywords: "cv resume pdf",
        icon: <FiDownload />,
        run: () => {
          window.open(profile.resume, "_blank", "noopener");
        },
      },
      {
        id: "github",
        group: "Elsewhere",
        label: "GitHub",
        keywords: "code source",
        icon: <FaGithub />,
        run: () => {
          window.open(profile.github, "_blank", "noopener");
        },
      },
      {
        id: "linkedin",
        group: "Elsewhere",
        label: "LinkedIn",
        icon: <FaLinkedin />,
        run: () => {
          window.open(profile.linkedin, "_blank", "noopener");
        },
      },
      {
        id: "v2",
        group: "Elsewhere",
        label: "Previous design (version two)",
        keywords: "old archive v2 modern",
        icon: <FiExternalLink />,
        run: () => {
          window.open("/v2", "_blank", "noopener");
        },
      },
      {
        id: "v1",
        group: "Elsewhere",
        label: "First portfolio (version one)",
        keywords: "old archive v1 3d",
        icon: <FiExternalLink />,
        run: () => {
          window.open("/v1", "_blank", "noopener");
        },
      },
    ];
  }, [pathname, router]);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return commands;

    const score = (command: Command) => {
      const label = command.label.toLowerCase();
      if (label.split(/\s+/).some((word) => word.startsWith(term))) return 0;
      if (label.includes(term)) return 1;
      if (`${command.keywords ?? ""} ${command.group}`.toLowerCase().includes(term)) return 2;
      return 3;
    };

    return commands
      .map((command) => ({ command, rank: score(command) }))
      .filter((entry) => entry.rank < 3)
      .sort((a, b) => a.rank - b.rank)
      .map((entry) => entry.command);
  }, [commands, query]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpenChange(!open);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      setQuery("");
      setActiveIndex(0);
      setStatus(null);
      dialog.showModal();

      if (window.matchMedia("(pointer: fine)").matches) {
        inputRef.current?.focus();
      }
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (!status) return;
    const timeout = window.setTimeout(() => onOpenChange(false), 900);
    return () => window.clearTimeout(timeout);
  }, [status, onOpenChange]);

  const runCommand = (command: Command) => {
    if (command.run() !== "keep-open") onOpenChange(false);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex(
        (index) => (index + step + results.length) % Math.max(results.length, 1),
      );
    }

    if (event.key === "Enter" && results[activeIndex]) {
      event.preventDefault();
      runCommand(results[activeIndex]);
    }
  };

  let lastGroup = "";

  return (
    <dialog
      ref={dialogRef}
      className="command"
      aria-label="Site menu"
      onClose={() => onOpenChange(false)}
      onClick={(event) => {
        if (event.target === dialogRef.current) onOpenChange(false);
      }}
      onKeyDown={onKeyDown}
    >
      <div className="command-panel">
        <label className="command-search">
          <FiSearch aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            placeholder="Jump to a section or run an action"
            aria-label="Search commands"
            aria-controls="command-results"
            aria-activedescendant={
              results[activeIndex] ? `command-${results[activeIndex].id}` : undefined
            }
          />
          <kbd>esc</kbd>
        </label>

        <ul id="command-results" className="command-results" role="listbox">
          {results.map((command, index) => {
            const showGroup = !query.trim() && command.group !== lastGroup;
            lastGroup = command.group;

            return (
              <li key={command.id} role="presentation">
                {showGroup && <p className="command-group">{command.group}</p>}
                <button
                  type="button"
                  id={`command-${command.id}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  className="command-item"
                  onPointerMove={() => setActiveIndex(index)}
                  onClick={() => runCommand(command)}
                >
                  <span className="command-icon">{command.icon}</span>
                  {command.label}
                </button>
              </li>
            );
          })}
          {results.length === 0 && (
            <li className="command-empty">Nothing matches “{query}”.</li>
          )}
        </ul>

        <p className="command-footer" aria-live="polite">
          {status ?? (
            <>
              <span>
                <kbd>↑</kbd>
                <kbd>↓</kbd> navigate
              </span>
              <span>
                <kbd>↵</kbd> select
              </span>
            </>
          )}
        </p>
      </div>
    </dialog>
  );
}
