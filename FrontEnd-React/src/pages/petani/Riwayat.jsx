import { useState, useEffect } from 'react';
import SidebarPetani from '../../components/layout/SidebarPetani';
import Topbar from '../../components/layout/Topbar';
import { useAuth } from '../../context/AuthContext';
import { getHarvestsByPetani } from '../../api/harvests';
import { showToast } from '../../components/ui/Toast';
import { QRCodeSVG } from 'qrcode.react';

const STATUS_BADGE = {
  pending:  <span className="badge pending"><i className="ti ti-clock"></i> Menunggu</span>,
  verified: <span className="badge approved"><i className="ti ti-circle-check"></i> Disetujui</span>,
  rejected: <span className="badge rejected"><i className="ti ti-circle-x"></i> Ditolak</span>,
  draft:    <span className="badge draft"><i className="ti ti-pencil"></i> Draft</span>,
};

export default function Riwayat() {
  const { user, token } = useAuth();
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedHarvest, setSelectedHarvest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    getHarvestsByPetani(token)
      .then(({ ok, data: res }) => {
        if (ok) { setData(res.data || []); setFiltered(res.data || []); }
        else showToast('Gagal memuat riwayat', 'error');
      })
      .catch(() => showToast('Koneksi server gagal', 'error'))
      .finally(() => setLoading(false));
  }, [token]);

  const applyFilter = (f) => {
    setActiveFilter(f);
    setFiltered(f === 'all' ? data : data.filter(h => h.status === f));
  };

  const openDetail = (h) => {
    setSelectedHarvest(h);
    setIsModalOpen(true);
  };

  const closeDetail = () => {
    setIsModalOpen(false);
    setSelectedHarvest(null);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="dashboard-layout" style={{ display: 'flex', minHeight: '100vh' }}>
      <SidebarPetani />
      <div className="main print-hide">
        <Topbar title="Riwayat Verifikasi" breadcrumb="Sutra › Riwayat" profileLink="/petani/profile" />
        <main className="content">
          <div className="page-header">
            <div className="page-header-text">
              <h1><i className="ti ti-clipboard-list"></i> Riwayat Panen</h1>
              <p>Pantau status semua pengajuan panen Anda</p>
            </div>
            <a href="/petani/input-panen" className="btn btn-primary"><i className="ti ti-plus"></i> Input Baru</a>
          </div>

          <div className="filter-bar">
            {[['all','Semua'],['pending','Menunggu'],['verified','Disetujui'],['rejected','Ditolak']].map(([f, label]) => (
              <button key={f} className={`filter-btn${activeFilter === f ? ' active' : ''}`} onClick={() => applyFilter(f)}>{label}</button>
            ))}
          </div>

          <div className="table-wrap">
            <table>
              <thead><tr>
                <th>ID</th><th>Tanggal</th><th>Komoditas</th><th>Jumlah</th><th>Lokasi</th><th>Status</th><th>Aksi</th>
              </tr></thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 30, color: 'var(--text-light)' }}>Memuat data...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7}><div className="empty-state"><i className="ti ti-inbox"></i><h3>Tidak ada data</h3><p>Tidak ada panen dengan filter ini</p></div></td></tr>
                ) : filtered.map(h => (
                  <tr key={h.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '.75rem', color: 'var(--text-light)' }}>AGC-{String(h.id).padStart(4,'0')}</td>
                    <td>{new Date(h.tanggal_panen).toLocaleDateString('id-ID')}</td>
                    <td>{h.komoditas}</td>
                    <td><strong>{h.jumlah} {h.satuan}</strong></td>
                    <td style={{ color: 'var(--text-mid)', fontSize: '.82rem' }}>{h.lokasi}</td>
                    <td>{STATUS_BADGE[h.status] || STATUS_BADGE.pending}</td>
                    <td>
                      <button className="action-btn" onClick={() => openDetail(h)}>
                        <i className="ti ti-eye"></i> Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* MODAL DETAIL */}
      {isModalOpen && selectedHarvest && (
        <div className="modal-overlay open print-hide" onClick={closeDetail} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal open" onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 12, width: 500, maxWidth: '90%', padding: 20 }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
              <div className="modal-title" style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-dark)' }}><i className="ti ti-file-description"></i> Detail Verifikasi</div>
              <button className="modal-close" onClick={closeDetail} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--text-light)' }}><i className="ti ti-x"></i></button>
            </div>
            <div className="modal-body" style={{ marginBottom: 20 }}>
              <div className="quick-info" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                <div className="qi-item"><div className="qi-label" style={{ fontSize: '.75rem', color: 'var(--text-light)' }}>ID Pengajuan</div><div className="qi-val" style={{ fontFamily: 'monospace', fontSize: '.9rem' }}>AGC-{String(selectedHarvest.id).padStart(4, '0')}</div></div>
                <div className="qi-item"><div className="qi-label" style={{ fontSize: '.75rem', color: 'var(--text-light)' }}>Tanggal</div><div className="qi-val" style={{ fontSize: '.9rem' }}>{new Date(selectedHarvest.tanggal_panen).toLocaleDateString('id-ID')}</div></div>
                <div className="qi-item"><div className="qi-label" style={{ fontSize: '.75rem', color: 'var(--text-light)' }}>Komoditas</div><div className="qi-val" style={{ fontSize: '.9rem' }}>{selectedHarvest.komoditas}</div></div>
                <div className="qi-item"><div className="qi-label" style={{ fontSize: '.75rem', color: 'var(--text-light)' }}>Jumlah</div><div className="qi-val" style={{ fontSize: '.9rem' }}>{selectedHarvest.jumlah} {selectedHarvest.satuan}</div></div>
              </div>
              <div style={{ background: 'var(--cream)', borderRadius: 10, padding: '13px 15px', marginBottom: 14, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '.72rem', color: 'var(--text-light)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.5px', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <i className="ti ti-message-circle"></i> Catatan
                </div>
                <div style={{ fontSize: '.84rem', color: 'var(--text-dark)', lineHeight: 1.5 }}>{selectedHarvest.catatan || 'Tidak ada catatan.'}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <span style={{ fontSize: '.78rem', color: 'var(--text-light)' }}>Status saat ini:</span>
                {STATUS_BADGE[selectedHarvest.status] || STATUS_BADGE.pending}
              </div>

              {/* QR Code and Certificate Download for Verified Harvests */}
              {selectedHarvest.status === 'verified' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#f8faf9', padding: 20, borderRadius: 12, border: '1px dashed var(--leaf)', marginTop: 20 }}>
                  <p style={{ fontSize: '.85rem', color: 'var(--forest)', marginBottom: 15, fontWeight: 600 }}><i className="ti ti-certificate"></i> Sertifikat Tersedia</p>
                  <QRCodeSVG 
                    value={`https://sutra-app.com/verify/AGC-${String(selectedHarvest.id).padStart(4, '0')}`} 
                    size={120} 
                    bgColor={"#ffffff"} 
                    fgColor={"#1a3a2a"} 
                    level={"Q"} 
                  />
                  <p style={{ fontSize: '.7rem', color: 'var(--text-light)', marginTop: 8, textAlign: 'center' }}>Scan QR untuk validasi keaslian</p>
                  <button onClick={handlePrint} className="btn btn-primary" style={{ marginTop: 15, width: '100%', justifyContent: 'center' }}>
                    <i className="ti ti-download"></i> Download Sertifikat (PDF)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PRINT-ONLY CERTIFICATE VIEW */}
      {selectedHarvest && selectedHarvest.status === 'verified' && (
        <div className="print-only-certificate" style={{ display: 'none' }}>
          <div style={{ border: '10px solid var(--leaf)', padding: 40, margin: 20, textAlign: 'center', fontFamily: 'serif' }}>
            <h1 style={{ color: 'var(--forest)', fontSize: '2.5rem', marginBottom: 10 }}>Sertifikat Panen</h1>
            <p style={{ fontSize: '1.2rem', color: '#555', marginBottom: 30 }}>Diberikan kepada:</p>
            <h2 style={{ fontSize: '2rem', borderBottom: '2px solid #ccc', display: 'inline-block', paddingBottom: 10, marginBottom: 30 }}>{user?.nama || 'Petani'}</h2>
            <p style={{ fontSize: '1.1rem', lineHeight: 1.6, marginBottom: 40 }}>
              Telah berhasil menyelesaikan proses verifikasi hasil panen untuk komoditas <strong>{selectedHarvest.komoditas}</strong><br/>
              sebanyak <strong>{selectedHarvest.jumlah} {selectedHarvest.satuan}</strong> yang dipanen pada tanggal <strong>{new Date(selectedHarvest.tanggal_panen).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</strong><br/>
              berlokasi di <strong>{selectedHarvest.lokasi}</strong>.
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', marginTop: 50 }}>
              <div>
                <p style={{ marginBottom: 10 }}>Dikeluarkan pada:</p>
                <strong>{new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>
              </div>
              <div>
                <QRCodeSVG 
                  value={`https://sutra-app.com/verify/AGC-${String(selectedHarvest.id).padStart(4, '0')}`} 
                  size={100} 
                />
                <p style={{ fontSize: '.8rem', marginTop: 5 }}>AGC-{String(selectedHarvest.id).padStart(4, '0')}</p>
              </div>
              <div>
                <p style={{ marginBottom: 50 }}>Disahkan oleh,</p>
                <strong>Ketua Kelompok Tani</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-hide { display: none !important; }
          .print-only-certificate, .print-only-certificate * {
            visibility: visible;
          }
          .print-only-certificate {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page { margin: 0; size: landscape; }
        }
      `}</style>
    </div>
  );
}
