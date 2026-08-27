# YUMENO 项目 - 简历技术亮点总结

## 🎯 项目定位
**面向企业级应用的多智能体 RAG 对话系统**

- 不是教程级玩具项目，而是生产级工程化实践
- 强调架构设计、安全性、可扩展性、可观测性
- 适合面试企业级 Agent 系统、LLM 应用开发岗位

---

## 📌 核心技术栈（简历上写的）

**后端**：Python, FastAPI, LangChain, LangGraph  
**向量数据库**：Milvus (RAG 知识检索)  
**关系数据库**：SQLite (会话状态、用户记忆)  
**前端**：Vue.js, WebSocket (实时流式响应)  
**AI 服务**：OpenAI / DeepSeek / 智谱 GLM (多提供商支持)

---

## 🏗️ 多智能体架构（重点）

### 架构设计亮点

#### 1. LangGraph Supervisor + Worker 模式
`
1 个 Supervisor (主调度器)
  ↓ Command.PARENT handoff
6 个 Worker (专职执行器)
  - knowledge: 知识检索 + 联网搜索 (5 tools)
  - memory: persona/workspace 记忆管理 (7 tools)
  - document: 文档上传和管理 (3 tools)
  - profile: 人设配置和导出 (3 tools)
  - voice_clone: 语音克隆全流程 (7 tools)
  - config: 系统配置修改 (4 tools)
`

**设计原则**：
- ✅ **单一职责**：每个 Worker 只负责一个业务领域
- ✅ **最小权限**：Worker 只能访问其专属的工具集
- ✅ **高内聚低耦合**：Worker 间通过 Supervisor 协调，不直接通信
- ✅ **工具均衡分配**：3-7 tools/worker，避免过轻或过重

**面试话术**：
> "我设计了一个基于 LangGraph 的多智能体系统，采用 Supervisor + 6 Worker 架构。Supervisor 负责意图理解和任务分派（LLM 做策略决策），Worker 负责具体执行（确定性代码执行）。通过 Command.PARENT 机制实现子图间通信，并使用 MemorySaver checkpointer 持久化会话状态，支持多轮对话和中断恢复。"

#### 2. 权限隔离和安全机制

**工具级权限验证**：
`python
@require_worker(["memory"])
def save_persona_memory(content: str, runtime: ToolRuntime):
    # 只有 memory_worker 可以调用
    # 防止其他 Worker 越权访问
`

**HITL（Human-in-the-Loop）审批**：
- 14/29 工具需要人工审批（48%）
- 两阶段提交：request_XXX → 用户确认 → apply_XXX
- 覆盖：记忆写入、文档管理、配置修改、语音训练

**多层安全机制**：
1. 输入验证：文件路径、SQL 查询、内容长度
2. 速率限制：防止 API 滥用（如 10 次/分钟）
3. 审计日志：所有工具调用可追溯
4. 跨 persona 隔离：防止数据泄露

**面试话术**：
> "安全性方面，我实现了工具级权限验证，通过装饰器模式二次验证调用者身份，防止 Worker 越权。对于敏感操作（记忆写入、配置修改等），采用 HITL 审批流程，用户需要明确确认后才执行。同时集成了输入验证、速率限制、审计日志等多层防护。"

#### 3. 可扩展性设计

**动态 Worker 注册**：
`python
# 运行时添加新 Worker，无需修改核心代码
register_worker(WorkerSpec(
    name="email",
    tools=["send_email", "read_inbox"],
    prompt_template="Handle email operations.",
    description="Delegate email tasks."
))
`

**MCP 协议集成**：
- 支持 GitHub、Slack、Jira 等 SaaS 工具
- 自定义企业工具
- 第三方 API 封装

**技能系统**：
- 用户可安装自定义技能
- 运行时动态加载
- 类似 VS Code 插件机制

**面试话术**：
> "可扩展性方面，我设计了动态 Worker 注册机制，支持运行时添加/移除 Worker，无需修改核心代码。同时集成了 MCP 协议和技能系统，可以动态加载外部工具和自定义能力，实现了插件化架构。"

#### 4. 监控和可观测性

**分布式追踪**：
- 记录完整的 Worker 调用链
- 每个工具的执行时长
- 请求级别的端到端追踪

**Metrics 收集**：
`python
{
  "total_calls": 1234,
  "success_rate": "98.5%",
  "avg_duration_ms": "345.67",
  "top_errors": {...}
}
`

**健康检查**：
- 成功率监控（< 50% 告警）
- 响应时间监控（> 30s 告警）
- 依赖服务状态检查

**面试话术**：
> "可观测性方面，我实现了分布式追踪系统，记录完整的 Worker 调用链和工具执行时长。设计了 Metrics 收集器，自动统计调用次数、成功率、响应时间等关键指标。提供健康检查接口，实时监控 Worker 状态和依赖服务可用性。"

---

## 🔍 RAG 架构（次重点）

### 技术方案

**向量数据库**：Milvus  
**Embedding 模型**：支持多提供商（OpenAI、DashScope、Ollama 等）  
**重排序**：可选 Reranker（Jina AI、Cohere、百炼等）

### 检索流程

