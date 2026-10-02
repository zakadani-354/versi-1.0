with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Check login view exists and form exists
print('1. view-login exists:', 'id="view-login"' in content)
print('2. form-login exists:', 'id="form-login"' in content)

# 2. Check init exists
print('3. init() exists:', 'async init()' in content)

# 3. Check showLogin exists and is intact (find snippet)
idx = content.find('showLogin()')
if idx != -1:
    snippet = content[idx:idx+300]
    print('4. showLogin snippet start:', snippet[:200])

# 4. Check for any remaining literal \n inside JS strings (should be 0 globally)
print('5. Literal backslash-n remaining:', content.count('\\n'))

# 5. Check brace balance in the big app block
start_app = content.find('const app = {')
# find the matching end - hard, instead just check that last }; exists
print('6. Closing }; exists:', content.rstrip().endswith('};'))

# 6. Check for broken HTML tags near dropdown (must have closing >)
lines = content.splitlines()
for i, line in enumerate(lines):
    if 'presensi-history-search' in line and '<select' in line:
        # Check that this line has closing tag
        print('7. Dropdown line:', i+1, 'ends with >?', line.rstrip().endswith('>'))
        # Print next 2 lines
        for j in range(i+1, min(i+3, len(lines))):
            print('   ', j+1, lines[j][:100])
