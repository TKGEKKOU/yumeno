# 在线扩展目录设计

## 目标

为扩展页增加一个轻量、可审计的在线扩展目录，让用户能够发现并安装外部 Skill 和 MCP，而不必手工填写完整配置。第一版聚焦以下流程：

```text
读取目录 -> 搜索/筛选 -> 查看详情 -> 校验来源与权限 -> 用户确认 -> 安装 -> 默认停用/未信任 -> 用户启用
```

目录只提供声明式元数据和来源信息。客户端不执行目录中的远程 shell 脚本，也不把目录当作任意代码执行入口。

## 范围

### 纳入

- 从固定 HTTPS 目录读取 Skill 和 MCP 条目。
- 目录缓存、刷新和离线回退。
- Skill：GitHub 仓库路径、直接 zip 或 `SKILL.md` 来源。
- MCP：`uvx`、`npx`、Docker、`streamable_http`、`sse` 五类声明式运行方式。
- 安装前详情预览：版本、来源、依赖、环境变量、网络和写操作权限。
- 安装成功后的状态刷新、失败回滚和错误反馈。
- 继续保留本地 zip 上传、MCP JSON 导入和手动配置。

### 不纳入

- GitHub 全站动态搜索。
- 第三方账号体系、评分、评论和付费市场。
- 远程脚本、安装器或未经声明的任意命令执行。
- 自动为角色启用外部 Skill 或自动授权 MCP。

## 方案选择

### 固定 HTTPS 目录（采用）

项目配置一个默认目录 URL，目录返回 JSON；支持通过本地配置覆盖 URL。实现简单、可缓存、可审计，适合当前单机桌面产品。

### GitHub 动态搜索（不采用）

发现能力强，但结果不稳定，难以验证技能结构、版本和供应链来源，也容易把不兼容的 MCP 配置展示给用户。

### 第三方扩展市场（暂不采用）

需要账号、审核、服务端存储和发布流程，超出当前轻量目标。

## 目录协议

目录根对象：

```json
{
  "schema_version": 1,
  "generated_at": "2026-08-10T00:00:00Z",
  "catalog_version": "2026.08.10",
  "items": []
}
```

每个条目至少包含：

```json
{
  "id": "web-research",
  "kind": "skill",
  "name": "网页研究",
  "description": "搜索、抓取并整理网页信息",
  "version": "1.0.0",
  "categories": ["联网", "研究"],
  "source": {
    "type": "github",
    "repo": "owner/repository",
    "path": "skills/web-research",
    "ref": "main",
    "sha256": ""
  },
  "requires": {
    "tools": ["search"],
    "env": [],
    "runtimes": []
  },
  "security": {
    "scripts": false,
    "network": true,
    "mutates_data": false,
    "notes": ""
  }
}
```

约束：

- `schema_version`、`id`、`kind`、`name`、`version`、`source` 必填。
- `kind` 只能是 `skill` 或 `mcp`。
- `source.type` 只能使用已实现的声明式来源。
- 所有远程地址必须是 HTTPS；本地来源只允许由本地导入流程处理。
- Skill 的来源必须最终能定位到一个包含 `SKILL.md` 的目录。
- MCP 条目必须声明一种运行方式和所需参数，不允许携带 shell 脚本字段。
- `sha256` 存在时，下载内容必须匹配；不匹配则拒绝安装。

MCP 条目的 `runtime` 示例：

```json
{
  "kind": "mcp",
  "source": {
    "type": "package",
    "runtime": "uvx",
    "package": "example-mcp==1.2.0",
    "args": ["example-mcp"]
  },
  "requires": {
    "env": ["EXAMPLE_API_KEY"]
  },
  "security": {
    "network": true,
    "mutates_data": false,
    "notes": "需要联网"
  }
}
```

远程 MCP 条目使用：

```json
{
  "source": {
    "type": "remote",
    "transport": "streamable_http",
    "url": "https://example.com/mcp"
  }
}
```

## 后端组件

新增目录服务层，职责分开：

- `ExtensionCatalogClient`：读取默认/覆盖 URL，执行 HTTPS 请求，校验 JSON，维护内存与磁盘缓存。
- `ExtensionCatalogValidator`：校验 schema、来源协议、名称、版本和安全字段。
- `ExtensionInstaller`：根据条目类型调用现有 Skill 拉取/校验逻辑，或把 MCP 声明转换为现有 `MCPServerConfig`。
- `ExtensionInstallJournal`：记录安装前配置快照，失败时恢复 Skill 目录、状态文件和 MCP 配置。

