import { generateKuroReply } from "./kuroChat.js";
import { createGuestbookRedis } from "./guestbookStore.js";

// Portfolio demos + tip chips burn through messages fast; keep a burst
// cap so scrapers can't flood Groq, but don't throttle normal chatting.
const CHAT_RATE_LIMIT_HOUR = 120;
const CHAT_RATE_LIMIT_MINUTE = 25;
const CHAT_RATE_HOUR_MS = 60 * 60 * 1000;
const CHAT_RATE_MINUTE_MS = 60 * 1000;
const memoryHourLimits = new Map();
const memoryMinuteLimits = new Map();

export function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers["x-real-ip"] || "unknown";
}

function bumpMemoryWindow(store, ip, windowMs, limit) {
  const now = Date.now();
  const key = ip || "unknown";
  let entry = store.get(key);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + windowMs };
    store.set(key, entry);
  }
  entry.count += 1;
  if (entry.count > limit) {
    const error = new Error("Too many messages. Try again in a bit.");
    error.status = 429;
    throw error;
  }
}

function checkMemoryRateLimit(ip) {
  bumpMemoryWindow(memoryMinuteLimits, ip, CHAT_RATE_MINUTE_MS, CHAT_RATE_LIMIT_MINUTE);
  bumpMemoryWindow(memoryHourLimits, ip, CHAT_RATE_HOUR_MS, CHAT_RATE_LIMIT_HOUR);
}

async function bumpRedisWindow(redis, key, ttlSeconds, limit) {
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, ttlSeconds);
  if (count > limit) {
    const error = new Error("Too many messages. Try again in a bit.");
    error.status = 429;
    throw error;
  }
}

export async function checkChatRateLimit(ip) {
  const redis = createGuestbookRedis();
  if (redis) {
    const id = ip || "unknown";
    // Minute first so abusers get a short cooldown instead of burning the hour budget.
    await bumpRedisWindow(redis, `chat:rate:m:${id}`, 60, CHAT_RATE_LIMIT_MINUTE);
    await bumpRedisWindow(redis, `chat:rate:h:${id}`, 3600, CHAT_RATE_LIMIT_HOUR);
    return;
  }

  // Fail closed: without Redis, still cap per-IP in this process.
  checkMemoryRateLimit(ip);
}

export async function handleChatRequest(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { message, history, currentPath, siteState } = req.body || {};

  try {
    await checkChatRateLimit(getClientIp(req));
    const result = await generateKuroReply(
      { message, history, currentPath, siteState },
      process.env.GROQ_API_KEY,
    );
    res.status(200).json(result);
  } catch (error) {
    const status = error.status || 500;
    let message = error.message || "Generation failed";
    // Never leak raw upstream / stack details to the client.
    if (
      status >= 500 &&
      !/not configured|snag|busy|too many/i.test(message)
    ) {
      message = "Kuro hit a snag talking to the model. Try again shortly.";
    }
    res.status(status).json({ error: message });
  }
}

export default async function handler(req, res) {
  return handleChatRequest(req, res);
}
