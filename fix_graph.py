import re

with open('agents/workflow.py', 'r', encoding='utf-8') as f:
    content = f.read()

# 更新图构建循环，使用新的 worker 列表
old_loop = r'for worker in \("web", "memory", "management", "conversation", "voice_clone", "config"\):'
new_loop = 'for worker in ("memory", "document", "profile", "voice_clone", "config"):'

content = re.sub(old_loop, new_loop, content)

with open('agents/workflow.py', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated worker loop in graph building')
print('Removed: web, management, conversation')
print('Added: document, profile')
print('Kept: memory, voice_clone, config')
