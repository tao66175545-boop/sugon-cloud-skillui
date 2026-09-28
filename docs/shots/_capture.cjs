const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

(async () => {
  const outDir = "F:/GrokBot/test02/docs/shots";
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://127.0.0.1:5173/", { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(800);

  // Full page for reference
  await page.screenshot({ path: path.join(outDir, "fullpage.png"), fullPage: true });

  // Hero: nav + hero section (top of page)
  const hero = page.locator("main > section").nth(0);
  await hero.screenshot({ path: path.join(outDir, "hero.png") });

  // Features
  const features = page.locator("#features");
  await features.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await features.screenshot({ path: path.join(outDir, "features.png") });

  // Pricing
  const pricing = page.locator("#pricing");
  await pricing.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await pricing.screenshot({ path: path.join(outDir, "pricing.png") });

  // FAQ
  const faq = page.locator("#faq");
  await faq.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await faq.screenshot({ path: path.join(outDir, "faq.png") });

  // Footer
  const footer = page.locator("footer");
  await footer.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await footer.screenshot({ path: path.join(outDir, "footer.png") });

  // Also capture some computed styles for evidence
  const observations = await page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    const tokens = {
      primary: cs.getPropertyValue("--color-primary").trim(),
      accent: cs.getPropertyValue("--color-accent").trim(),
      bg: cs.getPropertyValue("--color-bg").trim(),
      bgSubtle: cs.getPropertyValue("--color-bg-subtle").trim(),
      text: cs.getPropertyValue("--color-text").trim(),
      radiusXl: cs.getPropertyValue("--radius-xl").trim(),
      sectionPy: cs.getPropertyValue("--section-py").trim(),
      fontSans: cs.getPropertyValue("--font-sans").trim().slice(0, 40),
    };
    const h1 = document.querySelector("h1");
    const primaryBtn = document.querySelector(".btn-primary");
    const cards = document.querySelectorAll(".card");
    const recommended = Array.from(document.querySelectorAll("article")).find(a => a.textContent.includes("Recommended"));
    return {
      tokens,
      h1Text: h1 ? h1.innerText.replace(/\s+/g, " ").trim() : null,
      h1FontSize: h1 ? getComputedStyle(h1).fontSize : null,
      primaryBtnBg: primaryBtn ? getComputedStyle(primaryBtn).backgroundColor : null,
      primaryBtnRadius: primaryBtn ? getComputedStyle(primaryBtn).borderRadius : null,
      cardCount: cards.length,
      cardRadius: cards[0] ? getComputedStyle(cards[0]).borderRadius : null,
      cardPadding: cards[0] ? getComputedStyle(cards[0]).padding : null,
      cardBorder: cards[0] ? getComputedStyle(cards[0]).borderColor : null,
      featuresBg: (() => { const el = document.querySelector("#features"); return el ? getComputedStyle(el).backgroundColor : null; })(),
      pricingHighlightBorder: recommended ? getComputedStyle(recommended).borderColor : null,
      pricingHighlightShadow: recommended ? getComputedStyle(recommended).boxShadow : null,
      sectionCount: document.querySelectorAll("main > section").length,
      stickyNav: (() => { const h = document.querySelector("header"); return h ? getComputedStyle(h).position : null; })(),
      faqItems: document.querySelectorAll("#faq .card").length,
    };
  });
  fs.writeFileSync(path.join(outDir, "_observations.json"), JSON.stringify(observations, null, 2));
  console.log("OK", JSON.stringify(observations, null, 2));
  await browser.close();
})().catch(e => { console.error("ERR", e); process.exit(1); });
