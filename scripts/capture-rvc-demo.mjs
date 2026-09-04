#!/usr/bin/env node
import playwright from "../frontend/node_modules/playwright/index.js";
import { mkdirSync } from "node:fs";
const { chromium } = playwright;
const baseURL = process.env.YUMENO_BASE_URL || "http://127.0.0.1:17000";
const outDir = new URL("../docs/images/", import.meta.url).pathname.replace(/^\/+([A-Z]:)/, "$1");
mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ headless: true, channel: "msedge" }).catch(() => chromium.launch({ headless: true }));
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await page.goto(`${baseURL}/static/index.html#chat`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1000);
  await page.evaluate(() => {
    document.querySelector("#chat-title").textContent = "向导";
    const log = document.querySelector("#chat-log");
    if (!log) throw new Error("chat-log not found");
    log.innerHTML = `
      <article class="message message-user"><p>请把这段音频做成 RVC 变声，使用我的默认模型，完成后给我最终音频。</p></article>
      <article class="message message-assistant message-demo"><p>可以。我已收到音频，正在按顺序完成音频准备、人声分离和 RVC 转换，过程中可以随时停止。</p></article>
      <article class="message message-assistant message-demo">
        <p>RVC 任务已完成，最终音频可以试听或下载。</p>
        <section class="rvc-demo-card">
          <header><div><span class="demo-kicker">RVC 变声任务</span><h3>voice_sample_converted.wav</h3></div><span class="demo-status success">已完成</span></header>
          <div class="rvc-steps">
            <span class="done"><b>✓</b>文件接收</span><i>→</i><span class="done"><b>✓</b>音频准备</span><i>→</i><span class="done"><b>✓</b>人声分离</span><i>→</i><span class="done"><b>✓</b>RVC 转换</span>
          </div>
          <div class="rvc-result">
            <div class="rvc-wave"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>
            <div><strong>最终音频</strong><small>RVC · 默认音色模型 · 00:18</small></div><button class="play" type="button">▶</button>
          </div>
          <div class="rvc-meta"><span>模型：default_voice.pth</span><span>Index：default_voice.index</span><span>处理耗时：32 秒</span></div>
          <footer><span>结果已保存到任务记录，可随时再次下载</span><button type="button">下载音频</button></footer>
        </section>
      </article>`;
    document.body.classList.add("readme-capture");
    document.querySelector("#chat-scroll-region")?.scrollTo(0, 0);
  });
  await page.addStyleTag({ content: `
    .message-demo { max-width:min(100%,900px)!important; }
    .rvc-demo-card { border:1px solid #d7e2ea; border-top:3px solid #22b8b2; border-radius:14px; background:#fff; padding:20px 22px; margin-top:12px; box-shadow:0 10px 28px rgba(10,40,65,.08); }
    .rvc-demo-card header,.rvc-demo-card footer { display:flex; justify-content:space-between; align-items:center; gap:16px; }
    .demo-kicker { color:#159f9b; font-size:11px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; }
    .rvc-demo-card h3 { margin:5px 0 0; font-size:18px; color:#162638; }
    .demo-status { border-radius:999px; padding:6px 10px; font-size:12px; white-space:nowrap; background:#e6f7ef; color:#148454; }
    .rvc-steps { display:flex; align-items:center; justify-content:space-between; gap:8px; margin:20px 0; padding:13px 14px; background:#f6fbfc; border:1px solid #e3f0f1; border-radius:10px; color:#5e7483; font-size:12px; white-space:nowrap; }
    .rvc-steps i { color:#b1c1ca; font-style:normal; } .rvc-steps .done { color:#158d87; display:flex; align-items:center; gap:6px; } .rvc-steps b { display:inline-grid; place-items:center; width:18px; height:18px; border-radius:50%; background:#dff6ef; font-size:12px; }
    .rvc-result { display:flex; align-items:center; gap:15px; padding:14px 15px; border:1px solid #e1e9ef; border-radius:10px; background:#fbfdff; } .rvc-result strong,.rvc-result small { display:block; } .rvc-result strong { color:#263c4d; font-size:14px; } .rvc-result small { color:#7d8e9b; font-size:12px; margin-top:4px; white-space:nowrap; }
    .rvc-wave { display:flex; align-items:center; gap:3px; width:210px; height:34px; padding:0 7px; border-radius:7px; background:#eefafa; } .rvc-wave span { width:4px; border-radius:4px; background:#27b7b2; } .rvc-wave span:nth-child(3n) { height:26px; } .rvc-wave span:nth-child(3n+1) { height:14px; } .rvc-wave span:nth-child(3n+2) { height:21px; }
    .rvc-result .play { margin-left:auto; width:34px; height:34px; border:0; border-radius:50%; background:#2bbab5; color:#fff; font-size:14px; } .rvc-meta { display:flex; gap:18px; padding:14px 0 18px; color:#718492; font-size:12px; border-bottom:1px solid #edf2f5; white-space:nowrap; } .rvc-demo-card footer { color:#82919d; font-size:12px; margin-top:16px; } .rvc-demo-card footer button { border:1px solid #b9dedd; border-radius:8px; padding:8px 12px; color:#148f8c; background:#f4fffe; font-weight:600; }
  `});
  await page.screenshot({ path: `${outDir}/yumeno-rvc-conversation-demo.raw.png`, fullPage: true });
} finally { await browser.close(); }
