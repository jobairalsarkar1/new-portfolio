"use client";

import { useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  FiBold,
  FiEye,
  FiEdit3,
  FiLink,
  FiList,
  FiMaximize2,
  FiType,
} from "react-icons/fi";

type EditorMode = "write" | "preview" | "split";

type ProjectDescriptionEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

const caseStudyTemplate = `## Overview
What the project is, who it was built for, and the problem it solves.

## My Role
What you owned across frontend, backend, architecture, integrations, or deployment.

## Key Features
- Feature one
- Feature two
- Feature three

## Tech Stack
- Frontend:
- Backend:
- Database:
- Integrations:

## Outcome
What changed after the project was built. Keep this practical and specific.`;

const featureListTemplate = `## Key Features
- 
- 
- `;

const techStackTemplate = `## Tech Stack
- Frontend:
- Backend:
- Database:
- Integrations:
- Deployment:`;

function getWordCount(value: string) {
  return value.trim() ? value.trim().split(/\s+/).length : 0;
}

export default function ProjectDescriptionEditor({
  value,
  onChange,
}: ProjectDescriptionEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [mode, setMode] = useState<EditorMode>("split");
  const stats = useMemo(
    () => ({
      words: getWordCount(value),
      chars: value.length,
    }),
    [value],
  );

  const focusTextarea = () => {
    window.requestAnimationFrame(() => textareaRef.current?.focus());
  };

  const replaceSelection = (
    getNextValue: (selected: string) => {
      text: string;
      cursorOffset?: number;
    },
  ) => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end);
    const next = getNextValue(selected);
    const nextValue = value.slice(0, start) + next.text + value.slice(end);
    const cursorPosition = start + (next.cursorOffset ?? next.text.length);

    onChange(nextValue);
    window.requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorPosition, cursorPosition);
    });
  };

  const insertBlock = (block: string) => {
    const separator = value.trim() ? "\n\n" : "";
    onChange(`${value}${separator}${block}`);
    focusTextarea();
  };

  const insertHeading = () => {
    replaceSelection((selected) => ({
      text: `## ${selected || "Section title"}`,
      cursorOffset: selected ? undefined : 3,
    }));
  };

  const insertBold = () => {
    replaceSelection((selected) => ({
      text: `**${selected || "important text"}**`,
      cursorOffset: selected ? undefined : 2,
    }));
  };

  const insertList = () => {
    replaceSelection((selected) => {
      if (!selected) {
        return { text: "- ", cursorOffset: 2 };
      }

      return {
        text: selected
          .split("\n")
          .map((line) => `- ${line}`)
          .join("\n"),
      };
    });
  };

  const insertLink = () => {
    replaceSelection((selected) => ({
      text: `[${selected || "link text"}](https://example.com)`,
      cursorOffset: selected ? undefined : 1,
    }));
  };

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950 shadow-xl shadow-black/30 overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-zinc-800 bg-zinc-950/95 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Project Description
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Write it like a case study. The saved content stays as markdown.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMode("write")}
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
              mode === "write"
                ? "border-indigo-400 bg-indigo-500/20 text-indigo-100"
                : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700"
            }`}
          >
            <FiEdit3 />
            Write
          </button>
          <button
            type="button"
            onClick={() => setMode("split")}
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
              mode === "split"
                ? "border-indigo-400 bg-indigo-500/20 text-indigo-100"
                : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700"
            }`}
          >
            <FiMaximize2 />
            Split
          </button>
          <button
            type="button"
            onClick={() => setMode("preview")}
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
              mode === "preview"
                ? "border-indigo-400 bg-indigo-500/20 text-indigo-100"
                : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700"
            }`}
          >
            <FiEye />
            Preview
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-zinc-800 bg-black/30 p-3">
        <button
          type="button"
          onClick={insertHeading}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 transition hover:border-zinc-700"
        >
          <FiType />
          Heading
        </button>
        <button
          type="button"
          onClick={insertBold}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 transition hover:border-zinc-700"
        >
          <FiBold />
          Bold
        </button>
        <button
          type="button"
          onClick={insertList}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 transition hover:border-zinc-700"
        >
          <FiList />
          List
        </button>
        <button
          type="button"
          onClick={insertLink}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 transition hover:border-zinc-700"
        >
          <FiLink />
          Link
        </button>
        <span className="mx-1 hidden h-9 w-px bg-zinc-800 sm:block" />
        <button
          type="button"
          onClick={() => insertBlock(caseStudyTemplate)}
          className="rounded-lg border border-emerald-700/60 bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-100 transition hover:border-emerald-500"
        >
          Case study template
        </button>
        <button
          type="button"
          onClick={() => insertBlock(featureListTemplate)}
          className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 transition hover:border-zinc-700"
        >
          Feature section
        </button>
        <button
          type="button"
          onClick={() => insertBlock(techStackTemplate)}
          className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 transition hover:border-zinc-700"
        >
          Tech section
        </button>
      </div>

      <div
        className={`grid min-h-[460px] ${
          mode === "split" ? "lg:grid-cols-2" : "grid-cols-1"
        }`}
      >
        {mode !== "preview" && (
          <div className="border-zinc-800 lg:border-r">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder="Write the project story here. Start with what it is, what you built, the stack, and the outcome."
              className="min-h-[460px] w-full resize-y bg-zinc-950 p-5 text-[0.98rem] leading-7 text-zinc-100 outline-none placeholder:text-zinc-600"
            />
          </div>
        )}

        {mode !== "write" && (
          <div className="min-h-[460px] bg-zinc-900/40 p-5">
            {value.trim() ? (
              <article className="space-y-4 text-zinc-200">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-3xl font-bold text-white">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="pt-2 text-2xl font-bold text-white">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-xl font-semibold text-white">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="leading-7 text-zinc-300">{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul className="ml-5 list-disc space-y-2 text-zinc-300">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="ml-5 list-decimal space-y-2 text-zinc-300">
                        {children}
                      </ol>
                    ),
                    a: ({ children, href }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sky-300 underline underline-offset-4"
                      >
                        {children}
                      </a>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-white">
                        {children}
                      </strong>
                    ),
                  }}
                >
                  {value}
                </ReactMarkdown>
              </article>
            ) : (
              <div className="grid min-h-[420px] place-items-center rounded-xl border border-dashed border-zinc-800 text-center">
                <div>
                  <p className="text-sm font-semibold text-zinc-300">
                    Preview will appear here
                  </p>
                  <p className="mt-1 text-sm text-zinc-500">
                    Use the case study template if you want a clean starting
                    point.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 bg-black/30 px-4 py-3 text-sm text-zinc-500">
        <p>
          {stats.words} words / {stats.chars} characters
        </p>
        <p>Recommended: overview, role, features, stack, outcome.</p>
      </div>
    </section>
  );
}
