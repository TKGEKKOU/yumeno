import re

with open('agents/workflow.py', 'r', encoding='utf-8') as f:
    content = f.read()

# 找到 duties 字典的位置并替换
pattern = r'(\s+)duties = \{[^}]+\}'

new_duties = '''    duties = {
        "knowledge": (
            "Retrieve the active persona's uploaded knowledge, search current web information, "
            "or import knowledge from URLs. For structured data queries over CSV/XLSX, "
            "list tables first and use query_structured_data with physical column names."
        ),
        "memory": "Read or maintain only the active persona's user memory (both persona-specific and workspace-wide).",
        "document": "Inspect or manage only the active persona's knowledge documents and uploaded files.",
        "profile": "Inspect or modify only the active persona's profile, name, and export conversations.",
        "voice_clone": "Manage voice cloning workflows including material analysis, training coordination, and voice profile binding.",
        "config": "Inspect and modify system configuration settings after user confirmation.",
    }'''

content = re.sub(pattern, new_duties, content, count=1, flags=re.DOTALL)

with open('agents/workflow.py', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated duties dictionary in workflow.py')
