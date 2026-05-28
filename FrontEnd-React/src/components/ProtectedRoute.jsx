import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'var(--font-body)', color: 'var(--text-mid)' }}>
        <div>Memuat...</div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect ke dashboard yang sesuai role
    if (user.role === 'petani') return <Navigate to="/petani/dashboard" replace />;
    if (user.role === 'ketua') return <Navigate to="/ketua/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
}
