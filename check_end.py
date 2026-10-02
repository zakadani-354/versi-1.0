with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()
last_200 = content[-200:]
print('Last 200 chars:', repr(last_200))
# Find last } and ;
last_brace = content.rfind('}')
last_semi = content.rfind(';')
print('Last } at index:', last_brace, 'char:', content[last_brace] if last_brace!=-1 else 'none')
print('Last ; at index:', last_semi, 'char:', content[last_semi] if last_semi!=-1 else 'none')
# Check if there's missing closing for app
# Look for pattern after showLogin
idx = content.find('showLogin() {')
if idx != -1:
    print('showLogin() real definition at:', idx)
    snippet = content[idx:idx+400]
    # Find where showLogin ends
    brace_start = snippet.find('{')
    # rough count
    open_c = snippet.count('{')
    close_c = snippet.count('}')
    print('Braces inside showLogin snippet:', open_c, 'open,', close_c, 'close')
