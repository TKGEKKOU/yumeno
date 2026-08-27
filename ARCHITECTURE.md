# YUMENO Multi-Agent 架构文档

## 🏗️ 整体架构

基于 **LangGraph** 构建的 **Supervisor + 7 Worker** 多智能体协作系统。

### 核心设计原则

1. **LLM 只做策略决策**：模型负责意图理解和任务分派，不执行具体操作
2. **确定性代码执行**：所有工具调用由 Python 代码实现，保证可预测性
3. **最小权限原则**：每个 Worker 只能访问其职责范围内的工具
4. **HITL（Human-in-the-Loop）**：敏感操作需人工审批才能执行
5. **会话状态持久化**：使用 LangGraph checkpointer 保存对话历史和上下文

---

## 📊 Agent 层级结构

\\\
用户请求
   ↓
┌─────────────────────────────────────┐
│   persona_supervisor (主调度器)     │  ← LLM 分析意图，决策转发
│   - 分析用户意图                     │
│   - 选择合适的 Worker               │
│   - 不直接执行任何操作               │
└─────────────────────────────────────┘
   ↓ delegate_to_X (handoff 工具)
   ├─→ knowledge_worker    → finalize → supervisor
   ├─→ web_worker          → finalize → supervisor
   ├─→ memory_worker       → finalize → supervisor
   ├─→ management_worker   → finalize → supervisor
   ├─→ conversation_worker → finalize → supervisor
   ├─→ voice_clone_worker  → finalize → supervisor
   └─→ config_worker       → finalize → supervisor
   ↓
最终响应（由 supervisor 整合）
\\\

---

## 🔧 Worker 职责与工具分配

| Worker | 职责 | 工具列表 | 需审批 |
|--------|------|---------|--------|
| **knowledge** | 知识库检索、结构化数据查询 | search_persona_knowledge<br>list_structured_tables<br>query_structured_data | ❌ |
| **web** | 联网搜索公开信息 | web_search | ❌ |
| **memory** | 用户记忆读写 | read_persona_memories<br>save_persona_memory<br>update_persona_memory<br>delete_persona_memory<br>read_workspace_memories<br>save_workspace_memory<br>delete_workspace_memory | ✅ (写操作) |
| **management** | 文档/人设管理 | list_persona_documents<br>add_persona_knowledge<br>rename_persona<br>update_persona_profile<br>delete_persona_document<br>import_knowledge_from_url<br>export_conversation | ✅ (所有) |
| **conversation** | 通用对话处理 | 无工具（纯 LLM 对话） | ❌ |
| **voice_clone** | 语音克隆全流程 | start_voice_clone_session<br>request_file_upload<br>analyze_voice_material<br>request_training_confirmation<br>start_voice_training<br>check_training_progress<br>bind_trained_voice | ✅ (训练/绑定) |
| **config** | 配置修改 | list_available_configs<br>get_config_detail<br>request_config_change<br>apply_config_change | ✅ (所有) |

---

## 🔐 权限控制机制

### 1. 工具级权限隔离
- 每个 Worker 通过 \	ools_for_specialist()\ 获取专属工具集
- 代码层面强制：Worker A 无法调用 Worker B 的工具
- 实现位置：\gents/registry.py:181\

### 2. HITL 审批流程
敏感操作必须经过用户确认：
- **标记**：\ToolSpec(..., requires_confirmation=True)\
- **流程**：
  1. Worker 调用 \equest_XXX_confirmation\ 返回预览
  2. 前端展示操作细节，等待用户确认
  3. 用户批准后，Worker 调用 \pply_XXX\ 执行
  4. 拒绝时直接中止，不执行任何变更

### 3. 状态持久化
- **技术**：LangGraph MemorySaver checkpointer
- **范围**：
  - 对话历史（messages）
  - Worker 调用次数（handoff_count）
  - 已加载技能（loaded_skills）
  - 当前活跃 Worker（active_worker）
