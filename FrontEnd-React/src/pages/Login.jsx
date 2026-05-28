import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as apiLogin } from '../api/auth';
import { showToast } from '../components/ui/Toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('petani');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  async function doLogin(e) {
    e.preventDefault();
    if (!email || !password) {
      showToast('Email dan password wajib diisi!', 'error');
      return;
    }
    setLoading(true);
    try {
      const { ok, data } = await apiLogin(email, password);
      if (ok) {
        login(data.token, data.user);
        showToast(`Selamat datang, ${data.user.nama.split(' ')[0]}! 👋`, 'success');
        setTimeout(() => {
          if (data.user.role === 'petani') navigate('/petani/dashboard');
          else if (data.user.role === 'ketua') navigate('/ketua/dashboard');
          else navigate('/login');
        }, 900);
      } else {
        showToast(data.message || 'Login gagal', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan koneksi ke server', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-grid" style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 480px', background: 'var(--forest)' }}>
      {/* LEFT PANEL */}
      <div className="login-left" style={{ padding: 48, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'rgba(168,224,107,0.06)', top: -100, left: -100, pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(95,191,138,0.07)', bottom: -80, right: -80, pointerEvents: 'none' }}></div>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, zIndex: 1 }}>
          <div style={{ width: 46, height: 46, background: 'linear-gradient(135deg, var(--lime), var(--mint))', borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="ti ti-plant" style={{ fontSize: 24, color: 'var(--forest)' }}></i>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.52rem', color: '#fff', letterSpacing: '-0.3px' }}>
            Su<span style={{ color: 'var(--lime)' }}>tra</span>
          </div>
        </div>

        {/* Hero */}
        <div style={{ zIndex: 1 }}>
          <h1 style={{ fontSize: '2.6rem', color: '#fff', lineHeight: 1.15, marginBottom: 16, fontWeight: 800 }}>
            Verifikasi Panen<br />yang <span style={{ color: 'var(--lime)' }}>Transparan</span><br />& Terpercaya
          </h1>
          <p style={{ fontSize: '0.97rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, maxWidth: 420 }}>
            Platform digital untuk petani dan ketua kelompok tani dalam mengelola, memverifikasi, dan melacak hasil panen secara real-time.
          </p>
        </div>

        {/* Features */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, zIndex: 1 }}>
          {[
            { icon: 'ti-shield-check', title: '2 Tahap Verifikasi', desc: 'Verifikasi awal oleh petani, final oleh ketua kelompok' },
            { icon: 'ti-timeline', title: 'Tracking Real-time', desc: 'Pantau status panen dari input hingga finalisasi' },
            { icon: 'ti-chart-bar', title: 'Laporan Produksi', desc: 'Analitik data panen bulanan & tahunan lengkap' },
          ].map(f => (
            <div key={f.title} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(168,224,107,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className={`ti ${f.icon}`} style={{ fontSize: 17, color: 'var(--lime)' }}></i>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.85rem', color: '#fff', marginBottom: 2 }}>{f.title}</strong>
                <span style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.45)' }}>{f.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="login-right" style={{ background: 'var(--warm-white)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 44px', position: 'relative' }}>
        <div style={{ marginBottom: 30 }}>
          <h2 style={{ fontSize: '1.65rem', color: 'var(--text-dark)', marginBottom: 6 }}>Selamat Datang</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Masuk ke akun Sutra Anda</p>
        </div>

        {/* Role Select */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}>
          {[{ val: 'petani', icon: 'ti-user', label: 'Petani' }, { val: 'ketua', icon: 'ti-users', label: 'Ketua Petani' }].map(r => (
            <button
              key={r.val}
              type="button"
              onClick={() => {
                setRole(r.val);
                if (r.val === 'petani') {
                  setEmail('wahyu@sutra.com');
                  setPassword('password123');
                } else {
                  setEmail('ketua.pga@sutra.com');
                  setPassword('password123');
                }
              }}
              style={{
                padding: '12px 14px', borderRadius: 11, border: `2px solid ${role === r.val ? 'var(--leaf)' : 'var(--border)'}`,
                background: role === r.val ? 'rgba(61,139,94,0.06)' : '#fff', cursor: 'pointer',
                textAlign: 'center', transition: 'all .17s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6
              }}
            >
              <i className={`ti ${r.icon}`} style={{ fontSize: 22, color: role === r.val ? 'var(--leaf)' : 'var(--text-light)' }}></i>
              <span style={{ fontSize: '0.82rem', fontWeight: role === r.val ? 600 : 500, color: role === r.val ? 'var(--leaf)' : 'var(--text-mid)', fontFamily: 'var(--font-body)' }}>{r.label}</span>
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={doLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
          <div className="form-group">
            <label><i className="ti ti-at"></i> Username / Email</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <div style={{ position: 'absolute', left: 13, color: 'var(--text-light)', pointerEvents: 'none' }}><i className="ti ti-user" style={{ fontSize: 17 }}></i></div>
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: 40 }}
                placeholder="Masukkan username Anda"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label><i className="ti ti-lock"></i> Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <div style={{ position: 'absolute', left: 13, color: 'var(--text-light)', pointerEvents: 'none' }}><i className="ti ti-lock" style={{ fontSize: 17 }}></i></div>
              <input
                type={showPass ? 'text' : 'password'}
                className="form-input"
                style={{ paddingLeft: 40, paddingRight: 40 }}
                placeholder="Masukkan password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', display: 'flex', padding: 4 }}>
                <i className={`ti ${showPass ? 'ti-eye-off' : 'ti-eye'}`} style={{ fontSize: 17 }}></i>
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.81rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', color: 'var(--text-mid)' }}>
              <input type="checkbox" style={{ accentColor: 'var(--leaf)', width: 15, height: 15 }} /> Ingat saya
            </label>
            <a href="#" style={{ color: 'var(--leaf)', fontWeight: 500, textDecoration: 'none' }}>Lupa password?</a>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: 13, background: 'linear-gradient(135deg, var(--forest-mid), var(--leaf))', color: '#fff', border: 'none', borderRadius: 11, fontFamily: 'var(--font-body)', fontSize: '0.95rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', transition: 'all .18s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 6, boxShadow: '0 4px 14px rgba(26,58,42,0.22)', letterSpacing: '0.2px' }}
          >
            {loading ? (
              <><i className="ti ti-loader-2" style={{ animation: 'spin 1s linear infinite' }}></i> Memproses...</>
            ) : (
              <><i className="ti ti-login" style={{ fontSize: 18 }}></i> Masuk Sekarang</>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-light)', marginTop: 20 }}>
          Belum punya akun?{' '}
          <Link to="/register" style={{ color: 'var(--leaf)', fontWeight: 500, textDecoration: 'none' }}>Daftar di sini</Link>
        </div>

        <div style={{ background: 'var(--cream)', padding: '12px 16px', borderRadius: 10, border: '1px dashed var(--border)', marginTop: 24, fontSize: '0.8rem', color: 'var(--text-mid)', textAlign: 'center', lineHeight: 1.5 }}>
          <i className="ti ti-info-circle" style={{ color: 'var(--leaf)', marginRight: 5, fontSize: 16, verticalAlign: 'text-bottom' }}></i>
          <strong>Info Akun Demo:</strong><br/>
          Klik peran <strong>Petani</strong> atau <strong>Ketua</strong> di atas untuk otomatis mengisi form.
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
