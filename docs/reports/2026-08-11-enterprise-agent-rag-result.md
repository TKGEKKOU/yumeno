# YUMENO 企业级 Agent/RAG 优化成果报告

日期：2026-08-11
环境：Windows，本地 Python 3.11，YUMENO 工作区

## 结论

主链路已具备可写进简历的企业级架构特征：服务端权威作用域、Agent/Workflow/Tool 分层、LangGraph checkpoint/HITL、Milvus RAG Top3 评测、四层记忆、结构化 SQLite + 只读 Text-to-SQL、request-local 可观测。TTS、Live2D、B站和 NapCat/QQ 保持独立适配，不被主链路重构牵连。

准确边界：知识检索和结构化查询已经收敛为“一次 Supervisor 策略决策 + 确定性 Workflow/Tool”。Web、Memory、Management 与动态 Skill/MCP 写操作仍保留 Legacy Worker/HITL 图，以优先保证已有能力和中断恢复兼容；报告不把这部分计入模型调用优化收益。

## 已完成改造

- 增加当前轮运行事件和指标：首字延迟、总耗时、模型调用、Token、上下文裁剪、Tool 成功率、handoff 和 RAG trace。
- 将网页与 OneBot/NapCat 共用同一 context factory，消除作用域和会话摘要构建漂移。
- 上下文按完整用户回合裁剪，保留 Tool 调用配对；增加角色记忆与工作区全局记忆。
- 评测口径统一为 Recall@3、Precision@3、Hit@3、MRR@3，并提供检索/整链路 P50/P95 和 JSON 导出。
- CSV/XLSX 独立导入 SQLite；Milvus 只索引 Schema Card；双层 SQL AST + SQLite authorizer 防护跨空间和写操作。
- 知识/结构化路径改为“一次策略决策 + 确定性 Workflow/Tool 执行”；Web、Memory、Management、Skill、MCP 写操作保留原有受控图和 HITL。
- 对话页显示当前轮轻量运行指标；评测页显示 Top3 并支持导出。
- 修复应用生命周期缺陷：轻量测试应用不再加载真实 Embedding；worker 在 `Popen` 创建窗口和握手阶段均能可靠终止，应用级关闭会清除已关闭实例缓存。
- 将持久 MCP Runtime 的启动、工具发现和异步断开移出 FastAPI 事件循环；增加每服务器操作串行化、代次校验、在途 Future 取消、失败 Session 清理和应用关闭顺序，避免慢服务器阻塞请求或留下子进程。
- 将本地 Embedding 查找缓存改为 4 项显式 LRU；淘汰对象使用弱引用登记，在 Milvus 等真实持有者释放后自动关闭，应用退出时再统一回收仍存活对象，兼顾旧引用安全与资源上界。

## 可复现量化结果

基准文件：[enterprise-2026-08-11.json](../benchmarks/enterprise-2026-08-11.json)

| 指标 | 实测结果 | 口径 |
|---|---:|---|
| 结构化导入吞吐 | 315,075.744 行/s | 5,000 行 CSV，15.869 ms，SQLite 本地导入 |
| 结构化聚合查询 P50 | 1.914 ms | 20 次相同只读聚合查询 |
| 结构化聚合查询 P95 | 2.064 ms | 同上 |
| 恶意 SQL 拦截率 | 100%（80/80） | 4 类攻击模式各重复 20 次，不表示 80 种独立攻击 |
| 跨空间隔离 | 100%（4/4） | 跨 workspace / knowledge space 的真实反向查询探针 |
| 50 轮上下文 token | 12,057 → 5,791 | 预算 6,000 token，裁剪率 51.97% |
| 完整回归 | 581 passed，2 skipped，102.57 s | 2026-08-11 终审修复后非沙箱完整测试输出；历史超时仅保留为诊断过程记录 |

