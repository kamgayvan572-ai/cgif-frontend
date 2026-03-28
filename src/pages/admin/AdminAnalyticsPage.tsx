
import { useAnalytics } from '../../services/api';
import { Spinner, ErrorBox, StatCard, Card, SectionTitle } from '../../components/ui/PageShell';

const F = "'Plus Jakarta Sans', sans-serif";
const VERT = '#0D2818';

export default function AdminAnalyticsPage() {
  const { data: a, isLoading, error, refetch } = useAnalytics();

  if (isLoading) return <Spinner />;
  if (error) return <ErrorBox msg="Impossible de charger les analytics" onRetry={refetch} />;

  return (
    <div style={{ fontFamily:F, display:'flex', flexDirection:'column', gap:20 }}>

      <div style={{ background:`linear-gradient(135deg, ${VERT} 0%, #13883C 100%)`, borderRadius:20, padding:'24px 28px', color:'#fff' }}>
        <div style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,.55)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:6 }}>Administration · Rapport exécutif</div>
        <div style={{ fontSize:22, fontWeight:700 }}>Analytics CGIF</div>
      </div>

      <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
        <StatCard label="Membres totaux"       value={(a as any)?.membersTotal     ?? 0} color={VERT} />
        <StatCard label="Actifs"               value={(a as any)?.membersActive    ?? 0} color="#13883C" />
        <StatCard label="FCFA collectés"       value={`${(((a as any)?.amountTotal ?? 0)/1000).toFixed(0)}K`} color="#2563EB" />
        <StatCard label="Parts totales"        value={(a as any)?.sharesTotal      ?? 0} color="#7C3AED" />
        <StatCard label="Projets FUNDING"      value={(a as any)?.projectsFunding  ?? 0} color="#C8821A" />
        <StatCard label="KYC en attente"       value={(a as any)?.kycPending       ?? 0} color="#DC2626" />
        <StatCard label="Nouveaux membres/mois" value={(a as any)?.newMembersMonth ?? 0} color="#059669" />
        <StatCard label="Taux conversion"      value={`${(a as any)?.conversionRate ?? 0}%`} color="#0891B2" />
      </div>

      {(a as any)?.clusterStats && (a as any).clusterStats.length > 0 && (
        <Card>
          <SectionTitle>📊 Répartition par cluster</SectionTitle>
          {((a as any).clusterStats as any[]).map((cs: any) => (
            <div key={cs.clusterId ?? cs.name} style={{ marginBottom:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4, fontSize:12 }}>
                <span style={{ fontWeight:600, color:'#374151' }}>{cs.name ?? cs.cluster?.name}</span>
                <span style={{ color:'#6B7280' }}>{cs._count ?? cs.count ?? 0} membres · {(cs.amountTotal ?? 0).toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div style={{ height:8, background:'#E5E7EB', borderRadius:99, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${Math.min(100, ((cs._count ?? cs.count ?? 0)/Math.max(1,(a as any)?.membersTotal??1))*100)}%`, background:VERT, borderRadius:99 }}/>
              </div>
            </div>
          ))}
        </Card>
      )}

      {(a as any)?.monthlyTrend && (a as any).monthlyTrend.length > 0 && (
        <Card>
          <SectionTitle>📈 Tendance mensuelle</SectionTitle>
          <div style={{ display:'flex', gap:8, alignItems:'flex-end', height:120, paddingBottom:4 }}>
            {((a as any).monthlyTrend as any[]).map((m: any, i: number) => {
              const max = Math.max(...(a as any).monthlyTrend.map((x: any) => x.count ?? 0));
              const h = max ? ((m.count ?? 0)/max)*100 : 0;
              return (
                <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                  <div style={{ width:'100%', background:VERT, borderRadius:'4px 4px 0 0', height:`${h}%`, minHeight:4, transition:'height .3s' }}/>
                  <div style={{ fontSize:9, color:'#9CA3AF', fontWeight:600 }}>{m.month ?? m.label}</div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
