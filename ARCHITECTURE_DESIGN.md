# YUMENO LangGraph 多 Agent 架构设计文档

## 📋 目录
1. [架构概览](#架构概览)
2. [设计原则](#设计原则)
3. [Worker 设计](#worker-设计)
4. [安全机制](#安全机制)
5. [可扩展性](#可扩展性)
6. [监控与可观测性](#监控与可观测性)
7. [最佳实践](#最佳实践)
8. [简历亮点](#简历亮点)

---

## 架构概览

### 整体架构图

\\\
用户请求
   ↓
┌─────────────────────────────────────────┐
│       persona_supervisor                 │  ← 1个主调度器
│       (LangGraph Agent)                  │
│                                          │
│  职责:                                    │
│  • 意图理解 (LLM)                         │
│  • Worker 选择 (策略决策)                 │
│  • 结果整合 (生成最终答案)                 │
│                                          │
│  工具:                                    │
│  • delegate_to_knowledge                 │
│  • delegate_to_memory                    │
│  • delegate_to_document                  │
│  • delegate_to_profile                   │
│  • delegate_to_voice_clone               │
│  • delegate_to_config                    │
│  • load_skill / install_skill            │
│  • MCP 服务管理                           │
└─────────────────────────────────────────┘
        ↓ (Command.PARENT handoff)
   ┌────────────────────────────────┐
   │    6 个专职 Worker (并行)       │
   └────────────────────────────────┘
        ↓
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ knowledge    │  │   memory     │  │  document    │
│ (5 tools)    │  │  (7 tools)   │  │  (3 tools)   │
│              │  │              │  │              │
│ • 知识检索    │  │ • 读写记忆    │  │ • 文档管理   │
│ • 联网搜索    │  │ • persona记忆 │  │ • 上传文件   │
│ • 导入知识    │  │ • workspace  │  │ • 删除文档   │
│ • 结构化查询  │  │   记忆       │  │              │
└──────────────┘  └──────────────┘  └──────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   profile    │  │ voice_clone  │  │   config     │
│  (3 tools)   │  │  (7 tools)   │  │  (4 tools)   │
│              │  │              │  │              │
│ • 人设管理    │  │ • 语音克隆    │  │ • 配置管理   │
│ • 改名       │  │ • 材质分析    │  │ • 读写配置   │
│ • 导出对话    │  │ • 训练协调    │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
        ↓ (finalize)
┌─────────────────────────────────────────┐
│          结果封装与回传                   │
│  • knowledge: JSON 合同(证据+不确定性)    │
│  • 其他: 文本摘要                         │
└─────────────────────────────────────────┘
        ↓
    Supervisor 生成最终答案

会话状态持久化 (LangGraph MemorySaver)
  • messages (对话历史)
  • handoff_count (防止无限循环)
  • loaded_skills (已加载技能)
  • active_worker (当前活跃 Worker)
\\\

### 关键数据流

#### 场景 1: 知识检索
\\\
用户: "我的文档里提到了什么关键指标？"
  ↓
Supervisor 分析意图: 需要检索知识库
  ↓
调用 delegate_to_knowledge(request="检索关键指标")
  ↓
Command.PARENT → knowledge_worker
  ↓
knowledge_worker 调用 search_persona_knowledge(query="关键指标")
  ↓
RAG 子图执行: 检索 → 重排 → 质量门禁 → 生成答案
  ↓
finalize_knowledge: 封装 JSON 合同
  {
    "status": "accepted",
    "answer": "...",
    "evidence": [...],
    "citations": [...],
    "uncertainties": [],
    "confidence": 0.95
  }
  ↓
Supervisor 收到结果 → 生成自然语言回复
  ↓
用户: "您的文档提到了以下 3 个关键指标..."
\\\

#### 场景 2: 配置修改 (HITL)
\\\
用户: "把 LLM 换成 GPT-4"
  ↓
Supervisor → delegate_to_config
  ↓
config_worker 调用 request_config_change(key="llm.model", value="gpt-4")
  ↓
返回预览:
  {
    "current": "glm-4",
    "proposed": "gpt-4",
    "impact": "可能影响响应质量和成本"
  }
  ↓
前端显示确认弹窗 → 用户点击"确认"
  ↓
config_worker 调用 apply_config_change() → 写入配置
  ↓
Supervisor: "已将 LLM 模型切换为 GPT-4"
\\\

---

## 设计原则

### 1. 单一职责原则 (SRP)
- ✅ 每个 Worker 只负责一个业务领域
- ✅ 工具按职责归属清晰的 Worker
- ✅ Supervisor 只做调度，不做执行

**对比**：
- ❌ 旧架构: management worker 混合文档+人设+导出
- ✅ 新架构: 拆分为 document + profile，职责清晰

### 2. 最小权限原则 (Principle of Least Privilege)
- ✅ Worker 只能访问其专属工具
- ✅ 工具内部二次验证调用者身份
- ✅ 跨 persona 访问被阻止

**实现**：
\\\python
# agents/security.py
@require_worker(["knowledge"])
def search_persona_knowledge(query: str, runtime: ToolRuntime):
    # 只有 knowledge_worker 可以调用此工具
    ...
\\\

### 3. 高内聚低耦合
- ✅ 相关工具聚合在同一 Worker
- ✅ Worker 之间通过 Supervisor 通信，不直接耦合
- ✅ 每个 Worker 可独立测试、替换

**工具分配均衡性**：
| Worker | 工具数 | 职责范围 |
|--------|--------|---------|
| knowledge | 5 | 知识+搜索 |
| memory | 7 | 记忆管理 |
| document | 3 | 文档管理 |
| profile | 3 | 人设管理 |
| voice_clone | 7 | 语音克隆 |
| config | 4 | 配置管理 |

### 4. 失败安全 (Fail-Safe)
- ✅ 工具验证失败 → 拒绝执行，不降级
- ✅ Worker 超限 → 返回错误，不允许无限递归
- ✅ HITL 拒绝 → 操作取消，不留后门

---

## Worker 设计

### Worker 生命周期

\\\
1. 注册阶段
   register_worker(WorkerSpec) → _WORKER_REGISTRY

2. 图构建阶段
   build_persona_workflow() 读取注册表 → 为每个 Worker 创建节点

3. 运行时
   Supervisor 调用 delegate_to_X → Command.PARENT → X_worker
   Worker 执行 → finalize_X → 回传 Supervisor

4. 注销阶段
   unregister_worker(name) → 下次构建图时不包含
\\\

### 动态注册示例

\\\python
from agents.worker_registry import register_worker, WorkerSpec

# 定义新 Worker
email_worker = WorkerSpec(
    name="email",
    tools=["send_email", "read_inbox", "search_emails"],
    prompt_template="Handle email operations professionally and securely.",
    description="Delegate email tasks to the email specialist.",
    requires_approval=True  # 所有邮件操作需审批
)

# 注册
register_worker(email_worker)

# 重新构建图
workflow = build_persona_workflow(...)  # 自动包含 email_worker
\\\

### Worker 间通信规则

1. **禁止直接通信**：Worker A 不能直接调用 Worker B
2. **通过 Supervisor**：Worker → Supervisor → 决策 → Worker
3. **状态共享**：通过 LangGraph State 传递上下文

---

## 安全机制

### 1. 工具级权限验证

\\\python
from agents.security import require_worker

@require_worker(["memory"])
def save_persona_memory(content: str, runtime: ToolRuntime):
    # 验证调用者
    if runtime.context.active_worker != "memory":
        raise PermissionError("Only memory_worker can save memories")
    
    # 验证 persona 归属
    if runtime.context.persona_id != target_persona:
        raise PermissionError("Cross-persona access denied")
    
    # 执行保存
    ...
\\\

### 2. 输入验证和清洗

\\\python
from agents.security import InputValidator

# 文件路径验证（防止路径遍历）
safe_path = InputValidator.validate_file_path(
    user_input,
    allowed_dirs=["data/personas", "data/uploads"]
)

# SQL 查询验证（防止注入）
safe_query = InputValidator.validate_sql_query(user_query)

# 内容长度限制
safe_content = InputValidator.validate_content_length(content, max_length=50000)

# 文件大小限制
InputValidator.validate_file_size(file_path, max_size_mb=100)
\\\

### 3. 速率限制

\\\python
from agents.security import rate_limit

@rate_limit(limit=10, window_seconds=60)
def web_search(query: str):
    # 最多 10 次/分钟
    ...

@rate_limit(limit=3, window_seconds=86400)
def start_voice_training(session_id: str):
    # 最多 3 次/天
    ...
\\\

### 4. 审计日志

所有工具调用自动记录：
- 谁 (persona_id, conversation_id)
- 什么时候 (timestamp)
- 做了什么 (tool_name, parameters)
- 结果如何 (success/failure, error)

\\\python
# 日志示例
{
  "persona_id": "abc-123",
  "conversation_id": "conv-456",
  "tool_name": "save_persona_memory",
  "worker": "memory",
  "parameters": {"content": "...", "key": "***"},
  "success": true,
  "timestamp": "2026-08-28T12:34:56"
}
\\\

### 5. HITL 审批流程

**两阶段提交**：
1. equest_XXX_confirmation → 返回预览
2. 用户审批 → pply_XXX 执行

**需审批的操作**（14 个工具）：
- memory: save/update/delete (persona + workspace)
- document: add/delete_persona_document
- profile: rename/update_persona_profile
- voice_clone: training/binding
- config: 所有配置修改

---

## 可扩展性

### 1. 动态 Worker 注册

\\\python
# agents/worker_registry.py
_WORKER_REGISTRY: dict[str, WorkerSpec] = {}

def register_worker(spec: WorkerSpec) -> bool:
    _WORKER_REGISTRY[spec.name] = spec
    _REGISTRY_VERSION += 1
    return True
\\\

**优势**：
- 运行时添加新 Worker
- 不修改核心代码
- 支持插件化架构

### 2. MCP 工具集成

已有 MCP 协议支持，可动态加载外部工具：
- GitHub、Slack、Jira 等 SaaS 工具
- 自定义企业工具
- 第三方 API 封装

### 3. 技能系统

\\\python
# 用户可安装自定义技能
from agents.tools.skills import load_skill

load_skill("github_pr_review")  # 加载 GitHub PR 审查技能
\\\

### 4. Worker 热加载

\\\python
# 添加新 Worker
register_worker(email_worker)

# 重建图（无需重启服务）
workflow_cache.invalidate()
new_workflow = build_persona_workflow()
\\\

---

## 监控与可观测性

### 1. Metrics 收集

\\\python
from agents.monitoring import global_monitor

# 自动收集指标
metrics = global_monitor.get_metrics("knowledge")
# {
#   "total_calls": 1234,
#   "success_rate": "98.5%",
#   "avg_duration_ms": "345.67",
#   "last_call": "2026-08-28T12:34:56"
# }
\\\

**关键指标**：
- 调用次数
- 成功率
- 平均/最小/最大响应时间
- 错误分布

### 2. 分布式追踪

\\\python
# 开始追踪
global_monitor.start_trace(request_id, persona_id, conversation_id)

# 记录 Worker 调用
global_monitor.add_worker_to_trace(request_id, "knowledge", start, end)

# 结束追踪
trace = global_monitor.end_trace(request_id)
# {
#   "request_id": "req-123",
#   "total_duration_ms": 1234.56,
#   "workers_called": [
#     {"worker": "knowledge", "duration_ms": 345.67}
#   ],
#   "tools_called": [
#     {"tool": "search_persona_knowledge", "duration_ms": 234.56}
#   ]
# }
\\\

### 3. 健康检查

\\\python
health = global_monitor.get_health_status()
# {
#   "status": "healthy",
#   "unhealthy_workers": [],
#   "total_workers": 6,
#   "active_traces": 3
# }
\\\

**健康指标**：
- 成功率 < 50% → unhealthy
- 平均响应时间 > 30s → slow
- 依赖服务不可用 → degraded

---

## 最佳实践

### 1. 添加新 Worker

\\\python
# 1. 定义工具
@tool
def send_email(to: str, subject: str, body: str):
    ...

# 2. 注册到工具注册表
from agents.registry import register_tool_specs, ToolSpec

register_tool_specs([
    ToolSpec("send_email", "email", send_email, requires_confirmation=True)
])

# 3. 创建 Worker 规格
from agents.worker_registry import register_worker, WorkerSpec

email_worker = WorkerSpec(
    name="email",
    tools=["send_email", "read_inbox"],
    prompt_template="Handle email operations.",
    description="Delegate email tasks."
)

# 4. 注册 Worker
register_worker(email_worker)

# 5. 重建图
workflow = build_persona_workflow()
\\\

### 2. 保护敏感工具

\\\python
from agents.security import require_worker, rate_limit, InputValidator

@require_worker(["email"])
@rate_limit(limit=10, window_seconds=3600)
def send_email(to: str, subject: str, body: str, runtime: ToolRuntime):
    # 验证收件人
    if not re.match(r'^[^@]+@[^@]+\.[^@]+$', to):
        raise ValueError("Invalid email address")
    
    # 内容长度限制
    body = InputValidator.validate_content_length(body, max_length=10000)
    
    # 发送邮件
    ...
\\\

### 3. 监控生产环境

\\\python
# 定期导出指标
import schedule

def export_metrics():
    metrics = global_monitor.get_metrics()
    # 发送到 Prometheus / CloudWatch / DataDog
    ...

schedule.every(1).minutes.do(export_metrics)
\\\

---

## 简历亮点

### 技术深度

**1. LangGraph 架构设计**
- 基于 **LangGraph** 构建 **1 Supervisor + 6 Worker** 多智能体协作系统
- 使用 **Command.PARENT** 机制实现子图间通信和状态传递
- 实现 **MemorySaver checkpointer** 持久化会话状态，支持多轮对话和中断恢复

**2. 权限与安全**
- 实现 **最小权限原则**：29 个工具按职责分配到 6 个 Worker，代码层面强制隔离
- 设计 **工具级权限验证**：装饰器模式二次验证调用者身份，防止越权
- 实现 **HITL（Human-in-the-Loop）审批流程**：14 个敏感操作需二次确认
- 集成 **输入验证、速率限制、审计日志**等多层安全机制

**3. 可扩展性**
- 设计 **动态 Worker 注册机制**：支持运行时添加/移除 Worker，无需修改核心代码
- 集成 **MCP 协议**和 **技能系统**，支持动态加载外部工具和自定义能力
- 采用 **插件化架构**：Worker、工具、技能均可热插拔

**4. 可观测性**
- 实现 **分布式追踪系统**：记录完整的 Worker 调用链和工具执行时长
- 设计 **Metrics 收集器**：自动统计调用次数、成功率、响应时间等关键指标
- 提供 **健康检查接口**：实时监控 Worker 状态和依赖服务可用性

### 工程化

**1. 架构优化**
- 将原 7 个 Worker 精简为 6 个，拆分 management 为 document + profile，遵循单一职责
- 合并 web 到 knowledge，消除 conversation 冗余层，优化调用链开销
- 工具分配更均衡（3-7 tools/worker），提升系统可维护性

**2. 代码质量**
- 使用 **TypedDict、Literal、dataclass** 等类型系统保证类型安全
- 采用 **装饰器模式**实现横切关注点（权限、监控、速率限制）
- 遵循 **DRY、KISS、SOLID** 原则，代码可读性和可测试性强

**3. 设计模式**
- **策略模式**：Supervisor 根据意图选择 Worker
- **责任链模式**：Worker → finalize → Supervisor
- **注册表模式**：动态 Worker 和工具注册
- **装饰器模式**：权限验证、监控、日志

### 业务价值

**1. 安全性**
- 防止 LLM 幻觉导致的误操作：所有变更需人工审批
- 防止越权攻击：工具级权限+跨 persona 隔离
- 审计合规：完整的操作日志可追溯

**2. 性能**
- 减少不必要的 Worker 调用，降低延迟
- 速率限制防止滥用，保护后端服务
- 监控系统及时发现性能瓶颈

**3. 可维护性**
- 模块化设计便于团队协作
- 动态注册机制支持快速迭代
- 清晰的架构文档降低新人上手成本

---

## 附录

### A. 完整工具清单

| 工具名称 | Worker | 操作类型 | 需审批 |
|---------|--------|---------|--------|
| search_persona_knowledge | knowledge | read | ❌ |
| web_search | knowledge | read | ❌ |
| list_structured_tables | knowledge | read | ❌ |
| query_structured_data | knowledge | read | ❌ |
| import_knowledge_from_url | knowledge | write | ✅ |
| read_persona_memories | memory | read | ❌ |
| save_persona_memory | memory | write | ✅ |
| update_persona_memory | memory | write | ✅ |
| delete_persona_memory | memory | write | ✅ |
| read_workspace_memories | memory | read | ❌ |
| save_workspace_memory | memory | write | ✅ |
| delete_workspace_memory | memory | write | ✅ |
| list_persona_documents | document | read | ❌ |
| add_persona_knowledge | document | write | ✅ |
| delete_persona_document | document | write | ✅ |
| rename_persona | profile | write | ✅ |
| update_persona_profile | profile | write | ✅ |
| export_conversation | profile | read | ❌ |
| start_voice_clone_session | voice_clone | write | ✅ |
| request_file_upload | voice_clone | read | ❌ |
| analyze_voice_material | voice_clone | read | ❌ |
| request_training_confirmation | voice_clone | write | ✅ |
| start_voice_training | voice_clone | write | ✅ |
| check_training_progress | voice_clone | read | ❌ |
| bind_trained_voice | voice_clone | write | ✅ |
| list_available_configs | config | read | ❌ |
| get_config_detail | config | read | ❌ |
| request_config_change | config | write | ✅ |
| apply_config_change | config | write | ✅ |

**统计**：
- 总计：29 个工具
- 只读：15 个 (52%)
- 写入：14 个 (48%)
- 需审批：14 个 (48%)

### B. 相关文件

- 核心架构：gents/workflow.py (1045+ 行)
- 工具注册：gents/registry.py (215 行)
- 安全模块：gents/security.py (新增)
- Worker 注册：gents/worker_registry.py (新增)
- 监控模块：gents/monitoring.py (新增)
- 工具实现：gents/tools/ 目录
- RAG 子图：gents/rag/ 目录

---

**文档版本**: 2.0  
**最后更新**: 2026-08-28  
**作者**: YUMENO 架构团队