这些数据是本机可重复微基准，不代表外部 LLM、Milvus 网络或 GPU 生产延迟。知识快路径的 `model_calls == 1`、`tool_calls == 1` 属于执行合同测试，不属于该性能微基准；由于没有执行旧、新两条真实 LLM 链路的 A/B 测试，报告不再声称“模型调用降低 66.67%”。

复现命令：

```powershell
.\.venv\Scripts\python.exe -B -m scripts.benchmark_enterprise --rows 5000 --output docs\benchmarks\enterprise-2026-08-11.json
```

## 测试证据

- 完整 Python 回归：`581 passed, 2 skipped, 31 warnings in 102.57s`。
- MCP/Embedding/应用关闭定向回归：`41 passed`；真实 MCP stdio 生命周期单测另行通过。
- 前端 Node 回归：`13 passed, 0 failed`。
- 2 项 integration 跳过：需要当前环境未提供的外部 MySQL/Milvus 条件。
- MCP stdio 与 Node test runner 在沙箱内分别会因 `WinError 5` / `spawn EPERM` 失败，沙箱外完整复核通过；这是执行环境限制，不是代码降级。
- Agent 架构合同测试证明知识/结构化快路径每轮 `model_calls == 1`、`tool_calls == 1`。
- 完整回归结束后的 Python 进程检查为空，未遗留 pytest、MCP 或 Embedding worker。

警告主要来自 Protobuf gencode/runtime 版本差异、FastAPI `on_event` 弃用和 Python 3.13 `audioop` 弃用；本轮未将它们扩大为无关重构。

## 尚未声称的指标

事实：本次执行时本地 App 和 Milvus 端口均未监听。
因此没有把角色知识库的线上 Recall@3、Milvus P50/P95、外部模型 TTFT 写成实测结果。启动服务后，在“评测”页运行题集并导出 JSON，即可得到这组生产环境指标。

## 简历表述

- 设计并实现本地优先的 Agent/RAG 平台，基于 LangGraph 将策略决策、权限工作流和标准 Tool 解耦；将知识/结构化查询收敛为一次 Supervisor 决策后的确定性执行，合同测试锁定每轮 1 次模型调用、1 次 Tool 调用。
- 构建 Milvus Dense/BM25/RRF 检索与 Recall@3 评测链路，支持 P50/P95 延迟、质量门、拒答率、复杂题改写/纠错和 JSON 结果导出。
- 针对 CSV/XLSX 构建 workspace 隔离 SQLite + Schema Card + 只读 Text-to-SQL，AST 与 SQLite authorizer 对 4 类攻击模式的 80 次重复探针实现 100% 拦截，5,000 行导入吞吐约 31.51 万行/s、聚合查询 P95 2.064 ms。
- 实现四层 Agent 记忆与上下文预算，50 轮上下文从 12,057 压缩到 5,791 token，裁剪率 51.97%，并保留 checkpoint/HITL 中断恢复。
- 重构 MCP/Embedding 子进程生命周期与并发控制，修复跨 Task 清理、启停竞态、在途任务、LRU 旧引用失效、retired 强引用累积和 lifespan 闸门污染；当次 581 项完整回归在 102.57 秒完成。历史上一次超过 904 秒未收口的运行没有独立基线产物，因此不作为量化降幅。

前三项量化来自本机微基准或合同测试。真实知识库运行 Recall@3 后，才能补充“召回率提升”；真实 LLM A/B 后，才能补充“首字响应时间降低”。

## 后续量化闭环

启动 Milvus、加载固定角色知识库并在评测页运行至少 30 个固定问题后，再补充生产 Recall@3、检索 P50/P95 和整链路 P50/P95。外部 LLM 需要独立记录 TTFT P50/P95；在这些实验完成前，不应把“响应时间降低”写成具体百分比。

## 推断与假设

- 推断：一次策略决策 + 确定性 Workflow 更容易控制首字延迟、权限和失败边界；仍需在真实外部模型上测量 TTFT 才能量化收益。
- 假设：Milvus 启动且角色资料已索引后，评测页导出的 Recall@3 才能代表具体知识库质量；本报告不替用户填写该值。
