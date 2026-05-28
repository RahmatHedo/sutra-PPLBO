import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register as apiRegister } from '../api/auth';
import { showToast } from '../components/ui/Toast';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nama: '', email: '', alamat: '', daerah: '', password: '', confirmPassword: '', role: 'petani' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  async function doRegister(e) {
    e.preventDefault();
    if (!form.nama || !form.email || !form.alamat || !form.daerah || !form.password || !form.confirmPassword) {
      showToast('Semua kolom wajib diisi!', 'error');
      return;
    }
    if (form.password !== form.confirmPassword) {
      showToast('Password dan Konfirmasi Password tidak cocok!', 'error');
      return;
    }
    setLoading(true);
    try {
      const { ok, data } = await apiRegister(form);
      if (ok) {
        showToast('Akun berhasil dibuat! Silakan masuk.', 'success');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        alert("Pesan dari Server: " + (data.message || 'Registrasi gagal'));
      }
    } catch {
      showToast('Terjadi kesalahan koneksi ke server.', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--warm-white)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
      <div style={{ background: '#fff', borderRadius: 20, border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(26,58,42,0.1)', width: 560, maxWidth: '100%', padding: '36px 38px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 16, textDecoration: 'none' }}>
            <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, var(--lime), var(--mint))', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="ti ti-plant" style={{ fontSize: 21, color: 'var(--forest)' }}></i>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--text-dark)' }}>
              Su<span style={{ color: 'var(--leaf)' }}>tra</span>
            </div>
          </Link>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--text-dark)', marginBottom: 5 }}>Buat Akun Baru</h2>
          <p style={{ fontSize: '0.83rem', color: 'var(--text-light)' }}>Bergabung dengan Sutra untuk mulai verifikasi panen</p>
        </div>

        <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-mid)', marginBottom: 10 }}>Pilih Peran</p>
        {/* Role Selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
          {[{ val: 'petani', icon: 'ti-user', label: 'Petani' }, { val: 'ketua', icon: 'ti-users', label: 'Ketua Petani' }].map(r => (
            <button
              key={r.val}
              type="button"
              onClick={() => setForm(prev => ({ ...prev, role: r.val }))}
              style={{
                padding: '10px 14px', borderRadius: 10, border: `2px solid ${form.role === r.val ? 'var(--leaf)' : 'var(--border)'}`,
                background: form.role === r.val ? 'rgba(61,139,94,0.06)' : '#fff', cursor: 'pointer',
                textAlign: 'center', transition: 'all .16s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5
              }}
            >
              <i className={`ti ${r.icon}`} style={{ fontSize: 20, color: form.role === r.val ? 'var(--leaf)' : 'var(--text-light)', transition: 'color .16s' }}></i>
              <span style={{ fontSize: '0.8rem', fontWeight: 500, color: form.role === r.val ? 'var(--leaf)' : 'var(--text-mid)', fontFamily: 'var(--font-body)' }}>{r.label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={doRegister}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 18 }}>
            
            <div className="form-group">
              <label><i className="ti ti-user"></i> Nama </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <div style={{ position: 'absolute', left: 12, color: 'var(--text-light)', pointerEvents: 'none' }}><i className="ti ti-user" style={{ fontSize: 17 }}></i></div>
                <input type="text" className="form-input" style={{ paddingLeft: 39 }} placeholder="Nama" value={form.nama} onChange={set('nama')} required />
              </div>
            </div>

            <div className="form-group">
              <label><i className="ti ti-at"></i> Email</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <div style={{ position: 'absolute', left: 12, color: 'var(--text-light)', pointerEvents: 'none' }}><i className="ti ti-mail" style={{ fontSize: 17 }}></i></div>
                <input type="email" className="form-input" style={{ paddingLeft: 39 }} placeholder="email@example.com" value={form.email} onChange={set('email')} required />
              </div>
            </div>

            <div className="form-group">
              <label><i className="ti ti-map-pin"></i> Alamat</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <div style={{ position: 'absolute', left: 12, color: 'var(--text-light)', pointerEvents: 'none' }}><i className="ti ti-map-pin" style={{ fontSize: 17 }}></i></div>
                <input type="text" className="form-input" style={{ paddingLeft: 39 }} placeholder="Kota baru, Jambi" value={form.alamat} onChange={set('alamat')} required />
              </div>
            </div>

            <div className="form-group">
              <label><i className="ti ti-map-pin"></i> Daerah (Kelompok Tani)</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <div style={{ position: 'absolute', left: 12, color: 'var(--text-light)', pointerEvents: 'none' }}><i className="ti ti-building-community" style={{ fontSize: 17 }}></i></div>
                <select className="form-input" style={{ paddingLeft: 39 }} value={form.daerah} onChange={set('daerah')} required>
                  <option value="" disabled>Pilih daerah anda...</option>
                  <option value="padang_panjang">Padang Panjang</option>
                  <option value="pagaralam">Pagaralam</option>
                  <option value="tebing_tinggi">Tebing Tinggi</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label><i className="ti ti-lock"></i> Password</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <div style={{ position: 'absolute', left: 12, color: 'var(--text-light)', pointerEvents: 'none' }}><i className="ti ti-lock" style={{ fontSize: 17 }}></i></div>
                <input type={showPassword ? "text" : "password"} className="form-input" style={{ paddingLeft: 39, paddingRight: 40 }} placeholder="Minimal 8 karakter" value={form.password} onChange={set('password')} required />
                <div 
                  style={{ position: 'absolute', right: 12, color: 'var(--text-light)', cursor: 'pointer' }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`ti ${showPassword ? 'ti-eye-off' : 'ti-eye'}`} style={{ fontSize: 17 }}></i>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label><i className="ti ti-shield-lock"></i> Konfirmasi Password</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <div style={{ position: 'absolute', left: 12, color: 'var(--text-light)', pointerEvents: 'none' }}><i className="ti ti-shield-lock" style={{ fontSize: 17 }}></i></div>
                <input type={showConfirmPassword ? "text" : "password"} className="form-input" style={{ paddingLeft: 39, paddingRight: 40 }} placeholder="Ulangi password" value={form.confirmPassword} onChange={set('confirmPassword')} required />
                <div 
                  style={{ position: 'absolute', right: 12, color: 'var(--text-light)', cursor: 'pointer' }}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <i className={`ti ${showConfirmPassword ? 'ti-eye-off' : 'ti-eye'}`} style={{ fontSize: 17 }}></i>
                </div>
              </div>
            </div>

          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: 13, background: 'linear-gradient(135deg, var(--forest-mid), var(--leaf))', color: '#fff', border: 'none', borderRadius: 11, fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', transition: 'all .18s', boxShadow: '0 4px 14px rgba(26,58,42,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 14 }}>
            {loading ? <><i className="ti ti-loader-2" style={{ animation: 'spin 1s linear infinite' }}></i> Mendaftarkan...</> : <><i className="ti ti-user-plus" style={{ fontSize: 18 }}></i> Buat Akun</>}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-light)' }}>
          Sudah punya akun? <Link to="/login" style={{ color: 'var(--leaf)', fontWeight: 500, textDecoration: 'none' }}>Masuk di sini</Link>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
