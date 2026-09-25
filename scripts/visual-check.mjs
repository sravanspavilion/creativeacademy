/**
 * Headless visual + functional QA for the Academy Batch Controller.
 *
 * Uses system Chrome (puppeteer-core). Visits the dashboard at multiple
 * preview times (?at=HH:MM) and viewports, asserts expected states, checks
 * the clock/countdown actually tick, and captures console errors and
 * horizontal overflow. Screenshots land in /tmp/academy-shots.
 *
 * Usage:
 *   node scripts/visual-check.mjs [baseURL]   (default http://localhost:3000)
 */
import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";

const BASE = process.argv[2] ?? "http://localhost:3000";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUT = "/tmp/academy-shots";
mkdirSync(OUT, { recursive: true });

const viewports = [
  { name: "projector-1920", width: 1920, height: 1080 },
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "hd-1280", width: 1280, height: 720 },
  { name: "tablet-1024", width: 1024, height: 768 },
  { name: "mobile-390", width: 390, height: 844 },
];

/** time → expected active label + a defining phrase */
const scenarios = [
  { name: "morning-start", at: "09:00", active: "MORNING", expect: "Adobe Premiere Pro", state: "LIVE" },
  { name: "morning-50", at: "10:30", active: "MORNING", expect: "Adobe Premiere Pro", state: "50%" },
  { name: "morning-last", at: "11:59", active: "MORNING", expect: "Adobe Premiere Pro" },
  { name: "afternoon", at: "12:00", active: "AFTERNOON", expect: "Adobe Photoshop" },
  { name: "evening", at: "16:30", active: "EVENING", expect: "AI Creative Tools" },
  { name: "ended", at: "20:00", active: "", expect: "Today's Schedule Has Ended" },
  { name: "preopen", at: "07:00", active: "", expect: "Academy Opens at" },
];

const results = [];
const consoleErrors = [];
let failures = 0;

const run = async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--disable-gpu", "--no-first-run", "--disable-default-apps"],
  });

  const shot = async (page, name) => {
    try {
      await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
    } catch (err) {
      console.log(`      (screenshot skipped: ${err.message.split("\n")[0]})`);
    }
  };

  for (const vp of viewports) {
    for (const sc of scenarios) {
      const page = await browser.newPage();
      const errors = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text());
      });
      page.on("pageerror", (err) => errors.push(String(err)));

      await page.setViewport({ width: vp.width, height: vp.height });
      const url = `${BASE}/?at=${sc.at}`;
      await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
      await new Promise((r) => setTimeout(r, 1200));

      const bodyText = await page.evaluate(() => document.body.innerText);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      const hasActive = sc.active === "" || bodyText.includes(sc.active);
      const hasExpect = bodyText.includes(sc.expect);
      const hasCountdown = sc.at >= "09:00" && sc.at < "18:00"
        ? bodyText.includes("TIME REMAINING")
        : true;

      const ok = !!hasActive && !!hasExpect && overflow <= 1 && errors.length === 0 && hasCountdown;
      if (!ok) failures += 1;
      results.push({
        ok,
        viewport: vp.name,
        scenario: sc.name,
        url,
        checks: { hasActive, hasExpect, hasCountdown, overflow, consoleErrors: errors.length },
      });
      if (errors.length) consoleErrors.push({ url, errors });

      await shot(page, `${vp.name}-${sc.name}`);
      results.push({
        ok,
        viewport: vp.name,
        scenario: sc.name,
        url,
        checks: { hasActive, hasExpect, hasCountdown, overflow, consoleErrors: errors.length },
      });
      if (!ok) {
        console.log(
          `FAIL  ${vp.name.padEnd(14)} ${sc.name.padEnd(14)} overflow=${overflow}`,
        );
        console.log("      detail:", JSON.stringify({ hasActive, hasExpect, hasCountdown, consoleErrors: errors }));
      }
      await page.close();
    }
  }

  // ---- live ticking check (no ?at): clock + countdown must advance ----
  const live = await browser.newPage();
  await live.setViewport({ width: 1920, height: 1080 });
  await live.goto(BASE, { waitUntil: "networkidle2", timeout: 30000 });
  await new Promise((r) => setTimeout(r, 400));
  const clockA = await live.evaluate(() =>
    document.querySelector('[role="timer"]')?.textContent ?? "",
  );
  await new Promise((r) => setTimeout(r, 2100));
  const clockB = await live.evaluate(() =>
    document.querySelector('[role="timer"]')?.textContent ?? "",
  );
  const ticks = clockA !== clockB;
  results.push({
    ok: ticks,
    viewport: "desktop-1440",
    scenario: "live-clock-ticks",
    url: BASE,
    checks: { "clock advanced": ticks, before: clockA, after: clockB },
  });
  if (!ticks) failures += 1;
  await shot(live, "live-live");
  await live.close();

  await browser.close();

  // print
  for (const r of results) {
    console.log(
      `${r.ok ? "PASS" : "FAIL"}  ${r.viewport.padEnd(14)} ${r.scenario.padEnd(14)} ${
        r.url.split("/?")[0]
      }${r.url.split("?")[1] ? `?${r.url.split("?")[1]}` : ""}`,
    );
    if (!r.ok) console.log("      detail:", JSON.stringify(r.checks));
  }
  if (consoleErrors.length) {
    console.log("\nConsole errors captured:");
    console.log(JSON.stringify(consoleErrors, null, 2));
  }
  console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : `${failures} CHECK(S) FAILED`} — screenshots in ${OUT}`);
  process.exit(failures === 0 ? 0 : 1);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});