"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Change = {
  offset: number;
  table: "visitor" | "hovers" | "clicks";
  column: string;
  value: string;
  partition: number;
};

type Row = Record<string, string>;

const SECTIONS = ["experience", "work", "writing", "stack", "contact"];
const APPLY_DELAY = 450;
const IDLE_AFTER = 4000;
const VISIBLE = 6;

const partitionOf = (table: string) => [...table].reduce((sum, letter) => sum + letter.charCodeAt(0), 0) % 3;

function labelFor(element: Element) {
  const name = element.querySelector(".work-name")?.textContent ?? element.textContent ?? "";
  return name.replace(/\s+/g, " ").trim().slice(0, 26);
}

// Change data capture, demonstrated on the visitor. Every action on the page
// becomes an event in the log on the right, and a moment later it is applied
// to the visitor's row on the left, the way a consumer applies changes to
// PostgreSQL. Nothing is sent anywhere; it all lives in this tab.
export default function ChangeLog() {
  const pathname = usePathname();
  const [changes, setChanges] = useState<Change[]>([]);
  const [row, setRow] = useState<Row>({});
  const [applied, setApplied] = useState(0);
  const [flash, setFlash] = useState<string | null>(null);
  const [active, setActive] = useState(false);
  const offset = useRef(0);
  const pending = useRef(0);
  const [lag, setLag] = useState(0);

  useEffect(() => {
    if (pathname !== "/") return;

    let idleTimer = 0;
    const timers: number[] = [];

    const emit = (table: Change["table"], column: string, value: string) => {
      const change: Change = { offset: ++offset.current, table, column, value, partition: partitionOf(table) };
      setChanges((list) => [...list, change].slice(-VISIBLE));
      setActive(true);
      pending.current++;
      setLag(pending.current);

      timers.push(
        window.setTimeout(() => {
          const field = table === "visitor" ? column : table === "hovers" ? "hovering" : "last_click";
          setRow((current) => ({ ...current, [field]: value }));
          setApplied(change.offset);
          setFlash(field);
          pending.current = Math.max(0, pending.current - 1);
          setLag(pending.current);
        }, APPLY_DELAY),
      );

      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        setActive(false);
        setFlash(null);
      }, IDLE_AFTER);
    };

    const theme = () => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");
    setRow({
      section: "intro",
      hovering: "null",
      last_click: "null",
      theme: theme(),
      scrolled: "0%",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });

    let section = "intro";
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const next = entry.target.id || "intro";
          if (next === section) continue;
          section = next;
          emit("visitor", "section", next);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    [document.querySelector(".intro"), ...SECTIONS.map((id) => document.getElementById(id))].forEach(
      (element) => element && sectionObserver.observe(element),
    );

    let lastHover = "";
    let lastHoverAt = 0;
    const onOver = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const target = (event.target as Element).closest(".live, .work-row, .intro-links a, .note-link, .role h3");
      if (!target) return;
      const label = labelFor(target);
      const now = performance.now();
      if (!label || label === lastHover || now - lastHoverAt < 250) return;
      lastHover = label;
      lastHoverAt = now;
      emit("hovers", "label", label);
    };

    const onClick = (event: MouseEvent) => {
      const target = (event.target as Element).closest("a, button");
      if (!target) return;
      const label = labelFor(target) || target.getAttribute("aria-label") || "";
      if (label) emit("clicks", "label", label.slice(0, 26));
    };

    let scrolled = 0;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const percent = max > 0 ? Math.round(((window.scrollY / max) * 100) / 10) * 10 : 0;
      if (percent === scrolled) return;
      scrolled = percent;
      emit("visitor", "scrolled", `${percent}%`);
    };

    const themeObserver = new MutationObserver(() => emit("visitor", "theme", theme()));
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    document.addEventListener("pointerover", onOver);
    document.addEventListener("click", onClick);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      sectionObserver.disconnect();
      themeObserver.disconnect();
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("click", onClick);
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(idleTimer);
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [pathname]);

  if (pathname !== "/") return null;

  return (
    <div className="cdc" data-active={active} aria-hidden>
      <section className="cdc-table">
        <p className="cdc-title">
          visitor <span>PostgreSQL</span>
        </p>
        <dl>
          {Object.entries(row).map(([column, value]) => (
            <div key={column} data-flash={flash === column}>
              <dt>{column}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <p className="cdc-foot">applied offset {applied}</p>
        <p className="cdc-note">This is you, as a database row. Nothing leaves your browser.</p>
      </section>

      <section className="cdc-log">
        <p className="cdc-title">
          page.changes <span>Kafka</span>
        </p>
        <ol>
          {changes.map((change, index) => (
            <li key={change.offset} data-latest={index === changes.length - 1}>
              <span className="cdc-offset">{change.offset}</span>
              <span>
                {change.table === "visitor" ? (
                  <>
                    <b>UPDATE</b> visitor
                    <br />
                    <b>SET</b> {change.column} = <em>&apos;{change.value}&apos;</em>
                  </>
                ) : (
                  <>
                    <b>INSERT INTO</b> {change.table}
                    <br />
                    <b>VALUES</b> (<em>&apos;{change.value}&apos;</em>)
                  </>
                )}
              </span>
            </li>
          ))}
          {changes.length === 0 && <li className="cdc-empty">waiting for changes…</li>}
        </ol>
        <p className="cdc-foot">
          lag {lag} · partition {changes.at(-1)?.partition ?? 0} · <span className="cdc-live">{active ? "live" : "idle"}</span>
        </p>
      </section>
    </div>
  );
}
