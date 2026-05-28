import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Toast from './components/ui/Toast';

// Public
import Login from './pages/Login';
import Register from './pages/Register';

// Petani
import DashboardPetani from './pages/petani/Dashboard';
import InputPanen from './pages/petani/InputPanen';
import Riwayat from './pages/petani/Riwayat';
import Tracking from './pages/petani/Tracking';
import Notifikasi from './pages/petani/Notifikasi';
import ProfilePetani from './pages/petani/Profile';

// Ketua
import DashboardKetua from './pages/ketua/Dashboard';
import Verifikasi from './pages/ketua/Verifikasi';
import ManajemenPetani from './pages/ketua/ManajemenPetani';
import Laporan from './pages/ketua/Laporan';
import AuditLog from './pages/ketua/AuditLog';
import ProfileKetua from './pages/ketua/Profile';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toast />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Petani Routes */}
          <Route path="/petani/dashboard" element={<ProtectedRoute allowedRoles={['petani']}><DashboardPetani /></ProtectedRoute>} />
          <Route path="/petani/input-panen" element={<ProtectedRoute allowedRoles={['petani']}><InputPanen /></ProtectedRoute>} />
          <Route path="/petani/riwayat" element={<ProtectedRoute allowedRoles={['petani']}><Riwayat /></ProtectedRoute>} />
          <Route path="/petani/tracking" element={<ProtectedRoute allowedRoles={['petani']}><Tracking /></ProtectedRoute>} />
          <Route path="/petani/notifikasi" element={<ProtectedRoute allowedRoles={['petani']}><Notifikasi /></ProtectedRoute>} />
          <Route path="/petani/profile" element={<ProtectedRoute allowedRoles={['petani']}><ProfilePetani /></ProtectedRoute>} />

          {/* Ketua Routes */}
          <Route path="/ketua/dashboard" element={<ProtectedRoute allowedRoles={['ketua']}><DashboardKetua /></ProtectedRoute>} />
          <Route path="/ketua/verifikasi" element={<ProtectedRoute allowedRoles={['ketua']}><Verifikasi /></ProtectedRoute>} />
          <Route path="/ketua/manajemen-petani" element={<ProtectedRoute allowedRoles={['ketua']}><ManajemenPetani /></ProtectedRoute>} />
          <Route path="/ketua/laporan" element={<ProtectedRoute allowedRoles={['ketua']}><Laporan /></ProtectedRoute>} />
          <Route path="/ketua/audit-log" element={<ProtectedRoute allowedRoles={['ketua']}><AuditLog /></ProtectedRoute>} />
          <Route path="/ketua/profile" element={<ProtectedRoute allowedRoles={['ketua']}><ProfileKetua /></ProtectedRoute>} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
