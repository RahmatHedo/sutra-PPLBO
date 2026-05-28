import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Topbar({ title, breadcrumb, profileLink }) {
  const { user } = useAuth();
  const initials = user?.nama
    ? user.nama.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="page-title">{title}</div>
        {breadcrumb && <div className="breadcrumb">{breadcrumb}</div>}
      </div>
      <div className="topbar-right">
        <NavLink to={profileLink || '#'} className="topbar-avatar" title={user?.nama}>
          {initials}
        </NavLink>
      </div>
    </header>
  );
}
