# YUMENO 部署方案

> 根据你的使用场景，选择最适合的部署方式

---

## 📋 三种部署方案对比

| 维度 | 云端版 | 标准版（推荐） | 离线版 |
|------|--------|---------------|--------|
| **体积** | 50MB | 500MB | 3GB |
| **部署时间** | 5 分钟 | 15 分钟 | 30 分钟 |
| **LLM** | OpenAI/DashScope API | 云端 API 或本地 Ollama | 本地 Ollama/Llama |
| **Embedding** | OpenAI API | 云端 API（推荐） | 本地 HuggingFace 模型 |
| **TTS** | Edge TTS（系统） | GPT-SoVITS | GPT-SoVITS |
| **语音克隆** | ❌ 不支持 | ✅ 5 步自动化 | ✅ 5 步自动化 |
| **Reranker** | ❌ 无 | ✅ 本地模型 | ✅ 本地模型 |
| **网络需求** | 必须联网 | 可离线（LLM 用本地） | 完全离线 |
| **适用场景** | 快速试用、轻度使用 | 开发者、小团队 | 企业内网、强监管 |

---

## ⚡ 方案 1：云端版（快速体验）

### 适用人群
- 首次体验 YUMENO
- 个人轻量使用
- 不需要语音克隆功能

### 安装步骤

#### Windows
```bash
# 1. 下载安装包
https://github.com/TKGEKKOU/yumeno/releases/download/v0.2.0/YUMENO-Lite-Setup.exe

# 2. 运行安装向导（一键安装）

# 3. 配置 API Key
# 打开 http://127.0.0.1:17000/settings
# 填入 OpenAI API Key 或 DashScope API Key
```

#### macOS/Linux
```bash
# 1. 克隆仓库
git clone https://github.com/TKGEKKOU/yumeno.git
cd yumeno

# 2. 安装依赖（仅核心包）
pip install -r requirements-lite.txt

# 3. 启动服务
python main.py

# 4. 访问 http://127.0.0.1:17000
```

### 配置说明

**必填配置（.env）**：
```env
# LLM 配置（二选一）
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-xxx
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini

# 或使用 DashScope
LLM_PROVIDER=dashscope
DASHSCOPE_API_KEY=sk-xxx
DASHSCOPE_MODEL=qwen-plus

# Embedding 配置
EMBEDDING_PROVIDER=openai
OPENAI_API_KEY=sk-xxx
```

### 功能限制
- ❌ 无语音克隆
- ❌ 无本地 Reranker（召回质量略低）
- ⚠️ 依赖网络（需访问云端 API）

---

## 🔧 方案 2：标准版（推荐）

### 适用人群
- 开发者、技术爱好者
- 需要语音克隆功能
- 小团队内部使用

### 安装步骤

#### 自动安装（推荐）
```bash
# 1. 下载完整安装包（含 GPT-SoVITS）
https://github.com/TKGEKKOU/yumeno/releases/download/v0.2.0/YUMENO-Full-Setup.exe

# 2. 安装过程会自动下载：
#    - GPT-SoVITS 模型（350MB）
#    - Reranker 模型（100MB）

# 3. 首次启动会初始化（约 2 分钟）
```

#### 手动安装
```bash
# 1. 克隆仓库
git clone https://github.com/TKGEKKOU/yumeno.git
cd yumeno

# 2. 安装完整依赖
pip install -r requirements.txt

# 3. 下载 GPT-SoVITS 模型
python scripts/download_models.py --component gpt-sovits

# 4. 下载 Reranker 模型
python scripts/download_models.py --component reranker

# 5. 启动服务
python main.py
```

### 配置建议

**混合模式（推荐）**：
```env
# LLM：云端（快速响应）
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-xxx
OPENAI_MODEL=gpt-4o-mini

# Embedding：云端（高质量）
EMBEDDING_PROVIDER=openai

# TTS：本地 GPT-SoVITS（语音克隆）
TTS_PROVIDER=gpt_sovits
GPT_SOVITS_BASE_URL=http://127.0.0.1:9880

# Reranker：本地（免费）
RAG_RERANKER=local
LOCAL_RERANKER_MODEL=BAAI/bge-reranker-base
```

