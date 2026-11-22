/**
 * Headed Chrome performance trace for a mid-range laptop.
 * Run while preview is up: npm run audit:trace
 * Opens a visible browser, scrolls Home + Services at 4x CPU throttle,
 * writes a Chrome DevTools performance JSON you can open in chrome://tracing
 * or DevTools Performance panel.
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

const BASE = process.env.AUDIT_BASE_URL || "http://127.0.0.1:4173";
const OUT = join(process.env.TEMP || "/tmp", "portfolio-audit-run");
mkdirSync(OUT, { recursive: true });

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

async function main() {
  let browser;
  try {
    browser = await chromium.launch({
      channel: "chrome",
      headless: false,
      args: ["--disable-blink-features=AutomationControlled"],
    });
  } catch {
    browser = await chromium.launch({ headless: false });
  }

  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: UA,
  });
  await ctx.addInitScript(() => {
    localStorage.setItem("portfolio_visited", "true");
    sessionStorage.setItem("portfolio_visited", "true");
    localStorage.setItem("portfolio_onboarding_hint_dismissed", "true");
  });

  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await cdp.send("Tracing.start", {
    categories: "-*,devtools.timeline,disabled-by-default-devtools.timeline,v8.execute,blink.user_timing",
    transferMode: "ReturnAsStream",
  });

  console.log("Tracing Home…");
  await page.goto(`${BASE}/`, { waitUntil: "load" });
  await page.waitForTimeout(1500);
  for (let i = 0; i < 18; i++) {
    await page.mouse.wheel(0, 160);
    await page.waitForTimeout(50);
  }
  await page.waitForTimeout(800);

  console.log("Tracing Services…");
  await page.goto(`${BASE}/services`, { waitUntil: "load" });
  await page.waitForTimeout(1500);
  for (let i = 0; i < 24; i++) {
    await page.mouse.wheel(0, 180);
    await page.waitForTimeout(50);
  }
  await page.waitForTimeout(800);

  const { stream } = await cdp.send("Tracing.end");
  const chunks = [];
  while (true) {
    const { data, eof, base64Encoded } = await cdp.send("IO.read", { handle: stream });
    if (data) chunks.push(base64Encoded ? Buffer.from(data, "base64") : Buffer.from(data));
    if (eof) break;
  }
  await cdp.send("IO.close", { handle: stream });
  const outPath = join(OUT, `headed-trace-${Date.now()}.json`);
  writeFileSync(outPath, Buffer.concat(chunks));
  console.log("Wrote", outPath);
  console.log("Open in Chrome DevTools → Performance → Load profile, or chrome://tracing");

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
