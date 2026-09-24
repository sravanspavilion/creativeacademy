/**
 * Structural design verification without screenshots: measures the rendered
 * DOM (sizes, layout, effects) at key viewports. Complements visual-check.
 * Usage: node scripts/structure-check.mjs [baseURL]
 */
import puppeteer from "puppeteer-core";

const BASE = process.argv[2] ?? "http://localhost:3001";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const run = async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--disable-gpu"],
  });
  let failures = 0;

  const probe = async (name, at, width, height, opts = {}) => {
    const page = await browser.newPage();
    await page.setViewport({ width, height });
    await page.goto(`${BASE}/${at ? `?at=${at}` : ""}`, { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 1000));

    const m = await page.evaluate(() => {
      const cards = [...document.querySelectorAll("footer .grid > div")];
      const rects = cards.map((c) => ({
        top: Math.round(c.getBoundingClientRect().top),
        left: Math.round(c.getBoundingClientRect().left),
        shadow: getComputedStyle(c).boxShadow,
        hasBadge: (c.textContent ?? "").toLowerCase().includes("now active"),
      }));
      const clockEl = document.querySelector('[role="timer"]');
      const clockSize = clockEl ? parseFloat(getComputedStyle(clockEl).fontSize) : 0;
      const visibleEmblems = [...document.querySelectorAll(".emblem-float")].filter(
        (e) => !!(e.offsetWidth || e.offsetHeight || e.getClientRects().length),
      ).length;
      return { rects, clockSize: Math.round(clockSize), visibleEmblems };
    });

    const sameRow = m.rects.length === 3 && Math.abs(m.rects[1].top - m.rects[0].top) < 40;
    const stacked = m.rects.length === 3 && m.rects[1].top - m.rects[0].top > 100;
    const activeGlow = m.rects.some((r) => r.hasBadge && r.shadow !== "none");
    const minClock = opts.mobile ? 40 : 100;
    const emblemsOk = opts.mobile ? m.visibleEmblems === 0 : m.visibleEmblems >= 5;

    const ok =
      m.rects.length === 3 &&
      (opts.mobile ? stacked : sameRow) &&
      activeGlow &&
      m.clockSize >= minClock &&
      emblemsOk;
    if (!ok) failures += 1;
    console.log(
      `${ok ? "PASS" : "FAIL"}  ${name}\n     cardsRow=${sameRow} activeGlow=${activeGlow} clock=${m.clockSize}px visibleEmblems=${m.visibleEmblems} rects=${JSON.stringify(m.rects)}`,
    );
    await page.close();
  };

  await probe("projector-1920", "10:30", 1920, 1080);
  await probe("desktop-1440", "16:30", 1440, 900);
  await probe("tablet-1024", "12:00", 1024, 768);
  await probe("mobile-390", "10:30", 390, 844, { mobile: true });
  await probe("ultrawide-2560", "09:00", 2560, 1440);

  await browser.close();
  console.log(`\n${failures === 0 ? "STRUCTURE OK" : `${failures} STRUCTURE FAIL(S)`}`);
  process.exit(failures === 0 ? 0 : 1);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});