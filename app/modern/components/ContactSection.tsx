"use client";

import emailjs from "@emailjs/browser";
import { ChangeEvent, FormEvent, useState } from "react";
import {
  FaEnvelope,
  FaGithub,
  FaLinkedin,
  FaMapMarkerAlt,
  FaPhoneAlt,
} from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

type FormState = {
  name: string;
  email: string;
  message: string;
};

type SendState = "idle" | "sending" | "sent" | "error";

export default function ContactSection() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    message: "",
  });
  const [sendState, setSendState] = useState<SendState>("idle");

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSendState("sending");

    emailjs
      .send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        {
          from_name: form.name,
          to_name: "Jobair Al Sarkar",
          from_email: form.email,
          to_email: "jobairalsarkar1@gmail.com",
          message: `Message from: ${form.name} (${form.email})\n\n${form.message}`,
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_ID!,
      )
      .then(() => {
        setSendState("sent");
        setForm({ name: "", email: "", message: "" });
        window.setTimeout(() => setSendState("idle"), 2600);
      })
      .catch(() => {
        setSendState("error");
        window.setTimeout(() => setSendState("idle"), 3000);
      });
  };

  return (
    <section id="contact" className="modern-contact">
      <div className="modern-contact-copy">
        <p className="modern-kicker">Contact</p>
        <h2>Tell me what you want to build.</h2>
        <p>
          Keep it rough if the idea is still forming. I care more about the
          problem, the people using it, and what needs to happen next.
        </p>

        <div className="modern-contact-info">
          <a href="mailto:jobair.a.sarkar@gmail.com">
            <FaEnvelope />
            jobair.a.sarkar@gmail.com
          </a>
          <a href="tel:+8801766961460">
            <FaPhoneAlt />
            +8801766961460
          </a>
          <span>
            <FaMapMarkerAlt />
            Dhaka, Bangladesh
          </span>
        </div>
      </div>

      <form className="modern-contact-form" onSubmit={handleSubmit}>
        <div className="modern-form-row">
          <label>
            <span>Name</span>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Your name"
            />
          </label>
          <label>
            <span>Email</span>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
            />
          </label>
        </div>

        <label>
          <span>Project signal</span>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            required
            rows={6}
            placeholder="What are we building, fixing, or exploring?"
          />
        </label>

        <div className="modern-form-footer">
          <button type="submit" disabled={sendState === "sending"}>
            {sendState === "sending" ? (
              <>
                <AiOutlineLoading3Quarters className="modern-spin" />
                Sending
              </>
            ) : (
              "Send message"
            )}
          </button>

          <div className="modern-contact-socials">
            <a
              href="https://github.com/jobairalsarkar1"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
            >
              <FaGithub />
            </a>
            <a
              href="https://www.linkedin.com/in/jobair-al-sarkar/"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
            >
              <FaLinkedin />
            </a>
          </div>
        </div>

        {sendState === "sent" && (
          <p className="modern-form-status success">Message received.</p>
        )}
        {sendState === "error" && (
          <p className="modern-form-status error">
            Message could not be sent. Please try again.
          </p>
        )}
      </form>
    </section>
  );
}
