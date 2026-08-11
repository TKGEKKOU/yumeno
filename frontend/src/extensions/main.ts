import { createApp, type App as VueApp } from "vue";
import App from "./App.vue";
import "../shared/design-tokens.css";
import "./styles.css";

let app: VueApp<Element> | null = null;
const root = () => document.querySelector("#extensions-app-root");

export function mountExtensionsApp(target: string | Element = "#extensions-app-root") {
  if (app) return app;
  const element = typeof target === "string" ? document.querySelector(target) : target;
  if (!element) throw new Error("能力扩展挂载点不存在");
  app = createApp(App); app.mount(element); return app;
}
export function showExtensionsApp() { root()?.dispatchEvent(new CustomEvent("yumeno:extensions-show")); }
export function hideExtensionsApp() { root()?.dispatchEvent(new CustomEvent("yumeno:extensions-hide")); }
export function destroyExtensionsApp() { if (app) { app.unmount(); app = null; } }