### 核心功能
- ✅ 完整 RAG 功能（Reranker 提升召回质量）
- ✅ 语音克隆（5 步自动化）
- ✅ 配置管理（运行时修改参数）
- ✅ 可离线（LLM 切换到本地 Ollama）

---

## 🏢 方案 3：离线版（企业部署）

### 适用场景
- 金融、医疗、政府等强监管行业
- 企业内网完全隔离外网
- 数据安全要求极高

### Docker Compose 部署

```bash
# 1. 克隆仓库
git clone https://github.com/TKGEKKOU/yumeno.git
cd yumeno

# 2. 下载完整模型（一次性）
./scripts/download_all_models.sh

# 3. 启动全栈服务
docker-compose -f docker-compose.full.yml up -d

# 服务说明：
# - app: YUMENO 主应用（端口 17000）
# - milvus: 向量数据库（端口 19530）
# - ollama: 本地 LLM（端口 11434）
# - gpt-sovits: 语音服务（端口 9880）
```

### 完全离线配置

```env
# LLM：本地 Ollama
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_MODEL=qwen2.5:14b

# Embedding：本地模型
EMBEDDING_PROVIDER=local
LOCAL_EMBEDDING_MODEL=BAAI/bge-large-zh-v1.5
EMBEDDING_DIMENSIONS=1024

# TTS：本地 GPT-SoVITS
TTS_PROVIDER=gpt_sovits
GPT_SOVITS_BASE_URL=http://gpt-sovits:9880

# Reranker：本地
RAG_RERANKER=local
LOCAL_RERANKER_MODEL=BAAI/bge-reranker-base

# 向量库：本地 Milvus
MILVUS_URI=http://standalone:19530
```

### 性能参考

**硬件要求**：
- CPU: 8 核及以上
- 内存: 32GB 及以上
- 显卡: NVIDIA GPU（8GB+ 显存，可选）
- 存储: 100GB 可用空间

**性能指标**（Intel i7-12700 + 32GB RAM）：
- RAG 召回延迟: P50 = 800ms, P95 = 2.3s
- LLM 生成速度: 15 tokens/s（Qwen2.5-14B CPU）
- 语音克隆训练: 3-5 分钟

---

## 🔄 方案切换

### 从云端版升级到标准版

```bash
# 1. 安装额外依赖
pip install gpt-sovits reranker

# 2. 下载模型
python scripts/download_models.py --component gpt-sovits reranker

# 3. 修改 .env 配置
TTS_PROVIDER=gpt_sovits
RAG_RERANKER=local

# 4. 重启服务
```

### 从标准版切换到离线版

```bash
# 1. 安装 Ollama
curl -fsSL https://ollama.com/install.sh | sh

# 2. 下载本地 LLM
ollama pull qwen2.5:14b

# 3. 下载本地 Embedding 模型
python scripts/download_models.py --component embedding

# 4. 修改 .env 配置
LLM_PROVIDER=ollama
EMBEDDING_PROVIDER=local

# 5. 重启服务
```

---

## 📊 成本对比

### 云端版
- 初始成本: $0（使用自己的 API Key）
- 月度成本: 约 $10-50（取决于使用量）
- 适合：轻度使用、预算有限

### 标准版
- 初始成本: $0
- 月度成本: 约 $5-20（LLM 调 API，TTS/Reranker 本地）
- 适合：日常使用、性价比高

### 离线版
- 初始成本: 服务器硬件成本
- 月度成本: $0（完全本地）
- 适合：大量使用、数据敏感

---

## 🆘 常见问题

### Q: 语音克隆需要什么配置？
A: 标准版及以上，需要 GPT-SoVITS（350MB）。建议 8GB+ 内存。

### Q: 可以混合部署吗？
A: 可以！推荐：LLM 云端 + Embedding 云端 + TTS 本地 + Reranker 本地。

### Q: 内网部署如何更新？
A: 在有网环境下载模型和代码，打包后传入内网。

### Q: 需要 GPU 吗？
A: 非必须。CPU 可运行，GPU 加速（推理速度提升 3-5 倍）。

---

## 📞 技术支持

- GitHub Issues: https://github.com/TKGEKKOU/yumeno/issues
- 文档: https://github.com/TKGEKKOU/yumeno/blob/main/README.md
- 示例配置: `config/examples/`
