with open('agents/workflow.py', 'r', encoding='utf-8') as f:
    content = f.read()

# 修复函数定义和 duties 在同一行的问题
content = content.replace(
    'def _worker_prompt(worker: Worker, context: PersonaAgentContext) -> str:    duties = {',
    'def _worker_prompt(worker: Worker, context: PersonaAgentContext) -> str:\n    duties = {'
)

with open('agents/workflow.py', 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed function definition')