`
用户查询
  ↓
1. Embedding 生成
  ↓
2. Milvus 向量检索 (Top-K)
  ↓
3. 可选重排序 (Reranker)
  ↓
4. 质量门禁
   - 相似度阈值过滤
   - 上下文窗口限制
  ↓
5. 上下文注入 + LLM 生成
  ↓
6. 返回答案 + 引用来源
`

### 质量控制

**证据合同**：
`json
{
  "status": "accepted",
  "answer": "...",
  "evidence": [...],
  "citations": [...],
  "uncertainties": [],
  "confidence": 0.95
}
`

**不确定性处理**：
- 低置信度 → 告知用户"信息不足"
- 冲突证据 → 列出矛盾点
- 无相关文档 → 明确拒绝回答

**面试话术**：
> "RAG 方面，我使用 Milvus 作为向量数据库，支持多种 Embedding 和 Reranker 提供商。设计了质量门禁机制，包括相似度阈值过滤和上下文窗口限制。knowledge_worker 返回结构化的证据合同，包含答案、引用来源、不确定性说明和置信度，确保回答的可追溯性。"

---

## 🛠️ 技能和工具系统（加分项）

### MCP（Model Context Protocol）

**支持的 MCP 服务**：
- 文件系统操作
- 数据库查询
- HTTP 请求
- 自定义企业工具

**动态加载**：
`python
# 运行时连接 MCP 服务器
connect_mcp_server("github", config)
# 自动注册工具到 Worker
`

### 技能系统

**技能定义**：
`markdown
# SKILL.md
## 技能名称
xxx

## 触发条件
当用户提到"XX"时

## 执行步骤
1. 调用工具 A
2. 解析结果
3. 调用工具 B
`

**运行时加载**：
- 用户安装技能
- Supervisor 检测到匹配条件
- 动态加载并执行

**面试话术**：
> "我集成了 MCP 协议，支持动态连接外部服务（如 GitHub、Slack）。同时实现了技能系统，用户可以安装自定义技能，类似 VS Code 插件。Supervisor 会检测用户意图，动态加载匹配的技能并执行。"

---

## 💡 工程化实践（软实力）

### 代码质量

1. **类型系统**：TypedDict, Literal, dataclass
2. **设计模式**：策略、责任链、注册表、装饰器
3. **原则**：DRY, KISS, SOLID
4. **可测试性**：每个 Worker 可独立测试

### 文档

1. **架构设计文档**：ARCHITECTURE_DESIGN.md (3000+ 行)
2. **API 文档**：FastAPI 自动生成
3. **开发指南**：如何添加 Worker、如何保护工具

### Git 实践

- 原子化提交
- 清晰的 commit message
- 分支管理（如果有）

---

## 🎤 面试准备

### 高频问题及回答

#### Q1: 为什么选择 Supervisor + Worker 而不是其他架构？

**回答**：
> "我对比了几种多智能体架构：
> 1. **全连接网络**：每个 Agent 都能调用其他 Agent，灵活但容易失控
> 2. **层级树**：多层嵌套，调试困难
> 3. **Supervisor + Worker**：集中式调度，清晰的控制流
> 
> 我选择 Supervisor + Worker 是因为它平衡了灵活性和可控性。Supervisor 负责策略决策（这是 LLM 擅长的），Worker 负责确定性执行（这是代码擅长的）。同时避免了 Agent 间的无序通信，所有协调都通过 Supervisor，便于追踪和调试。"

#### Q2: 如何防止 LLM 幻觉导致的误操作？

**回答**：
> "我采用了三层防护：
> 1. **LLM 只做决策**：具体执行交给确定性代码，LLM 不直接操作数据
> 2. **HITL 审批**：敏感操作（记忆写入、配置修改）需要用户明确确认
> 3. **工具权限隔离**：即使 LLM 被欺骗调用错误的工具，Worker 权限验证会拦截
> 
> 例如，用户说'删除所有记忆'，LLM 会调用 delete_persona_memory，但 memory_worker 会先返回预览，等用户确认后才真正删除。"

#### Q3: 如何处理 Worker 调用失败？

**回答**：
> "我设计了多层容错机制：
> 1. **失败返回 Supervisor**：Worker 执行失败后，会将错误信息封装返回 Supervisor
> 2. **Supervisor 重试或降级**：Supervisor 可以选择重试、调用备用 Worker、或直接告知用户
> 3. **审计日志**：所有失败都会记录，便于事后分析
> 4. **健康检查**：监控系统会检测到成功率下降，触发告警
> 
> 例如，如果 web_search 失败（API 超时），knowledge_worker 会告诉 Supervisor，Supervisor 可以选择只用本地知识库回答，或明确告诉用户'联网搜索暂时不可用'。"

#### Q4: 如何添加一个新的 Worker？

