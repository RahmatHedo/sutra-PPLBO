import { useState, useEffect, useCallback } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function SidebarPetani({ activePage }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.nama
    ? user.nama.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'P';

  const navItems = [
    { key: 'dashboard', icon: 'ti-layout-dashboard', label: 'Dashboard', to: '/petani/dashboard' },
    { key: 'input-panen', icon: 'ti-plus', label: 'Input Panen', to: '/petani/input-panen' },
    { key: 'riwayat', icon: 'ti-clipboard-list', label: 'Riwayat Verifikasi', to: '/petani/riwayat' },
    { key: 'tracking', icon: 'ti-map-search', label: 'Tracking', to: '/petani/tracking' },
    { key: 'notifikasi', icon: 'ti-bell', label: 'Notifikasi', to: '/petani/notifikasi' },
    { key: 'profile', icon: 'ti-user', label: 'Profil Saya', to: '/petani/profile' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="sidebar-overlay show"
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 199 }}
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside id="sidebar" className={`sidebar${isOpen ? ' open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <NavLink to="/petani/dashboard" className="logo-mark">
            <div className="logo-icon"><i className="ti ti-plant"></i></div>
            <div className="logo-text">Su<span>tra</span></div>
          </NavLink>
          <div className="sidebar-role">
            <span className="role-dot"></span>
            <span>{user?.daerah || 'Kelompok Tani'} — Petani</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <div className="nav-label">Menu Utama</div>
          {navItems.map(item => (
            <NavLink
              key={item.key}
              to={item.to}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              <i className={`ti ${item.icon}`}></i>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user" style={{ cursor: 'pointer', flex: 1, paddingRight: '8px' }} onClick={() => navigate('/petani/profile')} title="Buka Profil">
            <div className="user-avatar-sm">{initials}</div>
            <div className="user-info-sm">
              <div className="user-name-sm">{user?.nama || 'Petani'}</div>
              <div className="user-sub-sm">Status Aktif</div>
            </div>
          </div>
          <div style={{ padding: '8px' }}>
            <i className="ti ti-logout sidebar-footer-icon" style={{ fontSize: 18, cursor: 'pointer', padding: '4px' }} onClick={handleLogout} title="Keluar"></i>
          </div>
        </div>
      </aside>

      {/* Mobile menu toggle button — rendered in Topbar */}
    </>
  );
}
