# YUMENO 架构图

这里集中维护与当前代码核对过的 Mermaid 架构图。README 只展示最能说明产品主线的 5 张图；本页补充 RVC 长任务和资源边界等实现细节。

## 阅读口径

- 我们采用 **Supervisor-centric Agent Architecture**：`persona_supervisor` 是唯一面向用户组织最终回复的节点。
- `knowledge_worker` 是 Planner + 确定性检索子图，不是自由的 `create_agent` 工具循环。
- 领域 Worker 不互相调用，也不直接向父图 `END` 输出未经收口的用户答案。
- `config_worker` 负责应用受管资源；业务 Worker 负责使用资源。
- Native Runtime 是进程内生命周期内核；它记录运行状态和事件，但不替代业务 Agent 图，也不是外部调度集群。
- 架构图中的“Milvus”默认指 Milvus Lite；远程 Milvus 是可选部署方式。

## 1. 系统上下文

```mermaid
%% YUMENO 系统上下文：多入口进入同一套角色 Agent 服务
flowchart LR
  U[用户] --> WEB[Web / Desktop]
  QQ[QQ / OneBot] --> API[FastAPI 应用层]
  BILI[B站接入] --> API
  WEB --> API
  API --> SVC[PersonaAgentService]
  SVC --> GRAPH[LangGraph Persona Workflow]
  GRAPH --> DOMAIN[领域 Worker 与工具]
  DOMAIN --> FILES[(文件系统
附件 / 模型 / 结果)]
  DOMAIN --> SQL[(SQLite
控制面与元数据)]
  DOMAIN --> MILVUS[(Milvus Lite
向量数据面)]
  DOMAIN --> EXT[外部服务
LLM / TTS / 搜索 / 接入]
```

多个入口最终进入同一个 FastAPI 和 `PersonaAgentService`，不会为 Web、QQ、B站分别复制一套 Agent 业务逻辑。

## 2. Agent 编排主流程

```mermaid
%% YUMENO Supervisor-centric 父图（与 build_persona_workflow 对齐）
flowchart TD
  START([START]) --> S[persona_supervisor
Core + Supervisor]
  S -->|普通对话 / 已有答案| END([END])
  S -->|需要结构化任务| D[supervisor_dispatch]
  D -->|缺少必要输入| C[supervisor_collect]
  C --> S
  D -->|delegate_to_knowledge_worker| DISPATCH_0[knowledge_worker 子图]
  DISPATCH_0 --> FINALIZE_0[finalize_knowledge_worker]
  FINALIZE_0 --> S
  D -->|delegate_to_memory_worker| DISPATCH_1[memory_worker]
  DISPATCH_1 --> FINALIZE_1[finalize_memory_worker]
  FINALIZE_1 --> S
  D -->|delegate_to_document_worker| DISPATCH_2[document_worker]
  DISPATCH_2 --> FINALIZE_2[finalize_document_worker]
  FINALIZE_2 --> S
  D -->|delegate_to_profile_worker| DISPATCH_3[profile_worker]
  DISPATCH_3 --> FINALIZE_3[finalize_profile_worker]
  FINALIZE_3 --> S
  D -->|delegate_to_voice_worker| DISPATCH_4[voice_worker]
  DISPATCH_4 --> FINALIZE_4[finalize_voice_worker]
  FINALIZE_4 --> S
  D -->|delegate_to_rvc_worker| DISPATCH_5[rvc_worker Worker]
  DISPATCH_5 --> FINALIZE_5[finalize_rvc_worker]
  FINALIZE_5 --> RW[rvc_wait_boundary]
  RW -->|终态结果| S
  RW -.->|等待输入 / 失败结果| END
  D -->|delegate_to_live2d_worker| DISPATCH_6[live2d_worker]
  DISPATCH_6 --> FINALIZE_6[finalize_live2d_worker]
  FINALIZE_6 --> S
  D -->|delegate_to_config_worker| DISPATCH_7[config_worker Worker]
  DISPATCH_7 --> FINALIZE_7[finalize_config_worker]
  FINALIZE_7 --> S
  S -.-> IR[intent_route
兼容性意图线索与安全门禁]
  IR -.-> S
```

工作流的真实入口是 `START → persona_supervisor`。`intent_route` 目前保留为兼容性意图线索和安全门禁，不应被理解为绕过 Supervisor 的独立主路由。

## 3. Worker 注册与最小权限

```mermaid
%% Worker 注册表、manifest 与最小权限工具集合
flowchart LR
  REG[agents/registry.py
canonical names + aliases] --> MAN[Worker manifest]
  MAN --> SPEC[ToolSpec 过滤]
  SPEC --> K[knowledge_worker
最小工具集]
  SPEC --> M[memory_worker
最小工具集]
  SPEC --> D[document_worker
最小工具集]
  SPEC --> V[voice_worker
最小工具集]
  SPEC --> R[rvc_worker
最小工具集]
  SPEC --> C[config_worker
最小工具集]
  SPEC --> O[其它领域 Worker]
  MCP[MCP 服务] -. 外部扩展工具 .-> SCOPE[运行时权限边界]
  K --> SCOPE
  M --> SCOPE
  D --> SCOPE
  V --> SCOPE
  R --> SCOPE
  C --> SCOPE
```

