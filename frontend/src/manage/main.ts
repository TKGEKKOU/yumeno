import { createApp, type App as VueApp } from "vue";
import "@vue-flow/core/dist/style.css";
import "@vue-flow/core/dist/theme-default.css";
import App from "./App.vue";
import "./styles.css";

let app: VueApp<Element> | null = null;
export function mountManageApp(target: string | Element = "#role-workbench-root") {
  if (app) return app;
  const element = typeof target === "string" ? document.querySelector(target) : target;
  if (!element) throw new Error("角色工作台挂载点不存在");
  app = createApp(App); app.mount(element); return app;
}
export function showManageApp() { document.querySelector("#role-workbench-root")?.dispatchEvent(new CustomEvent("yumeno:manage-show")); }
export function destroyManageApp() { if (app) { app.unmount(); app = null; } }
