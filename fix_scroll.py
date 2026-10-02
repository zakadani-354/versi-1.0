with open('index.html','r',encoding='utf-8') as f: c=f.read()
old = "          viewCapaian.classList.remove('hidden');\n          this.loadEvaluasiMode();"
new = "          viewCapaian.classList.remove('hidden');\n          viewCapaian.scrollIntoView({behavior:\"smooth\",block:\"start\"});\n          this.loadEvaluasiMode();"
if old in c:
    c = c.replace(old, new)
    with open('index.html','w',encoding='utf-8') as f: f.write(c)
    print("Scroll capaian added")
else:
    print("Pattern not found")
