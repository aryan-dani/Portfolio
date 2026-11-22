/**
 * Visual verification screenshots against a running server.
 * Usage: node scripts/audit/shots.mjs [baseUrl] [set]
 *   set = all | static | intro | grounded | header
 *   static   — fold and full-page shots of the main pages, desktop and phone
 *   intro    — the default film intro, in real time
 *   grounded — the Grounded intro (?intro=v2), frame by frame in slow motion
 *   header   — the navbar at every desktop width, with fit measurements
 * Output: %TEMP%/portfolio-verify, or SHOTS_OUT.
 */
import { chromium } from "playwright";
import { mkdirSync } from "fs";
import { join } from "path";

const BASE = process.argv[2] || "http://127.0.0.1:4173";
const SET = process.argv[3] || "all";
const OUT = process.env.SHOTS_OUT || join(process.env.TEMP || "/tmp", "portfolio-verify");
mkdirSync(OUT, { recursive: true });

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

async function launch() {
  try {
    return await chromium.launch({
      channel: "chrome",
      headless: true,
      args: ["--disable-blink-features=AutomationControlled"],
    });
  } catch {
    return chromium.launch({ headless: true });
  }
}

async function context(browser, viewport, { visited = true, mobile = false } = {}) {
  const ctx = await browser.newContext({
    viewport,
    userAgent: UA,
    isMobile: mobile,
    hasTouch: mobile,
    deviceScaleFactor: 1,
  });
  await ctx.addInitScript((isVisited) => {
    try {
      if (isVisited) {
        localStorage.setItem("portfolio_visited", "true");
        sessionStorage.setItem("portfolio_visited", "true");
      }
      localStorage.setItem("portfolio_onboarding_hint_dismissed", "true");
    } catch {
      /* ignore */
    }
  }, visited);
  return ctx;
}

async function staticShots(browser) {
  const pages = [
    ["home", "/"],
    ["services", "/services"],
    ["services-pune", "/services/website-development-pune"],
    ["services-mvp", "/services/web-app-mvp-development"],
    ["services-redesign", "/services/website-redesign"],
    ["services-rag", "/services/rag-chatbot-development"],
    ["projects", "/projects"],
    ["about", "/about"],
    ["skills", "/skills"],
    ["experience", "/experience"],
    ["research", "/research"],
    ["certifications", "/certifications"],
    ["playground", "/playground"],
    ["work-prism", "/work/prism"],
  ];
  const viewports = [
    ["phone-390", { width: 390, height: 844 }, true],
    ["tablet-1024", { width: 1024, height: 900 }, false],
    ["desktop-1440", DESKTOP, false],
    ["desktop-1920", { width: 1920, height: 1080 }, false],
  ];
  for (const [label, viewport, mobile] of viewports) {
    const ctx = await context(browser, viewport, { visited: true, mobile });
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(`${e.message}`));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(`console: ${m.text().slice(0, 200)}`);
    });
    page.on("response", (r) => {
      if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
    });
    for (const [name, path] of pages) {
      errors.length = 0;
      await page.goto(`${BASE}${path}`, { waitUntil: "load" });
      await page.waitForTimeout(2500);
      await page.screenshot({ path: join(OUT, `${label}-${name}-fold.png`) });
      await page.screenshot({ path: join(OUT, `${label}-${name}-full.png`), fullPage: true });
      const info = await page.evaluate(() => ({
        h1: [...document.querySelectorAll("h1")].map((h) => h.innerText.trim().slice(0, 60)),
        mains: document.querySelectorAll("main").length,
        navLinks: [...document.querySelectorAll("nav[aria-label='Main navigation'] a")]
          .filter((a) => a.offsetParent !== null)
          .map((a) => a.innerText.trim()),
        scrollW: document.documentElement.scrollWidth,
        innerW: window.innerWidth,
      }));
      console.log(label, name, JSON.stringify(info), errors.length ? `ERRORS: ${errors.join(" | ")}` : "");
    }
    await ctx.close();
  }
}

async function introShots(browser) {
  for (const [name, path, frames] of [
    ["intro-film", "/?intro=1", [300, 1200, 2500, 4000, 5500, 6500, 7500, 9000, 11000, 13000]],
  ]) {
    const ctx = await context(browser, DESKTOP, { visited: false });
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const t0 = Date.now();
    await page.goto(`${BASE}${path}`, { waitUntil: "commit" });
    for (const at of frames) {
      const wait = at - (Date.now() - t0);
      if (wait > 0) await page.waitForTimeout(wait);
      const real = Date.now() - t0;
      await page.screenshot({ path: join(OUT, `${name}-${String(at).padStart(5, "0")}.png`) });
      console.log(name, `frame@${at} (actual ${real}ms)`);
    }
    if (errors.length) console.log(name, "ERRORS:", errors.join(" | "));
    await ctx.close();
  }
}

