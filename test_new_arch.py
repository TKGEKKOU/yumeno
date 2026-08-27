import requests
import json

print("Testing new Worker architecture...")

# 1. 获取 persona
response = requests.get("http://127.0.0.1:17000/api/personas")
personas = response.json()
if not personas:
    print("No personas found")
    exit(1)

persona_id = personas[0]["id"]
print(f"Using persona: {persona_id}")

# 2. 测试对话 - 应该直接由 supervisor 处理
print("\n[Test 1] Simple conversation (no worker needed)")
response = requests.post(
    f"http://127.0.0.1:17000/api/personas/{persona_id}/agent/stream",
    json={"question": "你好", "conversation_id": "test1"},
    headers={"X-YUMENO-Request": "web"},
    stream=True,
    timeout=30
)

stage_count = 0
for line in response.iter_lines(decode_unicode=True):
    if line and line.startswith("data: "):
        data = json.loads(line[6:])
        if data.get("kind") == "stage":
            stage_count += 1
            print(f"  Stage: {data.get('stage')}")
        elif data.get("kind") == "done":
            break

print(f"  Total stages: {stage_count}")

# 3. 测试知识检索 - 应该调用 knowledge_worker
print("\n[Test 2] Knowledge retrieval (should use knowledge_worker)")
response = requests.post(
    f"http://127.0.0.1:17000/api/personas/{persona_id}/agent/stream",
    json={"question": "我的文档里有什么内容？", "conversation_id": "test2"},
    headers={"X-YUMENO-Request": "web"},
    stream=True,
    timeout=30
)

stages = []
for line in response.iter_lines(decode_unicode=True):
    if line and line.startswith("data: "):
        data = json.loads(line[6:])
        if data.get("kind") == "stage":
            stages.append(data.get('stage'))
            print(f"  Stage: {data.get('stage')}")
        elif data.get("kind") == "done":
            break

if "正在检索知识库" in stages:
    print("  ✓ Knowledge worker invoked correctly")
else:
    print("  ✗ Knowledge worker NOT invoked")

print("\n✓ Architecture test complete")
