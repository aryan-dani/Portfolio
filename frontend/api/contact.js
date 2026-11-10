import { createGuestbookRedis, getClientIp } from "./guestbookStore.js";

const CONTACT_EMAIL = "daniaryan212@gmail.com";
const MAX_MESSAGE_LENGTH = 5000;
const CONTACT_RATE_LIMIT = 8;
const CONTACT_RATE_WINDOW_MS = 60 * 60 * 1000;
const memoryRateLimits = new Map();

function stripNewlines(value) {
  return String(value || "").replace(/[\r\n]+/g, " ").trim();
}

function checkMemoryRateLimit(ip) {
  const now = Date.now();
  const key = ip || "unknown";
  let entry = memoryRateLimits.get(key);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + CONTACT_RATE_WINDOW_MS };
    memoryRateLimits.set(key, entry);
  }
  entry.count += 1;
  if (entry.count > CONTACT_RATE_LIMIT) {
    const error = new Error("Too many messages. Try again later.");
    error.status = 429;
    throw error;
  }
}

async function checkContactRateLimit(ip) {
  const redis = createGuestbookRedis();
  if (redis) {
    const key = `contact:rate:${ip || "unknown"}`;
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, 3600);
    if (count > CONTACT_RATE_LIMIT) {
      const error = new Error("Too many messages. Try again later.");
      error.status = 429;
      throw error;
    }
    return;
  }
  checkMemoryRateLimit(ip);
}

/**
 * Pure payload builder used by the API and by scripts/check-services.mjs.
 * Rejects a filled honeypot. Keeps the classic Contact form fields valid.
 */
export function buildContactPayload(body = {}) {
  if (stripNewlines(body.companyWebsite || body.website || body.honeypot)) {
    const error = new Error("Rejected.");
    error.status = 400;
    error.code = "HONEYPOT";
    throw error;
  }

  const safeName = stripNewlines(body.name).slice(0, 120);
  const safeEmail = stripNewlines(body.email).slice(0, 200);
  const safeSubject = stripNewlines(body.subject || "Portfolio Contact").slice(0, 200);
  const safeMessage = String(body.message || "").trim();
  const organization = stripNewlines(body.organization).slice(0, 160);
  const projectType = stripNewlines(body.projectType).slice(0, 120);
  const budgetRange = stripNewlines(body.budgetRange).slice(0, 80);
  const timeline = stripNewlines(body.timeline).slice(0, 80);
  const hasExistingSite = stripNewlines(body.hasExistingSite).slice(0, 120);
  const links = stripNewlines(body.links).slice(0, 500);

  if (!safeName || !safeEmail || !safeMessage) {
    const error = new Error("Name, email, and message are required.");
    error.status = 400;
    throw error;
  }
  if (safeMessage.length > MAX_MESSAGE_LENGTH) {
    const error = new Error(`Message is too long (max ${MAX_MESSAGE_LENGTH} characters).`);
    error.status = 400;
    throw error;
  }

  const metaLines = [
    organization && `Organization: ${organization}`,
    projectType && `Project type: ${projectType}`,
    budgetRange && `Budget range: ${budgetRange}`,
    timeline && `Timeline: ${timeline}`,
    hasExistingSite && `Existing site or domain: ${hasExistingSite}`,
    links && `Links: ${links}`,
  ].filter(Boolean);

  const text = [
    `Name: ${safeName}`,
    `Email: ${safeEmail}`,
    `Subject: ${safeSubject}`,
    ...metaLines,
    "",
    "Message:",
    safeMessage,
  ].join("\n");

  return {
    safeName,
    safeEmail,
    safeSubject,
    safeMessage,
    organization,
    projectType,
    budgetRange,
    timeline,
    hasExistingSite,
    links,
    text,
  };
}

export async function handleContactRequest(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return response.status(503).json({
      error: "The form inbox is briefly offline. Use the email button or your mail app.",
      code: "EMAIL_NOT_CONFIGURED",
    });
  }

  try {
    await checkContactRateLimit(getClientIp(request));
  } catch (error) {
    return response.status(error.status || 429).json({ error: error.message });
  }

  let payload;
  try {
    payload = buildContactPayload(request.body || {});
  } catch (error) {
    return response.status(error.status || 400).json({
      error: error.message || "Invalid request.",
      code: error.code,
    });
  }

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL || "Portfolio <onboarding@resend.dev>",
      to: [CONTACT_EMAIL],
      reply_to: payload.safeEmail,
      subject: `[Portfolio] ${payload.safeSubject} from ${payload.safeName}`,
      text: payload.text,
    }),
  });

  const data = await resendResponse.json().catch(() => ({}));
  if (!resendResponse.ok) {
    return response.status(resendResponse.status).json({
      error: "Failed to send message.",
    });
  }

  return response.status(200).json({ success: true, id: data.id });
}

export default async function handler(request, response) {
  return handleContactRequest(request, response);
}
