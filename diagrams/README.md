# YUMENO 架构图

全部用 Markdown mermaid 画，可直接在 GitHub / 编辑器预览。不要再导出 PNG。

口径：

- 这是 **hybrid Supervisor-centric**：1 个对外 Supervisor + 1 个 knowledge 子图 + 7 个领域 Worker。
- knowledge **是** LangGraph 子图，**不是** `create_agent` 工具循环。
- Worker 不直达父图 END，也不互相调用。
- 父图拓扑见 `agents.graph.diagram.parent_graph_mermaid()`；LangGraph 原生父图导出缺 handoff 边。

## 系统上下文

```mermaid
%% YUMENO 系统上下文：接入层如何进入 Agent 图与存储
flowchart LR
  Web[Web 前端] --> API[FastAPI]
  QQ[QQ / OneBot] --> API
  Bili[B站] --> API
  API --> Svc[PersonaAgentService]
  Svc --> Graph[LangGraph 父图]
  Graph --> RAG[RAG / SQL]
  Graph --> DB[(SQLite 检查点与记忆)]
  RAG --> Vec[(Milvus)]
  Svc --> HITL[HITL 确认]
  Graph --> Voice[TTS / Live2D]
```

## 完整 Multi-Agent 父图

```mermaid
%% YUMENO 完整 Multi-Agent 父图
%% 强意图由 intent_route 直达 Worker；其余交给 Supervisor
flowchart TD
  START([START]) --> R[intent_route]
  R -->|模糊 / knowledge / web| S[persona_supervisor]
  S -->|直接回答| END([父图 END])
  S -->|需要执行| D[supervisor_dispatch]
  D -->|收集必要输入| C[supervisor_collect]
  C --> S
  R -->|强意图| S
  D -->|delegate_to_knowledge_worker| K[knowledge_worker 子图]
  D -->|delegate_to_memory_worker| M[memory_worker]
  D -->|delegate_to_document_worker| D[document_worker]
  D -->|delegate_to_profile_worker| P[profile_worker]
  D -->|delegate_to_voice_worker| V[voice_worker]
  D -->|delegate_to_rvc_worker| RV[rvc_worker Worker]
  D -->|delegate_to_live2d_worker| L[live2d_worker]
  D -->|delegate_to_config_worker| C[config_worker Worker]
  K --> FK[finalize_knowledge_worker]
  M --> FM[finalize_memory_worker]
  D --> FD[finalize_document_worker]
  P --> FP[finalize_profile_worker]
  V --> FV[finalize_voice_worker]
  RV --> FRV[finalize_rvc_worker]
  L --> FL[finalize_live2d_worker]
  C --> FC[finalize_config_worker]
  FK --> S
  FM --> S
  FD --> S
  FP --> S
  FV --> S
  FRV --> S
  FL --> S
  FC --> S
  FRV --> RW[rvc_wait_boundary]
  RW --> S
```

## knowledge 子图

```mermaid

%% knowledge：Planner + 确定性执行，不是 create_agent 工具循环
flowchart TD
  START([子图 START]) --> P[planner 选择 RAG 或 SQL]
  P --> R[retrieve 执行管线]
  R --> F[fallback 不足才升级]
  F --> SE([子图 END])
  SE --> FK[finalize_knowledge]
  FK --> S[persona_supervisor]
  R -.-> RAG[RAG / 只读 SQL]
  F -.-> WEB[拒绝 / HITL / web]
```

## 意图与权限

```mermaid
%% 意图是分层信号 + 硬门禁，不是单一路由器
flowchart TD
  Q[用户问题] --> Cap{"能力自检?"}
  Cap -->|是| List[直接返回能力清单]
  Cap -->|否| Funnel[确定性漏斗]
  Funnel --> Inherit[省略句继承]
  Inherit --> Dec[intent_decision]
  Dec --> Hint[Supervisor prompt 顾问]
  Dec --> Gate[web_authorized 硬门禁]
  Hint --> Del[delegate_to 选择 Worker]
  Gate --> Mid[registry + capability]
  Mid --> Act[拒绝 / HITL / 执行]
```

## 分层记忆与 HITL

```mermaid
%% 分层记忆 + HITL 绑定 checkpoint
flowchart LR
  subgraph Mem[分层记忆]
    CK[checkpoint 工作记忆]
    SUM[对话摘要]
    PM[角色 / 工作区记忆]
    KS[知识空间 RAG/SQL]
  end
  S[Supervisor / Worker] --> CK
  CK --> S
  SUM --> S
  PM --> MW[memory Worker]
  KS --> KW[knowledge 子图]
  Write[写操作 / 联网确认] --> INT[interrupt]
  INT --> User[用户确认]
  User -->|resume| CK
```

## 宏观到微观同构

```mermaid
%% 宏观父图与微观 knowledge 子图遵守同一套分层
flowchart TB
  subgraph Macro[宏观 父图]
    S[Supervisor 选择]
    W[Worker 执行]
    F[finalize 校验]
    A[Supervisor 表达]
  end
  subgraph Micro[微观 knowledge]
    P[planner 选择]
    R[retrieve 执行]
    FB[fallback / HITL]
    FK[finalize 校验]
  end
  S -.-> P
  W -.-> R
  F -.-> FK
  A -.-> OUT[只对外说话]
```

## RAG 检索管线

```mermaid
%% knowledge_retrieve 内部的 RAG 管线，不是完整 Multi-Agent 图
flowchart LR
    Q[用户问题] --> S[Supervisor / 角色作用域]
    S --> R[意图路由]
    R -->|闲聊/能力| A[直接回答]
    R -->|知识问题| H[SQLite checkpoint\n不跨角色]
    H --> D[Dense Embedding + BM25]
    D --> F[RRF 融合召回]
    F --> U[内容去重\n精确 + 近似]
    U --> K[候选 K]
    K --> X[Qwen3-Reranker-0.6B\n常驻预热]
    X -->|最高分 < 0.1| N[快速拒答\n资料不足]
    X -->|保留相关候选| T[Token Budget\n主片段 + 邻居片段]
    T --> G[生成回答]
    G --> C[质量门]
    C -->|通过| Z[最终答案]
    C -->|失败且未超限| P[有界修正]
    P --> G
    C -->|超限| N
    N --> Z
    D -.向量存储.- M[(Milvus)]
    H -.会话状态.- L[(SQLite)]
    G -.custom stage.- UI[前端过程气泡]
```
