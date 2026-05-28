import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarPetani from '../../components/layout/SidebarPetani';
import Topbar from '../../components/layout/Topbar';
import { useAuth } from '../../context/AuthContext';
import { createHarvest } from '../../api/harvests';
import { uploadHarvestPhoto } from '../../utils/supabaseStorage';
import { showToast } from '../../components/ui/Toast';

export default function InputPanen() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fotoUrl, setFotoUrl] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [form, setForm] = useState({
    tanggal_panen: '', komoditas: '', jumlah: '', satuan: 'kg',
    lokasi: '', luas: '', cuaca: '', kualitas: '', catatan: ''
  });

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  async function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { showToast('Hanya file gambar yang dibolehkan!', 'error'); return; }
    if (file.size > 5 * 1024 * 1024) { showToast('Ukuran file maksimal 5MB', 'error'); return; }

    // Preview lokal
    setFotoPreview(URL.createObjectURL(file));
    setUploading(true);
    showToast('Mengunggah foto ke Supabase...', 'info');

    try {
      const url = await uploadHarvestPhoto(file, user.id);
      setFotoUrl(url);
      showToast('Foto berhasil diunggah! ✓', 'success');
    } catch (err) {
      showToast(`Gagal upload foto: ${err.message}`, 'error');
      setFotoPreview(null);
    } finally {
      setUploading(false);
    }
  }

  async function submitPanen(e) {
    e.preventDefault();
    if (!form.tanggal_panen || !form.komoditas || !form.jumlah || !form.satuan || !form.lokasi || !form.luas || !form.cuaca || !form.kualitas || !form.catatan) {
      showToast('Lengkapi semua field wajib (*)', 'error');
      return;
    }
    setLoading(true);
    try {
      const { ok, data } = await createHarvest(token, { ...form, foto_url: fotoUrl });
      if (ok) {
        showToast('Pengajuan berhasil dikirim! Menunggu verifikasi ketua.', 'success');
        setTimeout(() => navigate('/petani/riwayat'), 1400);
      } else {
        showToast(data.message || 'Gagal mengirim data', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan pada server', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dashboard-layout" style={{ display: 'flex', minHeight: '100vh' }}>
      <SidebarPetani />
      <div className="main">
        <Topbar title="Input Hasil Panen" breadcrumb="Sutra › Input Panen" profileLink="/petani/profile" />
        <main className="content">

          <div className="page-header">
            <div className="page-header-text">
              <h1><i className="ti ti-plus"></i> Input Hasil Panen</h1>
              <p>Isi formulir di bawah untuk mendaftarkan hasil panen Anda</p>
            </div>
            <a href="/petani/riwayat" className="btn btn-secondary"><i className="ti ti-clipboard-list"></i> Lihat Riwayat</a>
          </div>

          <div className="card section-gap">
            <div className="card-header">
              <div className="card-title"><i className="ti ti-file-description"></i> Formulir Input Panen</div>
              <span className="badge draft"><i className="ti ti-pencil"></i> Draft</span>
            </div>
            <div className="card-body">
              <form onSubmit={submitPanen}>
                <div className="form-grid">
                  <div className="form-group">
                    <label><i className="ti ti-calendar"></i> Tanggal Panen *</label>
                    <input type="date" className="form-input" value={form.tanggal_panen} onChange={set('tanggal_panen')} required />
                  </div>
                  <div className="form-group">
                    <label><i className="ti ti-wheat"></i> Jenis Komoditas *</label>
                    <select className="form-input" value={form.komoditas} onChange={set('komoditas')} required>
                      <option value="">— Pilih komoditas —</option>
                      {['Padi','Jagung','Singkong','Kedelai','Cabai','Tomat','Bawang Merah','Lainnya'].map(k => <option key={k}>{k}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label><i className="ti ti-scale"></i> Jumlah Panen *</label>
                    <input type="number" className="form-input" placeholder="cth: 450" value={form.jumlah} onChange={set('jumlah')} min="0" required />
                  </div>
                  <div className="form-group">
                    <label><i className="ti ti-ruler"></i> Satuan</label>
                    <select className="form-input" value={form.satuan} onChange={set('satuan')}>
                      <option value="kg">Kilogram (kg)</option>
                      <option value="ton">Ton (t)</option>
                      <option value="kuintal">Kuintal (kw)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label><i className="ti ti-map-pin"></i> Lokasi Lahan *</label>
                    <input type="text" className="form-input" placeholder="cth: Blok A, Desa Sukamaju" value={form.lokasi} onChange={set('lokasi')} required />
                  </div>
                  <div className="form-group">
                    <label><i className="ti ti-square-rotated"></i> Luas Lahan (m²) *</label>
                    <input type="number" className="form-input" placeholder="cth: 5000" value={form.luas} onChange={set('luas')} min="0" required />
                  </div>
                  <div className="form-group">
                    <label><i className="ti ti-thermometer"></i> Kondisi Cuaca *</label>
                    <select className="form-input" value={form.cuaca} onChange={set('cuaca')} required>
                      <option value="">— Pilih kondisi cuaca —</option>
                      {['Cerah','Berawan','Hujan Ringan','Hujan Deras'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label><i className="ti ti-star"></i> Kualitas Panen *</label>
                    <select className="form-input" value={form.kualitas} onChange={set('kualitas')} required>
                      <option value="">— Pilih kualitas —</option>
                      {['Premium (Grade A)','Standar (Grade B)','Bawah Standar'].map(k => <option key={k}>{k}</option>)}
                    </select>
                  </div>
                  <div className="form-group span-2">
                    <label><i className="ti ti-notes"></i> Catatan Tambahan *</label>
                    <textarea className="form-input" rows={3} placeholder="Kualitas panen, kondisi, kendala..." value={form.catatan} onChange={set('catatan')} required />
                  </div>

                  {/* FOTO UPLOAD */}
                  <div className="form-group span-2">
                    <label><i className="ti ti-camera"></i> Foto Bukti Panen</label>
                    <div
                      className="upload-area"
                      onClick={() => !uploading && fileInputRef.current?.click()}
                      style={{ borderColor: fotoUrl ? 'var(--leaf)' : undefined, cursor: uploading ? 'not-allowed' : 'pointer' }}
                    >
                      {fotoPreview ? (
                        <img src={fotoPreview} alt="Preview" style={{ maxHeight: 160, borderRadius: 8, margin: '0 auto' }} />
                      ) : (
                        <>
                          <i className={`ti ${uploading ? 'ti-loader-2' : 'ti-photo-up'}`} style={{ color: fotoUrl ? 'var(--leaf)' : undefined }}></i>
                          <div className="upload-text">
                            {uploading ? 'Mengunggah ke Supabase...' : fotoUrl ? '✓ Foto berhasil diunggah' : 'Klik untuk upload foto bukti panen'}
                          </div>
                          <div className="upload-hint">Format: JPG, PNG — Maks. 5MB · Langsung tersimpan di Supabase Storage</div>
                        </>
                      )}
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileSelect} />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={loading || uploading}>
                    <i className="ti ti-send"></i> {loading ? 'Mengirim...' : 'Submit Verifikasi'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => { setForm({ tanggal_panen:'',komoditas:'',jumlah:'',satuan:'kg',lokasi:'',luas:'',cuaca:'',kualitas:'',catatan:'' }); setFotoUrl(null); setFotoPreview(null); }}>
                    <i className="ti ti-refresh"></i> Reset
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="tip-box blue">
            <i className="ti ti-bulb"></i>
            <div>
              <strong>Tips Upload Foto</strong>
              <p>Foto langsung diunggah ke Supabase Storage dan dapat dilihat oleh Ketua saat verifikasi. Pastikan foto jelas dan menampilkan komoditas beserta timbangan.</p>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
