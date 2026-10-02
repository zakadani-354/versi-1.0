with open('index.html','r',encoding='utf-8') as f:
    content = f.read()
content = content.replace("        this.updateBulkBar('presensi');\n\n      filterPresensiHistory() {", "        this.updateBulkBar('presensi');\n      },\n\n      filterPresensiHistory() {")
with open('index.html','w',encoding='utf-8') as f:
    f.write(content)
print("Fixed syntax error at line 2957")
