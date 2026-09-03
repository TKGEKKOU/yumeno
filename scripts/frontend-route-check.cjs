"use strict";
const { chromium } = require("playwright");
const baseURL = process.env.YUMENO_BASE_URL || "http://127.0.0.1:17000";
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(`${baseURL}/static/index.html`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(500);
    await page.goto(`${baseURL}/static/index.html#settings`, { waitUntil: "domcontentloaded" });
    const providerCard = await page.locator(".provider-card").count();
    if (!providerCard) throw new Error("provider-card not found");
    if (errors.length) throw new Error(`console errors: ${errors.join("; ")}`);
    console.log(JSON.stringify({ ok: true, url: `${baseURL}/static/index.html`, providerCard }));
  } finally { await browser.close(); }
})().catch(error => { console.error(error.stack || error); process.exit(1); });
