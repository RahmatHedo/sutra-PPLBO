import { useState } from 'react';
import SidebarPetani from '../../components/layout/SidebarPetani';
import Topbar from '../../components/layout/Topbar';
import { useAuth } from '../../context/AuthContext';
import { updateUser } from '../../api/users';
import { showToast } from '../../components/ui/Toast';

export default function ProfilePetani() {
  const { user, token, login } = useAuth();
  const [form, setForm] = useState({ nama: user?.nama || '', alamat: user?.alamat || '', daerah: user?.daerah || '' });
  const [loading, setLoading] = useState(false);

  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

  async function saveProfile(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { ok, data } = await updateUser(token, user.id, form);
      if (ok) {
        login(token, { ...user, ...form });
        showToast('Profil berhasil diperbarui!', 'success');
      } else {
        showToast(data.message || 'Gagal menyimpan', 'error');
      }
    } catch {
      showToast('Koneksi server gagal', 'error');
    } finally {
      setLoading(false);
    }
  }

  const initials = user?.nama?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() || 'P';

  return (
    <div className="dashboard-layout" style={{ display: 'flex', minHeight: '100vh' }}>
      <SidebarPetani />
      <div className="main">
        <Topbar title="Profil Saya" breadcrumb="Sutra › Profil" profileLink="/petani/profile" />
        <main className="content">
          <div className="profile-hero">
            <div className="profile-avatar-lg">{initials}</div>
            <div className="profile-info">
              <h3>{user?.nama}</h3>
              <p>{user?.email}</p>
              <div className="profile-tags">
                <div className="profile-tag"><i className="ti ti-map-pin"></i> {user?.daerah || 'Belum diatur'}</div>
                <div className="profile-tag"><i className="ti ti-wheat"></i> {user?.komoditas || 'Belum diatur'}</div>
                <div className="profile-tag"><i className="ti ti-shield-check"></i> Petani Terverifikasi</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><div className="card-title"><i className="ti ti-pencil"></i> Edit Profil</div></div>
            <div className="card-body">
              <form onSubmit={saveProfile}>
                <div className="form-grid" style={{ marginBottom: 16 }}>
                  <div className="form-group">
                    <label><i className="ti ti-user"></i> Nama Lengkap</label>
                    <input type="text" className="form-input" value={form.nama} onChange={set('nama')} required />
                  </div>
                  <div className="form-group">
                    <label><i className="ti ti-map-pin"></i> Kelompok / Daerah</label>
                    <select className="form-input" value={form.daerah} onChange={set('daerah')} required>
                      <option value="" disabled>Pilih Daerah</option>
                      <option value="Padang Panjang">Padang Panjang</option>
                      <option value="Pagaralam">Pagaralam</option>
                      <option value="Bukit Tinggi">Bukit Tinggi</option>
                    </select>
                  </div>
                  <div className="form-group span-2">
                    <label><i className="ti ti-home"></i> Alamat</label>
                    <textarea className="form-input" rows={3} value={form.alamat} onChange={set('alamat')} />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    <i className="ti ti-device-floppy"></i> {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