**回答**：
> "非常简单，因为我设计了动态注册机制：
> 
> 1. **定义工具**：
>    `python
>    @tool
>    def send_email(to: str, subject: str, body: str):
>        ...
>    `
> 
> 2. **注册到工具注册表**：
>    `python
>    register_tool_specs([
>        ToolSpec("send_email", "email", send_email, requires_confirmation=True)
>    ])
>    `
> 
> 3. **创建 Worker 规格**：
>    `python
>    email_worker = WorkerSpec(
>        name="email",
>        tools=["send_email", "read_inbox"],
>        prompt_template="Handle email operations.",
>        description="Delegate email tasks."
>    )
>    `
> 
> 4. **注册 Worker**：
>    `python
>    register_worker(email_worker)
>    `
> 
> 5. **重建图**：下次构建 workflow 时自动包含新 Worker
> 
> 整个过程不需要修改核心代码，符合开闭原则。"

#### Q5: 如何保证系统性能？

**回答**：
> "性能优化我从几个方面入手：
> 
> 1. **减少不必要的 Worker 调用**：
>    - 简单对话直接由 Supervisor 回答，不 handoff
>    - 合并 web 到 knowledge，避免两次 handoff
> 
> 2. **缓存机制**：
>    - RAG 检索结果缓存
>    - Embedding 缓存
>    - 配置缓存
> 
> 3. **速率限制**：
>    - 防止滥用，保护后端服务
>    - 例如语音训练限制 3 次/天
> 
> 4. **监控和优化**：
>    - 收集每个 Worker 的响应时间
>    - 识别瓶颈并优化
>    - 例如发现某个工具平均耗时 10s，就优化它
> 
> 5. **流式响应**：
>    - WebSocket + SSE 实时推送
>    - 用户不用等到所有处理完成才看到结果"

#### Q6: 这个项目和 AstrBot 有什么区别？

**回答**：
> "AstrBot 是一个成熟的开源项目，我从中学到了很多。但我的项目有几个不同的设计重点：
> 
> 1. **架构层面**：
>    - AstrBot 是传统的插件系统，我用的是 LangGraph 多智能体
>    - 我强调 LLM 做决策、代码做执行的分离
> 
> 2. **安全性**：
>    - 我实现了工具级权限验证和 HITL 审批
>    - 更适合企业级应用场景
> 
> 3. **可扩展性**：
>    - 我的动态 Worker 注册机制支持运行时热加载
>    - MCP 协议集成更标准化
> 
> 4. **可观测性**：
>    - 我有完整的分布式追踪和监控系统
>    - 便于生产环境排查问题
> 
> AstrBot 更适合快速搭建 QQ 机器人，我的项目更适合作为企业级 Agent 系统的基础框架。"

---

## 📊 项目数据（量化成果）

- **代码规模**：约 5000+ 行 Python
- **Worker 数量**：6 个
- **工具数量**：29 个
- **HITL 覆盖**：14/29 (48%)
- **架构文档**：3000+ 行
- **测试覆盖**：关键路径有测试
- **响应时间**：P99 < 3s（简单查询）
- **并发支持**：WebSocket 多连接

---

## 🎯 简历上怎么写

### 项目标题
**YUMENO - 企业级多智能体 RAG 对话系统**

### 技术栈
Python, FastAPI, LangChain, LangGraph, Milvus, SQLite, Vue.js, WebSocket

### 项目描述（2-3 行）
基于 LangGraph 设计的生产级多智能体系统，采用 Supervisor + 6 Worker 架构，实现知识检索、记忆管理、语音克隆等功能。强调安全性（工具权限隔离 + HITL 审批）、可扩展性（动态 Worker 注册 + MCP 集成）和可观测性（分布式追踪 + 健康检查）。

### 技术亮点（3-5 条）
1. **多智能体架构**：基于 LangGraph 设计 1 Supervisor + 6 Worker 分工协作系统，通过 Command.PARENT 机制实现子图通信，使用 MemorySaver 持久化会话状态；LLM 只做策略决策，工具执行交给确定性代码

2. **安全机制**：实现工具级权限验证（装饰器模式），29 个工具按最小权限原则分配到 6 个 Worker；14 个敏感操作采用 HITL 二次审批流程；集成输入验证、速率限制、审计日志等多层防护

3. **可扩展性**：设计动态 Worker 注册机制，支持运行时添加/移除 Worker；集成 MCP 协议和技能系统，可动态加载外部工具和自定义能力

4. **RAG 优化**：基于 Milvus 向量数据库实现多提供商 Embedding 和 Reranker；设计质量门禁机制（相似度过滤 + 上下文限制）；knowledge_worker 返回结构化证据合同，包含引用、不确定性和置信度

5. **可观测性**：实现分布式追踪系统记录完整调用链；设计 Metrics 收集器统计调用次数、成功率、响应时间；提供健康检查接口监控 Worker 状态

### 项目成果（1-2 条）
- 架构设计获得导师/同学认可，代码质量达到生产级标准
- 完整的架构设计文档（3000+ 行），便于团队协作和知识传承

---

## 🔗 相关资源

- **架构设计文档**：ARCHITECTURE_DESIGN.md
- **代码仓库**：（你的 GitHub 链接）
- **核心文件**：
  - gents/workflow.py - LangGraph 主图
  - gents/security.py - 安全模块
  - gents/worker_registry.py - 动态注册
  - gents/monitoring.py - 监控模块

---

**最后更新**: 2026-08-28  
**用途**: 求职面试准备
