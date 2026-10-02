with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

count = content.count('\\n')
print('Before fix:', count)

# Replace literal two-char backslash+n with actual newline
content_fixed = content.replace('\\n', '\n')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content_fixed)

print('Done replacing. Check again...')
with open('index.html', 'r', encoding='utf-8') as f:
    content2 = f.read()
print('After fix:', content2.count('\\n'))
