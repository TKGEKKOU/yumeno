# Agent Runtime Phase 1 设计方案

日期：2026-08-30
状态：已获用户确认，进入实现前设计阶段

## 1. 目标

把 YUMENO 当前已经存在的 Supervisor、Worker、HITL、checkpoint、Tool 能力和请求级观测，收敛为一个统一、可恢复、可查询、可审计的 Agent Runtime 基础层。第一阶段不更换 LangGraph，不引入第二套 Agent 编排框架，不重写声音、RAG 或渠道业务。

完成后，一次复杂请求应能被视为一个 `AgentRun`：有稳定的 `run_id`、状态、事件、结果、错误和确认点；服务重启或人工确认后可以从已有 checkpoint 继续，而不是依赖某个路由器或前端轮询的隐式状态。

## 2. 已知事实与边界

- 现有父图是 `persona_supervisor -> worker -> finalize -> persona_supervisor` 的中心辐射拓扑。
- `knowledge` 是 Planner + 确定性 retrieve/fallback 子图；不能改成自由总结型 Agent。
- `memory`、`document`、`profile`、`voice_clone`、`config` 是受限工具 Worker。
- 现有 ToolSpec、CapabilityCatalog、MCP grants、Skill trust 和 HITL 逻辑必须继续有效。
- 当前工作区存在大量未提交改动；实现不得 reset、checkout 或批量删除这些改动。
- 当前测试基线为 729 passed、2 skipped、1 failed。失败项是启动脚本测试仍要求 `DockerManager` 字样，而当前脚本采用 Web-first 直接启动路径；Phase 1 需要修复该契约。
- 第一阶段不实现远程账号、公开互联网部署、完整 Live2D runtime、分布式队列或 SaaS 多租户。

## 3. 设计原则

### 3.1 保留现有编排内核

继续使用 LangGraph 表达分支、循环、interrupt 和 checkpoint。新增层只负责运行实例、事件和持久化，不在外面再套一套 CrewAI、AutoGen 或自研图引擎。

### 3.2 结果与过程分离

`AgentResult` 表达本轮最终交接结果；`RunEvent` 表达过程事件；checkpoint 保存图恢复所需状态。三者不互相冒充：事件不作为事实答案，最终答案不包含隐藏推理，checkpoint 不直接返回给前端。

### 3.3 默认失败关闭

缺少合法合同、能力未授权、确认未通过、工具超时或外部服务不可用时，返回明确状态和错误码，不让 Supervisor 以自然语言猜测执行结果。

### 3.4 兼容已有 API

现有 `AgentService.query()`、`stream_query()`、SSE `token/stage/result` 事件和已有前端先保持兼容。新字段采用可选方式加入；不要求一次性迁移全部前端。

### 3.5 数据最小化

持久化运行记录只保存路由、Worker、工具、状态、耗时、数量、错误码和脱敏摘要；不保存 API Key、完整隐藏 Prompt、模型思维链和不必要的原始敏感内容。

## 4. 目标架构

```text
API / Channel
     |
     v
AgentRuntime.run()
     |
     +-- RunStore: 创建与更新 AgentRun
     +-- EventStore: 追加脱敏 RunEvent
     +-- ApprovalService: pending / approve / reject
     +-- CapabilityGuard: policy + confirmation
     +-- LangGraph: Supervisor / Worker / checkpoint
     +-- ResultContract: 统一 AgentResult
     |
     v
Web / SSE / Channel Adapter
```

### 4.1 核心模块

新增 `agents/runtime/`：

- `models.py`：`AgentRun`、`AgentResult`、`RunEvent`、`RunStatus`、`StepStatus` 等不可变/可校验数据模型。
- `errors.py`：稳定错误码和面向用户的错误消息映射。
- `events.py`：事件名称、脱敏和事件序列号规则。
- `runner.py`：围绕现有图服务创建、执行、恢复、取消运行；不复制图路由逻辑。
- `approvals.py`：统一确认状态查询和处理，复用已有 checkpoint/confirmation 机制。

新增 `app/` 持久化与 API：

- `app/run_store.py`：SQLite 运行记录和事件的 CRUD，使用现有应用数据库连接/模型习惯。
- `app/task_store.py`：长耗时任务的状态记录；第一阶段仅提供统一抽象，不把所有后台任务迁移完。
- `app/routers/runs.py`：查询运行、事件、确认和取消的 API。

修改现有模块：

- `agents/contracts.py`：把已有领域合同统一适配到 `AgentResult`。
- `agents/service.py`：创建 `run_id`、写入运行状态、收口异常和结果；保留原方法签名。
- `agents/registry.py`：暴露可序列化 Tool 元数据，并让授权检查成为统一调用入口。
- `agents/checkpoint.py`：补充按 `run_id`/thread 查询和清理的安全接口。
- `scripts/start.ps1` 与 `tests/unit/test_web_launch.py`：统一 Web-first 启动契约。

## 5. 数据模型

### 5.1 AgentRun

```text
id: str                  # run_xxx，唯一
persona_id: str
conversation_id: str
thread_id: str           # 与 LangGraph config 对应
status: queued|running|waiting_approval|paused|completed|failed|cancelled
action: str              # chat / memory / document / voice / config / eval
active_worker: str | null
result_json: JSON | null
error_code: str | null
error_message: str | null
created_at: datetime
started_at: datetime | null
finished_at: datetime | null
updated_at: datetime
```

### 5.2 RunEvent