注册表统一维护 canonical name、兼容别名、manifest、执行默认值和工具集合。这样 Worker 可以按领域获得最小权限，而不是共享全部工具。

## 4. Native Runtime 生命周期

```mermaid
%% Native Runtime 是进程内生命周期内核，不是独立分布式调度服务
flowchart TD
  SESSION[Session
会话作用域] --> RUN[AgentRun
持久化运行记录]
  RUN --> JOB[Native Runtime Job
进程内控制句柄]
  JOB --> Q[queued]
  Q --> R[running]
  R --> WAIT[waiting_approval / paused]
  WAIT -->|resume| R
  R --> DONE[completed]
  R --> FAIL[failed]
  R --> CANCEL[cancelled]
  JOB -.事件流 / 进度 / 取消.-> STORE[RunStore]
  STORE --> SQL[(SQLite
运行摘要与事件)]
```

Session 表示会话作用域，`AgentRun` 是可持久化的运行记录，Native Runtime Job 是进程内控制句柄。确认、补充输入、取消和恢复都通过运行合同和事件反馈给前端。

## 5. knowledge_worker 子图

```mermaid
%% knowledge_worker 是 Planner + 确定性检索子图
flowchart TD
  START([子图 START]) --> P[knowledge_planner
选择 RAG / SQL / 回退]
  P --> R[knowledge_retrieve
作用域检索管线]
  R --> F[knowledge_fallback
证据不足时策略处理]
  F --> END([子图 END])
  R --> VEC[(Milvus Lite
Dense / Sparse 向量)]
  R --> SQL[(SQLite
元数据与查询记录)]
  F -.-> WEB[联网搜索 / HITL / 拒答]
  END --> FINAL[finalize_knowledge_worker]
  FINAL --> SUP[persona_supervisor]
```

文档导入由 `document_worker` 负责，检索和回答证据处理由 `knowledge_worker` 负责；两者通过知识空间、文档和来源引用关联，不把所有知识逻辑塞进一个 Worker。

## 6. RVC 文件型长任务

```mermaid
%% RVC 文件型长任务：引用 ID 在各阶段传递，不暴露本地路径
flowchart LR
  MSG[对话请求] --> SUP[persona_supervisor]
  SUP --> W[rvc_worker]
  ATT[attachment_id] --> PRE[音频标准化 / 视频音轨提取]
  W --> PRE
  PRE --> SEP[人声与伴奏分离]
  SEP --> APPROVE{用户确认音轨}
  APPROVE -->|resume| MODEL[选择模型 / Index / 参数]
  MODEL --> TASK[创建 conversion task]
  TASK --> EVENT[任务事件与进度]
  EVENT --> RESULT[成功：结果引用
失败/取消：真实状态]
  RESULT --> SUP
  CFG[config_worker] -.安装并检查 Separator.-> SEP
```

RVC 是 YUMENO 文件型任务和恢复边界的验证场景。各阶段传递 `attachment_id`、session、task 和 result reference，不向前端暴露或依赖浏览器临时路径。

## 7. 受管资源边界

```mermaid
%% config_worker 的资源边界
flowchart TD
  C[config_worker] --> MANAGED[应用受管资源]
  MANAGED --> ENV[RVC / GPT-SoVITS / ASR / FFmpeg]
  MANAGED --> MODELS[Separator / Embedding / Reranker]
  C --> ACTION[检查 / 下载 / 停止 / 卸载]
  ACTION --> ROOT[受管目录边界]
  C -.不可管理 / 不得误删.-> USER[用户模型
.pth / .index]
  C -.-> ATT[会话附件 / 历史音频]
  C -.-> DOC[用户知识文档 / 历史任务结果]
```

我们只允许 `config_worker` 操作应用受管目录。用户音色模型、附件、知识文档、历史结果和非受管路径不进入资源卸载逻辑。

## 代码对应关系

| 图 | 主要代码 |
| --- | --- |
| Agent 编排 | `agents/graph/build.py`、`agents/graph/supervisor.py` |
| Worker 注册 | `agents/registry.py`、`agents/graph/state.py` |
| Runtime | `agents/runtime/native.py`、`agents/runtime/runner.py`、`agents/runtime/models.py` |
| RAG | `agents/graph/knowledge.py`、`rag/`、`ingestion/` |
| RVC | `agents/tools/rvc.py`、`voice/`、相关 API 路由 |
| 资源管理 | `agents/tools/config.py`、`app/routers/providers.py`、`app/routers/resources.py` |

修改这些代码的拓扑或状态合同时，应同步更新对应 `.mmd` 文件和架构图测试。
