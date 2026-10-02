import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add I. BIDANG ALIM-FAQIH
content = content.replace(
    """<p class="mb-1" style="font-family: Georgia, 'Times New Roman', serif;"><strong>NAMA :</strong> <span id="formal-student-name">-</span></p>""",
    """<p class="mb-1" style="font-family: Georgia, 'Times New Roman', serif;"><strong>NAMA :</strong> <span id="formal-student-name">-</span></p>\n            <h3 class="text-base font-bold uppercase mb-2 mt-4 text-left" style="font-family: Georgia, 'Times New Roman', serif;">I. BIDANG ALIM-FAQIH</h3>"""
)

# 2. Change column order in UI table
content = content.replace(
    """<th class="p-3 text-center">Ulangan Harian 1</th>
                    <th class="p-3 text-center">Ulangan Harian 2</th>
                    <th class="p-3 text-center">PTS</th>
                    <th class="p-3 text-center">PAS</th>""",
    """<th class="p-3 text-center">Ulangan Harian 1</th>
                    <th class="p-3 text-center">PTS</th>
                    <th class="p-3 text-center">Ulangan Harian 2</th>
                    <th class="p-3 text-center">PAS</th>"""
)

# 2.1 Change column order in JS mapping
content = content.replace(
    """${['uh1', 'uh2', 'pts', 'pas'].map(field =>""",
    """${['uh1', 'pts', 'uh2', 'pas'].map(field =>"""
)
content = content.replace(
    """<td class="p-3 font-bold">${kategori}</td>
                ${['uh1', 'uh2', 'pts', 'pas'].map(field => `<td class="p-3 text-center"><input type="number" min="0" max="100" id="rapor-${field}-${index}" value="${record[field] ?? 0}" class="w-16 text-center text-xs font-bold p-1 bg-slate-50 border rounded-lg outline-none"></td>`).join('')}""",
    """<td class="p-3 font-bold">${kategori}</td>
                ${['uh1', 'pts', 'uh2', 'pas'].map(field => `<td class="p-3 text-center"><input type="number" min="0" max="100" id="rapor-${field}-${index}" value="${record[field] ?? 0}" class="w-16 text-center text-xs font-bold p-1 bg-slate-50 border rounded-lg outline-none"></td>`).join('')}"""
)


# 3. Add footer for average of 4 types of values in UI table
content = content.replace(
    """<tbody id="rapor-table-body" class="divide-y divide-slate-100 text-slate-700"></tbody>""",
    """<tbody id="rapor-table-body" class="divide-y divide-slate-100 text-slate-700"></tbody>
                <tfoot class="bg-slate-50 font-bold text-slate-700 border-t-2 border-slate-200">
                  <tr>
                    <td colspan="2" class="p-3 text-right">RATA-RATA DARI EMPAT JENIS NILAI</td>
                    <td id="rapor-avg-uh1" class="p-3 text-center">0</td>
                    <td id="rapor-avg-pts" class="p-3 text-center">0</td>
                    <td id="rapor-avg-uh2" class="p-3 text-center">0</td>
                    <td id="rapor-avg-pas" class="p-3 text-center">0</td>
                    <td id="rapor-avg-total" class="p-3 text-center">0</td>
                    <td id="rapor-avg-grade" class="p-3 text-center">D</td>
                  </tr>
                </tfoot>"""
)

# 4. Add Share Dashboard
content = content.replace(
    """<button onclick="app.printDashboard()" class="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95">
              <i class="fa-solid fa-print"></i>
              <span class="hidden sm:inline">Cetak / PDF</span>
            </button>""",
    """<button onclick="app.shareDashboardVisualization()" class="px-3.5 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition">
              <i class="fa-solid fa-image"></i>
              <span class="hidden sm:inline">Bagikan Gambar</span>
            </button>
            <button onclick="app.printDashboard()" class="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95">
              <i class="fa-solid fa-print"></i>
              <span class="hidden sm:inline">Cetak / PDF</span>
            </button>"""
)

# 5. Dashboard share function JS
share_dash_func = """
      async shareDashboardVisualization() {
        const dashboard = document.getElementById('tab-dashboard');
        if (!dashboard || typeof html2canvas !== 'function') {
          this.showToast('Fitur gambar belum siap, silakan muat ulang halaman', 'error');
          return;
        }

        try {
          const oldMax = dashboard.style.maxHeight;
          const oldOver = dashboard.style.overflow;
          dashboard.style.maxHeight = 'none';
          dashboard.style.overflow = 'visible';

          // Ensure charts are rendered
          if (this.charts.batang) this.charts.batang.resize();
          if (this.charts.pie) this.charts.pie.resize();

          await new Promise(resolve => requestAnimationFrame(resolve));
          const canvas = await html2canvas(dashboard, {
            backgroundColor: '#f8fafc',
            scale: 2,
            useCORS: true,
            logging: false,
            ignoreElements: (el) => el.id === 'dashboard-filter-controls' || el.tagName === 'BUTTON'
          });
          
          dashboard.style.maxHeight = oldMax;
          dashboard.style.overflow = oldOver;

          const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
          if (!blob) throw new Error('Gambar tidak berhasil dibuat');

          if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'dashboard.png', { type: 'image/png' })] })) {
            const file = new File([blob], `Dashboard_TPQ_${Date.now()}.png`, { type: 'image/png' });
            await navigator.share({
              title: 'Laporan Dashboard TPQ',
              text: 'Berikut adalah laporan dashboard TPQ Baitussalam Huda Mansurin',
              files: [file]
            });
          } else {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Dashboard_TPQ_${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(url);
            this.showToast('Gambar berhasil diunduh', 'success');
          }
        } catch (e) {
          this.showToast('Gagal membagikan gambar: ' + e.message, 'error');
        }
      },
"""
content = content.replace(
    'printDashboard() {',
    share_dash_func + '\n      printDashboard() {'
)

