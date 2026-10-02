with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

old_text = "      filterPresensiHistory() {\r\n        if (!this.presensiHistoryList) return;\r\n        const q = (document.getElementById(\"presensi-history-search\").value || \"\").toLowerCase();\r\n        const filtered = this.presensiHistoryList.filter(p => p.nama.toLowerCase().includes(q));\r\n        this.presensiHistoryList = filtered;\r\n        this.renderPresensiHistory();\r\n        this.updateBulkBar(\"presensi\");\r\n      },"

new_text = "      filterPresensiHistory() {\r\n        if (!this.presensiHistoryAll) return;\r\n        const val = document.getElementById(\"presensi-history-search\").value || \"ALL\";\r\n        let filtered = this.presensiHistoryAll;\r\n        if (val && val !== \"ALL\") {\r\n          filtered = filtered.filter(p => p.nama === val);\r\n        }\r\n        this.presensiHistoryList = filtered;\r\n        this.renderPresensiHistory();\r\n        this.updateBulkBar(\"presensi\");\r\n      },\r\n\r\n      updatePresensiHistoryFilter() {\r\n        const sel = document.getElementById(\"presensi-history-search\");\r\n        if (!sel || !this.presensiHistoryAll) return;\r\n        const current = sel.value || \"ALL\";\r\n        const names = [...new Set(this.presensiHistoryAll.map(p => p.nama))].sort();\r\n        let html = '<option value=\"ALL\">Semua Santri</option>';\r\n        names.forEach(n => {\r\n          html += '<option value=\"' + n.replace(/\"/g, \"&quot;\") + '\"' + (n === current ? ' selected' : '') + '>' + n + '</option>';\r\n        });\r\n        sel.innerHTML = html;\r\n      },"

content = content.replace(old_text, new_text)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done')