```text
id: int
run_id: str
sequence: int
category: system|agent|worker|tool|retrieval|approval|error
name: str
label: str
status: started|completed|pending|failed|skipped
duration_ms: float | null
details_json: JSON
created_at: datetime
```

`details_json` 只能通过统一 sanitizer 写入，允许字段沿用现有 `PUBLIC_DETAIL_KEYS`，并补充 `run_id`、`attempt`、`job_id`、`error_code` 等非敏感标识。

### 5.3 AgentResult

```text
run_id: str
status: completed|pending_confirmation|degraded|failed
answer: str
specialist: str
worker_results: list[dict]
evidence: list[dict]
citations: list[dict]
uncertainties: list[str]
trace: list[dict]
requires_approval: bool
error_code: str | null
```

已有 `AgentTurnResult` 继续作为兼容输出；新增 runtime 层负责双向转换，避免在第一阶段修改所有调用方。

## 6. 运行状态机

```text
queued -> running
running -> waiting_approval
waiting_approval -> running       # approve + resume
waiting_approval -> cancelled     # reject / cancel
running -> completed
running -> failed
running -> paused                  # 外部依赖临时不可用或显式暂停
paused -> running                  # 显式恢复
```

非法状态转移必须返回稳定错误，不允许前端通过重复请求强行覆盖状态。

### 6.1 幂等要求

- `run_id` 创建后不可复用。
- approve/reject/cancel 使用状态条件更新，重复请求返回当前状态而不是重复执行。
- 相同 `thread_id` 的 pending confirmation 不能被新问题绕过。
- 运行事件 `sequence` 在同一 `run_id` 内单调递增。

## 7. API 草案

第一阶段新增以下只读/控制接口，默认仍只绑定 `127.0.0.1`：

```text
GET  /api/runs/{run_id}
GET  /api/runs/{run_id}/events
POST /api/runs/{run_id}/cancel
POST /api/runs/{run_id}/approval
```

确认请求体：

```json
{
  "approved": true
}
```

接口返回统一错误结构：

```json
{
  "error": {
    "code": "run_not_found",
    "message": "找不到该运行记录。"
  }
}
```

第一阶段不开放任意 `resume` 参数；恢复必须绑定已有 thread/checkpoint 和当前 pending approval，防止客户端伪造恢复位置。

## 8. 与现有 AgentService 的集成

### 同步 query

1. 计算 persona/thread。
2. `RunStore.create(status=queued)`。
3. 进入图前更新为 `running`。
4. 复用现有 `RunRecorder`，将脱敏事件镜像到 `EventStore`。
5. 结果为普通完成、降级或 pending confirmation 时更新 `AgentRun`。
6. 未知异常映射为 `runtime_failed`，保留日志上下文但只向 API 返回脱敏消息。

### 流式 stream_query

1. 先发送现有兼容事件。
2. 同时写入 runtime event。
3. 结束时必须发送一个 `result`，并以 `AgentRun` 最终状态为准。
4. Worker 内部 AIMessage 不直接转发到用户。

### 确认恢复

1. 图抛出 interrupt 或服务发现 pending checkpoint。
2. Run 标记为 `waiting_approval`。
3. API 查询 pending 详情。
4. 用户 approve 后只调用受控 resume 入口。
5. 恢复前校验 persona、conversation、thread 和审批 token 一致。
6. 结束后更新为 completed/failed/cancelled。

## 9. 错误分类

第一阶段至少定义：

```text
run_not_found
run_invalid_transition
run_already_finished
confirmation_required
confirmation_denied
capability_denied
contract_invalid
provider_unavailable
worker_timeout
worker_failed
checkpoint_unavailable
runtime_failed
```

错误响应需要同时服务于前端提示和日志筛选；不把 Python 异常类型或外部 Provider 原始错误直接暴露给用户。

## 10. 测试验收

新增单元测试：

- 状态机允许/拒绝的所有转移；
- AgentResult 从既有 AgentTurnResult 转换；
- 事件序列递增和敏感字段脱敏；
- RunStore 创建、更新、查询、幂等控制；
- approval/cancel 重复请求不会重复执行；
- capability denied、contract invalid、provider unavailable 的错误映射。

新增 API 测试：

- 查询不存在的 run 返回 `run_not_found`；
- 查询运行事件按 sequence 排序；
- pending approval 只允许匹配的 persona/thread 处理；
- 完成运行不能再次 approve/cancel；
- 现有 chat、SSE、MCP、voice、RAG 测试继续通过。

回归命令：

```powershell
.\.venv\Scripts\python.exe -m pytest -q --disable-warnings --maxfail=1
```

## 11. 明确不做的事情

- 不安装 AutoGen、CrewAI、OpenHands、PydanticAI 等第二套编排框架。
- 不把所有后台任务一次性迁移到新 TaskStore。
- 不在第一阶段实现分布式 Redis/Celery/RQ 队列。
- 不默认开放公网访问。
- 不把完整 prompt、隐藏推理、API Key 或模型权重写入 RunEvent。
- 不修改 YUMENO 的 Supervisor-centric 拓扑为平级群聊。

## 12. 后续阶段接口预留

Phase 2 的角色版本/发布可以复用 `AgentRun` 和事件记录；Phase 3 的 RAG 评测可以将评测任务写入 `TaskStore`；Phase 4 的声音训练和渠道消息可以复用同一状态机。第一阶段只保证这些模块未来能接入，而不提前实现所有业务。
