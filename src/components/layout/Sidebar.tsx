import { NavLink } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  isAdmin: boolean;
  user: any;
  onToggle: () => void;
}

const USER_NAV = [
  { path: '/dashboard',  label: 'Tableau de bord', icon: '⊞' },
  { path: '/cluster',    label: 'Mon Cluster',      icon: '◉' },
  { path: '/projects',   label: 'Projets',           icon: '📋' },
  { path: '/investir',   label: 'Investir',          icon: '💼' },
  { path: '/portfolio',  label: 'Portefeuille',      icon: '💰' },
  { path: '/kyc',        label: 'Mon KYC',           icon: '🪪' },
  { path: '/calendrier', label: 'Calendrier',        icon: '📅' },
  { path: '/actualites', label: 'Actualités',        icon: '📰' },
  { path: '/parrainage', label: 'Parrainage',        icon: '🔗' },
  { path: '/alertes',    label: 'Mes alertes',       icon: '🔔' },
  { path: '/matching',   label: 'Matching experts',  icon: '🤝' },
  { path: '/messages',   label: 'Messagerie',        icon: '✉️' },
  { path: '/notifs',     label: 'Notifications',     icon: '🔔' },
  { path: '/profile',    label: 'Mon Profil',        icon: '👤' },
];

const ADMIN_NAV = [
  { path: '/admin',             label: 'Vue d\'ensemble',  icon: '⊞' },
  { path: '/admin/members',     label: 'Membres',           icon: '👥' },
  { path: '/admin/clusters',    label: 'Clusters',          icon: '◉' },
  { path: '/admin/projects',    label: 'Projets',           icon: '📋' },
  { path: '/admin/invest',      label: 'Dossiers invest.',  icon: '💼' },
  { path: '/admin/kyc',         label: 'KYC',               icon: '🪪' },
  { path: '/admin/votes',       label: 'Votes & Sondages',  icon: '🗳️' },
  { path: '/admin/archives',    label: 'Archives IA',       icon: '🗂️' },
  { path: '/admin/announcements', label: 'Annonces',        icon: '📣' },
  { path: '/admin/calendrier',  label: 'Calendrier',        icon: '📅' },
  { path: '/admin/moderation',  label: 'Modération',        icon: '🛡️' },
  { path: '/admin/nda',         label: 'NDA',               icon: '📜' },
  { path: '/admin/analytics',   label: 'Analytics',         icon: '📊' },
  { path: '/admin/audit',       label: 'Audit',             icon: '🔍' },
  { path: '/admin/settings',    label: 'Paramètres',        icon: '⚙️' },
];

const F = "'Plus Jakarta Sans', sans-serif";
const VERT = '#0D2818';

export default function Sidebar({ isOpen, isAdmin, user, onToggle }: SidebarProps) {
  const nav = isAdmin ? ADMIN_NAV : USER_NAV;

  return (
    <div style={{
      width: isOpen ? 220 : 64, minWidth: isOpen ? 220 : 64,
      background: VERT, display: 'flex', flexDirection: 'column',
      transition: 'width .25s ease', overflow: 'hidden',
      borderRight: '1px solid rgba(255,255,255,.08)', zIndex: 30,
    }}>
      {/* Logo */}
      <div style={{
        padding: '16px 12px', display: 'flex', alignItems: 'center', gap: 10,
        borderBottom: '1px solid rgba(255,255,255,.1)', minHeight: 60, flexShrink: 0,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, background: '#13883C',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 700, color: '#fff', flexShrink: 0, fontFamily: F,
        }}>C</div>
        {isOpen && (
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontFamily: F, fontWeight: 700, color: '#fff', fontSize: 14, whiteSpace: 'nowrap' }}>CGIF</div>
            <div style={{ fontFamily: F, fontSize: 10, color: 'rgba(255,255,255,.5)', whiteSpace: 'nowrap' }}>
              {isAdmin ? 'Administration' : user?.cluster?.name || 'Membre'}
            </div>
          </div>
        )}
        <button onClick={onToggle} style={{
          marginLeft: 'auto', background: 'none', border: 'none', color: 'rgba(255,255,255,.5)',
          cursor: 'pointer', fontSize: 14, padding: 4, flexShrink: 0,
        }}>
          {isOpen ? '◀' : '▶'}
        </button>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0', scrollbarWidth: 'none' }}>
        {nav.map(item => (
          <NavLink key={item.path} to={item.path} end={item.path === '/admin'}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', margin: '1px 6px', borderRadius: 8,
              textDecoration: 'none', color: isActive ? '#fff' : 'rgba(255,255,255,.6)',
              background: isActive ? 'rgba(255,255,255,.12)' : 'transparent',
              fontSize: 13, fontFamily: F, fontWeight: isActive ? 600 : 400,
              whiteSpace: 'nowrap', overflow: 'hidden',
              borderLeft: isActive ? '3px solid #C8821A' : '3px solid transparent',
              transition: 'all .15s',
            })}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
            {isOpen && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      {isOpen && (
        <div style={{
          padding: '12px', borderTop: '1px solid rgba(255,255,255,.1)',
          display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', background: '#13883C',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: '#fff', fontFamily: F, flexShrink: 0,
          }}>{user?.initials || '?'}</div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontFamily: F, fontSize: 12, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name || 'Utilisateur'}
            </div>
            <div style={{ fontFamily: F, fontSize: 10, color: 'rgba(255,255,255,.5)' }}>
              {user?.role === 'ADMIN' ? '👑 Admin' : '👤 Membre'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
