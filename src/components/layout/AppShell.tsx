import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth, useIsAdmin } from '../../context/auth.store';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const isAdmin = useIsAdmin();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        isAdmin={isAdmin}
        user={user}
        onToggle={() => setSidebarOpen(o => !o)}
      />

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Navbar
          user={user}
          isAdmin={isAdmin}
          onMenuToggle={() => setSidebarOpen(o => !o)}
          onLogout={handleLogout}
          onSwitchRole={() => navigate(isAdmin ? '/dashboard' : '/admin')}
        />

        {/* Page content */}
        <main style={{
          flex: 1, overflowY: 'auto', overflowX: 'hidden',
          padding: 'clamp(12px, 2.5vw, 24px)',
          background: 'var(--bg, #F4F6F3)',
        }}>
          <Outlet />
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{
            display: 'none', // visible via CSS @media
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 40,
          }}
          className="mobile-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
