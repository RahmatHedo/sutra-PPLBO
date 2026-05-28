import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SidebarPetani from '../../components/layout/SidebarPetani';
import Topbar from '../../components/layout/Topbar';
import { useAuth } from '../../context/AuthContext';
import { getHarvestStats, getHarvestsByPetani } from '../../api/harvests';
import { getTodayShort } from '../../utils/formatDate';
import { showToast } from '../../components/ui/Toast';

export default function DashboardPetani() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({ total_panen: 0, total_verified_kg: 0 });
  const [harvests, setHarvests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, harvestsRes] = await Promise.all([
          getHarvestStats(token),
          getHarvestsByPetani(token),
        ]);
        if (statsRes.ok) setStats(statsRes.data.data || {});
        if (harvestsRes.ok) setHarvests(harvestsRes.data.data || []);
      } catch {
        showToast('Gagal memuat data dashboard', 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  const verifiedKg = parseFloat(stats.total_verified_kg) || 0;
  const verified = harvests.filter(h => h.status === 'verified').length;
  const pending = harvests.filter(h => h.status === 'pending').length;
  const rejected = harvests.filter(h => h.status === 'rejected').length;
  const latest = harvests[0];

  // --- GRAFIK BULANAN ---
  const currentYear = new Date().getFullYear();
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
      <SidebarPetani />
      <div className="main">
        <Topbar title="Dashboard" breadcrumb="Sutra › Dashboard" profileLink="/petani/profile" />
        <main className="content">

          {/* DASHBOARD PAGE */}
          <div className="welcome-banner section-gap">
            <div className="welcome-text">
              <h2>Selamat Datang, {user?.nama?.split(' ')[0] || 'Petani'}! 👋</h2>
              <p>Pantau hasil panen & status verifikasi Anda hari ini</p>
            </div>
            <div className="welcome-date">
              <small>Hari ini</small>
              <strong>{getTodayShort()}</strong>
            </div>
          </div>

          {/* STATS */}
          <div className="stats-grid">
            {[
              { label: 'Total Panen Terverifikasi', val: verifiedKg > 1000 ? (verifiedKg / 1000).toFixed(1) + ' T' : verifiedKg.toFixed(0) + ' kg', icon: 'ti-wheat', color: 'green', trend: 'Panen', trendIcon: 'ti-trending-up', trendDir: 'up' },
              { label: 'Total Panen Diverifikasi', val: verified, icon: 'ti-circle-check', color: 'green', trend: 'Baik', trendIcon: 'ti-trending-up', trendDir: 'up' },
              { label: 'Menunggu Verifikasi', val: pending, icon: 'ti-clock', color: 'amber', trend: 'Aktif', trendIcon: '', trendDir: 'neu' },
              { label: 'Ditolak / Revisi', val: rejected, icon: 'ti-circle-x', color: 'rose', trend: 'Perlu Revisi', trendIcon: 'ti-trending-down', trendDir: 'down' },
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

          {/* CHART + ACTIVITY */}
          <div className="bottom-grid section-gap">
            <div className="card">
              <div className="card-header">
                <div className="card-title"><i className="ti ti-chart-bar"></i> Grafik Produksi Bulanan</div>
                <Link to="/petani/riwayat" className="card-action">Lihat semua <i className="ti ti-arrow-right"></i></Link>
              </div>
              <div className="card-body">
                {displayData.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-light)' }}>Belum ada data panen tahun ini.</div>
                ) : (
                  <>
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
                      <div className="legend-item"><div className="legend-dot" style={{ background: 'var(--leaf)' }}></div> Panen (ton)</div>
                      <div className="legend-item"><div className="legend-dot" style={{ background: 'var(--lime)', opacity: .7 }}></div> Diverifikasi</div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title"><i className="ti ti-clock"></i> Aktivitas Terkini</div>
                <Link to="/petani/riwayat" className="card-action">Semua <i className="ti ti-arrow-right"></i></Link>
              </div>
              <div className="activity-list">
                {loading ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-light)' }}>Memuat aktivitas...</div>
                ) : harvests.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-light)' }}>Belum ada aktivitas.</div>
                ) : (
                  harvests.slice(0, 4).map(h => (
                    <div key={h.id} className="activity-item">
                      <div className={`activity-icon ${h.status === 'verified' ? 'success' : h.status === 'rejected' ? 'reject' : 'pending'}`}>
                        <i className={`ti ${h.status === 'verified' ? 'ti-circle-check' : h.status === 'rejected' ? 'ti-circle-x' : 'ti-clock'}`}></i>
                      </div>
                      <div className="activity-text">
                        <div className="activity-title">Panen {h.komoditas} — {h.jumlah} {h.satuan}</div>
                        <div className="activity-sub">
                          {h.status === 'verified' ? 'Disetujui' : h.status === 'pending' ? 'Menunggu verifikasi ketua' : 'Perlu revisi / Ditolak'}
                        </div>
                      </div>
                      <div className="activity-time" style={{ fontSize: '.72rem', color: 'var(--text-light)' }}>{new Date(h.created_at).toLocaleDateString('id-ID')}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* STATUS TERAKHIR */}
          <div className="card">
            <div className="card-header">
              <div className="card-title"><i className="ti ti-bookmark"></i> Status Pengajuan Terakhir</div>
              <Link to="/petani/tracking" className="card-action">Tracking <i className="ti ti-arrow-right"></i></Link>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div style={{ fontSize: '.87rem', fontWeight: 600, color: 'var(--text-dark)' }}>
                    {latest ? `Panen ${latest.komoditas} — ${latest.jumlah} ${latest.satuan}` : '—'}
                  </div>
                  <div style={{ fontSize: '.75rem', color: 'var(--text-light)', marginTop: '2px' }}>
                    {latest ? `AGC-${String(latest.id).padStart(4, '0')} · ${new Date(latest.created_at).toLocaleDateString('id-ID')}` : '—'}
                  </div>
                </div>
                {latest ? (
                  latest.status === 'verified' ? (
                    <span className="badge approved"><i className="ti ti-circle-check"></i> Selesai Verifikasi</span>
                  ) : latest.status === 'rejected' ? (
                    <span className="badge rejected"><i className="ti ti-circle-x"></i> Ditolak</span>
                  ) : (
                    <span className="badge pending"><i className="ti ti-clock"></i> Menunggu Verifikasi</span>
                  )
                ) : (
                  <span className="badge">—</span>
                )}
              </div>
              <div className="status-stepper">
                <div className={`step ${latest ? 'done' : ''}`}>
                  <div className="step-circle"><i className={latest ? "ti ti-check" : "ti ti-clock"}></i></div>
                  <div className="step-label">Input Petani</div>
                </div>
                <div className={`step ${latest ? 'done' : ''}`}>
                  <div className="step-circle"><i className={latest ? "ti ti-check" : "ti ti-clock"}></i></div>
                  <div className="step-label">Verifikasi Awal</div>
                </div>
                <div className={`step ${latest && latest.status === 'pending' ? 'current' : latest && latest.status === 'verified' ? 'done' : ''}`}>
                  <div className="step-circle"><i className={latest && latest.status === 'verified' ? "ti ti-check" : "ti ti-clock"}></i></div>
                  <div className="step-label">Verifikasi Akhir</div>
                </div>
                <div className={`step ${latest && latest.status === 'verified' ? 'done' : ''}`}>
                  <div className="step-circle"><i className={latest && latest.status === 'verified' ? "ti ti-check" : "ti ti-certificate"}></i></div>
                  <div className="step-label">Finalisasi</div>
                </div>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
