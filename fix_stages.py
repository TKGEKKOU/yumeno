import re

with open('agents/workflow.py', 'r', encoding='utf-8') as f:
    content = f.read()

# 更新 handoff 函数中的 stage_names
old_stage_names = r'stage_names = \{[^}]+\}'

new_stage_names = '''stage_names = {
                "knowledge": "正在检索知识库",
                "memory": "正在查询记忆",
                "document": "正在管理文档",
                "profile": "正在管理人设",
                "voice_clone": "正在克隆语音",
                "config": "正在修改配置",
            }'''

content = re.sub(old_stage_names, new_stage_names, content, count=1)

# 更新 finalize 函数中的 complete_names
old_complete_names = r'complete_names = \{[^}]+\}'

new_complete_names = '''complete_names = {
                "knowledge": "知识检索完成",
                "memory": "记忆查询完成",
                "document": "文档管理完成",
                "profile": "人设管理完成",
                "voice_clone": "语音克隆完成",
                "config": "配置修改完成",
            }'''

content = re.sub(old_complete_names, new_complete_names, content, count=1)

with open('agents/workflow.py', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated stage notifications')
