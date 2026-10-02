with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.read().splitlines()
for i in range(2980, 2995):
    print(i+1, lines[i])
