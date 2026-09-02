# Codex 目标模式提示词：完善对话驱动的多 Agent 工作流

> 使用方式：将下方整段内容作为 Codex 目标模式的新目标。预期是一次长时间、自主、分阶段的工程任务；不要机械追求“运行满 8 小时”，而应在目标完成、验证通过后收束。

---

你正在维护本地项目：

```text
D:\CodePython\YUMENO
```

## 一、最终目标

将 YUMENO 完善为一个**以对话为首要入口、以结构化工具和专项 Agent 执行复杂工作流**的本地多智能体系统。用户应当主要通过对话，并在必要时上传文本、文档、图片、音频、视频或其他受支持文件，即可完成系统现有工作流，而不需要理解内部接口、手动填写路径或在多个页面之间反复搬运数据。

最终交互原则：

```text
普通对话
→ Core Agent 快速直接回复

明确且信息充分的专项任务
→ Core Agent 形成结构化任务
→ TaskOrchestrator
→ 对应专项 Worker
→ 受管文件、任务状态和结构化结果
→ Core Agent 汇总并自然回复
```

优先完成：

1. 对话页的多类型文件上传、预览、删除、取消和发送；
2. 对话附件进入统一的受管文件系统，并能被 Agent 工具安全引用；
3. 完成并加固 `rvc_worker`，接入现有 Agent 架构；
4. 让用户通过对话上传音频/视频、指定 RVC 音色并生成可试听、可下载的结果；
5. 梳理并加固 Core Agent、专项 Worker、TaskOrchestrator 的边界；
6. 建立清晰、高效、可测试、失败可收束的多 Agent 架构。

## 二、必须保留的产品事实

### GPT-SoVITS

GPT-SoVITS 是 YUMENO 的主声音系统，继续负责：

- 角色对话语音；
- TTS；
- 角色声音资产；
- 数据集、转写、切片和训练；
- 对话中的角色语音输出。

普通的“读出文字”“让角色说话”“使用角色声音回复”不得路由到 RVC。

### RVC

RVC 是独立的音频到音频生产工具，只负责：

```text
已有音频或视频
→ 提取/标准化音频
→ 可选人声分离
→ 选择已有 .pth / .index
→ RVC 推理
→ 返回独立音频文件
```

RVC 不负责训练，不参与角色默认音色，不作为 TTS 回退，不自动写入角色 VoiceAsset。

现有真实测试资源：

```text
模型：D:\Music\RVC\HatsuneMiku\HatsuneMiku_pth.pth
Index：D:\Music\RVC\HatsuneMiku\HatsuneMiku_index.index
输入：D:\Music\提取\小小恋歌\小さな恋のうた(Vocals).wav
已保留输出：D:\CodePython\YUMENO\data\voice\rvc\tasks\1e0111969cb9\output.wav
```

禁止删除上述用户资源和已保留输出。

## 三、工作方式

### 1. 自主执行

先检查代码、调用链、数据模型、测试和当前 Git 状态，再实施最小且集中的修改。目标已经足够明确，不要要求用户先写完整设计方案，也不要每完成一个小步骤就等待确认。

只有出现以下情况才停止并询问用户：

- 必须取得外部账号、付费密钥或用户未提供的私有资源；
- 存在不可逆的数据删除或迁移风险；
- 两个方案会显著改变产品定位，且无法从现有事实判断；
- 同一阻塞条件经过三次不同方式仍无法推进。

普通测试失败、依赖问题、接口不一致和局部设计问题应自行调查、缩小范围并继续。

### 2. 分阶段推进

维护一个简洁计划，一次只让一个步骤处于进行中。每个阶段结束时运行相关测试，并写入工作记录：

```text
docs/plans/agent-chat-progress.md
```

记录：完成项、验证命令、结果、风险、下一步。不要把内部工作记录显示在最终产品页面中。

### 3. 时间与范围控制

这是一次最长约 8 小时的目标任务，但不要通过无意义重构消耗时间。采用以下优先级：

```text
P0：对话附件安全进入 Agent 工作流；RVC 对话流程真实可用
P1：任务状态、取消、错误恢复、上下文边界、测试
P2：前端体验、移动端、可访问性、细节精修
P3：非必要抽象、历史代码大规模迁移、与目标无关的重构
```

如果某个子目标超过 45 分钟仍受阻：记录根因，先实现可验证的较小闭环，再继续其他不依赖该阻塞的工作。

## 四、阶段 A：现状审计与架构基线

先阅读并梳理：

```text
main.py
app/main.py
app/routers/*chat*
app/routers/voice_rvc.py
agents/
agents/graph/
agents/tools/
agents/workflow.py
voice/rvc/
static/views/chat.html
static/js/ 中与聊天、上传、消息相关的脚本
static/views/rvc.html
static/js/rvc-studio.js
现有 tests/api、tests/unit、tests/js
```

