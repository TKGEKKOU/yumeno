import { createApp, type App as VueApp } from "vue";
import RerankerSettingsApp from "./RerankerSettingsApp.vue";
import ProvidersApp from "./ProvidersApp.vue";

let app: VueApp<Element> | null = null;
let providersApp: VueApp<Element> | null = null;

export function mountRerankerSettingsApp(target: string | Element = "#reranker-settings-root") {
  if (app) return app;
  const element = typeof target === "string" ? document.querySelector(target) : target;
  if (!element) throw new Error("Reranker 设置挂载点不存在");
  app = createApp(RerankerSettingsApp);
  app.mount(element);
  return app;
}

export function destroyRerankerSettingsApp() {
  if (!app) return;
  app.unmount();
  app = null;
}

export function mountProvidersApp(target: string | Element = "#providers-root") {
  if (providersApp) return providersApp;
  const element = typeof target === "string" ? document.querySelector(target) : target;
  if (!element) throw new Error("提供商配置挂载点不存在");
  providersApp = createApp(ProvidersApp);
  providersApp.mount(element);
  return providersApp;
}

export function destroyProvidersApp() {
  if (!providersApp) return;
  providersApp.unmount();
  providersApp = null;
}
