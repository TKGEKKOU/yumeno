// @vitest-environment node

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { reactive } from "vue";
import { describe, expect, it } from "vitest";

import { plainClone } from "../src/manage/api";

const source = (relativePath: string) => readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf8");
const appSource = source("../src/manage/App.vue");
const navigatorSource = source("../src/manage/components/RoleNavigator.vue");
const inspectorSource = source("../src/manage/components/NodeInspector.vue");
const apiSource = source("../src/manage/api.ts");
const workbenchSource = source("../src/manage/state/useRoleWorkbench.ts");
const stylesSource = source("../src/manage/styles.css");

describe("plainClone", () => {
  it("converts Vue reactive API data into a cloneable plain object", () => {
    const source = reactive({ id: "p", profile: { description: "角色" } });
    const cloned = plainClone(source);
    expect(cloned).toEqual({ id: "p", profile: { description: "角色" } });
    expect(cloned).not.toBe(source);
  });

});

describe("manage workbench structure", () => {
  it("keeps role selection in the toolbar and gives the graph an open canvas region", () => {
    expect(appSource).toContain('class="workbench-content"');
    expect(appSource).toContain('class="workbench-canvas-region"');
    expect(appSource.indexOf("<RoleNavigator")).toBeGreaterThan(appSource.indexOf('class="workbench-toolbar"'));
    expect(navigatorSource).toContain('class="role-picker"');
    expect(navigatorSource).not.toContain('class="role-nav"');
  });

  it("integrates the Live2D model library into the node inspector", () => {
    expect(inspectorSource).toContain('class="live2d-model-library"');
    expect(inspectorSource).toContain("model.compatible === false");
    expect(inspectorSource).toContain("model.moc_version");
    expect(inspectorSource).toContain("emit('refreshLive2d')");
    expect(inspectorSource).toContain("emit('openLive2dDirectory')");
    expect(apiSource).toContain("export async function listLive2dModels");
    expect(apiSource).toContain("export async function openLive2dModelDirectory");
    expect(workbenchSource).toContain("async function refreshLive2dResources");
    expect(appSource).toContain('@refresh-live2d="workbench.refreshLive2dResources"');
  });

  it("keeps the persona node read-only and reserves editing for the profile node", () => {
    expect(inspectorSource).toContain('v-if="kind === \'profile\'" class="inspect-fields"');
    expect(inspectorSource).not.toContain("kind === 'persona' || kind === 'profile'");
  });

  it("uses one grid surface across the canvas and inspector", () => {
    expect(stylesSource).toMatch(/\.workbench-content\s*\{[^}]*background-image:/s);
    expect(stylesSource).toMatch(/\.graph-stage\s*\{[^}]*background:\s*transparent/s);
    expect(stylesSource).toContain(".graph-node.kind-skill");
    expect(stylesSource).toContain(".graph-node.kind-tool");
    expect(stylesSource).toContain(".graph-node.kind-mcp");
  });

  it("uses an open canvas with a lightweight contextual inspector", () => {
    expect(stylesSource).toContain(".workbench-content {");
    expect(stylesSource).toContain(".role-picker-menu {");
    expect(stylesSource).not.toMatch(/\.role-workbench\s*\{[^}]*border\s*:/s);
    expect(stylesSource).not.toContain("grid-template-columns:220px minmax(520px,1fr) 300px");
    expect(stylesSource).toMatch(/@media \(max-width:820px\)[\s\S]*\.node-inspector\s*\{[^}]*position\s*:\s*absolute/s);
  });

  it("keeps the canvas height when the optional status message is absent", () => {
    expect(stylesSource).toMatch(/\.role-workbench\s*\{[^}]*display:\s*flex[^}]*flex-direction:\s*column/s);
    expect(stylesSource).toMatch(/\.workbench-content\s*\{[^}]*flex:\s*1/s);
  });

  it("removes the desktop shell minimum width only while the narrow manage view is active", () => {
    expect(stylesSource).toMatch(/@media \(max-width:820px\)[\s\S]*body:has\(#manage-view:not\(\.is-hidden\)\) \.app-shell\s*\{[^}]*min-width:\s*0/s);
  });
});
