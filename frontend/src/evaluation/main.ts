import { createApp, type App as VueApp } from "vue";
import App from "./App.vue";
import "../shared/design-tokens.css";
import "./styles.css";

let app: VueApp<Element> | null = null;
const root = () => document.querySelector("#evaluation-app-root");
export function mountEvaluationApp(target: string | Element = "#evaluation-app-root") { if (app) return app; const element = typeof target === "string" ? document.querySelector(target) : target; if (!element) throw new Error("RAG 评测挂载点不存在"); app = createApp(App); app.mount(element); return app; }
export function showEvaluationApp() { root()?.dispatchEvent(new CustomEvent("yumeno:evaluation-show")); }
export function hideEvaluationApp() { root()?.dispatchEvent(new CustomEvent("yumeno:evaluation-hide")); }
export function destroyEvaluationApp() { if (app) { app.unmount(); app = null; } }
