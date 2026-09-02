import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createPersonaVersion,
  getPersonaVersion,
  listPersonaVersions,
  publishPersonaVersion,
  rollbackPersonaVersion,
} from "../src/manage/api";
import VersionPanel from "../src/manage/components/VersionPanel.vue";

const versionSummary = {
  id: "v-1",
  persona_id: "persona-1",
  version_number: 1,
  status: "draft",
  label: "初始配置",
  note: "第一次保存",
  created_at: "2026-08-30T10:00:00Z",
  published_at: null,
};

const version = {
  ...versionSummary,
  snapshot: {
    schema_version: 1,
    name: "测试角色",
    persona_type: "knowledge_expert",
    profile: { description: "一个测试角色" },
    knowledge_space_id: "space-1",
    document_ids: ["doc-1"],
    capability_overrides: { "skill/research": true },
    mcp_server_names: ["browser"],
  },
};

function response(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("persona version API", () => {
  it("uses the persona-scoped version endpoints and payloads", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(response([versionSummary]))
      .mockResolvedValueOnce(response(version))
      .mockResolvedValueOnce(response(version, 201))
      .mockResolvedValueOnce(response({ version }))
      .mockResolvedValueOnce(response({ version }));

    await expect(listPersonaVersions("persona/1")).resolves.toEqual([versionSummary]);
    await expect(getPersonaVersion("persona/1", "v-1")).resolves.toEqual(version);
    await expect(createPersonaVersion("persona/1", { label: "新版本", note: "备注" })).resolves.toEqual(version);
    await expect(publishPersonaVersion("persona/1", "v-1")).resolves.toEqual(version);
    await expect(rollbackPersonaVersion("persona/1", "v-1")).resolves.toEqual(version);

    expect(fetchMock.mock.calls.map(([input, init]) => [String(input), init?.method, init?.body])).toEqual([
      ["/api/personas/persona%2F1/versions", undefined, undefined],
      ["/api/personas/persona%2F1/versions/v-1", undefined, undefined],
      ["/api/personas/persona%2F1/versions", "POST", JSON.stringify({ label: "新版本", note: "备注" })],
      ["/api/personas/persona%2F1/versions/v-1/publish", "POST", undefined],
      ["/api/personas/persona%2F1/versions/v-1/rollback", "POST", undefined],
    ]);
  });
});

describe("VersionPanel", () => {
  it("renders the history, loads a snapshot, and exposes version actions", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(response([versionSummary]))
      .mockResolvedValueOnce(response(version));

    const wrapper = mount(VersionPanel, {
      props: { personaId: "persona-1", personaName: "测试角色" },
    });

    await vi.waitFor(() => expect(wrapper.text()).toContain("v1"));
    expect(wrapper.text()).toContain("初始配置");
    expect(wrapper.text()).toContain("草稿");

    await vi.waitFor(() => expect(wrapper.text()).toContain("space-1"));
    expect(wrapper.text()).toContain("1 份资料");
    expect(wrapper.text()).toContain("1 项能力");
    expect(wrapper.text()).toContain("browser");
    expect(wrapper.find("button.version-action").exists()).toBe(true);
  });

  it("shows a clear unavailable state when the backend route is not enabled", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response({ detail: "Not Found" }, 404));

    const wrapper = mount(VersionPanel, {
      props: { personaId: "persona-1" },
    });

    await vi.waitFor(() => expect(wrapper.text()).toContain("版本接口尚未启用"));
  });
});
