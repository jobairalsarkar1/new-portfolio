import axios from "axios";

const RESEND_API_URL = "https://api.resend.com/emails";
const SENDER_EMAIL = "contact@jobairalsarkar.site";

interface MailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

export async function sendMail({ to, subject, html, text, from }: MailOptions) {
  try {
    const response = await axios.post(
      RESEND_API_URL,
      {
        from: from || `Jobair Al Sarkar <${SENDER_EMAIL}>`,
        to,
        subject,
        html,
        text,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.AUTH_RESEND_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return { success: true, data: response.data };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("Mailer error:", error.response?.data || error.message);
      return { success: false, error: error.response?.data || error.message };
    }

    if (error instanceof Error) {
      console.error("Mailer error:", error.message);
      return { success: false, error: error.message };
    }

    console.error("Mailer error: Unknown error");
    return { success: false, error: "Unknown error occurred" };
  }
}
