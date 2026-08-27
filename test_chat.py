import requests
import json
import uuid

# 1. 获取 persona 列表
print("1. 获取 persona 列表...")
response = requests.get("http://127.0.0.1:17000/api/personas")
personas = response.json()
print(f"   找到 {len(personas)} 个 persona")

if not personas:
    print("   没有 persona，无法测试")
    exit(1)

persona_id = personas[0]["id"]
conversation_id = str(uuid.uuid4())
print(f"   使用 persona_id: {persona_id}")
print(f"   使用 conversation_id: {conversation_id}")

# 2. 测试对话流
print("\n2. 测试对话流...")
url = f"http://127.0.0.1:17000/api/personas/{persona_id}/agent/stream"
payload = {
    "question": "你好，请简单介绍一下自己",
    "conversation_id": conversation_id
}

print(f"   POST {url}")

response = requests.post(
    url,
    json=payload,
    headers={"X-YUMENO-Request": "web"},
    stream=True,
    timeout=30
)

print(f"   状态码: {response.status_code}")
print(f"   Content-Type: {response.headers.get('Content-Type')}")

if response.status_code != 200:
    print(f"   错误: {response.text}")
    exit(1)

print("\n3. 读取流事件:")
for line in response.iter_lines(decode_unicode=True):
    if line and line.startswith("data: "):
        data = json.loads(line[6:])
        kind = data.get("kind")
        if kind == "stage":
            print(f"   [阶段] {data.get('stage')}")
        elif kind == "token":
            print(f"   [令牌] {data.get('token')}", end="", flush=True)
        elif kind == "result":
            print(f"\n   [结果] 接收到完整响应")
        elif kind == "done":
            print(f"\n   [完成]")
            break

print("\n✓ 测试完成")