/**
 * Grounded intro, frame by frame. Real-time screenshots are too slow to catch
 * 120ms cuts, so the page runs SLOW times slower (timers stretched by an init
 * script, animations by the DevTools playback rate) and frames are taken at
 * SLOW × the intro time. Frame names are in intro milliseconds.
 */
const SLOW = 8;
async function groundedFrames(browser, { name, path, viewport, mobile = false, dark = false, times }) {
  const ctx = await context(browser, viewport, { visited: false, mobile });
  await ctx.addInitScript(
    ({ k, darkTheme }) => {
      const st = window.setTimeout;
      const si = window.setInterval;
      window.setTimeout = (fn, ms, ...rest) => st(fn, (ms || 0) * k, ...rest);
      window.setInterval = (fn, ms, ...rest) => si(fn, (ms || 0) * k, ...rest);
      try {
        if (darkTheme) localStorage.setItem("portfolio_theme", "dark");
      } catch {
        /* ignore */
      }
    },
    { k: SLOW, darkTheme: dark },
  );
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Animation.enable");
  await cdp.send("Animation.setPlaybackRate", { playbackRate: 1 / SLOW });
  await page.goto(`${BASE}${path}`, { waitUntil: "commit" });
  await page.waitForSelector(".gi", { state: "attached", timeout: 20000 });
  const t0 = Date.now();
  for (const at of times) {
    const wait = at * SLOW - (Date.now() - t0);
    if (wait > 0) await page.waitForTimeout(wait);
    const actual = Math.round((Date.now() - t0) / SLOW);
    await page.screenshot({ path: join(OUT, `${name}-${String(at).padStart(4, "0")}.png`) });
    if (Math.abs(actual - at) > 25) console.log(name, `frame ${at} taken at ${actual}`);
  }
  const state = await page.evaluate(() => ({
    overlayGone: !document.querySelector(".gi"),
    htmlClass: document.documentElement.className,
    h1Opacity: getComputedStyle(document.querySelector("[data-intro-name-target]")).opacity,
    visited: localStorage.getItem("portfolio_visited"),
  }));
  console.log(name, JSON.stringify(state), errors.length ? `ERRORS: ${errors.join(" | ")}` : "");
  await ctx.close();
}

async function groundedShots(browser) {
  const desktopTimes = [
    60, 200, 360, 520, 660, 790, 910, 990, 1100, 1260, 1400, 1500, 1600, 1690, 1800, 1900, 1975,
    2060, 2200, 2350, 2480, 2900,
  ];
  await groundedFrames(browser, {
    name: "gi-desktop",
    path: "/?intro=v2",
    viewport: DESKTOP,
    times: desktopTimes,
  });
  await groundedFrames(browser, {
    name: "gi-dark",
    path: "/?intro=v2",
    viewport: DESKTOP,
    dark: true,
    times: [520, 990, 1100, 1260, 1500, 1690, 1900, 2060, 2350, 2900],
  });
  await groundedFrames(browser, {
    name: "gi-homev2",
    path: "/?intro=v2&home=v2",
    viewport: DESKTOP,
    times: [990, 1260, 1500, 1690, 1900, 2060, 2350, 2900],
  });
  await groundedFrames(browser, {
    name: "gi-wide",
    path: "/?intro=v2",
    viewport: { width: 1920, height: 1080 },
    times: [990, 1260, 1500, 1690, 1900, 2200, 2900],
  });
  await groundedFrames(browser, {
    name: "gi-mobile",
    path: "/?intro=v2",
    viewport: MOBILE,
    mobile: true,
    times: [60, 200, 400, 560, 740, 860, 1000, 1160, 1260, 1360, 1450, 1540, 1900],
  });
}

/** Grounded intro behaviour: skip on a key press, reduced motion, second visit. */
async function groundedBehaviour(browser) {
  const probe = (page) =>
    page.evaluate(() => {
      const h1 = document.querySelector("[data-intro-name-target]");
      const ink = document.querySelector("[data-intro-name-ink]");
      return {
        overlay: Boolean(document.querySelector(".gi")),
        h1Opacity: h1 ? getComputedStyle(h1).opacity : null,
        markOpacity: ink ? getComputedStyle(ink).opacity : null,
        visited: localStorage.getItem("portfolio_visited"),
      };
    });

  // Skip: a key press 400ms in lands on the finished hero.
  {
    const ctx = await context(browser, DESKTOP, { visited: false });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/?intro=v2`, { waitUntil: "commit" });
    await page.waitForSelector(".gi", { state: "attached" });
    await page.waitForTimeout(400);
    await page.keyboard.press("Space");
    await page.waitForTimeout(400);
    console.log("gi skip (key at 400ms)", JSON.stringify(await probe(page)));
    await page.screenshot({ path: join(OUT, "gi-skipped.png") });
    await ctx.close();
  }
  // Reduced motion: no overlay at all, hero finished with the mark drawn.
  {
    const ctx = await browser.newContext({ viewport: DESKTOP, userAgent: UA, reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/?intro=v2`, { waitUntil: "load" });
    await page.waitForSelector("[data-intro-name-target]");
    await page.waitForTimeout(300);
    console.log("gi reduced motion", JSON.stringify(await probe(page)));
    await page.screenshot({ path: join(OUT, "gi-reduced-motion.png") });
    await ctx.close();
  }
  // Flag on, second visit: no replay.
  {
    const ctx = await context(browser, DESKTOP, { visited: true });
    await ctx.addInitScript(() => localStorage.setItem("portfolio_intro_v2", "1"));
    const page = await ctx.newPage();
    await page.goto(`${BASE}/`, { waitUntil: "load" });
    await page.waitForSelector("[data-intro-name-target]");
    await page.waitForTimeout(300);
    console.log("gi second visit (flag on)", JSON.stringify(await probe(page)));
    await ctx.close();
  }
}