建议 API：

```text
GET  /api/extensions/catalog?kind=all&refresh=false
GET  /api/extensions/catalog/{id}
POST /api/extensions/catalog/{id}/install
GET  /api/extensions/catalog/install/{job_id}
POST /api/extensions/catalog/refresh
```

安装接口只接收目录条目 ID 和用户明确确认的请求，不接受前端拼接的任意 command。MCP 最终仍通过现有配置校验和 MCP manager reload 流程接入。

## 安装流程

### Skill

1. 取得目录条目并再次服务端校验。
2. 下载 GitHub/zip/直链来源到临时目录。
3. 使用现有安全解压规则检查路径、符号链接、大小和文件数。
4. 解析 `SKILL.md`，确认工具引用均已注册。
5. 校验 sha256（若目录提供）。
6. 展示详情和权限，等待用户确认。
7. 原子复制到 `data/skills/{name}`。
8. 写入 `skills_state.json`：`enabled=false`、`trusted=false`、`scripts_enabled=false`。
9. 刷新 Skill 注册表，返回安装结果。

### MCP

1. 取得目录条目并校验声明式运行方式。
2. 检查本地运行时是否存在（`uvx`、`npx`、Docker）；缺失时只报告，不自动安装运行时。
3. 显示最终命令/远程 URL、环境变量、网络和写操作权限。
4. 用户确认后生成 `MCPServerConfig`，默认 `enabled=false`。
5. 写入 `data/mcp_servers.json`，调用现有 reload/test 流程。
6. 连接成功后显示工具清单；失败时恢复旧配置。

MCP 包的首次依赖下载由声明的运行时完成，不由 YUMENO 执行任意 pip/npm shell 命令。命令仍必须通过现有 stdio 安全策略。

## 前端设计

扩展页新增“在线目录”标签和“获取扩展”入口，保留现有“技能 / MCP 服务 / 工具目录”视图。

目录视图包含：

- Skill / MCP 分段筛选。
- 搜索、分类、已安装状态和更新时间。
- 卡片显示名称、版本、来源、运行时、权限摘要和依赖缺口。
- 详情抽屉显示完整安装声明。
- “安装”按钮进入确认步骤，不直接执行。
- 下载中、校验中、待确认、安装中、成功、失败和已回滚状态。
- 目录不可达时显示缓存时间和“离线目录”状态。

外部 Skill 安装后必须在技能卡上突出显示“未信任”；MCP 安装后必须突出显示“未启用”，并提供去配置/测试入口。

## 安全与失败处理

- 目录请求仅使用 HTTPS，并限制响应大小和超时时间。
- 目录 JSON 不允许携带可执行脚本或未声明字段影响安装行为。
- Skill 继续使用现有安全 zip 校验和未知 Tool 拒绝策略。
- 外部 Skill 的 scripts 即使存在也保持关闭，除非用户在技能页显式信任并启用。
- MCP 不自动暴露给角色；角色授权仍由现有能力链和 MCP grant 控制。
- 任何安装异常都恢复安装前快照，不删除用户原有扩展。
- 目录条目冲突、版本冲突和已安装状态必须明确显示，不覆盖现有内置 Skill。

## 测试

- 目录 schema、HTTPS、大小、版本和非法字段校验。
- 缓存命中、刷新失败和离线回退。
- Skill 安装成功、未知 Tool、sha256 不匹配、重复安装和回滚。
- MCP 包/远程条目转换、缺少运行时、配置冲突、连接失败回滚。
- API 权限、安装状态轮询和错误响应。
- 前端目录筛选、详情确认、安装状态和未信任/未启用反馈。
- 保留现有 Skill 上传、MCP 手动配置和对话式 `install_skill` 回归测试。

## 完成标准

- 用户不填写命令即可从在线目录安装至少一个 Skill 和一个 MCP 预设。
- 外部 Skill 不会在安装时自动执行或自动启用。
- MCP 安装前能看到最终运行方式、环境变量和权限，安装失败不污染现有配置。
- 目录不可用时已有缓存仍可浏览，安装行为给出明确网络错误。
- 扩展页仍支持本地 zip、MCP JSON 导入和手动配置。
