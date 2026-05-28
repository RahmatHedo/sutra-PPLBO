import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function SidebarKetua() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.nama
    ? user.nama.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'K';

  const navItems = [
    { key: 'dashboard', icon: 'ti-layout-dashboard', label: 'Dashboard', to: '/ketua/dashboard' },
    { key: 'verifikasi', icon: 'ti-shield-check', label: 'Verifikasi Panen', to: '/ketua/verifikasi' },
    { key: 'manajemen-petani', icon: 'ti-users', label: 'Manajemen Petani', to: '/ketua/manajemen-petani' },
    { key: 'laporan', icon: 'ti-chart-bar', label: 'Laporan Produksi', to: '/ketua/laporan' },
    { key: 'audit-log', icon: 'ti-list-details', label: 'Audit Log', to: '/ketua/audit-log' },
    { key: 'profile', icon: 'ti-user', label: 'Profil Saya', to: '/ketua/profile' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <NavLink to="/ketua/dashboard" className="logo-mark">
          <div className="logo-icon"><i className="ti ti-plant"></i></div>
          <div className="logo-text">Su<span>tra</span></div>
        </NavLink>
        <div className="sidebar-role">
          <span className="role-dot"></span>
          <span>{user?.daerah || 'Kelompok Tani'} — Ketua</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-label">Menu Ketua</div>
        {navItems.map(item => (
          <NavLink
            key={item.key}
            to={item.to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <i className={`ti ${item.icon}`}></i>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user" style={{ cursor: 'pointer', flex: 1, paddingRight: '8px' }} onClick={() => navigate('/ketua/profile')} title="Buka Profil">
          <div className="user-avatar-sm">{initials}</div>
          <div className="user-info-sm">
            <div className="user-name-sm">{user?.nama || 'Ketua'}</div>
            <div className="user-sub-sm">Status Aktif</div>
          </div>
        </div>
        <div style={{ padding: '8px' }}>
          <i className="ti ti-logout sidebar-footer-icon" style={{ fontSize: 18, cursor: 'pointer', padding: '4px' }} onClick={handleLogout} title="Keluar"></i>
        </div>
      </div>
    </aside>
  );
}
