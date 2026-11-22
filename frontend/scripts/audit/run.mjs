/**
 * Portfolio audit — reproduces key Phase 0 budgets against a running preview server.
 * Usage: npm run preview (separate terminal) then npm run audit
 */
import { chromium } from "playwright";
import { readFileSync, mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const budgets = JSON.parse(readFileSync(join(__dirname, "budgets.json"), "utf8"));
const OUT = join(process.env.TEMP || "/tmp", "portfolio-audit-run");
mkdirSync(OUT, { recursive: true });

const BASE = process.env.AUDIT_BASE_URL || budgets.baseUrl;
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const failures = [];
const results = {};

function check(name, ok, detail) {
  results[name] = { ok, detail };
  if (!ok) failures.push(`${name}: ${detail}`);
  console.log(ok ? "PASS" : "FAIL", name, "—", detail);
}

async function main() {
  let browser;
  try {
    browser = await chromium.launch({
      channel: "chrome",
      headless: true,
      args: ["--disable-blink-features=AutomationControlled"],
    });
  } catch {
    browser = await chromium.launch({ headless: true });
  }

  // --- First visit /services: headline timing ---
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      userAgent: UA,
    });
    const page = await ctx.newPage();
    const t0 = Date.now();
    await page.goto(`${BASE}/services`, { waitUntil: "commit" });
    let readableAt = null;
    let erasedAt = null;
    let readableAgain = null;
    for (let i = 0; i < 200; i++) {
      const s = await page
        .evaluate(() => {
          const loader = !!document.querySelector(".page-loader");
          const h1 = document.querySelector("#main-content h1");
          const len = h1 ? (h1.innerText || "").trim().length : -1;
          return { loader, len };
        })
        .catch(() => null);
      if (!s) {
        await page.waitForTimeout(80);
        continue;
      }
      const ms = Date.now() - t0;
      if (!s.loader && readableAt === null && s.len > 40) readableAt = ms;
      if (readableAt !== null && erasedAt === null && s.len >= 0 && s.len < 10) erasedAt = ms;
      if (erasedAt !== null && readableAgain === null && s.len > 40) readableAgain = ms;
      if (readableAt !== null && ms > readableAt + 8000) break;
      await page.waitForTimeout(80);
    }
    check(
      "servicesHeadlineReadableMs",
      readableAt !== null && readableAt <= budgets.servicesHeadlineReadableMs,
      `readableAt=${readableAt}ms (budget ${budgets.servicesHeadlineReadableMs}ms)`,
    );
    check(
      "servicesHeadlineNeverErased",
      erasedAt === null,
      erasedAt === null ? "headline never erased" : `erased at ${erasedAt}ms, back at ${readableAgain}ms`,
    );
    await ctx.close();
  }

  // --- Home transfer size (returning visitor, no intro) ---
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      userAgent: UA,
    });
    await ctx.addInitScript(() => {
      localStorage.setItem("portfolio_visited", "true");
      sessionStorage.setItem("portfolio_visited", "true");
    });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/`, { waitUntil: "load" });
    await page.waitForTimeout(2500);
    const kb = await page.evaluate(() => {
      let total = 0;
      for (const e of performance.getEntriesByType("resource")) {
        total += (e.transferSize || e.encodedBodySize || 0) / 1024;
      }
      return Math.round(total);
    });
    // Soft check — first visit with intro is heavier; this is returning visitor
    check(
      "returningHomeTransferKb",
      kb <= budgets.firstVisitHomeTransferKb * 2,
      `${kb}KB transferred (soft budget ${budgets.firstVisitHomeTransferKb * 2}KB for returning)`,
    );
    await ctx.close();
  }

  // --- CLS samples ---
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      userAgent: UA,
    });
    await ctx.addInitScript(() => {
      localStorage.setItem("portfolio_visited", "true");
      sessionStorage.setItem("portfolio_visited", "true");
      window.__cls = 0;
      try {
        new PerformanceObserver((list) => {
          for (const e of list.getEntries()) {
            if (!e.hadRecentInput) window.__cls += e.value;
          }
        }).observe({ type: "layout-shift", buffered: true });
      } catch {
        /* ignore */
      }
    });
    const page = await ctx.newPage();
    for (const [path, key, budget] of [
      ["/", "clsHome", budgets.clsHome],
      ["/services", "clsServices", budgets.clsServices],
      ["/projects", "clsProjects", budgets.clsProjects],
    ]) {
      await page.goto(`${BASE}${path}`, { waitUntil: "load" });
      await page.waitForTimeout(path === "/services" ? 4000 : 3000);
      const cls = await page.evaluate(() => +(window.__cls || 0).toFixed(4));
      await page.evaluate(() => {
        window.__cls = 0;
      });
      // Phase 0 records baseline; hard fail only if catastrophic (>0.25)
      check(key, cls <= Math.max(budget, 0.25), `CLS=${cls} (target ${budget})`);
    }
    await ctx.close();
  }

  // --- Primary CTA hit test ---
  {
    for (const [label, viewport] of [
      ["desktop", { width: 1440, height: 900 }],
      ["mobile", { width: 390, height: 844, isMobile: true, hasTouch: true }],
    ]) {
      const ctx = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        isMobile: !!viewport.isMobile,
        hasTouch: !!viewport.hasTouch,
        userAgent: UA,
      });
      await ctx.addInitScript(() => {
        localStorage.setItem("portfolio_visited", "true");
        sessionStorage.setItem("portfolio_visited", "true");
        localStorage.setItem("portfolio_onboarding_hint_dismissed", "true");
      });
      const page = await ctx.newPage();
      await page.goto(`${BASE}/`, { waitUntil: "load" });
      await page.waitForTimeout(2000);
      const hit = await page.evaluate(() => {
        const cta = [...document.querySelectorAll("#main-content a")].find((a) =>
          /start a project|discovery call|request a quote/i.test(a.textContent),
        );
        if (!cta) return { found: false };
        const r = cta.getBoundingClientRect();
        const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        return {
          found: true,
          hitIsSelf: cta.contains(top),
          hitText: top?.textContent?.trim()?.slice(0, 40),
          label: cta.textContent.trim().slice(0, 40),
        };
      });
      check(
        `ctaHitTest_${label}`,
        hit.found && hit.hitIsSelf,
        JSON.stringify(hit),
      );
      await ctx.close();
    }
  }

  await browser.close();

  const report = { at: new Date().toISOString(), base: BASE, results, failures };
  writeFileSync(join(OUT, "audit-report.json"), JSON.stringify(report, null, 2));
  console.log("\nReport:", join(OUT, "audit-report.json"));
  if (failures.length) {
    console.error(`\n${failures.length} budget failure(s)`);
    process.exitCode = 1;
  } else {
    console.log("\nAll audited budgets passed (or within soft Phase 0 tolerance).");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
