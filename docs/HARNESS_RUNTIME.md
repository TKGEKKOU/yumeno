# YUMENO 内置 Agent Runtime

## 设计目标

YUMENO 将 Harness 的核心运行抽象内置在 Python 项目中：

- Session：以 persona 与 conversation 作为会话边界；
- Job：每次对话或恢复请求都有独立的运行任务；
- Event：继续复用现有流式事件合同；
- Cancel：统一取消运行任务，并交给领域 Worker 取消实际任务；
- Resume：结构化恢复等待输入、确认和异步任务；
- Lifecycle：运行记录、结果、错误和终态统一写入 RunStore。

这不是外部 Harness SDK 的包装，也不需要 Harness 源码、Node runtime、外部可执行文件或额外下载的 runtime。

## 启动

```powershell
cd D:\CodePython\YUMENO
.\.venv\Scripts\python.exe -m agents.runtime serve

# 安装项目后也可使用
pip install -e .
yumeno serve

# 查看内置运行内核
.\.venv\Scripts\python.exe -m agents.runtime runtime-status
```

原有 `python main.py` 入口继续保留。

## 架构边界

```text
AgentRuntime
  └── NativeAgentLoop（Session / Job / Event / Cancel / Resume）
       └── PersonaAgentService
            ├── Core Agent：意图识别
            ├── Supervisor：业务路由、Worker 选择、生命周期
            └── Workers：rvc_worker / config_worker / rag_worker / gpt_sovits_worker
```

内置 Runtime 不识别业务关键词、不直接调用 RVC、不替代 Core 或 Supervisor。它只为现有服务提供统一的运行生命周期，并保证同步、流式和恢复入口使用同一套 Job 合同。

## 取消与恢复

`AgentRuntime.cancel(run_id)` 会先停止内置 Job 的事件转发，再执行已经注册的领域取消钩子。领域钩子负责取消 RVC session、资源下载或其它后台任务。

恢复请求仍通过 `stream_resume()` / `resume()` 进入现有 Supervisor；附件、session、worker 和 input_values 由业务层维护，不由 Runtime 猜测或覆盖。