输出并落盘当前架构图或文字说明，至少明确：

- Core Agent 当前入口和普通对话快速路径；
- 意图识别与专项 Worker 路由位置；
- Worker 注册、能力清单和工具授权；
- TaskOrchestrator 的任务状态和取消方式；
- 对话消息、附件、受管文件 ID 的现状；
- RVC 页面接口与 `rvc_worker` 工具是否复用同一服务层；
- 哪些能力只是“可配置”，哪些已经进入真实运行链路；
- 当前最小安全修改点。

不要先新建第二套 Agent 框架。优先补齐现有架构。

## 五、阶段 B：对话页文件上传与预览

参考成熟对话产品的交互，但保持 YUMENO 现有视觉语言。上传区域至少支持：

### 文档与通用文件

- txt、md、json、csv、pdf、docx 等已具备解析能力的格式；
- 文件名、类型、大小、上传状态；
- 可移除、取消上传、失败重试；
- 不支持的格式给出明确原因；
- 发送前附件以紧凑卡片显示。

### 图片

- 缩略图预览；
- 点击查看大图；
- 移除与上传状态；
- 无视觉模型时不得伪称已理解图片，应明确能力边界。

### 音频

- 内嵌播放器；
- 时长、格式和大小；
- 可选择用于 STT、GPT-SoVITS 素材或明确的 RVC 任务；
- 不要仅凭上传音频自动触发 RVC。

### 视频

- 视频预览；
- 文件信息；
- 后端可受管地提取音轨；
- 当用户明确提出音频处理、转写或 RVC 需求时，Agent 再调用对应工具。

### 交互要求

- 支持文件选择、拖放和粘贴（浏览器可用时）；
- 支持多个附件，但设置合理数量、单文件大小和总大小限制；
- 上传过程有真实进度，不能用假百分比；
- 上传失败不应清空用户已经输入的消息；
- 发送中避免重复提交；
- 附件上传未完成时，发送按钮状态和原因清晰；
- 支持键盘操作和焦点可见；
- 移动端无横向溢出；
- `prefers-reduced-motion` 生效。

## 六、阶段 C：统一受管文件与安全边界

建立或完善统一附件对象，不把本地绝对路径暴露给模型或前端。推荐结构：

```json
{
  "file_id": "file_xxx",
  "conversation_id": "...",
  "message_id": "...",
  "name": "sample.wav",
  "media_type": "audio/wav",
  "kind": "audio",
  "size": 123456,
  "status": "ready",
  "metadata": {
    "duration": 12.4,
    "sample_rate": 44100
  }
}
```

要求：

- API、Agent 和 Worker 之间传递 `file_id`，不传用户提供的任意路径；
- 文件解析必须限制在 YUMENO 受管目录；
- 防止 `..`、绝对路径注入、符号链接逃逸和任意文件读取；
- 文件下载与 `<audio>/<video>/<img>` 预览应能在浏览器工作，不依赖媒体标签无法携带的自定义请求头；
- 同时保留本地访问限制、会话归属校验和文件 ID 校验；
- 临时文件、消息附件、任务输入和长期结果要有不同生命周期；
- 失败任务清理临时文件，但不误删用户原文件或已完成结果；
- 任务和消息的引用关系可追踪。

如果已有文件管理实现，扩展并复用，不要另造一套相互不兼容的存储。

## 七、阶段 D：Core Agent 与多 Agent 路由

Core Agent 应承担：

- 绝大多数普通对话的快速响应；
- 理解用户目标；
- 检查附件类型和可用信息；
- 在信息足够时形成结构化专项任务；
- 信息不足时只询问完成任务所必需的最少问题；
- 接收 Worker 结构化结果并自然回复。

Core Agent 不应：

- 对每条消息都启动规划器或多个 Worker；
- 把完整自由文本和所有历史无差别转发给专项 Worker；
- 直接拼 Shell 或 Python 命令；
- 在普通聊天中加载 RVC 等重型运行时；
- 让多个 Worker 争抢同一意图。

建立清晰的路由优先级：

```text
1. 普通聊天 / 可直接完成 → Core Agent
2. 严格 RAG 意图 → knowledge_worker，经完整 RAG 流程
3. 明确 RVC 音频生产 → rvc_worker
4. 明确 GPT-SoVITS/TTS/训练工作流 → 对应现有专项 Worker
5. 多步骤跨域任务 → TaskOrchestrator 编排必要 Worker
```

RAG 相关任务必须遵循系统既有标准 RAG 流程，不建立绕过检索、重排和引用的“轻量 RAG”。

