import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const SMTP_USER = process.env.GMAIL_SMTP_USER || "jobairalsarkar38@gmail.com";
const RECEIVER_EMAIL =
  process.env.CONTACT_RECEIVER_EMAIL || "jobair.a.sarkar@gmail.com";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function cleanError(error: unknown) {
  if (error instanceof Error) {
    return error.message.slice(0, 500);
  }

  return "Unknown mail error";
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(req: Request) {
  let savedMessageId: string | null = null;

  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const message = String(body.message || "").trim();

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: "Name, email, and message are required." },
        { status: 400 },
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: "Please use a valid email address." },
        { status: 400 },
      );
    }

    if (!process.env.GMAIL_APP_PASSWORD) {
      return NextResponse.json(
        { success: false, error: "Gmail app password is not configured." },
        { status: 500 },
      );
    }

    const savedMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        message,
        sentTo: RECEIVER_EMAIL,
        sentFrom: SMTP_USER,
      },
    });

    savedMessageId = savedMessage.id;

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: SMTP_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");

    await transporter.sendMail({
      from: `"${name}" <${SMTP_USER}>`,
      replyTo: email,
      to: RECEIVER_EMAIL,
      subject: `Portfolio message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>New portfolio message</h2>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Message:</strong></p>
          <p>${safeMessage}</p>
        </div>
      `,
    });

    await prisma.contactMessage.update({
      where: { id: savedMessageId },
      data: { deliveryStatus: "SENT", error: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/contact error:", error);

    if (savedMessageId) {
      await prisma.contactMessage.update({
        where: { id: savedMessageId },
        data: {
          deliveryStatus: "FAILED",
          error: cleanError(error),
        },
      });
    }

    return NextResponse.json(
      { success: false, error: "Message could not be sent." },
      { status: 500 },
    );
  }
}
