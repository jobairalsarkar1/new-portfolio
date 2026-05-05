"use client";

import axios from "axios";
import useSWR from "swr";
import { FaEnvelope, FaReply, FaClock } from "react-icons/fa";
import ActionLoader from "@/components/loaders/ActionLoader";

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  sentTo: string;
  sentFrom: string;
  deliveryStatus: string;
  error?: string | null;
  createdAt: string;
};

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function DashboardMessagesPage() {
  const { data, isLoading, error } = useSWR("/api/contact-messages", fetcher, {
    refreshInterval: 30000,
  });

  const messages = (data?.data ?? []) as ContactMessage[];

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <ActionLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 text-white">
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-blue-300">
            <FaEnvelope />
            Contact inbox
          </p>
          <h1 className="text-2xl font-bold">Portfolio messages</h1>
          <p className="mt-2 text-sm text-gray-400">
            Messages sent from the modern contact form and saved in the
            database.
          </p>
        </div>

        <div className="rounded-xl border border-gray-700 bg-black/30 px-4 py-3 text-right">
          <p className="text-3xl font-black text-white">{messages.length}</p>
          <p className="text-xs uppercase text-gray-400">saved messages</p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          Could not load contact messages.
        </div>
      )}

      {!error && messages.length === 0 && (
        <div className="rounded-xl border border-gray-700 bg-black/30 p-8 text-center text-gray-300">
          No messages yet.
        </div>
      )}

      <div className="grid gap-4">
        {messages.map((message) => (
          <article
            key={message.id}
            className="rounded-xl border border-gray-700 bg-black/40 p-5 shadow-lg backdrop-blur-2xl"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-bold">{message.name}</h2>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      message.deliveryStatus === "SENT"
                        ? "bg-green-500/15 text-green-300"
                        : message.deliveryStatus === "FAILED"
                          ? "bg-red-500/15 text-red-300"
                          : "bg-yellow-500/15 text-yellow-200"
                    }`}
                  >
                    {message.deliveryStatus}
                  </span>
                </div>
                <a
                  href={`mailto:${message.email}`}
                  className="mt-2 inline-flex items-center gap-2 text-sm text-blue-300 hover:text-blue-200"
                >
                  <FaReply size={12} />
                  {message.email}
                </a>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-400">
                <FaClock size={13} />
                {formatDate(message.createdAt)}
              </div>
            </div>

            <p className="mt-5 whitespace-pre-wrap rounded-lg border border-gray-800 bg-gray-950/50 p-4 leading-7 text-gray-200">
              {message.message}
            </p>

            <div className="mt-4 grid gap-2 text-xs text-gray-500 md:grid-cols-2">
              <p>Sent from: {message.sentFrom}</p>
              <p>Sent to: {message.sentTo}</p>
            </div>

            {message.error && (
              <p className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
                {message.error}
              </p>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
