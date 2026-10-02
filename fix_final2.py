with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

old = """      filterPresensiHistory() {
        if (!this.presensiHistoryList) return;
        const q = (document.getElementById(\"presensi-history-search\").value || \"\").toLowerCase();
        const filtered = this.presensiHistoryList.filter(p => p.nama.toLowerCase().includes(q));
        this.presensiHistoryList = filtered;
        this.renderPresensiHistory();
        this.updateBulkBar(\"presensi\");
      },"""

new = """      filterPresensiHistory() {
        if (!this.presensiHistoryAll) return;
        const val = document.getElementById(\"presensi-history-search\").value || \"ALL\";
        let filtered = this.presensiHistoryAll;
        if (val && val !== \"ALL\") {
          filtered = filtered.filter(p => p.nama === val);
        }
        this.presensiHistoryList = filtered;
        this.renderPresensiHistory();
        this.updateBulkBar(\"presensi\");
      },

      updatePresensiHistoryFilter() {
        const sel = document.getElementById(\"presensi-history-search\");
        if (!sel || !this.presensiHistoryAll) return;
        const current = sel.value || \"ALL\";
        const names = [...new Set(this.presensiHistoryAll.map(p => p.nama))].sort();
        let html = '<option value=\"ALL\">Semua Santri</option>';
        for (let i = 0; i < names.length; i++) {
          const n = names[i];
          const selected = n === current ? ' selected' : '';
          html += '<option value=\"' + n.replace(/\"/g, '&quot;') + '\"' + selected + '>' + n + '</option>';
        }
        sel.innerHTML = html;
      },"""

if old in content:
    content = content.replace(old, new)
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Replaced OK')
else:
    print('Not found')
