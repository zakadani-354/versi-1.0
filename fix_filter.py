with open('index.html','r',encoding='utf-8') as f:
    content = f.read()

search = "        this.updateBulkBar('presensi');\n      },\n\n      openModalPresensi(p = null) {"
replace = """        this.updateBulkBar('presensi');

      filterPresensiHistory() {
        if (!this.presensiHistoryList) return;
        const q = (document.getElementById("presensi-history-search").value || "").toLowerCase();
        const filtered = this.presensiHistoryList.filter(p => p.nama.toLowerCase().includes(q));
        this.presensiHistoryList = filtered;
        this.renderPresensiHistory();
        this.updateBulkBar("presensi");
      },

      openModalPresensi(p = null) {"""

if search in content:
    content = content.replace(search, replace)
    with open('index.html','w',encoding='utf-8') as f:
        f.write(content)
    print("OK: filterPresensiHistory ditambahkan")
else:
    print("GAGAL: search tidak ditemukan")
