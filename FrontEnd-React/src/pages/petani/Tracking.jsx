import { useState, useEffect } from 'react';
import SidebarPetani from '../../components/layout/SidebarPetani';
import Topbar from '../../components/layout/Topbar';
import { useAuth } from '../../context/AuthContext';
import { getHarvestsByPetani } from '../../api/harvests';
import { showToast } from '../../components/ui/Toast';

const STEPS = ['Input Data','Terkirim','Verifikasi Ketua','Finalisasi'];

const statusToStep = { draft: 0, pending: 2, verified: 3, rejected: 2 };

export default function Tracking() {
  const { token } = useAuth();
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHarvestsByPetani(token)
      .then(({ ok, data: res }) => { if (ok) { setData(res.data || []); if (res.data?.length > 0) setSelected(res.data[0]); } })
      .catch(() => showToast('Gagal memuat data', 'error'))
      .finally(() => setLoading(false));
  }, [token]);

  const currentStep = selected ? statusToStep[selected.status] ?? 1 : 0;

  return (
    <div className="dashboard-layout" style={{ display: 'flex', minHeight: '100vh' }}>
      <SidebarPetani />
      <div className="main">
        <Topbar title="Tracking Panen" breadcrumb="Sutra › Tracking" profileLink="/petani/profile" />
        <main className="content">
          <div className="page-header">
            <div className="page-header-text">
              <h1><i className="ti ti-map-search"></i> Tracking Panen</h1>
              <p>Pantau status pengajuan panen Anda secara real-time</p>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-light)' }}>Memuat...</div>
          ) : data.length === 0 ? (
            <div className="card"><div className="card-body"><div className="empty-state"><i className="ti ti-inbox"></i><h3>Belum ada pengajuan</h3><p>Input panen Anda untuk mulai tracking</p></div></div></div>
          ) : (
            <>
              {/* Selector */}
              <div className="card section-gap">
                <div className="card-body" style={{ paddingBottom: 14 }}>
                  <label style={{ fontSize: '.81rem', fontWeight: 500, marginBottom: 8, display: 'block', color: 'var(--text-mid)' }}>Pilih Pengajuan</label>
                  <select className="form-input" style={{ maxWidth: 380 }} value={selected?.id || ''} onChange={e => setSelected(data.find(h => h.id == e.target.value))}>
                    {data.map(h => (
                      <option key={h.id} value={h.id}>AGC-{String(h.id).padStart(4,'0')} — {h.komoditas} {h.jumlah} {h.satuan}</option>
                    ))}
                  </select>
                </div>
              </div>

              {selected && (
                <div className="tracking-card">
                  <div className="tracking-header">
                    <div>
                      <div className="tracking-id">Pengajuan <span>AGC-{String(selected.id).padStart(4,'0')}</span></div>
                      <div style={{ fontSize: '.8rem', color: 'var(--text-mid)', marginTop: 4 }}>{selected.komoditas} · {selected.jumlah} {selected.satuan} · {selected.lokasi}</div>
                    </div>
                    {selected.status === 'verified' && <span className="badge approved"><i className="ti ti-circle-check"></i> Disetujui</span>}
                    {selected.status === 'rejected' && <span className="badge rejected"><i className="ti ti-circle-x"></i> Ditolak</span>}
                    {selected.status === 'pending' && <span className="badge pending"><i className="ti ti-clock"></i> Menunggu</span>}
                  </div>

                  {/* Stepper */}
                  <div className="status-stepper">
                    {STEPS.map((step, i) => (
                      <div key={i} className={`step ${i < currentStep ? 'done' : i === currentStep ? 'current' : ''}`}>
                        <div className="step-circle">
                          {i < currentStep ? <i className="ti ti-check"></i> : i + 1}
                        </div>
                        <div className="step-label">{step}</div>
                      </div>
                    ))}
                  </div>

                  {/* Foto */}
                  {selected.foto && (
                    <div style={{ marginTop: 16 }}>
                      <div style={{ fontSize: '.79rem', fontWeight: 600, color: 'var(--text-mid)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <i className="ti ti-camera" style={{ color: 'var(--leaf)' }}></i> Foto Bukti Panen
                      </div>
                      <img src={selected.foto} alt="Bukti panen" style={{ maxWidth: '100%', maxHeight: 220, borderRadius: 10, objectFit: 'cover' }} />
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
