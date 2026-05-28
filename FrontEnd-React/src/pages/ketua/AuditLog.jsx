import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarKetua from '../../components/layout/SidebarKetua';
import Topbar from '../../components/layout/Topbar';

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadLogs = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      try {
        const res = await fetch('http://localhost:3000/api/harvests/ketua', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          const formattedLogs = (data.data || []).map(h => {
            const tgl = new Date(h.updated_at || h.created_at);
            const timeStr = tgl.toLocaleDateString('id-ID', {day:'numeric', month:'short'}) + ', ' + tgl.toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'});
            const idStr = 'AGC-' + String(h.id).padStart(4, '0');

            if (h.status === 'verified') {
              return { type:'approve', icon:'ti-circle-check', title:`Ketua menyetujui panen ${h.nama_petani}`, detail:`${h.komoditas} ${h.jumlah} ${h.satuan} · ${h.lokasi} · ${idStr}`, tag:'Verifikasi', time:timeStr };
            } else if (h.status === 'rejected') {
              return { type:'reject', icon:'ti-circle-x', title:`Ketua menolak panen ${h.nama_petani}`, detail:`${h.komoditas} ${h.jumlah} ${h.satuan} · ${h.lokasi} · ${idStr} — ${h.catatan || 'Tidak sesuai'}`, tag:'Verifikasi', time:timeStr };
            } else {
              return { type:'input', icon:'ti-plus', title:`${h.nama_petani} menginput pengajuan panen baru`, detail:`${h.komoditas} ${h.jumlah} ${h.satuan} · ${h.lokasi} · ${idStr}`, tag:'Input Panen', time:timeStr };
            }
          });
          setLogs(formattedLogs);
        }
      } catch (e) {
        console.error('Error load audit:', e);
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, [navigate]);

  const filteredLogs = filter === 'all' ? logs : logs.filter(l => l.type === filter);

  return (
    <div className="dashboard-layout" style={{ display: 'flex', minHeight: '100vh' }}>
      <SidebarKetua />
      <div className="main">
        <Topbar title="Audit Log" breadcrumb="Sutra › Audit Log" profileLink="/ketua/profile" />
        <main className="content">
          <style>{`
            .log-item { display: flex; align-items: flex-start; gap: 14px; padding: 14px 22px; border-bottom: 1px solid var(--border); transition: background .13s; }
            .log-item:hover { background: var(--cream); }
            .log-item:last-child { border-bottom: none; }
            .log-icon { width: 36px; height: 36px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
            .log-icon i { font-size: 16px; }
            .log-icon.approve { background: rgba(61,139,94,0.1); color: var(--leaf); }
            .log-icon.reject  { background: var(--rose-light); color: var(--rose); }
            .log-icon.input   { background: var(--sky-light); color: var(--sky); }
            .log-icon.edit    { background: var(--amber-light); color: var(--amber); }
            .log-icon.system  { background: var(--cream); color: var(--text-mid); border: 1px solid var(--border); }
            .log-content { flex: 1; min-width: 0; }
            .log-main { font-size: .84rem; color: var(--text-dark); margin-bottom: 3px; line-height: 1.4; }
            .log-main strong { color: var(--text-dark); }
            .log-meta { font-size: .73rem; color: var(--text-light); display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
            .log-meta i { font-size: 12px; }
            .log-tag { padding: 2px 8px; border-radius: 4px; font-size: .68rem; font-weight: 600; background: var(--cream); color: var(--text-mid); border: 1px solid var(--border); }
            .log-time { font-size: .72rem; color: var(--text-light); flex-shrink: 0; white-space: nowrap; }
          `}</style>
          <div className="page-header">
            <div className="page-header-text">
              <h1><i className="ti ti-history"></i> Audit Log</h1>
              <p>Riwayat seluruh aktivitas verifikasi dan perubahan data di sistem</p>
            </div>
            <button className="btn btn-secondary" onClick={() => showToast('Audit log diunduh ke Excel', 'success')}>
              <i className="ti ti-download"></i> Export Log
            </button>
          </div>

          {/* FILTER */}
          <div className="filter-bar">
            <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}><i className="ti ti-list"></i> Semua</button>
            <button className={`filter-btn ${filter === 'approve' ? 'active' : ''}`} onClick={() => setFilter('approve')}><i className="ti ti-circle-check"></i> Persetujuan</button>
            <button className={`filter-btn ${filter === 'reject' ? 'active' : ''}`} onClick={() => setFilter('reject')}><i className="ti ti-circle-x"></i> Penolakan</button>
            <button className={`filter-btn ${filter === 'input' ? 'active' : ''}`} onClick={() => setFilter('input')}><i className="ti ti-plus"></i> Input Panen</button>
            <button className="filter-btn" onClick={() => showToast('Filter belum tersedia', 'info')}><i className="ti ti-pencil"></i> Edit Data</button>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
              <input type="date" className="form-input" style={{ padding: '7px 12px', fontSize: '.8rem', width: 'auto' }} />
              <input type="date" className="form-input" style={{ padding: '7px 12px', fontSize: '.8rem', width: 'auto' }} />
            </div>
          </div>

          {/* LOG LIST */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div id="log-list">
              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-light)' }}>Memuat log...</div>
              ) : filteredLogs.length === 0 ? (
                <div className="empty-state" style={{ padding: '40px', textAlign: 'center' }}>
                  <i className="ti ti-inbox" style={{ fontSize: '36px', color: 'var(--text-light)' }}></i>
                  <h3>Tidak ada log</h3>
                </div>
              ) : (
                filteredLogs.map((l, idx) => (
                  <div key={idx} className="log-item">
                    <div className={`log-icon ${l.type}`}><i className={`ti ${l.icon}`}></i></div>
                    <div className="log-content">
                      <div className="log-main" dangerouslySetInnerHTML={{ __html: l.title }} />
                      <div className="log-meta">
                        <i className="ti ti-file-description"></i> {l.detail}
                        <span className="log-tag">{l.tag}</span>
                      </div>
                    </div>
                    <div className="log-time"><i className="ti ti-clock" style={{ fontSize: '11px', marginRight: '3px' }}></i>{l.time}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* PAGINATION */}
          {!loading && filteredLogs.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px', alignItems: 'center' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => showToast('Halaman sebelumnya', 'info')}><i className="ti ti-chevron-left"></i></button>
              <button className="btn btn-primary btn-sm" style={{ minWidth: '36px' }}>1</button>
              <button className="btn btn-secondary btn-sm" style={{ minWidth: '36px' }} onClick={() => showToast('Halaman ke-2', 'info')}>2</button>
              <button className="btn btn-secondary btn-sm" style={{ minWidth: '36px' }} onClick={() => showToast('Halaman ke-3', 'info')}>3</button>
              <span style={{ fontSize: '.8rem', color: 'var(--text-light)' }}>...</span>
              <button className="btn btn-secondary btn-sm" onClick={() => showToast('Halaman selanjutnya', 'info')}><i className="ti ti-chevron-right"></i></button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
