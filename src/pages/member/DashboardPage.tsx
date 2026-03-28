
import { useAuth } from '../../context/auth.store';
import { useAnalytics } from '../../services/api';
import { useNotifications } from '../../services/api';
import { useProjects } from '../../services/api';
import { Spinner, ErrorBox, StatCard, Card, SectionTitle, Badge, EmptyState } from '../../components/ui/PageShell';

const F = "'Plus Jakarta Sans', sans-serif";
const VERT = '#0D2818';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: analytics, isLoading: loadingA, error: errorA, refetch: refetchA } = useAnalytics();
  const { data: projectsData, isLoading: loadingP } = useProjects({ status: 'FUNDING' });
  const { data: notifs } = useNotifications();

  const projects = projectsData?.projects ?? [];
  const unread = (notifs ?? []).filter((n: any) => !n.read).length;

  if (loadingA) return <Spinner />;
  if (errorA) return <ErrorBox msg="Impossible de charger le tableau de bord" onRetry={refetchA} />;

  const clusterName = user?.cluster?.name ?? 'Mon Cluster';

  return (
    <div style={{ fontFamily:F, display:'flex', flexDirection:'column', gap:20 }}>

      {/* Hero */}
      <div style={{ background:`linear-gradient(135deg, ${VERT} 0%, #13883C 100%)`, borderRadius:20, padding:'24px 28px', color:'#fff' }}>
        <div style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,.55)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:6 }}>
          Bienvenue sur CGIF
        </div>
        <div style={{ fontSize:24, fontWeight:700, marginBottom:4 }}>{user?.name ?? 'Membre'}</div>
        <div style={{ fontSize:13, color:'rgba(255,255,255,.75)', display:'flex', gap:16, flexWrap:'wrap' }}>
          <span>📍 {user?.country ?? '—'}</span>
          <span>🏛️ {clusterName}</span>
          {user?.specialization && <span>🎯 {user.specialization}</span>}
          {unread > 0 && <span style={{ background:'rgba(255,255,255,.2)', padding:'1px 10px', borderRadius:99, fontWeight:700 }}>🔔 {unread} notification{unread>1?'s':''}</span>}
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
        <StatCard label="Parts actives" value={analytics?.memberStats?.sharesTotal ?? 0} color="#0D2818" sub="dans tous les projets" />
        <StatCard label="Investissement" value={`${((analytics?.memberStats?.amountTotal ?? 0)/1000).toFixed(0)}K FCFA`} color="#13883C" />
        <StatCard label="Projets suivis" value={analytics?.memberStats?.projectsCount ?? 0} color="#C8821A" sub="en cours de financement" />
        <StatCard label="KYC" value={user?.kycStatus === 'APPROVED' ? '✓ Validé' : user?.kycStatus ?? 'En attente'} color={user?.kycStatus === 'APPROVED' ? '#059669' : '#D97706'} />
      </div>

      {/* Projets ouverts */}
      <Card>
        <SectionTitle>💼 Projets ouverts au financement</SectionTitle>
        {loadingP && <Spinner />}
        {!loadingP && projects.length === 0 && <EmptyState icon="📁" title="Aucun projet en financement" desc="Revenez bientôt — de nouveaux projets seront annoncés." />}
        {projects.slice(0,4).map((p: any) => (
          <div key={p.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 0', borderBottom:'1px solid #F3F4F6' }}>
            <div style={{ width:44, height:44, borderRadius:12, background:'#F0FDF4', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>🏗️</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'#111827', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.title}</div>
              <div style={{ fontSize:11, color:'#6B7280', marginTop:2 }}>
                {p.cluster?.name ?? 'CGIF'} · {p.progress ?? 0}% financé
              </div>
              <div style={{ height:4, background:'#E5E7EB', borderRadius:99, marginTop:5, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${Math.min(100, p.progress ?? 0)}%`, background:VERT, borderRadius:99 }}/>
              </div>
            </div>
            <Badge label={p.status} color={p.status==='FUNDING'?'green':p.status==='REVIEW'?'amber':'gray'} />
          </div>
        ))}
      </Card>

      {/* Notifications récentes */}
      {notifs && notifs.length > 0 && (
        <Card>
          <SectionTitle>🔔 Notifications récentes</SectionTitle>
          {(notifs as any[]).slice(0, 5).map((n: any) => (
            <div key={n.id} style={{ display:'flex', gap:10, padding:'10px 0', borderBottom:'1px solid #F3F4F6', opacity: n.read ? 0.6 : 1 }}>
              <span style={{ fontSize:18 }}>{n.icon ?? '📌'}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12, fontWeight:600, color:'#111827' }}>{n.title}</div>
                <div style={{ fontSize:11, color:'#6B7280', marginTop:2 }}>{n.message}</div>
              </div>
              {!n.read && <span style={{ width:8, height:8, borderRadius:'50%', background:'#0D2818', marginTop:4, flexShrink:0 }}/>}
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
