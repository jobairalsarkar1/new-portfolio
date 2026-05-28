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

function buildContactEmail({
  name,
  email,
  message,
}: {
  name: string;
  email: string;
  message: string;
}) {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style="margin:0;background:#050608;padding:28px;font-family:Arial,Helvetica,sans-serif;color:#f7f5ef;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;margin:0 auto;border-collapse:collapse;">
          <tr>
            <td style="padding:0 0 18px;">
              <div style="display:inline-block;border:1px solid rgba(255,229,180,0.22);border-radius:999px;padding:8px 13px;color:#f8d79e;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">
                Portfolio Contact
              </div>
            </td>
          </tr>
          <tr>
            <td style="border:1px solid rgba(255,229,180,0.18);border-radius:14px;background:#0b0d10;box-shadow:0 24px 80px rgba(0,0,0,.32);overflow:hidden;">
              <div style="padding:26px 26px 18px;background:linear-gradient(135deg,rgba(255,240,199,.13),rgba(255,240,199,0) 48%);">
                <h1 style="margin:0;color:#fff0c7;font-size:26px;line-height:1.15;">New message from ${safeName}</h1>
                <p style="margin:10px 0 0;color:rgba(247,245,239,.68);font-size:14px;">Someone reached out from the modern portfolio contact form.</p>
              </div>

              <div style="padding:0 26px 26px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:0 0 18px;">
                  <tr>
                    <td style="padding:14px 0;border-bottom:1px solid rgba(255,229,180,.12);color:#f8d79e;font-size:12px;font-weight:700;text-transform:uppercase;">Name</td>
                    <td style="padding:14px 0;border-bottom:1px solid rgba(255,229,180,.12);color:#f7f5ef;text-align:right;">${safeName}</td>
                  </tr>
                  <tr>
                    <td style="padding:14px 0;border-bottom:1px solid rgba(255,229,180,.12);color:#f8d79e;font-size:12px;font-weight:700;text-transform:uppercase;">Email</td>
                    <td style="padding:14px 0;border-bottom:1px solid rgba(255,229,180,.12);text-align:right;">
                      <a href="mailto:${safeEmail}" style="color:#9fd8ff;text-decoration:none;">${safeEmail}</a>
                    </td>
                  </tr>
                </table>

                <div style="border:1px solid rgba(255,229,180,.14);border-radius:12px;background:rgba(255,255,255,.035);padding:18px;">
                  <p style="margin:0 0 10px;color:#f8d79e;font-size:12px;font-weight:700;text-transform:uppercase;">Message</p>
                  <p style="margin:0;color:rgba(247,245,239,.86);font-size:15px;line-height:1.75;">${safeMessage}</p>
                </div>

                <p style="margin:18px 0 0;color:rgba(247,245,239,.46);font-size:12px;line-height:1.6;">
                  Replying to this email will respond to ${safeName}. This message was also saved in your portfolio dashboard.
                </p>
              </div>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
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

    const replyToName = name.replace(/[<>"\r\n]/g, "").slice(0, 80);
    const subjectName = name.replace(/[\r\n]/g, " ").slice(0, 80);

    await transporter.sendMail({
      from: `"Jobair Portfolio" <${SMTP_USER}>`,
      sender: SMTP_USER,
      replyTo: `"${replyToName}" <${email}>`,
      to: RECEIVER_EMAIL,
      subject: `Portfolio message from ${subjectName}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      html: buildContactEmail({ name, email, message }),
      headers: {
        "X-Portfolio-Contact": "jobairalsarkar.com",
      },
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