专项 Worker 获取最小上下文：用户目标、必要参数、相关 `file_id`、会话标识和权限范围。不要把整段无关聊天历史复制给 Worker。

## 八、阶段 E：完成 `rvc_worker`

`rvc_worker` 定位：

```text
RVC 音频生产助手
```

允许的结构化工具：

```text
inspect/get_rvc_status
list_rvc_models
validate_rvc_model
prepare_rvc_audio（需要时复用音频提取/标准化/分离）
convert_audio_with_rvc
get_rvc_task_status
cancel_rvc_task
get_rvc_output
```

禁止：

- 任意 Shell；
- 任意 Python 文件执行；
- RVC 训练；
- Index 构建；
- 角色音色绑定；
- 普通 TTS；
- 背景音作为默认 RVC 输入；
- 未校验路径和参数。

意图示例：

```text
应触发：
“把我上传的录音用初音模型变声”
“用这个 pth 和 index 处理附件中的 wav”
“从这个视频提取人声后用 RVC 生成音频”

不应触发：
“让角色读出这段话”
“生成角色语音”
“RVC 是什么”
“帮我总结这个音频的内容”
```

Core Agent → `rvc_worker` 应使用结构化任务，例如：

```json
{
  "task_type": "convert_audio_with_rvc",
  "input_file_id": "file_xxx",
  "model_id": "HatsuneMiku_pth.pth",
  "index_id": "HatsuneMiku_index.index",
  "options": {
    "pitch": 0,
    "f0_method": "rmvpe",
    "index_rate": 0.75,
    "protect": 0.33,
    "resample_sr": 0,
    "rms_mix_rate": 1.0
  },
  "conversation_context": {
    "conversation_id": "...",
    "workspace_id": "..."
  }
}
```

Worker 返回：

```json
{
  "task_id": "task_xxx",
  "worker": "rvc_worker",
  "state": "succeeded",
  "phase": "done",
  "output_file_id": "file_out_xxx",
  "output_url": "/api/...",
  "error": null
}
```

对话中展示：任务阶段、取消入口、成功后的音频播放器和下载按钮。不要让 Core Agent 在任务仍运行时伪称已经完成。

## 九、阶段 F：TaskOrchestrator 与任务健壮性

统一或映射以下状态：

```text
queued
preparing
running / domain-specific phases
succeeded
done
failed
cancelling
cancelled
timed_out
```

每个长任务应具有：

- `task_id`；
- Worker/能力标识；
- 输入文件引用；
- 当前阶段；
- 可解释的状态信息；
- 创建、开始、更新、结束时间；
- 已用时；
- 取消信号；
- 超时；
- 错误收束；
- 输出文件引用；
- 日志摘要，但不向用户泄露密钥和完整本地路径。

真实无法获得百分比的任务使用“阶段 + 已用时 + 动态但不伪精确的反馈”。能够获得真实 chunk/bytes 进度的任务使用真实百分比。

避免：

- stdout 管道未消费导致子进程卡死；
- 取消后子进程残留；
- 任务失败但前端永远轮询；
- 服务重启后把旧 running 任务继续显示为运行中；
- 一个全局轮询变量同时控制不相关的上传、分离和推理任务。

## 十、阶段 G：对话结果组件

对话消息应能渲染结构化结果：

- 普通文件卡片；
- 图片预览；
- 音频播放器与下载；
- 视频预览；
- 上传/处理进度；
- Agent 任务状态；
- 失败原因和重试；
- 可取消任务；
- RAG 引用；
- RVC 输出音频。

保持聊天流为主，不把对话页做成复杂后台仪表盘。任务详情默认紧凑，必要时展开。

## 十一、测试要求

优先补充回归测试，不只依赖手工页面验证。

### 后端与安全

验证：

- 附件上传、大小限制、格式识别；
- `file_id` 与会话归属；
- 路径穿越、绝对路径和跨会话访问被拒绝；
- 媒体 GET 可被浏览器播放；
- 临时文件和长期结果生命周期；
- RVC 模型、Index 和参数校验；
- RVC 任务取消、超时、失败和成功；
- 子进程无残留；
- GPT-SoVITS 现有流程无回归。

### Agent

验证：

- 普通聊天走 Core Agent 快速路径；
- 普通 TTS 请求不触发 RVC；
- 明确 RVC 文件任务触发 `rvc_worker`；
- 缺少附件或模型时只询问必要信息；
- Worker 只能调用授权工具；
- 不允许任意路径或 Shell；
- Worker 结构化结果能回到 Core Agent；
- RAG 意图仍走标准 `knowledge_worker` 流程；
- 多意图时路由稳定、无重复执行。

### 前端

验证：

