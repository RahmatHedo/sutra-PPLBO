import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarKetua from '../../components/layout/SidebarKetua';
import Topbar from '../../components/layout/Topbar';

export default function Laporan() {
  const [allHarvests, setAllHarvests] = useState([]);
  const [filters, setFilters] = useState({ tahun: 'all', bulan: 'all', komoditas: 'all', petani: 'all' });
  const navigate = useNavigate();

  useEffect(() => {
    const loadLaporan = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }
      try {
        const response = await fetch('http://localhost:3000/api/harvests/ketua', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
          setAllHarvests(data.data || []);
        }
      } catch (err) {
        console.error('Error load laporan:', err);
      }
    };
    loadLaporan();
  }, [navigate]);

  const komoditasSet = [...new Set(allHarvests.map(h => h.komoditas).filter(Boolean))];
  const petaniSet = [...new Set(allHarvests.map(h => h.nama_petani).filter(Boolean))];

  const filtered = allHarvests.filter(h => {
    let match = true;
    const d = new Date(h.tanggal_panen);
    if (filters.tahun !== 'all' && d.getFullYear().toString() !== filters.tahun) match = false;
    if (filters.bulan !== 'all' && (d.getMonth() + 1).toString() !== filters.bulan) match = false;
    if (filters.komoditas !== 'all' && h.komoditas !== filters.komoditas) match = false;
    if (filters.petani !== 'all' && h.nama_petani !== filters.petani) match = false;
    return match;
  });

  // Calculate stats
  let totalVerifiedKg = 0;
  let disetujuiCount = 0;
  const activePetani = new Set();

  filtered.forEach(h => {
    let kg = parseFloat(h.jumlah) || 0;
    if (h.satuan && h.satuan.toLowerCase() === 'ton') kg *= 1000;
    if (h.satuan && h.satuan.toLowerCase() === 'kuintal') kg *= 100;
    if (h.status === 'verified') {
      totalVerifiedKg += kg;
      disetujuiCount++;
      activePetani.add(h.petani_id);
    }
  });

  const persetujuan = filtered.length > 0 ? (disetujuiCount / filtered.length) * 100 : 0;
  const aktifCount = activePetani.size;
  const rataRata = aktifCount > 0 ? (totalVerifiedKg / aktifCount) : 0;

  // Chart data
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const chartDataMap = Object.fromEntries(monthNames.map(m => [m, { panen: 0, ver: 0 }]));
  filtered.forEach(h => {
    const d = new Date(h.tanggal_panen);
    const mName = monthNames[d.getMonth()];
    let kg = parseFloat(h.jumlah) || 0;
    if (h.satuan && h.satuan.toLowerCase() === 'ton') kg *= 1000;
    if (h.satuan && h.satuan.toLowerCase() === 'kuintal') kg *= 100;
    if (chartDataMap[mName]) {
      chartDataMap[mName].panen += kg;
      if (h.status === 'verified') {
        chartDataMap[mName].ver += kg;
      }
    }
  });

  const chartData = monthNames.map(m => ({ month: m, panen: chartDataMap[m].panen / 1000, ver: chartDataMap[m].ver / 1000 }));
  const maxVal = Math.max(...chartData.map(d => Math.max(d.panen, d.ver))) || 10;
  const chartH = 150;

  // Distribusi Komoditas
  const distMap = {};
  let totalVerifiedForDist = 0;
  filtered.filter(h => h.status === 'verified').forEach(h => {
    let kg = parseFloat(h.jumlah) || 0;
    if (h.satuan && h.satuan.toLowerCase() === 'ton') kg *= 1000;
    if (h.satuan && h.satuan.toLowerCase() === 'kuintal') kg *= 100;
    distMap[h.komoditas] = (distMap[h.komoditas] || 0) + kg;
    totalVerifiedForDist += kg;
  });
  
  const icons = { 'Padi': 'ti-wheat', 'Jagung': 'ti-plant', 'Kedelai': 'ti-plant', 'Singkong': 'ti-plant-2', 'Cabai': 'ti-flame', 'Bawang Merah': 'ti-plant' };
  const colors = { 'Padi': 'var(--leaf),var(--mint)', 'Jagung': 'var(--amber),#f0c060', 'Kedelai': 'var(--sky),#7ec8e0', 'Singkong': 'var(--rose),#f09090', 'Cabai': 'var(--red),#ff6b6b' };
  const distArr = Object.keys(distMap).map(k => ({ k, kg: distMap[k] })).sort((a, b) => b.kg - a.kg);

  // Tabel Rekap Petani
  const petaniStats = {};
  filtered.forEach(h => {
    if (!petaniStats[h.petani_id]) petaniStats[h.petani_id] = { nama: h.nama_petani, total_kg: 0, total_pengajuan: 0, disetujui: 0 };
    let kg = parseFloat(h.jumlah) || 0;
    if (h.satuan && h.satuan.toLowerCase() === 'ton') kg *= 1000;
    if (h.satuan && h.satuan.toLowerCase() === 'kuintal') kg *= 100;
    if (h.status === 'verified') {
      petaniStats[h.petani_id].total_kg += kg;
      petaniStats[h.petani_id].disetujui += 1;
    }
    petaniStats[h.petani_id].total_pengajuan += 1;
  });
  const statsArray = Object.values(petaniStats);
  let grandKg = 0, grandPengajuan = 0, grandDisetujui = 0;

  return (
    <div className="dashboard-layout" style={{ display: 'flex', minHeight: '100vh' }}>
      <SidebarKetua />
      <div className="main">
        <Topbar title="Laporan Produksi" breadcrumb="Sutra › Laporan" profileLink="/ketua/profile" />
        <main className="content">
          <div className="page-header">
            <div className="page-header-text">
              <h1><i className="ti ti-report-analytics"></i> Laporan Produksi</h1>
              <p>Analitik dan rekapitulasi hasil panen kelompok tani</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary" onClick={() => alert('Laporan PDF sedang diunduh...')}>
                <i className="ti ti-file-type-pdf"></i> Export PDF
              </button>
              <button className="btn btn-primary" onClick={() => alert('Laporan Excel sedang diunduh...')}>
                <i className="ti ti-file-spreadsheet"></i> Export Excel
              </button>
            </div>
          </div>

          <div className="report-filters">
            <label><i className="ti ti-filter" style={{ color: 'var(--leaf)' }}></i> Filter:</label>
            <select className="form-input" style={{ width: 'auto', padding: '7px 12px', fontSize: '.82rem' }} value={filters.tahun} onChange={e => setFilters({ ...filters, tahun: e.target.value })}>
              <option value="all">Semua Tahun</option>
              <option value="2025">2025</option><option value="2024">2024</option>
            </select>
            <select className="form-input" style={{ width: 'auto', padding: '7px 12px', fontSize: '.82rem' }} value={filters.bulan} onChange={e => setFilters({ ...filters, bulan: e.target.value })}>
              <option value="all">Semua Bulan</option>
              {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>
            <div className="divider-v"></div>
            <select className="form-input" style={{ width: 'auto', padding: '7px 12px', fontSize: '.82rem' }} value={filters.komoditas} onChange={e => setFilters({ ...filters, komoditas: e.target.value })}>
              <option value="all">Semua Komoditas</option>
              {komoditasSet.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
            <select className="form-input" style={{ width: 'auto', padding: '7px 12px', fontSize: '.82rem' }} value={filters.petani} onChange={e => setFilters({ ...filters, petani: e.target.value })}>
              <option value="all">Semua Petani</option>
              {petaniSet.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <button className="btn btn-primary btn-sm" onClick={() => setFilters({ ...filters })}>
              <i className="ti ti-refresh"></i> Terapkan
            </button>
          </div>

          <div className="stats-grid section-gap" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
            <div className="stat-card">
              <div className="stat-header"><div className="stat-icon green"><i className="ti ti-wheat"></i></div></div>
              <div className="stat-value">{(totalVerifiedKg / 1000).toFixed(2)} T</div>
              <div className="stat-label">Total Produksi</div>
            </div>
            <div className="stat-card">
              <div className="stat-header"><div className="stat-icon green"><i className="ti ti-circle-check"></i></div></div>
              <div className="stat-value">{persetujuan.toFixed(1)}%</div>
              <div className="stat-label">Tingkat Persetujuan</div>
            </div>
            <div className="stat-card">
              <div className="stat-header"><div className="stat-icon sky"><i className="ti ti-users"></i></div></div>
              <div className="stat-value">{aktifCount}</div>
              <div className="stat-label">Petani Berkontribusi</div>
            </div>
            <div className="stat-card">
              <div className="stat-header"><div className="stat-icon amber"><i className="ti ti-chart-bar"></i></div></div>
              <div className="stat-value">{(rataRata / 1000).toFixed(2)} T</div>
              <div className="stat-label">Rata-rata Per Petani</div>
            </div>
          </div>

          <div className="bottom-grid section-gap">
            <div className="card">
              <div className="card-header">
                <div className="card-title"><i className="ti ti-chart-bar"></i> Grafik Produksi Bulanan</div>
              </div>
              <div className="card-body">
                <div className="chart-wrap" style={{ height: '220px', display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                  {chartData.map(d => (
                    <div key={d.month} className="chart-bar-group">
                      <div className="bar-wrap">
                        <div className="bar primary" style={{ height: `${(d.panen / maxVal) * chartH}px` }} title={`${d.panen} ton panen`}></div>
                        <div className="bar secondary" style={{ height: `${(d.ver / maxVal) * chartH}px` }} title={`${d.ver} ton diverifikasi`}></div>
                      </div>
                      <div className="bar-label">{d.month}</div>
                    </div>
                  ))}
                </div>
                <div className="chart-legend" style={{ marginTop: '14px' }}>
                  <div className="legend-item"><div className="legend-dot" style={{ background: 'var(--leaf)' }}></div> Total produksi (ton)</div>
                  <div className="legend-item"><div className="legend-dot" style={{ background: 'var(--lime)', opacity: .7 }}></div> Diverifikasi</div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title"><i className="ti ti-chart-pie"></i> Distribusi Komoditas</div>
              </div>
              <div className="card-body">
                {distArr.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-light)' }}>Tidak ada data terverifikasi</div>
                ) : (
                  distArr.map(d => {
                    const pct = ((d.kg / totalVerifiedForDist) * 100).toFixed(1);
                    const icon = icons[d.k] || 'ti-plant-2';
                    const color = colors[d.k] || '#9b8cff,#c4b8ff';
                    return (
                      <div key={d.k} className="komoditas-bar" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 0', borderBottom: '1px solid var(--border)' }}>
                        <div className="komoditas-label" style={{ width: '100px', fontSize: '.82rem', flexShrink: 0 }}><i className={`ti ${icon}`} style={{ color: 'var(--leaf)' }}></i> {d.k}</div>
                        <div className="bar-track" style={{ flex: 1, height: '8px', background: 'var(--cream)', borderRadius: '4px' }}>
                          <div className="bar-fill" style={{ height: '100%', borderRadius: '4px', width: `${pct}%`, background: `linear-gradient(90deg, ${color})` }}></div>
                        </div>
                        <div className="bar-val" style={{ width: '70px', textAlign: 'right', fontSize: '.82rem', fontWeight: 600 }}>{(d.kg / 1000).toFixed(2)} ton</div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title"><i className="ti ti-table"></i> Rekap Per Petani</div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Nama Petani</th><th>Total Panen (kg)</th><th>Total Panen (ton)</th><th>Total Pengajuan</th><th>Disetujui</th>
                  </tr>
                </thead>
                <tbody>
                  {statsArray.length === 0 ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center' }}>Belum ada data panen.</td></tr>
                  ) : (
                    <>
                      {statsArray.map(p => {
                        grandKg += p.total_kg; grandPengajuan += p.total_pengajuan; grandDisetujui += p.disetujui;
                        return (
                          <tr key={p.nama}>
                            <td><strong>{p.nama}</strong></td>
                            <td>{p.total_kg.toFixed(2)} kg</td>
                            <td>{(p.total_kg / 1000).toFixed(2)} ton</td>
                            <td>{p.total_pengajuan}</td>
                            <td><span className="badge approved">{p.disetujui}</span></td>
                          </tr>
                        );
                      })}
                      <tr>
                        <td style={{ fontWeight: 700, color: 'var(--text-dark)' }}>TOTAL</td>
                        <td style={{ fontWeight: 700 }}>{grandKg.toFixed(2)} kg</td>
                        <td style={{ fontWeight: 700, color: 'var(--leaf)' }}>{(grandKg / 1000).toFixed(2)} ton</td>
                        <td style={{ fontWeight: 700 }}>{grandPengajuan}</td>
                        <td><span className="badge approved" style={{ fontSize: '.8rem' }}>{grandDisetujui}</span></td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
