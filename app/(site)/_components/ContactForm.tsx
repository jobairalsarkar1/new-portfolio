"use client";

import { useState } from "react";
import { FiArrowRight } from "react-icons/fi";

type Status = "idle" | "sending" | "sent" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setStatus("sending");
    setError("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || "Message could not be sent.");
      }

      form.reset();
      setStatus("sent");
    } catch (reason) {
      setStatus("error");
      setError(
        reason instanceof Error ? reason.message : "Message could not be sent.",
      );
    }
  };

  return (
    <form className="contact-form" onSubmit={onSubmit}>
      <div className="field-row">
        <label className="field">
          <span>Name</span>
          <input name="name" autoComplete="name" required placeholder="Ada Lovelace" />
        </label>
        <label className="field">
          <span>Email</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@company.com"
          />
        </label>
      </div>
      <label className="field">
        <span>What are you working on?</span>
        <textarea
          name="message"
          required
          rows={5}
          placeholder="A system to build, a migration to plan, a product to ship…"
        />
      </label>

      <div className="contact-submit">
        <button
          type="submit"
          className="button button-solid"
          disabled={status === "sending"}
        >
          {status === "sending" ? "Sending…" : "Send message"}
          <FiArrowRight aria-hidden />
        </button>
        <p className="form-status" role="status" data-tone={status}>
          {status === "sent" && "Thanks, your message is on its way to my inbox."}
          {status === "error" && error}
        </p>
      </div>
    </form>
  );
}
