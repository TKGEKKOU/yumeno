# YUMENO Worker 注册表

> 本文档描述当前正在运行的 Worker 注册体系。所有 Worker 名称使用带 `_worker` 后缀的 canonical 命名，旧名称仅作为兼容别名保留。

## 命名规范

### Canonical 名称

所有 Worker 在注册表、manifest、graph 节点和 API 中统一使用以下名称：

```text
knowledge_worker
memory_worker
document_worker
profile_worker
voice_worker
rvc_worker
live2d_worker
config_worker
```

### 兼容别名

以下旧名称在读取旧 checkpoint 或旧客户端请求时自动映射到 canonical 名称：

| 旧名称 | Canonical 名称 |
|---|---|
| `knowledge` | `knowledge_worker` |
| `memory` | `memory_worker` |
| `document` | `document_worker` |
| `profile` | `profile_worker` |
| `voice` | `voice_worker` |
| `voice_clone` | `voice_worker` |
| `live2d` | `live2d_worker` |
| `rvc` | `rvc_worker` |
| `config` | `config_worker` |

别名只存在于读取路径，新图和新合同永远写入 canonical 名称。

### 图节点命名

Graph 节点使用 `worker_node_name()` 从 canonical 名称生成：

```text
knowledge_worker     → knowledge_worker
memory_worker        → memory_worker
finalize_knowledge_worker
finalize_memory_worker
...
```

Supervisor handoff 工具名为 `delegate_to_{canonical_name}`，例如 `delegate_to_knowledge_worker`。

## 单一事实源

Worker 注册表由以下三个模块共同维护，它们构成单一事实源：

| 模块 | 职责 |
|---|---|
| `agents/graph/state.py` | Worker 类型定义 + canonical 名称 + 兼容别名 |
| `agents/registry.py` | ToolSpec 注册 + Worker manifest 生成 |
| `agents/contracts.py` | Worker 合同类型定义 |

`WORKERS` 元组是 Worker 集合的唯一声明点，所有下游（graph build、manifest API、前端 UI）从这里读取。

`ToolSpec` 的 `specialist` 字段决定工具挂到哪个 Worker，`tools_for_specialist()` 按 canonical 名称过滤，强制最小权限。

## Worker Manifest

每个 Worker 的公开能力声明由 `worker_manifests()` 从 ToolSpec 自动计算，避免与实际工具注册表产生第二套漂移的事实源。

Manifest 字段：

- `name`：canonical Worker 名称
- `description`：人类可读描述
- `tools`：该 Worker 拥有的工具列表
- `capabilities`：`builtin/{tool_name}` 格式的能力 ID
- `mutating_operations`：写数据操作列表
- `requires_confirmation`：是否可能触发 HITL 确认
- `read_only`：是否无写操作
- `timeout_seconds` / `retry_policy`：执行边界

API 暴露为 `GET /api/workers/manifests` 和 `GET /api/workers/manifests/{worker}`。

## 全部 Worker 清单

### knowledge_worker

- 描述：在当前角色知识空间中检索、查询结构化数据，并按策略补充公开信息。
- 工具：`search_persona_knowledge`、`web_search`、`list_structured_tables`、`query_structured_data`
- 超时：45s / 重试：2 次
- 特殊：knowledge 不走 `create_agent` LLM 循环，而是 Planner + 确定性 RAG/SQL 子图。

### memory_worker

- 描述：读取、维护当前角色范围内的用户记忆与工作区记忆。
- 工具：`read_persona_memories`、`save_persona_memory`、`update_persona_memory`、`delete_persona_memory`、`read_workspace_memories`、`save_workspace_memory`、`delete_workspace_memory`
- 超时：30s / 重试：1 次

### document_worker

- 描述：管理当前角色的知识文档、上传资料和 URL 导入任务。
- 工具：`list_persona_documents`、`add_persona_knowledge`、`delete_persona_document`、`import_knowledge_from_url`
- 超时：120s / 重试：2 次

### profile_worker

- 描述：读取或修改当前角色的人设档案，并导出会话内容。
- 工具：`rename_persona`、`update_persona_profile`、`export_conversation`
- 超时：30s / 重试：1 次

### voice_worker

- 描述：统一管理音色、TTS、ASR、实时语音、Voice Studio、训练与 GPT-SoVITS。
- 工具：`start_voice_clone_session`、`request_file_upload`、`analyze_voice_material`、`request_training_confirmation`、`start_voice_training`、`check_training_progress`、`bind_trained_voice`、`list_voice_assets`、`get_voice_system_status`、`list_voice_studio_sessions`、`get_voice_studio_session`、`get_voice_training_status`、`get_persona_voice_binding`
- 超时：300s / 重试：1 次

### rvc_worker

