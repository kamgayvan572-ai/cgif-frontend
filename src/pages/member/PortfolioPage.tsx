
import { useMyInvestments } from '../../services/api';
import { Spinner, ErrorBox, Card, SectionTitle, Badge, StatCard, EmptyState } from '../../components/ui/PageShell';

const F = "'Plus Jakarta Sans', sans-serif";
const VERT = '#0D2818';

const STATUS_MAP: Record<string, {label:string;color:'green'|'amber'|'blue'|'gray'|'red'}> = {
  ACTIVE:               { label:'Actif',             color:'green' },
  VOEU_SOUMIS:          { label:'Vœu soumis',        color:'amber' },
  COORDOS_ENVOYEES:     { label:'Coordonnées envoyées', color:'blue' },
  VIREMENT_EN_ATTENTE:  { label:'Virement en attente', color:'amber' },
  VIREMENT_RECU:        { label:'Virement reçu',     color:'blue'  },
  ANNULE:               { label:'Annulé',             color:'red'   },
};

export default function PortfolioPage() {
  const { data, isLoading, error, refetch } = useMyInvestments();
  const investments = data?.investments ?? [];

  const actifs    = investments.filter((i: any) => i.status === 'ACTIVE');
  const totalParts= actifs.reduce((a: number, i: any) => a + (i.sharesCount ?? 0), 0);
  const totalFcfa = actifs.reduce((a: number, i: any) => a + (i.amount ?? 0), 0);
  const enCours   = investments.filter((i: any) => i.status !== 'ACTIVE' && i.status !== 'ANNULE');

  if (isLoading) return <Spinner />;
  if (error) return <ErrorBox msg="Impossible de charger votre portefeuille" onRetry={refetch} />;

  return (
    <div style={{ fontFamily:F, display:'flex', flexDirection:'column', gap:20 }}>

      <div style={{ background:`linear-gradient(135deg, ${VERT} 0%, #13883C 100%)`, borderRadius:20, padding:'24px 28px', color:'#fff' }}>
        <div style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,.55)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:6 }}>Mon portefeuille</div>
        <div style={{ fontSize:22, fontWeight:700 }}>Mes investissements CGIF</div>
        <div style={{ fontSize:13, color:'rgba(255,255,255,.75)', marginTop:4 }}>Parts actives · Dividendes · Historique</div>
      </div>

      {/* KPIs */}
      <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
        <StatCard label="Parts actives" value={totalParts} color={VERT} sub="toutes projets confondus" />
        <StatCard label="Investi" value={`${(totalFcfa/1000).toFixed(0)}K FCFA`} color="#13883C" />
        <StatCard label="Projets" value={actifs.length} color="#C8821A" sub="avec parts actives" />
        <StatCard label="En cours" value={enCours.length} color="#2563EB" sub="en attente de traitement" />
      </div>

      {investments.length === 0 && (
        <EmptyState icon="💰" title="Aucun investissement" desc="Rendez-vous dans la section Projets pour investir." />
      )}

      {/* Parts actives */}
      {actifs.length > 0 && (
        <Card>
          <SectionTitle>✅ Parts actives</SectionTitle>
          {actifs.map((inv: any) => (
            <div key={inv.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 0', borderBottom:'1px solid #F3F4F6' }}>
              <div style={{ width:44, height:44, borderRadius:12, background:'#F0FDF4', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>🏗️</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:600, color:'#111827', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {inv.project?.title ?? 'Projet CGIF'}
                </div>
                <div style={{ fontSize:11, color:'#6B7280', marginTop:2 }}>
                  {inv.sharesCount} parts · {(inv.amount ?? 0).toLocaleString('fr-FR')} FCFA · Activé le {inv.activatedAt ? new Date(inv.activatedAt).toLocaleDateString('fr-FR') : '—'}
                </div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:15, fontWeight:700, color:VERT }}>{inv.sharesCount} 🏷️</div>
                <Badge label="Actif" color="green" />
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Dossiers en cours */}
      {enCours.length > 0 && (
        <Card>
          <SectionTitle>⏳ Dossiers en cours de traitement</SectionTitle>
          {enCours.map((inv: any) => {
            const s = STATUS_MAP[inv.status] ?? { label:inv.status, color:'gray' as const };
            return (
              <div key={inv.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 0', borderBottom:'1px solid #F3F4F6' }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:'#111827', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {inv.project?.title ?? 'Projet CGIF'}
                  </div>
                  <div style={{ fontSize:11, color:'#6B7280', marginTop:2 }}>
                    {inv.sharesCount} parts demandées · {(inv.amount ?? 0).toLocaleString('fr-FR')} FCFA
                  </div>
                  <div style={{ fontSize:10, color:'#9CA3AF', marginTop:2, fontFamily:"'Courier New', monospace" }}>
                    Réf. {inv.refVirement ?? '—'}
                  </div>
                </div>
                <Badge label={s.label} color={s.color} />
              </div>
            );
          })}
          <div style={{ padding:'12px 14px', background:'#EFF6FF', border:'1px solid #BFDBFE', borderRadius:10, marginTop:12, fontSize:12, color:'#1E40AF' }}>
            📧 Vous serez notifié par email à chaque changement de statut. Connectez-vous régulièrement pour suivre l'avancement.
          </div>
        </Card>
      )}
    </div>
  );
}
