import { createApp, type App as VueApp } from "vue";
import RerankerSettingsApp from "./RerankerSettingsApp.vue";

let app: VueApp<Element> | null = null;

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
