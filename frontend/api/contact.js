const CONTACT_EMAIL = "daniaryan212@gmail.com";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return response.status(503).json({
      error: "Contact endpoint is not configured. Add RESEND_API_KEY in production.",
    });
  }

  const { name, email, subject, message } = request.body || {};
  if (!name || !email || !message) {
    return response.status(400).json({ error: "Name, email, and message are required." });
  }

  const safeSubject = subject || "Portfolio Contact";
  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL || "Portfolio <onboarding@resend.dev>",
      to: [CONTACT_EMAIL],
      reply_to: email,
      subject: `[Portfolio] ${safeSubject} from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${safeSubject}\n\nMessage:\n${message}`,
    }),
  });

  const data = await resendResponse.json().catch(() => ({}));
  if (!resendResponse.ok) {
    return response.status(resendResponse.status).json({
      error: data.message || data.error || "Failed to send message.",
    });
  }

  return response.status(200).json({ success: true });
}
