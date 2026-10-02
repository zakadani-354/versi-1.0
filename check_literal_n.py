with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

count = content.count('\\n')
print('Literal \\\\n count:', count)

if count > 0:
    idx = content.find('\\n')
    snippet = content[max(0, idx-30):idx+30]
    print('Snippet:', snippet)
    # Replace all literal \n with real newline
    fixed = content.replace('\\n', '\n')
    with open('index.html', 'w', encoding='utf-8') as f2:
        f2.write(fixed)
    print('Fixed by replacing literal backslash-n with real newline.')
else:
    print('No literal backslash-n found.')

# Also check for \r
count_r = content.count('\\r')
print('Literal \\\\r count:', count_r)
