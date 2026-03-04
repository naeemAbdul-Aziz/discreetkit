import sys

path = r'c:\Users\naeemaziz\Desktop\discreetkit\src\lib\admin-actions.ts'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# We want to identify the export async function getProductRequests that is duplicated
# Let's count them
count = content.count('export async function getProductRequests')
print(f"Found {count} occurrences of getProductRequests")

# Let's replace the last one specifically from "// --- Product Requests Management ---" to the end of the file.
start_marker = "// --- Product Requests Management ---"
if count > 1 and start_marker in content:
    idx = content.rfind(start_marker)
    if idx != -1:
        new_content = content[:idx]
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Truncated file at last Product Requests Management marker.")
else:
    print("Could not find the duplicate or marker.")
