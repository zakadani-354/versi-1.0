with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.read().splitlines()
# Find showLogin definition line
start = None
for i, line in enumerate(lines):
    if 'showLogin()' in line and '{' in line:
        start = i
        break
print('showLogin starts at line', start+1)
# Print from start to start+30
for i in range(start, min(start+35, len(lines))):
    print(i+1, lines[i])
# Count braces in this block until we see next method or end
open_c = 0
close_c = 0
for i in range(start, min(start+100, len(lines))):
    open_c += lines[i].count('{')
    close_c += lines[i].count('}')
    print(i+1, 'open=', open_c, 'close=', close_c, '|', lines[i][:80])
    if open_c == close_c and open_c > 0:
        print('Balanced at line', i+1)
        break
else:
    print('Not balanced in first 100 lines after start')
