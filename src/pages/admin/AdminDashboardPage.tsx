
import { useAnalytics } from '../../services/api';
import { useNotifications } from '../../services/api';
import { Spinner, ErrorBox, StatCard, Card, SectionTitle } from '../../components/ui/PageShell';

const F = "'Plus Jakarta Sans', sans-serif";
const VERT = '#0D2818';

export default function AdminDashboardPage() {
  const { data: analytics, isLoading, error, refetch } = useAnalytics();
  const { data: notifs = [] } = useNotifications();

  if (isLoading) return <Spinner />;
  if (error) return <ErrorBox msg="Impossible de charger le tableau de bord" onRetry={refetch} />;

  const a = analytics ?? {};
  const pendingActions = (notifs as any[]).filter((n: any) => !n.read).length;

  return (
    <div style={{ fontFamily:F, display:'flex', flexDirection:'column', gap:20 }}>

      <div style={{ background:`linear-gradient(135deg, ${VERT} 0%, #13883C 100%)`, borderRadius:20, padding:'24px 28px', color:'#fff' }}>
        <div style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,.55)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:6 }}>Administration</div>
        <div style={{ fontSize:22, fontWeight:700 }}>Tableau de bord CGIF</div>
        <div style={{ fontSize:13, color:'rgba(255,255,255,.75)', marginTop:4 }}>
          {pendingActions > 0 && `⚠️ ${pendingActions} action(s) requise(s) · `}Données en temps réel
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
        <StatCard label="Membres totaux"     value={a.membersTotal     ?? a.totalMembers     ?? 0} color={VERT} />
        <StatCard label="Membres actifs"     value={a.membersActive    ?? a.activeMembers    ?? 0} color="#13883C" sub="statut ACTIVE" />
        <StatCard label="KYC en attente"     value={a.kycPending       ?? 0}                       color="#D97706" />
        <StatCard label="Projets en cours"   value={a.projectsFunding  ?? a.projectsActive  ?? 0} color="#2563EB" />
        <StatCard label="Parts activées"     value={a.sharesTotal      ?? 0}                       color="#7C3AED" />
        <StatCard label="FCFA collectés"     value={`${((a.amountTotal ?? 0)/1000).toFixed(0)}K`}  color="#0891B2" />
        <StatCard label="Investissements à traiter" value={a.investmentsPending ?? 0}             color="#DC2626" />
        <StatCard label="NDA signés"         value={a.ndaSigned        ?? 0}                       color="#059669" />
      </div>

      {/* Répartition membres par cluster */}
      {a.clusterStats && a.clusterStats.length > 0 && (
        <Card>
          <SectionTitle>📊 Membres par cluster</SectionTitle>
          {(a.clusterStats as any[]).map((cs: any) => (
            <div key={cs.clusterId ?? cs.name} style={{ marginBottom:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#374151', marginBottom:4 }}>
                <span style={{ fontWeight:600 }}>{cs.name ?? cs.cluster?.name ?? 'Cluster'}</span>
                <span style={{ color:'#6B7280' }}>{cs._count ?? cs.count ?? 0} membres</span>
              </div>
              <div style={{ height:6, background:'#E5E7EB', borderRadius:99, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${Math.min(100, ((cs._count ?? cs.count ?? 0) / Math.max(1, a.membersTotal ?? 1))*100)}%`, background:VERT, borderRadius:99 }}/>
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Activité récente */}
      {a.recentActivity && a.recentActivity.length > 0 && (
        <Card>
          <SectionTitle>⚡ Activité récente</SectionTitle>
          {(a.recentActivity as any[]).slice(0, 8).map((act: any, i: number) => (
            <div key={i} style={{ display:'flex', gap:12, padding:'10px 0', borderBottom:'1px solid #F3F4F6', fontSize:12 }}>
              <span style={{ fontSize:16 }}>{act.icon ?? '📌'}</span>
              <div style={{ flex:1 }}>
                <span style={{ fontWeight:600, color:'#111827' }}>{act.action ?? act.title}</span>
                {act.detail && <span style={{ color:'#6B7280' }}> — {act.detail}</span>}
              </div>
              <span style={{ color:'#9CA3AF', whiteSpace:'nowrap' }}>
                {act.createdAt ? new Date(act.createdAt).toLocaleDateString('fr-FR',{day:'numeric',month:'short'}) : ''}
              </span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
