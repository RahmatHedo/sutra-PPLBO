import { useState, useEffect } from 'react';
import SidebarKetua from '../../components/layout/SidebarKetua';
import Topbar from '../../components/layout/Topbar';
import { useAuth } from '../../context/AuthContext';
import { getHarvestsForKetua, updateHarvestStatus } from '../../api/harvests';
import { showToast } from '../../components/ui/Toast';

const STATUS_BADGE = {
  pending:  <span className="badge pending"><i className="ti ti-clock"></i> Menunggu</span>,
  verified: <span className="badge approved"><i className="ti ti-circle-check"></i> Disetujui</span>,
  rejected: <span className="badge rejected"><i className="ti ti-circle-x"></i> Ditolak</span>,
};

export default function Verifikasi() {
  const { token } = useAuth();
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Rejection Modal State
  const [rejectItem, setRejectItem] = useState(null);
  const [rejectCatatan, setRejectCatatan] = useState('');

  async function load() {
    try {
      const { ok, data: res } = await getHarvestsForKetua(token);
      if (ok) { setData(res.data || []); applyFilter('all', res.data || []); }
      else showToast('Gagal memuat data', 'error');
    } catch { showToast('Koneksi server gagal', 'error'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [token]);

  const applyFilter = (f, source = data) => {
    setActiveFilter(f);
    const dbF = f === 'approved' ? 'verified' : f;
    setFiltered(dbF === 'all' ? source : source.filter(r => r.status === dbF));
  };

  async function doAction(id, status, catatan = '') {
    try {
      const { ok, data: res } = await updateHarvestStatus(token, id, status, catatan);
      if (ok) {
        showToast(res.message, 'success');
        setSelected(null);
        setRejectItem(null);
        setRejectCatatan('');
        load();
      } else {
        showToast(res.message || 'Gagal mengubah status', 'error');
      }
    } catch { showToast('Koneksi server gagal', 'error'); }
  }

  const handleRejectConfirm = (e) => {
    e.preventDefault();
    if (!rejectCatatan.trim()) {
      showToast('Catatan penolakan wajib diisi', 'error');
      return;
    }
    doAction(rejectItem.id, 'rejected', rejectCatatan);
  };

  const pendingCount = data.filter(r => r.status === 'pending').length;

  return (
    <div className="dashboard-layout" style={{ display: 'flex', minHeight: '100vh' }}>
      <SidebarKetua />
      <div className="main">
        <Topbar title="Verifikasi Panen" breadcrumb="Sutra › Verifikasi" profileLink="/ketua/profile" />
        <main className="content">
          <div className="page-header">
            <div className="page-header-text">
              <h1><i className="ti ti-shield-check"></i> Verifikasi Panen</h1>
              <p>{pendingCount > 0 ? `${pendingCount} pengajuan menunggu verifikasi Anda` : 'Tidak ada pengajuan yang menunggu'}</p>
            </div>
          </div>

          <div className="filter-bar">
            {[['all','Semua'],['pending','Menunggu'],['approved','Disetujui'],['rejected','Ditolak']].map(([f, label]) => (
              <button key={f} className={`filter-btn${activeFilter === f ? ' active' : ''}`} onClick={() => applyFilter(f)}>{label}</button>
            ))}
          </div>

          <div className="table-wrap">
            <table>
              <thead><tr>
                <th>ID</th><th>Nama Petani</th><th>Tanggal</th><th>Komoditas</th><th>Jumlah</th><th>Status</th><th>Aksi</th>
              </tr></thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 30, color: 'var(--text-light)' }}>Memuat data...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7}><div className="empty-state"><i className="ti ti-inbox"></i><h3>Tidak ada data</h3><p>Tidak ada pengajuan dengan filter ini</p></div></td></tr>
                ) : filtered.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '.75rem', color: 'var(--text-light)' }}>AGC-{String(r.id).padStart(4,'0')}</td>
                    <td><strong>{r.nama_petani}</strong></td>
                    <td style={{ color: 'var(--text-mid)' }}>{new Date(r.tanggal_panen).toLocaleDateString('id-ID')}</td>
                    <td>{r.komoditas}</td>
                    <td><strong>{r.jumlah} {r.satuan}</strong></td>
                    <td>{STATUS_BADGE[r.status] || STATUS_BADGE.pending}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button className="action-btn" onClick={() => setSelected(r)}><i className="ti ti-eye"></i> Detail</button>
                        {r.status === 'pending' && (
                          <>
                            <button className="action-btn" style={{ background: 'rgba(61,139,94,0.1)', color: 'var(--leaf)', border: '1.5px solid rgba(61,139,94,0.3)' }} onClick={() => doAction(r.id, 'verified')}><i className="ti ti-check"></i></button>
                            <button className="action-btn" style={{ background: 'var(--rose-light)', color: 'var(--rose)', border: '1.5px solid #f5c4c4' }} onClick={() => setRejectItem(r)}><i className="ti ti-x"></i></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MODAL DETAIL */}
          {selected && (
            <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && setSelected(null)}>
              <div className="modal" style={{ width: 580 }}>
                <div className="modal-header">
                  <div className="modal-title"><i className="ti ti-shield-check"></i> Detail Verifikasi</div>
                  <button className="modal-close" onClick={() => setSelected(null)}><i className="ti ti-x"></i></button>
                </div>

                {/* Info Grid */}
                <div className="quick-info" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 16 }}>
                  {[
                    ['ID', `AGC-${String(selected.id).padStart(4,'0')}`],
                    ['Petani', selected.nama_petani],
                    ['Komoditas', selected.komoditas],
                    ['Jumlah', `${selected.jumlah} ${selected.satuan}`],
                    ['Lokasi', selected.lokasi],
                    ['Luas Lahan', selected.luas || '-'],
                    ['Cuaca', selected.cuaca || '-'],
                    ['Kualitas', selected.kualitas || '-'],
                  ].map(([k, v]) => (
                    <div key={k} className="qi-item"><div className="qi-label">{k}</div><div className="qi-val">{v}</div></div>
                  ))}
                </div>

                {/* FOTO — tampil langsung dari Supabase Storage URL */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: '.79rem', fontWeight: 600, color: 'var(--text-mid)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <i className="ti ti-camera" style={{ color: 'var(--leaf)' }}></i> Foto Bukti Panen
                  </div>
                  {selected.foto ? (
                    <img
                      src={selected.foto}
                      alt="Bukti Panen"
                      style={{ width: '100%', borderRadius: 10, maxHeight: 240, objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 10, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 6, color: 'var(--text-light)' }}>
                      <i className="ti ti-photo" style={{ fontSize: 28 }}></i>
                      <span style={{ fontSize: '.75rem' }}>Tidak ada foto</span>
                    </div>
                  )}
                </div>

                {/* Catatan */}
                {selected.catatan && (
                  <div style={{ background: 'var(--cream)', borderRadius: 10, padding: '12px 14px', border: '1px solid var(--border)', marginBottom: 16 }}>
                    <div style={{ fontSize: '.72rem', color: 'var(--text-light)', marginBottom: 4 }}>Catatan Petani</div>
                    <div style={{ fontSize: '.84rem' }}>{selected.catatan}</div>
                  </div>
                )}

                {/* Action Buttons */}
                {selected.status === 'pending' && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-sm" style={{ background: 'rgba(61,139,94,0.1)', color: 'var(--leaf)', border: '1.5px solid rgba(61,139,94,0.3)' }} onClick={() => doAction(selected.id, 'verified')}>
                      <i className="ti ti-circle-check"></i> Setujui Panen
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => setRejectItem(selected)}>
                      <i className="ti ti-circle-x"></i> Tolak
                    </button>
                  </div>
                )}

                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setSelected(null)}>Tutup</button>
                </div>
              </div>
            </div>
          )}
          {/* REJECT MODAL */}
          {rejectItem && (
            <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && setRejectItem(null)} style={{ zIndex: 1000 }}>
              <div className="modal" style={{ width: 450 }}>
                <div className="modal-header">
                  <div className="modal-title" style={{ color: 'var(--rose)' }}><i className="ti ti-alert-circle"></i> Tolak Verifikasi</div>
                  <button className="modal-close" onClick={() => setRejectItem(null)}><i className="ti ti-x"></i></button>
                </div>
                <form onSubmit={handleRejectConfirm}>
                  <p style={{ fontSize: '.85rem', color: 'var(--text-mid)', marginBottom: 15 }}>
                    Berikan alasan penolakan untuk panen <strong>{rejectItem.komoditas}</strong> (Petani: <strong>{rejectItem.nama_petani}</strong>). Catatan ini akan dikirim ke Petani.
                  </p>
                  <div className="form-group" style={{ marginBottom: 20 }}>
                    <label>Catatan Penolakan *</label>
                    <textarea 
                      className="form-input" 
                      rows={4} 
                      placeholder="Contoh: Bukti foto kurang jelas / Jumlah tidak sesuai..."
                      value={rejectCatatan}
                      onChange={(e) => setRejectCatatan(e.target.value)}
                      required
                    ></textarea>
                  </div>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setRejectItem(null)}>Batal</button>
                    <button type="submit" className="btn btn-danger"><i className="ti ti-send"></i> Kirim & Tolak</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