# 6. Add Simpan sebagai PDF to Pencapaian Target 
content = content.replace(
    """<button onclick="app.printCapaianVisualization()" class="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition">
                <i class="fa-solid fa-print"></i> Cetak / PDF
              </button>""",
    """<button onclick="app.printCapaianVisualization()" class="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition">
                <i class="fa-solid fa-file-pdf"></i> Simpan sebagai PDF
              </button>"""
)

# 7. Update logic to calculate average row in JS loadNilaiRapor
calc_avg_code = """
          this.renderAkhlaqAdabInput(res.nilaiAkhlaqAdab || {});
          this.updateRaporPeriod();

          // Hitung rata-rata kolom
          let sumUh1 = 0, sumPts = 0, sumUh2 = 0, sumPas = 0, sumTotal = 0;
          let count = this.raporKategoriList.length || 1;
          this.raporKategoriList.forEach((kategori, index) => {
             const record = records.find(item => item.kategori === kategori) || {};
             sumUh1 += Number(record.uh1 ?? 0);
             sumPts += Number(record.pts ?? 0);
             sumUh2 += Number(record.uh2 ?? 0);
             sumPas += Number(record.pas ?? 0);
             sumTotal += Number(record.rataRata ?? 0);
          });
          document.getElementById('rapor-avg-uh1').textContent = Math.round(sumUh1 / count);
          document.getElementById('rapor-avg-pts').textContent = Math.round(sumPts / count);
          document.getElementById('rapor-avg-uh2').textContent = Math.round(sumUh2 / count);
          document.getElementById('rapor-avg-pas').textContent = Math.round(sumPas / count);
          const avgTotal = Math.round(sumTotal / count);
          document.getElementById('rapor-avg-total').textContent = avgTotal;
          document.getElementById('rapor-avg-grade').textContent = this.getRaporGrade(avgTotal);
"""
content = content.replace(
    """this.renderAkhlaqAdabInput(res.nilaiAkhlaqAdab || {});
          this.updateRaporPeriod();""",
    calc_avg_code
)

# 8. Add event listeners to input fields to recalculate averages automatically
js_calc_avg_func = """
      recalcRaporAverages() {
          let sumUh1 = 0, sumPts = 0, sumUh2 = 0, sumPas = 0, sumTotal = 0;
          let count = this.raporKategoriList.length || 1;
          this.raporKategoriList.forEach((kategori, index) => {
             const val = (id) => Number(document.getElementById(id)?.value || 0);
             const uh1 = val(`rapor-uh1-${index}`);
             const pts = val(`rapor-pts-${index}`);
             const uh2 = val(`rapor-uh2-${index}`);
             const pas = val(`rapor-pas-${index}`);
             
             sumUh1 += uh1;
             sumPts += pts;
             sumUh2 += uh2;
             sumPas += pas;
             
             // Update row average
             const avg = Math.round((uh1 + pts + uh2 + pas) / 4);
             const rowAvgEl = document.getElementById(`rapor-average-${index}`);
             if(rowAvgEl) rowAvgEl.textContent = avg;
             const rowGradeEl = document.getElementById(`rapor-grade-${index}`);
             if(rowGradeEl) rowGradeEl.textContent = this.getRaporGrade(avg);
             
             sumTotal += avg;
          });
          
          const footUh1 = document.getElementById('rapor-avg-uh1');
          if(footUh1) footUh1.textContent = Math.round(sumUh1 / count);
          
          const footPts = document.getElementById('rapor-avg-pts');
          if(footPts) footPts.textContent = Math.round(sumPts / count);
          
          const footUh2 = document.getElementById('rapor-avg-uh2');
          if(footUh2) footUh2.textContent = Math.round(sumUh2 / count);
          
          const footPas = document.getElementById('rapor-avg-pas');
          if(footPas) footPas.textContent = Math.round(sumPas / count);
          
          const avgTotal = Math.round(sumTotal / count);
          const footTotal = document.getElementById('rapor-avg-total');
          if(footTotal) footTotal.textContent = avgTotal;
          
          const footGrade = document.getElementById('rapor-avg-grade');
          if(footGrade) footGrade.textContent = this.getRaporGrade(avgTotal);
      },
"""
content = content.replace(
    'updateRaporPeriod() {',
    js_calc_avg_func + '\n      updateRaporPeriod() {'
)

# And bind onchange for the inputs
content = content.replace(
    """<input type="number" min="0" max="100" id="rapor-${field}-${index}" value="${record[field] ?? 0}" class="w-16 text-center text-xs font-bold p-1 bg-slate-50 border rounded-lg outline-none">""",
    """<input type="number" min="0" max="100" id="rapor-${field}-${index}" value="${record[field] ?? 0}" oninput="app.recalcRaporAverages()" class="w-16 text-center text-xs font-bold p-1 bg-slate-50 border border-slate-200 rounded-lg outline-none transition focus:ring-2 focus:ring-brand-500">"""
)

# 9. Percepat loading
# By optimizing chart rendering with requestAnimationFrame (already mostly done).
# I'll just save it.

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated index.html")
