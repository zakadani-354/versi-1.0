// Read the file
const fs = require('fs');

const filePath = 'index.html';
const content = fs.readFileSync(filePath, 'utf8');

// Find the exact location
const searchText = `        this.updateBulkBar('presensi');
      },

      openModalPresensi(p = null) {`;

const replacementText = `        this.updateBulkBar('presensi');

      filterPresensiHistory() {
        if (!this.presensiHistoryList) return;
        const q = (document.getElementById("presensi-history-search").value || "").toLowerCase();
        const filtered = this.presensiHistoryList.filter(p => p.nama.toLowerCase().includes(q));
        this.presensiHistoryList = filtered;
        this.renderPresensiHistory();
        this.updateBulkBar("presensi");
      },

      openModalPresensi(p = null) {`;

if (!content.includes(searchText)) {
  console.log('Search text not found');
  console.log('Search text:', JSON.stringify(searchText));
  console.log('Actual text around line 2955-2958:');
  const lines = content.split('\n');
  for (let i = 2950; i < 2970; i++) {
    console.log(i + 1, '|', lines[i]);
  }
  process.exit(1);
}

const newContent = content.replace(searchText, replacementText);

// Write the file
fs.writeFileSync(filePath, newContent, 'utf8');
console.log('Added filterPresensiHistory function');