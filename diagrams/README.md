# YUMENO 架构图

README 只保留三张必要图，分别说明系统边界、Agent 主流程，以及以 RVC 为例的真实文件型任务。其它 Worker 复用相同的委派、资源和任务协议，不再为每个功能重复维护二级跳转图。

## 1. 系统边界

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

## 2. Agent 主流程

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

## 3. RVC 文件型任务示例

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

> RVC 图只用于说明一个具体实现样本：GPT-SoVITS、知识导入、资源检查等能力共享同一套 Core Agent → Supervisor → Worker → Runtime 机制。
