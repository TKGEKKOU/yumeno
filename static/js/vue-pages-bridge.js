"use strict";
window.PL = window.PL || { modules: {} };
let vuePagesPromise = null;
function ensureVuePageStyles() {
  if (document.querySelector('link[data-yumeno-vue-pages]')) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "/static/vue/style.css";
  link.dataset.yumenoVuePages = "true";
  document.head.append(link);
}
function loadVuePages() {
  ensureVuePageStyles();
  if (!vuePagesPromise) vuePagesPromise = import("/static/vue/manage.js");
  return vuePagesPromise;
}
async function initExtensions() { const module = await loadVuePages(); module.mountExtensionsApp("#extensions-app-root"); }
async function showExtensions() { const module = await loadVuePages(); module.mountExtensionsApp("#extensions-app-root"); module.showExtensionsApp(); }
async function hideExtensions() { const module = await loadVuePages(); module.hideExtensionsApp(); }
async function initEvaluation() { const module = await loadVuePages(); module.mountEvaluationApp("#evaluation-app-root"); }
async function showEvaluation() { const module = await loadVuePages(); module.mountEvaluationApp("#evaluation-app-root"); module.showEvaluationApp(); }
async function hideEvaluation() { const module = await loadVuePages(); module.hideEvaluationApp(); }
window.PL.modules.plugins = { init: initExtensions, onShow: showExtensions, onHide: hideExtensions };
window.PL.modules.test = { init: initEvaluation, onShow: showEvaluation, onHide: hideEvaluation };
window.addEventListener("pagehide", () => vuePagesPromise?.then((module) => {
  module.destroyExtensionsApp(); module.destroyEvaluationApp();
}).catch(() => {}));
