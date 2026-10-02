with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.read().splitlines()
# Show lines 2980-3000
for i in range(2980, 3000):
    if i < len(lines):
        print(i+1, lines[i])
