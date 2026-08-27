# Worker 架构分析脚本
import json
from collections import defaultdict

# 解析工具注册表
tools_by_specialist = defaultdict(list)
tool_data = '''
search_persona_knowledge|knowledge|read
web_search|web|read
list_persona_documents|management|read
read_persona_memories|memory|read
save_persona_memory|memory|write|confirm
update_persona_memory|memory|write|confirm
delete_persona_memory|memory|write|confirm
read_workspace_memories|memory|read
list_structured_tables|knowledge|read
query_structured_data|knowledge|read
save_workspace_memory|memory|write|confirm
delete_workspace_memory|memory|write|confirm
add_persona_knowledge|management|write|confirm
rename_persona|management|write|confirm
update_persona_profile|management|write|confirm
delete_persona_document|management|write|confirm
start_voice_clone_session|voice_clone|write|confirm
request_file_upload|voice_clone|read
analyze_voice_material|voice_clone|read
request_training_confirmation|voice_clone|write|confirm
start_voice_training|voice_clone|write|confirm
check_training_progress|voice_clone|read
bind_trained_voice|voice_clone|write|confirm
list_available_configs|config|read
get_config_detail|config|read
request_config_change|config|write|confirm
apply_config_change|config|write|confirm
import_knowledge_from_url|management|write|confirm
export_conversation|management|read
'''

for line in tool_data.strip().split('\n'):
    parts = line.split('|')
    tool_name = parts[0]
    specialist = parts[1]
    operation_type = parts[2]
    requires_confirm = len(parts) > 3 and parts[3] == 'confirm'
    
    tools_by_specialist[specialist].append({
        'name': tool_name,
        'type': operation_type,
        'confirm': requires_confirm
    })

# 输出分析报告
print("=" * 80)
print("YUMENO Worker 工具分配分析报告")
print("=" * 80)

for specialist in sorted(tools_by_specialist.keys()):
    tools = tools_by_specialist[specialist]
    read_tools = [t for t in tools if t['type'] == 'read']
    write_tools = [t for t in tools if t['type'] == 'write']
    confirm_tools = [t for t in tools if t['confirm']]
    
    print(f"\n【{specialist.upper()}】")
    print(f"  总工具数: {len(tools)}")
    print(f"  只读工具: {len(read_tools)}")
    print(f"  写入工具: {len(write_tools)}")
    print(f"  需确认: {len(confirm_tools)}")
    
    if len(tools) == 0:
        print("  ⚠️  警告: 该 Worker 没有任何工具！")
    
    if len(read_tools) == 0 and len(write_tools) > 0:
        print("  ⚠️  警告: 只有写入工具，缺少查询工具")
    
    print(f"  工具列表:")
    for tool in tools:
        flag = "🔒" if tool['confirm'] else "✓"
        print(f"    {flag} {tool['name']} ({tool['type']})")

# conversation worker 分析
print(f"\n【CONVERSATION】")
print(f"  总工具数: 0")
print(f"  ⚠️  警告: 该 Worker 没有任何工具！")
print(f"  说明: conversation worker 应该是纯对话处理，不需要工具")
print(f"  建议: 考虑是否真的需要这个 Worker，或者合并到 Supervisor")

print("\n" + "=" * 80)
print("架构问题总结")
print("=" * 80)

issues = [
    {
        'severity': 'HIGH',
        'issue': 'conversation worker 没有工具，职责不清晰',
        'impact': '增加架构复杂度，但没有实际价值',
        'suggestion': '移除 conversation worker，纯对话由 Supervisor 直接处理'
    },
    {
        'severity': 'MEDIUM',
        'issue': 'Worker 粒度不均匀',
        'impact': 'memory 7个工具，web 只有1个工具，分工不平衡',
        'suggestion': '考虑按业务领域而非技术类型划分 Worker'
    },
    {
        'severity': 'MEDIUM',
        'issue': 'management worker 职责过于宽泛',
        'impact': '包含文档、人设、导入等多种操作，违反单一职责原则',
        'suggestion': '拆分为 document_worker 和 profile_worker'
    },
    {
        'severity': 'LOW',
        'issue': 'web worker 功能单一',
        'impact': '只有一个搜索工具，可能不需要独立 Worker',
        'suggestion': '考虑合并到 knowledge worker 作为知识增强'
    }
]

for i, issue in enumerate(issues, 1):
    print(f"\n{i}. [{issue['severity']}] {issue['issue']}")
    print(f"   影响: {issue['impact']}")
    print(f"   建议: {issue['suggestion']}")

print("\n" + "=" * 80)
