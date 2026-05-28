import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SidebarKetua from '../../components/layout/SidebarKetua';
import Topbar from '../../components/layout/Topbar';
import { useAuth } from '../../context/AuthContext';
import { getHarvestStats, getHarvestsForKetua } from '../../api/harvests';
import { getAllUsers } from '../../api/users';
import { getTodayShort } from '../../utils/formatDate';
import { showToast } from '../../components/ui/Toast';

export default function DashboardKetua() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({ total_pengajuan: 0, total_pending: 0 });
  const [harvests, setHarvests] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, harvestsRes, usersRes] = await Promise.all([
          getHarvestStats(token),
          getHarvestsForKetua(token),
          getAllUsers(token),
        ]);
        if (statsRes.ok) setStats(statsRes.data.data || {});
        if (harvestsRes.ok) setHarvests(harvestsRes.data.data || []);
        if (usersRes.ok) setUsers(usersRes.data.data || []);
      } catch { showToast('Gagal memuat dashboard', 'error'); }
      finally { setLoading(false); }
    }
    load();
  }, [token]);

  // Derived states
  const verified = harvests.filter(h => h.status === 'verified').length;
  const rejected = harvests.filter(h => h.status === 'rejected').length;
  
  // Total petani aktif
  const petaniAktifCount = users.filter(u => u.role === 'petani' && u.status === 'acc').length;
  
  // Panen bulan ini
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  let totalPanenBulanIniKg = 0;
  harvests.filter(h => h.status === 'verified').forEach(h => {
    let kg = parseFloat(h.jumlah) || 0;
    if (h.satuan && h.satuan.toLowerCase() === 'ton') kg *= 1000;
    if (h.satuan && h.satuan.toLowerCase() === 'kuintal') kg *= 100;
    const hDate = new Date(h.tanggal_panen);
    if (hDate.getMonth() === currentMonth && hDate.getFullYear() === currentYear) {
      totalPanenBulanIniKg += kg;
    }
  });

  const pctPersetujuan = stats.total_pengajuan > 0 ? ((verified / stats.total_pengajuan) * 100).toFixed(1) + '%' : '0%';

  // Pending list
  const pendingList = harvests.filter(h => h.status === 'pending');

  // Top Petani
  const petaniList = users.filter(u => u.role === 'petani');
  const petaniStats = petaniList.map(p => {
    let totalKg = 0;
    harvests.filter(h => h.petani_id === p.id && h.status === 'verified').forEach(h => {
      let kg = parseFloat(h.jumlah) || 0;
      if (h.satuan && h.satuan.toLowerCase() === 'ton') kg *= 1000;
      if (h.satuan && h.satuan.toLowerCase() === 'kuintal') kg *= 100;
      totalKg += kg;
    });
    return { ...p, totalKg };
  });
  petaniStats.sort((a, b) => b.totalKg - a.totalKg);
  const topPetani = petaniStats.slice(0, 5);

  // Chart data
  const monthNames = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  const chartMap = {};
  monthNames.forEach(m => chartMap[m] = { month: m, panen: 0, ver: 0 });

  harvests.forEach(h => {
    const d = new Date(h.tanggal_panen);
    if (d.getFullYear() === currentYear) {
      const mName = monthNames[d.getMonth()];
      let kg = parseFloat(h.jumlah) || 0;
      if (h.satuan && h.satuan.toLowerCase() === 'ton') kg *= 1000;
      if (h.satuan && h.satuan.toLowerCase() === 'kuintal') kg *= 100;
      chartMap[mName].panen += kg;
      if (h.status === 'verified') chartMap[mName].ver += kg;
    }
  });

  const displayData = monthNames.slice(0, new Date().getMonth() + 1).map(m => ({
    month: m,
    panen: chartMap[m].panen / 1000,
    ver: chartMap[m].ver / 1000
  }));
  const maxVal = Math.max(...displayData.map(d => Math.max(d.panen, d.ver)), 1);
  const chartH = 150;

  return (
    <div className="dashboard-layout" style={{ display: 'flex', minHeight: '100vh' }}>
      <SidebarKetua />
      <div className="main">
        <Topbar title="Dashboard Ketua" breadcrumb="Sutra › Dashboard" profileLink="/ketua/profile" />
        <main className="content">

          <div className="welcome-banner section-gap">
            <div className="welcome-text">
              <h2>Selamat Datang, {user?.nama?.split(' ')[0] || 'Ketua'}! 👋</h2>
              <p>Ada <strong style={{ color: 'var(--lime)' }}>{stats.total_pending || 0} pengajuan</strong> yang menunggu verifikasi Anda hari ini</p>
            </div>
            <div className="welcome-date">
              <small>Hari ini</small>
              <strong>{getTodayShort()}</strong>
            </div>
          </div>

          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {[
              { label: 'Total Petani Aktif', val: petaniAktifCount, icon: 'ti-users', color: 'green', trend: 'Aktif', trendIcon: 'ti-trending-up', trendDir: 'up' },
              { label: 'Total Panen Bulan Ini', val: `${(totalPanenBulanIniKg / 1000).toFixed(2)} T`, icon: 'ti-wheat', color: 'green', trend: 'Bulan Ini', trendIcon: 'ti-trending-up', trendDir: 'up' },
              { label: 'Menunggu Verifikasi', val: stats.total_pending || 0, icon: 'ti-clock', color: 'amber', trend: 'Perlu aksi', trendIcon: '', trendDir: 'neu' },
              { label: 'Total Disetujui', val: verified, icon: 'ti-circle-check', color: 'green', trend: 'Baik', trendIcon: 'ti-trending-up', trendDir: 'up' },
              { label: 'Ditolak / Revisi', val: rejected, icon: 'ti-circle-x', color: 'rose', trend: 'Ditolak', trendIcon: '', trendDir: 'down' },
              { label: 'Tingkat Persetujuan', val: pctPersetujuan, icon: 'ti-chart-pie', color: 'sky', trend: pctPersetujuan, trendIcon: '', trendDir: 'up' },
            ].map((s, idx) => (
              <div key={idx} className="stat-card">
                <div className="stat-header">
                  <div className={`stat-icon ${s.color}`}><i className={`ti ${s.icon}`}></i></div>
                  <span className={`stat-trend ${s.trendDir}`}>{s.trendIcon && <i className={`ti ${s.trendIcon}`}></i>} {s.trend}</span>
                </div>
                <div className="stat-value">{loading ? '—' : s.val}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* CHART + PENDING LIST */}
          <div className="bottom-grid section-gap">
            <div className="card">
              <div className="card-header">
                <div className="card-title"><i className="ti ti-chart-bar"></i> Produksi Kelompok (Ton)</div>
                <Link to="/ketua/laporan" className="card-action">Laporan lengkap <i className="ti ti-arrow-right"></i></Link>
              </div>
              <div className="card-body">
                <div className="chart-wrap" style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                  {displayData.map(d => (
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
                  <div className="legend-item"><div className="legend-dot" style={{ background: 'var(--leaf)' }}></div> Panen total kelompok (ton)</div>
                  <div className="legend-item"><div className="legend-dot" style={{ background: 'var(--lime)', opacity: .7 }}></div> Diverifikasi</div>
                </div>
              </div>
            </div>

            {/* PENDING VERIFIKASI */}
            <div className="card">
              <div className="card-header">
                <div className="card-title"><i className="ti ti-clock"></i> Antrian Verifikasi</div>
                <Link to="/ketua/verifikasi" className="card-action">Semua <i className="ti ti-arrow-right"></i></Link>
              </div>
              <div className="activity-list">
                {loading ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-light)' }}>Memuat data...</div>
                ) : pendingList.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-light)' }}>Tidak ada antrian verifikasi.</div>
                ) : (
                  pendingList.slice(0, 4).map(h => (
                    <div key={h.id} className="activity-item">
                      <div className="activity-icon pending"><i className="ti ti-clock"></i></div>
                      <div className="activity-text">
                        <div className="activity-title">{h.nama_petani} — {h.komoditas} {h.jumlah} {h.satuan}</div>
                        <div className="activity-sub">{h.lokasi} · AGC-{String(h.id).padStart(4,'0')} · {new Date(h.created_at).toLocaleDateString('id-ID')}</div>
                      </div>
                      <Link to="/ketua/verifikasi" className="action-btn btn-sm" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="ti ti-eye"></i></Link>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* TOP PETANI */}
          <div className="card">
            <div className="card-header">
              <div className="card-title"><i className="ti ti-trophy"></i> Top Petani Bulan Ini</div>
              <Link to="/ketua/petani" className="card-action">Semua petani <i className="ti ti-arrow-right"></i></Link>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>#</th><th>Nama Petani</th><th>Komoditas Utama</th><th>Lahan</th><th>Total Panen</th><th>Status Akun</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="6" style={{ textAlign: 'center' }}>Memuat data...</td></tr>
                    ) : topPetani.length === 0 ? (
                      <tr><td colSpan="6" style={{ textAlign: 'center' }}>Belum ada data petani.</td></tr>
                    ) : (
                      topPetani.map((p, i) => (
                        <tr key={p.id}>
                          <td><span style={{ fontWeight: 700, color: i === 0 ? 'var(--amber)' : 'var(--text-mid)' }}>{i + 1}</span></td>
                          <td><strong>{p.nama}</strong></td>
                          <td>{p.komoditas || '-'}</td>
                          <td>{p.lahan ? p.lahan + ' Ha' : '-'}</td>
                          <td>{(p.totalKg / 1000).toFixed(2)} ton</td>
                          <td>{p.status === 'acc' ? <span className="badge approved">Aktif</span> : <span className="badge pending">Nonaktif</span>}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