/** Header fit at every desktop breakpoint: screenshot the top strip and report overlaps. */
async function headerShots(browser) {
  for (const width of [1024, 1152, 1280, 1366, 1440, 1536, 1920]) {
    const ctx = await context(browser, { width, height: 800 }, { visited: true });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/experience`, { waitUntil: "load" });
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: join(OUT, `header-${width}.png`),
      clip: { x: 0, y: 0, width, height: 110 },
    });
    const info = await page.evaluate(() => {
      const nav = document.querySelector("nav[aria-label='Main navigation']");
      const row = nav?.firstElementChild;
      const kids = row ? [...row.children].filter((el) => el.offsetParent !== null) : [];
      const rects = kids.map((el) => el.getBoundingClientRect());
      const overlaps = [];
      for (let i = 1; i < rects.length; i += 1) {
        const gap = Math.round(rects[i].left - rects[i - 1].right);
        overlaps.push(gap);
      }
      const links = [...(kids[1]?.querySelectorAll("a") || [])];
      const linkRects = links.map((a) => a.getBoundingClientRect());
      const clipped = kids[1] ? kids[1].scrollWidth - kids[1].clientWidth : 0;
      return {
        links: links.map((a) => a.innerText.trim()),
        gapsBetweenGroups: overlaps,
        navOverflowPx: clipped,
        firstLinkLeft: Math.round(linkRects[0]?.left ?? -1),
        lastLinkRight: Math.round(linkRects.at(-1)?.right ?? -1),
        pageOverflow: document.documentElement.scrollWidth - window.innerWidth,
      };
    });
    console.log("header", width, JSON.stringify(info));
    await ctx.close();
  }
  // Phone: the menu sheet lists every header link.
  const ctx = await context(browser, MOBILE, { visited: true, mobile: true });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "load" });
  await page.waitForTimeout(1200);
  await page.click("button[aria-controls='mobile-navigation']");
  await page.waitForTimeout(900);
  await page.screenshot({ path: join(OUT, "header-mobile-menu.png") });
  const links = await page.evaluate(() =>
    [...document.querySelectorAll("#mobile-navigation a")].map((a) => a.innerText.trim()),
  );
  console.log("header mobile menu", JSON.stringify(links));
  await ctx.close();
}

/**
 * One page, one viewport-sized screenshot per screen of scroll.
 * Usage: node scripts/audit/shots.mjs [baseUrl] slices <path> [desktop|mobile]
 */
async function sliceShots(browser, path, device) {
  const mobile = device === "mobile";
  const viewport = mobile ? MOBILE : DESKTOP;
  const ctx = await context(browser, viewport, { visited: true, mobile });
  const page = await ctx.newPage();
  await page.goto(`${BASE}${path}`, { waitUntil: "load" });
  await page.waitForTimeout(8000); // let Kuro's greeting bubble clear
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  const step = viewport.height - 120;
  const name = `${mobile ? "mobile" : "desktop"}-slice${path.replace(/[^a-z0-9]+/gi, "-") || "-home"}`;
  let index = 0;
  for (let y = 0; y < total; y += step) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
    await page.waitForTimeout(700);
    await page.screenshot({ path: join(OUT, `${name}-${String(index).padStart(2, "0")}.png`) });
    index += 1;
  }
  console.log(name, `${index} slices of ${total}px`);
  await ctx.close();
}

const browser = await launch();
if (SET === "slices") await sliceShots(browser, process.argv[4] || "/", process.argv[5] || "desktop");
if (SET === "all" || SET === "header") await headerShots(browser);
if (SET === "all" || SET === "grounded") {
  await groundedShots(browser);
  await groundedBehaviour(browser);
}
if (SET === "all" || SET === "static") await staticShots(browser);
if (SET === "all" || SET === "intro") await introShots(browser);
await browser.close();
console.log("Saved to", OUT);
