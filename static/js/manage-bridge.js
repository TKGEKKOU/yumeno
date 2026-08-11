"use strict";
window.PL = window.PL || { modules: {} };
let manageModulePromise = null;
function ensureManageStyles() {
  if (document.querySelector('link[data-yumeno-manage]')) return;
  const link = document.createElement("link"); link.rel = "stylesheet"; link.href = "/static/vue/style.css"; link.dataset.yumenoManage = "true"; document.head.append(link);
}
function loadManageModule() { ensureManageStyles(); if (!manageModulePromise) manageModulePromise = import("/static/vue/manage.js"); return manageModulePromise; }
async function initVueManage() { const module = await loadManageModule(); module.mountManageApp("#role-workbench-root"); }
async function showVueManage() { const module = await loadManageModule(); module.mountManageApp("#role-workbench-root"); module.showManageApp(); }
window.PL.modules.manage = { init: initVueManage, onShow: showVueManage };
window.addEventListener("pagehide", () => { manageModulePromise?.then((module) => module.destroyManageApp()).catch(() => {}); });
