# Create a script file to edit the HTML
$files = Get-Content "index.html" -Raw

# Find the exact location where we want to insert the function
$searchText = @"
        this.updateBulkBar('presensi');
      },

      openModalPresensi(p = null) {
"@"

$replacementText = @"
        this.updateBulkBar('presensi');

      filterPresensiHistory() {
        if (!this.presensiHistoryList) return;
        const q = (document.getElementById(""presensi-history-search"").value || """).toLowerCase();
        const filtered = this.presensiHistoryList.filter(p => p.nama.toLowerCase().includes(q));
        this.presensiHistoryList = filtered;
        this.renderPresensiHistory();
        this.updateBulkBar(""presensi"");
      },

      openModalPresensi(p = null) {
"@"

# Use the Replace method with proper escaping
$newContent = $files.Replace($searchText, $replacementText)

# Write back to the file
Set-Content -Path "index.html" -Value $newContent -Encoding UTF8 -NoNewline

Write-Host "Added filterPresensiHistory function"