import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './lib/auth';
import PublicWedding from './pages/PublicWedding';
import Login from './pages/admin/Login';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Guests from './pages/admin/Guests';

function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'glass-panel text-ra-text border-ra-gold/20 font-poppins',
          style: {
            background: '#141414',
            color: '#F5F5F5',
            border: '1px solid rgba(212, 175, 55, 0.15)',
          },
          duration: 4000,
        }}
      />
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<PublicWedding />} />
        
        {/* Login Route */}
        <Route path="/admin/login" element={<Login />} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="guests" element={<Guests />} />
          {/* Catch all in admin area and redirect back to admin main */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>

        {/* Global Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
