with open('agents/workflow.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 找到并修复 handoff_format 的缩进
for i, line in enumerate(lines):
    if 'handoff_format = (' in line and not line.startswith('    '):
        # 添加正确的缩进
        lines[i] = '    ' + line.lstrip()
        # 修复后续行的缩进
        j = i + 1
        while j < len(lines) and lines[j].strip() and not lines[j].strip().startswith(')'):
            if not lines[j].startswith('        '):
                lines[j] = '        ' + lines[j].lstrip()
            j += 1
        if j < len(lines) and lines[j].strip() == ')':
            lines[j] = '    )\n'
        break

with open('agents/workflow.py', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print('Fixed indentation')
