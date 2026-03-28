import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  user: any;
  isAdmin: boolean;
  onMenuToggle: () => void;
  onLogout: () => void;
  onSwitchRole: () => void;
}

const F = "'Plus Jakarta Sans', sans-serif";

export default function Navbar({ user, isAdmin, onMenuToggle, onLogout, onSwitchRole }: NavbarProps) {
  const [dropOpen, setDropOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div style={{
      height: 56, background: '#fff', borderBottom: '1px solid #E5E7EB',
      display: 'flex', alignItems: 'center', padding: '0 16px',
      gap: 12, flexShrink: 0, position: 'relative', zIndex: 20,
    }}>
      {/* Menu toggle */}
      <button onClick={onMenuToggle} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        fontSize: 18, color: '#6B7280', padding: 6, borderRadius: 6,
        display: 'flex', alignItems: 'center',
      }}>☰</button>

      {/* Breadcrumb */}
      <div style={{ flex: 1, fontFamily: F, fontSize: 14, color: '#6B7280' }}>
        CGIF {isAdmin ? '— Administration' : ''}
      </div>

      {/* Switch rôle (si admin) */}
      {user?.role === 'ADMIN' && (
        <button onClick={onSwitchRole} style={{
          background: 'rgba(13,40,24,.06)', border: '1px solid rgba(13,40,24,.15)',
          borderRadius: 8, padding: '5px 12px', cursor: 'pointer',
          fontFamily: F, fontSize: 12, fontWeight: 600, color: '#0D2818',
        }}>
          {isAdmin ? '👤 Vue membre' : '👑 Vue admin'}
        </button>
      )}

      {/* Avatar + dropdown */}
      <div style={{ position: 'relative' }}>
        <button onClick={() => setDropOpen(o => !o)} style={{
          width: 36, height: 36, borderRadius: '50%', background: '#13883C',
          border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontFamily: F, fontSize: 13, fontWeight: 700, color: '#fff',
        }}>
          {user?.initials || '?'}
        </button>

        {dropOpen && (
          <>
            <div onClick={() => setDropOpen(false)} style={{
              position: 'fixed', inset: 0, zIndex: 40,
            }}/>
            <div style={{
              position: 'absolute', right: 0, top: 44, zIndex: 50,
              background: '#fff', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,.12)',
              border: '1px solid #E5E7EB', minWidth: 200, overflow: 'hidden',
            }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6' }}>
                <div style={{ fontFamily: F, fontWeight: 600, fontSize: 13, color: '#111827' }}>{user?.name}</div>
                <div style={{ fontFamily: F, fontSize: 11, color: '#9CA3AF' }}>{user?.email}</div>
              </div>
              {[
                { label: '👤 Mon profil', action: () => { navigate('/profile'); setDropOpen(false); } },
                { label: '⚙️ Paramètres', action: () => { navigate(isAdmin ? '/admin/settings' : '/profile'); setDropOpen(false); } },
                { label: '🚪 Déconnexion', action: onLogout, danger: true },
              ].map((item, i) => (
                <button key={i} onClick={item.action} style={{
                  width: '100%', padding: '10px 16px', background: 'none', border: 'none',
                  textAlign: 'left', cursor: 'pointer', fontFamily: F, fontSize: 13,
                  color: item.danger ? '#DC2626' : '#374151',
                  borderTop: item.danger ? '1px solid #F3F4F6' : 'none',
                  display: 'block',
                }}>
                  {item.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