- **好处**：
  - 跨轮次保持上下文
  - 支持多轮审批流程
  - 可恢复中断的任务

---

## 🎯 LLM 职责边界

### Supervisor LLM 做什么
✅ 理解用户意图（问知识？搜新闻？改配置？）
✅ 决定调用哪个 Worker（\delegate_to_knowledge\）
✅ 整合 Worker 返回结果，生成最终回复

### Supervisor LLM 不做什么
❌ 不执行具体工具（如查询数据库、调 API）
❌ 不直接修改系统状态
❌ 不绕过 Worker 权限限制

### Worker LLM 做什么
✅ 理解 Supervisor 的委派请求
✅ 选择合适的工具调用序列
✅ 总结工具结果返回 Supervisor

### Worker LLM 不做什么
❌ 不能访问其他 Worker 的工具
❌ 不能跳过审批流程直接执行敏感操作
❌ 不能伪造工具返回结果

---

## 🔄 典型工作流示例

### 场景 1：知识检索（无需审批）
\\\
用户："我的文档里提到过什么关键指标？"
  ↓
Supervisor 分析意图 → 调用 delegate_to_knowledge
  ↓
knowledge_worker 执行 search_persona_knowledge(query="关键指标")
  ↓
finalize_knowledge → 返回 JSON 结果给 Supervisor
  ↓
Supervisor 生成自然语言回复："您的文档提到了以下 3 个关键指标..."
\\\

### 场景 2：配置修改（需审批）
\\\
用户："把 LLM 换成 GPT-4"
  ↓
Supervisor 分析意图 → 调用 delegate_to_config
  ↓
config_worker 调用 request_config_change(key="llm.model", value="gpt-4")
  ↓
返回预览：{current: "glm-4", proposed: "gpt-4", impact: "可能影响响应质量"}
  ↓
前端显示确认弹窗 → 用户点击"确认"
  ↓
config_worker 调用 apply_config_change() → 写入配置文件
  ↓
Supervisor："已将 LLM 模型切换为 GPT-4"
\\\

### 场景 3：多轮协作
\\\
用户："搜索最新的 AI 新闻并保存到记忆"
  ↓
Supervisor → delegate_to_web
  ↓
web_worker 调用 web_search() → 返回新闻摘要
  ↓
Supervisor 收到结果 → delegate_to_memory
  ↓
memory_worker 调用 save_workspace_memory() → 请求审批
  ↓
用户确认 → 写入数据库
  ↓
Supervisor："已保存 3 条 AI 新闻到您的记忆库"
\\\

---

## 📈 简历亮点总结

### 技术深度
1. **LangGraph 状态管理**：MessagesState + 自定义 PersonaWorkflowState
2. **子图嵌套**：knowledge_worker 内部有独立的 RAG 子图
3. **Command.PARENT 机制**：Worker 通过 Command 返回控制权给 Supervisor

### 工程化
1. **工具注册表**：单一事实来源（\gents/registry.py\）
2. **中间件系统**：动态 prompt、技能加载、权限检查
3. **类型安全**：TypedDict、Literal 类型约束

### 安全性
1. **最小权限**：Worker 工具集代码强制隔离
2. **审批流程**：敏感操作二次确认
3. **审计日志**：所有工具调用可追溯

### 可扩展性
1. **MCP 工具**：运行时动态注册外部工具
2. **技能系统**：用户可安装自定义技能
3. **提供商配置**：支持多种 LLM/TTS/ASR 后端

---

## 📁 核心代码位置

- **架构定义**：\gents/workflow.py\ (1045 行)
- **工具注册**：\gents/registry.py\ (93 行)
- **工具实现**：\gents/tools/\ 目录
- **状态持久化**：\gents/checkpoint.py\
- **前端交互**：\pp/routers/agents.py\

---

生成时间：2026-08-28 00:24:07
