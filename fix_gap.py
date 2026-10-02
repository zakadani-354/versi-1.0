with open('index.html','r',encoding='utf-8') as f:
    c = f.read()
old = '<section id="tab-target" class="tab-pane hidden space-y-6">'
new = '<section id="tab-target" class="tab-pane hidden space-y-2">'
if old in c:
    c = c.replace(old, new)
    with open('index.html','w',encoding='utf-8') as f:
        f.write(c)
    print('Fixed white gap in tab-target')
else:
    print('Pattern not found')
