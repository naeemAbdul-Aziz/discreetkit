
import os

filepath = 'src/lib/admin-actions.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
found = False
skipping = False
brace_count = 0

for line in lines:
    if 'export async function getProductRequests()' in line:
        if found:
            print(f"Found duplicate at line {len(new_lines) + 1}")
            skipping = True
            brace_count = 0
            continue
        else:
            found = True
    
    if skipping:
        brace_count += line.count('{')
        brace_count -= line.count('}')
        if brace_count == 0 and '}' in line:
            skipping = False
        continue
    
    new_lines.append(line)

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
print("Done")
