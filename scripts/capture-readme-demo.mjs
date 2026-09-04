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
    const title = document.querySelector("#chat-title");
    if (title) title.textContent = "向导";
    const log = document.querySelector("#chat-log");
    if (!log) throw new Error("chat-log not found");
    log.innerHTML = `
      <article class="message message-user"><p>帮我检查一下当前运行环境，并把需要的资源准备好。</p></article>
      <article class="message message-assistant message-demo"><p>好的，我先检查本机服务和受管资源。已确认 LLM 可用，GPT-SoVITS 当前未启动（按需启动，不是错误）。</p></article>
      <article class="message message-assistant message-demo demo-task-message">
        <p>运行环境检查完成，下面是当前状态：</p>
        <section class="demo-task-card">
          <header><div><span class="demo-kicker">环境检查</span><h3>运行资源状态</h3></div><span class="demo-status success">已完成</span></header>
          <div class="demo-resource-grid">
            <div><strong>LLM</strong><span class="demo-ok">已启用 · GPT-4o-mini</span></div>
            <div><strong>Milvus Lite</strong><span class="demo-ok">正常 · 本地向量库</span></div>
            <div><strong>GPT-SoVITS</strong><span class="demo-warn">已安装 · 服务未启动</span></div>
            <div><strong>RVC 环境</strong><span class="demo-ok">已就绪</span></div>
          </div>
          <footer><span>检测时间：刚刚 · 可在需要语音时按需启动</span><button type="button">查看系统状态</button></footer>
        </section>
      </article>
      <article class="message message-user"><p>那就下载并安装人声分离模型，完成后告诉我。</p></article>
      <article class="message message-assistant message-demo demo-task-message">
        <p>已开始准备人声分离模型，完成后会自动通知你。</p>
        <section class="demo-task-card running">
          <header><div><span class="demo-kicker">资源任务</span><h3>人声分离模型</h3></div><span class="demo-status running">下载中 · 68%</span></header>
          <div class="demo-progress"><i></i></div>
          <div class="demo-task-meta"><span>已下载 112 MB / 165 MB</span><span>当前阶段：校验模型文件</span></div>
          <footer><span>任务可恢复 · 资源仅写入应用受管目录</span><button class="stop" type="button">停止任务</button></footer>
        </section>
      </article>`;
    document.body.classList.add("readme-capture");
    document.querySelector("#chat-scroll-region")?.scrollTo(0, 0);
  });
  await page.addStyleTag({ content: `
    .message-demo { max-width: min(100%, 900px) !important; }
    .demo-task-card { border:1px solid #d7e2ea; border-top:3px solid #22b8b2; border-radius:14px; background:#fff; padding:20px 22px; margin-top:12px; box-shadow:0 10px 28px rgba(10,40,65,.08); }
    .demo-task-card.running { border-top-color:#3a82d6; }
    .demo-task-card header,.demo-task-card footer { display:flex; justify-content:space-between; align-items:center; gap:16px; }
    .demo-kicker { color:#159f9b; font-size:11px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; }
    .demo-task-card h3 { margin:5px 0 0; font-size:18px; color:#162638; }
    .demo-status { border-radius:999px; padding:6px 10px; font-size:12px; white-space:nowrap; }
    .demo-status.success { background:#e6f7ef; color:#148454; } .demo-status.running { background:#e8f2ff; color:#216db9; }
    .demo-resource-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px 28px; margin:20px 0; padding:15px 0; border-top:1px solid #edf2f5; border-bottom:1px solid #edf2f5; }
    .demo-resource-grid div { display:flex; justify-content:space-between; gap:16px; font-size:13px; } .demo-resource-grid strong { color:#33495d; } .demo-resource-grid span { color:#718292; white-space:nowrap; } .demo-ok { color:#178455 !important; } .demo-warn { color:#bd7c18 !important; }
    .demo-task-card footer { color:#82919d; font-size:12px; } .demo-task-card button { border:1px solid #b9dedd; border-radius:8px; padding:8px 12px; color:#148f8c; background:#f4fffe; font-weight:600; } .demo-task-card button.stop { border-color:#c5dbf3; color:#256eb2; background:#f5faff; }
    .demo-progress { height:8px; border-radius:999px; background:#e7eef5; overflow:hidden; margin:20px 0 10px; } .demo-progress i { display:block; width:68%; height:100%; background:linear-gradient(90deg,#32bcb6,#3784d8); border-radius:inherit; } .demo-task-meta { display:flex; justify-content:space-between; color:#6d8090; font-size:12px; margin-bottom:20px; }
  `});
  await page.screenshot({ path: `${outDir}/yumeno-conversation-demo.raw.png`, fullPage: true });
} finally { await browser.close(); }
