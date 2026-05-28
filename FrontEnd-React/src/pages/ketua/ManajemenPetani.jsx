import { useState, useEffect } from 'react';
import SidebarKetua from '../../components/layout/SidebarKetua';
import Topbar from '../../components/layout/Topbar';
import { useAuth } from '../../context/AuthContext';
import { getAllUsers, toggleUserStatus, deleteUser } from '../../api/users';
import { getHarvestsForKetua } from '../../api/harvests';
import { showToast } from '../../components/ui/Toast';

export default function ManajemenPetani() {
  const { token } = useAuth();
  const [petaniData, setPetaniData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(null);

  async function load() {
    try {
      const [usersRes, harvestsRes] = await Promise.all([
        getAllUsers(token),
        getHarvestsForKetua(token),
      ]);
      if (usersRes.ok) {
        const harvests = harvestsRes.ok ? (harvestsRes.data.data || []) : [];
        const petani = (usersRes.data.data || [])
          .filter(u => u.role === 'petani')
          .map(p => {
            const myHarvests = harvests.filter(h => h.petani_id === p.id && h.status === 'verified');
            let totalKg = myHarvests.reduce((acc, h) => {
              let kg = parseFloat(h.jumlah) || 0;
              if (h.satuan?.toLowerCase() === 'ton') kg *= 1000;
              if (h.satuan?.toLowerCase() === 'kuintal') kg *= 100;
              return acc + kg;
            }, 0);
            return { ...p, panen: (totalKg / 1000).toFixed(2) + ' ton', active: p.status === 'acc' };
          });
        setPetaniData(petani);
        applyFilter('all', petani);
      }
    } catch { showToast('Gagal memuat data', 'error'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [token]);

  const applyFilter = (f, source = petaniData) => {
    setActiveFilter(f);
    let result = source;
    if (f === 'active') result = source.filter(p => p.active);
    else if (f === 'inactive') result = source.filter(p => !p.active);
    if (search) result = result.filter(p => p.nama.toLowerCase().includes(search.toLowerCase()));
    setFiltered(result);
  };

  const handleSearch = (q) => {
    setSearch(q);
    let result = petaniData;
    if (activeFilter === 'active') result = petaniData.filter(p => p.active);
    else if (activeFilter === 'inactive') result = petaniData.filter(p => !p.active);
    setFiltered(result.filter(p => p.nama.toLowerCase().includes(q.toLowerCase())));
  };

  async function handleToggle(id, isActive) {
    if (!confirm(`${isActive ? 'Nonaktifkan' : 'Aktifkan'} petani ini?`)) return;
    const { ok } = await toggleUserStatus(token, id);
    if (ok) { showToast('Status berhasil diubah', 'success'); load(); }
    else showToast('Gagal mengubah status', 'error');
  }

  async function handleDelete(id) {
    if (!confirm('Hapus petani ini secara permanen?')) return;
    const { ok, data } = await deleteUser(token, id);
    if (ok) { showToast('Petani berhasil dihapus', 'success'); load(); }
    else showToast(data.message || 'Gagal menghapus', 'error');
  }

  const stats = {
    total: petaniData.length,
    active: petaniData.filter(p => p.active).length,
    inactive: petaniData.filter(p => !p.active).length,
  };

  return (
    <div className="dashboard-layout" style={{ display: 'flex', minHeight: '100vh' }}>
      <SidebarKetua />
      <div className="main">
        <Topbar title="Manajemen Petani" breadcrumb="Sutra › Manajemen Petani" profileLink="/ketua/profile" />
        <main className="content">
          <div className="page-header">
            <div className="page-header-text">
              <h1><i className="ti ti-users"></i> Manajemen Petani</h1>
              <p>Kelola data seluruh petani dalam kelompok tani Anda</p>
            </div>
          </div>

          {/* Stats */}
          <div className="quick-info" style={{ marginBottom: 20 }}>
            <div className="qi-item"><div className="qi-label">Total Petani</div><div className="qi-val">{stats.total}</div></div>
            <div className="qi-item"><div className="qi-label">Aktif</div><div className="qi-val" style={{ color: 'var(--leaf)' }}>{stats.active}</div></div>
            <div className="qi-item"><div className="qi-label">Tidak Aktif</div><div className="qi-val" style={{ color: 'var(--text-light)' }}>{stats.inactive}</div></div>
            <div className="qi-item"><div className="qi-label">Daerah</div><div className="qi-val" style={{ color: 'var(--sky)' }}>1</div></div>
          </div>

          {/* Search + Filter */}
          <div className="filter-bar">
            <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
              <i className="ti ti-search" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)', fontSize: 15, pointerEvents: 'none' }}></i>
              <input type="text" className="form-input" style={{ paddingLeft: 36 }} placeholder="Cari nama petani..." value={search} onChange={e => handleSearch(e.target.value)} />
            </div>
            {[['all','Semua'],['active','Aktif'],['inactive','Tidak Aktif']].map(([f, label]) => (
              <button key={f} className={`filter-btn${activeFilter === f ? ' active' : ''}`} onClick={() => applyFilter(f)}>{label}</button>
            ))}
          </div>

          <div className="table-wrap">
            <table>
              <thead><tr>
                <th>Nama Petani</th><th>ID</th><th>Komoditas</th><th>Lahan</th><th>Panen 2025</th><th>Status</th><th>Aksi</th>
              </tr></thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 30, color: 'var(--text-light)' }}>Memuat...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7}><div className="empty-state"><i className="ti ti-inbox"></i><h3>Tidak ada petani</h3></div></td></tr>
                ) : filtered.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,var(--leaf),var(--mint))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '.75rem', fontWeight: 700, flexShrink: 0 }}>
                          {p.nama.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}
                        </div>
                        <strong>{p.nama}</strong>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '.75rem', color: 'var(--text-light)' }}>AGR-{String(p.id).padStart(5,'0')}</td>
                    <td style={{ fontSize: '.82rem', color: 'var(--text-mid)' }}>{p.komoditas || 'Belum diatur'}</td>
                    <td>{p.lahan ? `${p.lahan} Ha` : '0 Ha'}</td>
                    <td>{p.panen}</td>
                    <td>
                      {p.active
                        ? <span className="badge approved"><i className="ti ti-circle-check"></i> Aktif</span>
                        : <span className="badge pending"><i className="ti ti-clock"></i> Pending</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button className="action-btn" title={p.active ? 'Nonaktifkan' : 'Aktifkan'} onClick={() => handleToggle(p.id, p.active)}>
                          <i className={`ti ${p.active ? 'ti-user-off' : 'ti-user-check'}`}></i>
                        </button>
                        <button className="action-btn danger" title="Hapus Permanen" onClick={() => handleDelete(p.id)}>
                          <i className="ti ti-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