- 描述：管理本地 RVC 音色转换资源，并提交和跟踪受管的音频变声任务。
- 工具：`create_rvc_session`、`attach_file_to_rvc_session`、`prepare_rvc_source`、`separate_rvc_vocals`、`get_rvc_session`、`mix_rvc_instrumental`、`register_rvc_result_attachment`、`get_rvc_status`、`list_rvc_models`、`validate_rvc_model`、`convert_audio_with_rvc`、`get_rvc_task_status`、`cancel_rvc_task`
- 超时：1800s / 重试：1 次

### live2d_worker

- 描述：统一管理 Live2D 模型、VTube Studio 连接和本地模型目录。
- 工具：`list_live2d_models`、`get_live2d_vts_config`、`open_live2d_model_directory`
- 超时：45s / 重试：1 次

### config_worker

- 描述：查询、安装、更新、取消和安全清理应用受管资源；不执行具体功能任务。
- 工具：`list_available_configs`、`get_config_detail`、`get_resource_install_status`、`manage_resource_install`、`request_config_change`、`apply_config_change`
- 超时：45s / 重试：1 次

## config_worker 资源管理链路

config_worker 是所有需下载/安装/清理的应用受管资源的唯一管理者。它通过 `app.state` 中的资源管理器实例操作，不接触任意路径。

### 受管资源映射

| resource key | app.state 管理器 | 说明 |
|---|---|---|
| `rvc` | `rvc_resources` | RVC 推理运行时 + Hubert + RMVPE |
| `ffmpeg` | `ffmpeg_resources` | 受管 FFmpeg |
| `asr` | `asr_resources` | ASR 运行环境 + 模型 |
| `embedding` | `embedding_resources` | 本地 Embedding 模型 |
| `reranker` | `reranker_resources` | 本地 Reranker 模型 |
| `gpt_sovits` | `gpt_sovits_install` | GPT-SoVITS 运行环境 |
| `separator` | `separator_resources` | 人声分离模型 |

### 操作合同

`get_resource_install_status(resource)` 返回：
```json
{
  "status": "ok",
  "worker": "config_worker",
  "kind": "resource_setup",
  "resource": "rvc",
  "action": "status",
  "install": { "ready": true, "installed": true, "phase": "idle", ... },
  "capabilities": { "status": true, "install": true, "cancel": true, "clean": true }
}
```

`manage_resource_install(resource, action)` 支持 `install` / `cancel` / `clean` 三种操作：
- `install` → `start_install()` 或 `install()`
- `cancel` → `cancel_install()`
- `clean` → `remove_managed()` / `remove_install()` / `remove()`

安装器合同兼容不同资源管理器：
- 无参数安装器直接调用；
- 需要 URL 的安装器从 `status().download_url` 读取默认地址。

### 安全边界

config_worker 不会操作：
- 用户 `.pth` 音色模型；
- 用户 `.index` 文件；
- 会话附件；
- 历史音频/任务结果；
- 用户知识文档；
- 远程 API Provider；
- 不属于应用受管路径的任意文件。

仅操作 `runtime/`、`data/providers/`、`models/` 中的应用自有目录。

## 特殊 Worker 说明

### knowledge_worker（Planner 子图）

knowledge_worker 不走通用 `create_agent` 路径。它使用：

```text
knowledge_planner → knowledge_retrieve → knowledge_fallback
```

Planner 单次 `bind_tools` 产出 RAG/SQL schema-only tool_call；retrieve 执行确定性管线；fallback 按策略拒绝 / HITL / 联网。它经过自己的 `finalize_knowledge_worker` 节点回 Supervisor。

### rvc_worker（异步样板）

rvc_worker 是文件型 Worker 的样板：

- Agent handoff 后才创建 managed session；
- 通过 `attachment_id` 引用文件，不使用浏览器临时路径；
- 异步 session 状态轮询（normalize → separate → convert）；
- 结构化 resume contract（waiting_input / input_values）；
- 前端通过 workflow metadata 激活工作区，不由关键词猜测。

### config_worker（资源管理层）

config_worker 不执行具体功能任务（如不跑 RVC 转换），只管理资源的生命周期。功能 Worker 需要某个资源就绪时，依赖 config_worker 管理的 `*_resources` 管理器。

## 兼容性保障

1. `canonicalize_worker_name()` 在 `agents.graph.state` 和 `agents.registry` 中双份存在（保持行为一致）；
2. 旧 checkpoint 中的旧名称在读取时自动映射；
3. `AgentResult.model_post_init()` 在 `worker` / `specialist` 字段间双向同步；
4. `PersonaAgentService._PUBLIC_SPECIALIST_BY_WORKER` 映射 Worker → 四值 specialist（conversation / web / memory / management）供 HTTP resume 契约使用；
5. API `POST /api/workers/manifests/config` 返回 `config_worker` manifest，旧客户端不断裂。