- 桌面端和移动端；
- 拖放、选择、删除、取消、重试；
- 图片、音频、视频和文档预览；
- 上传中和任务中按钮状态；
- 快速连续提交；
- 横向溢出；
- 键盘操作和焦点；
- 控制台错误；
- `prefers-reduced-motion`；
- 音频结果播放与下载。

### 真实 RVC 冒烟测试

在不删除用户资源的前提下，使用已有模型和测试音频完成一次真实 GPU 流程。至少确认：

- CUDA 被识别；
- 模型和 Index 被发现；
- 对话附件可以转成受管输入；
- Core Agent 路由到 `rvc_worker`；
- 任务阶段可见；
- 输出 WAV 生成；
- 对话中可试听和下载；
- 取消和失败路径至少通过模拟测试。

新的真实测试结果可以保留，并在最终报告中写明绝对路径；不得覆盖或删除既有保留输出。

## 十二、前端设计与 Skill

先检查环境内现有 Skill。按任务类型使用：

- 视觉和局部布局：`design-taste-frontend` 或现有明确视觉主导 Skill，单次只使用一个视觉主导 Skill；
- React/工程质量：如实际为 React 组件，再使用对应 React 最佳实践；
- Web 可访问性和交互检查：相关规范/QA Skill；
- 最终功能检查：`qa`。

这是现有产品的功能完善，不做无关的整站视觉重构。保留产品事实和品牌信息，优先最小、集中、可回滚的改动。

## 十三、验证命令基线

根据实际代码调整，但至少运行相关集合：

```powershell
D:\CodePython\YUMENO\.venv\Scripts\python.exe -m py_compile <修改过的 Python 文件>
node --check <修改过的原生 JS 文件>
D:\CodePython\YUMENO\.venv\Scripts\python.exe -m pytest -q <相关测试>
npm run typecheck
npm run build:frontend
```

FastAPI 启动入口：

```powershell
D:\CodePython\YUMENO\.venv\Scripts\python.exe -B D:\CodePython\YUMENO\main.py
```

默认页面：

```text
http://127.0.0.1:17000/static/index.html
```

检查端口：

```powershell
Get-NetTCPConnection -LocalPort 17000 -State Listen
```

停止服务：

```powershell
$conn = Get-NetTCPConnection -LocalPort 17000 -State Listen -ErrorAction SilentlyContinue
if ($conn) {
    Stop-Process -Id $conn.OwningProcess
    Write-Host "Stopped process PID:" $conn.OwningProcess
} else {
    Write-Host "No service is listening on port 17000"
}
```

## 十四、阶段检查点

按以下检查点推进，不需要等待用户逐项确认：

```text
Checkpoint 1：完成架构与附件现状审计
Checkpoint 2：完成统一附件上传和预览闭环
Checkpoint 3：完成受管文件安全边界和 API 测试
Checkpoint 4：完成 Core Agent 附件理解与专项路由
Checkpoint 5：完成 rvc_worker 对话闭环
Checkpoint 6：完成任务取消、超时、错误恢复
Checkpoint 7：完成桌面端、移动端和可访问性 QA
Checkpoint 8：完成真实 GPU RVC 冒烟测试与最终回归
```

每个检查点均更新 `docs/plans/agent-chat-progress.md`。

## 十五、完成标准

只有同时满足以下条件才算完成：

- 用户可在对话页上传并预览主要文件类型；
- 文件通过受管 ID 安全进入 Agent 工具；
- 普通对话保持快速，不无条件启动多 Agent；
- 专项任务在信息充分时才交给对应 Worker；
- RAG 仍由 `knowledge_worker` 严格执行完整流程；
- GPT-SoVITS 仍是角色和对话声音主线；
- 明确 RVC 请求可以通过 `rvc_worker` 完成真实音频生成；
- RVC 结果能在对话中试听、下载；
- 长任务有阶段、已用时、取消、超时和错误反馈；
- 路径、文件和工具权限边界通过测试；
- 桌面端、移动端无关键布局和交互问题；
- 修改过的相关测试全部通过；
- 没有留下调试文字、内部流程说明或作者备注在用户页面。

## 十六、最终汇报格式

最终用中文汇报，并明确区分“事实”“判断”“尚未验证”。内容必须包括：

1. 修改内容；
2. 原问题、直接原因和根本原因；
3. 当前多 Agent 架构与主要调用链；
4. 使用了哪些 Skill；
5. 验证命令和结果；
6. 真实 RVC 测试结果与保留输出路径；
7. 未解决风险、降级实现和需要用户决定的事项；
8. 当前服务 PID；
9. 完整 PowerShell 停止命令。

不要因为时间将近而宣称完成；没有验证的部分必须如实标注。若提前满足全部完成标准，则立即收束，不需要人为延长任务。
