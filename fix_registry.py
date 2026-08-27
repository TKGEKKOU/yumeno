import re

with open('agents/registry.py', 'r', encoding='utf-8') as f:
    content = f.read()

# 更新工具的 specialist 分配
# web_search: web -> knowledge
content = content.replace(
    'ToolSpec("web_search", "web"',
    'ToolSpec("web_search", "knowledge"'
)

# import_knowledge_from_url: management -> knowledge  
content = content.replace(
    'ToolSpec("import_knowledge_from_url", "management"',
    'ToolSpec("import_knowledge_from_url", "knowledge"'
)

# 文档管理工具: management -> document
content = content.replace(
    'ToolSpec("list_persona_documents", "management"',
    'ToolSpec("list_persona_documents", "document"'
)
content = content.replace(
    'ToolSpec("add_persona_knowledge", "management"',
    'ToolSpec("add_persona_knowledge", "document"'
)
content = content.replace(
    'ToolSpec("delete_persona_document", "management"',
    'ToolSpec("delete_persona_document", "document"'
)

# 人设管理工具: management -> profile
content = content.replace(
    'ToolSpec("rename_persona", "management"',
    'ToolSpec("rename_persona", "profile"'
)
content = content.replace(
    'ToolSpec("update_persona_profile", "management"',
    'ToolSpec("update_persona_profile", "profile"'
)
content = content.replace(
    'ToolSpec("export_conversation", "management"',
    'ToolSpec("export_conversation", "profile"'
)

with open('agents/registry.py', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated tool specialist assignments in registry.py')
print('Changes:')
print('  - web_search: web -> knowledge')
print('  - import_knowledge_from_url: management -> knowledge')
print('  - list_persona_documents: management -> document')
print('  - add_persona_knowledge: management -> document')
print('  - delete_persona_document: management -> document')
print('  - rename_persona: management -> profile')
print('  - update_persona_profile: management -> profile')
print('  - export_conversation: management -> profile')
