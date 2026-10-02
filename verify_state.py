with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()
print('Dropdown HTML ok:', 'select id="presensi-history-search"' in c)
print('Literal \\n left:', c.count('\\n'))
lines = c.splitlines()
for i in range(824, 830):
    print(i+1, lines[i][:120])
