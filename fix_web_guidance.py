import re

with open('agents/workflow.py', 'r', encoding='utf-8') as f:
    content = f.read()

# 更新 web_guidance，从 web 改为 knowledge
old_web_guidance = r'if worker == "web"'
new_web_guidance = 'if worker == "knowledge"'

content = content.replace(old_web_guidance, new_web_guidance)

with open('agents/workflow.py', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated web_guidance condition from web to knowledge')
