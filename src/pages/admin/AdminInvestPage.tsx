
import { useState } from 'react';
import { useInvestments, useSendBankInfo, useConfirmVirement, useActivateParts } from '../../services/api';
import { Spinner, ErrorBox, Card, Badge, Btn, EmptyState, StatCard } from '../../components/ui/PageShell';

const F = "'Plus Jakarta Sans', sans-serif";
const VERT = '#0D2818';

const STATUS_MAP: Record<string, {label:string;color:'green'|'amber'|'blue'|'gray'|'red'}> = {
  ACTIVE:               { label:'Actif ✓',           color:'green' },
  VOEU_SOUMIS:          { label:'Vœu soumis',         color:'amber' },
  COORDOS_ENVOYEES:     { label:'Coordonnées envoyées',color:'blue'  },
  VIREMENT_EN_ATTENTE:  { label:'Virement attendu',   color:'amber' },
  VIREMENT_RECU:        { label:'Virement reçu 💰',   color:'blue'  },
  ANNULE:               { label:'Annulé',              color:'red'   },
};

export default function AdminInvestPage() {
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [montant, setMontant] = useState('');
  const [notes, setNotes] = useState('');

  const { data, isLoading, error, refetch } = useInvestments(filter ? { status:filter } : undefined);
  const sendBankInfo = useSendBankInfo();
  const confirmVirement = useConfirmVirement();
  const activateParts = useActivateParts();

  const investments = data?.investments ?? [] as any[];
  const aTraiter = investments.filter((i: any) => ['VOEU_SOUMIS','VIREMENT_EN_ATTENTE','VIREMENT_RECU'].includes(i.status)).length;
  const actifs   = investments.filter((i: any) => i.status === 'ACTIVE');
  const totalFcfa= actifs.reduce((a: number, i: any) => a + (i.amount ?? 0), 0);

  return (
    <div style={{ fontFamily:F, display:'flex', flexDirection:'column', gap:20 }}>

      <div style={{ background:`linear-gradient(135deg, ${VERT} 0%, #13883C 100%)`, borderRadius:20, padding:'24px 28px', color:'#fff' }}>
        <div style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,.55)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:6 }}>Administration</div>
        <div style={{ fontSize:22, fontWeight:700 }}>Dossiers Investisseurs</div>
        <div style={{ fontSize:13, color:'rgba(255,255,255,.75)', marginTop:4 }}>
          {aTraiter > 0 ? `⚠️ ${aTraiter} dossier(s) à traiter · ` : ''}Workflow virement OHADA
        </div>
      </div>

      <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
        <StatCard label="À traiter" value={aTraiter} color="#D97706" />
        <StatCard label="Parts actives" value={actifs.reduce((a: number, i: any) => a + (i.sharesCount ?? 0), 0)} color={VERT} />
        <StatCard label="FCFA confirmés" value={`${(totalFcfa/1000).toFixed(0)}K`} color="#2563EB" />
        <StatCard label="Total dossiers" value={investments.length} color="#6B7280" />
      </div>

      {/* Filtres */}
      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
        {['','VOEU_SOUMIS','VIREMENT_EN_ATTENTE','VIREMENT_RECU','ACTIVE'].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding:'7px 14px', borderRadius:99, border:`1.5px solid ${filter===s ? VERT : '#E5E7EB'}`,
            background: filter===s ? VERT : '#fff', color: filter===s ? '#fff' : '#374151',
            fontFamily:F, fontSize:11, fontWeight:600, cursor:'pointer', transition:'all .15s',
          }}>
            {s === '' ? 'Tous' : (STATUS_MAP[s]?.label ?? s)}
          </button>
        ))}
      </div>

      {isLoading && <Spinner />}
      {error && <ErrorBox msg="Impossible de charger les dossiers" onRetry={refetch} />}
      {!isLoading && investments.length === 0 && <EmptyState icon="💼" title="Aucun dossier" desc="Aucun dossier d'investissement pour ce filtre." />}

      <Card style={{ padding:0, overflow:'hidden' }}>
        {investments.map((inv: any, i: number) => {
          const s = STATUS_MAP[inv.status] ?? { label:inv.status, color:'gray' as const };
          return (
            <div key={inv.id} style={{
              display:'flex', alignItems:'center', gap:14, padding:'14px 20px',
              borderBottom: i < investments.length-1 ? '1px solid #F3F4F6' : 'none',
              background: inv.status === 'VIREMENT_RECU' ? 'rgba(200,130,26,.03)' : '#fff',
            }}>
              <div style={{ width:38, height:38, borderRadius:'50%', background:'#F0FDF4', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:VERT, flexShrink:0 }}>
                {inv.member?.initials ?? 'M'}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', gap:8, marginBottom:2, alignItems:'center', flexWrap:'wrap' }}>
                  <span style={{ fontSize:13, fontWeight:600, color:'#111827' }}>{inv.member?.name ?? '—'}</span>
                  <Badge label={s.label} color={s.color} />
                </div>
                <div style={{ fontSize:11, color:'#6B7280' }}>
                  {inv.project?.title ?? '—'} · {(inv.amount ?? 0).toLocaleString('fr-FR')} FCFA · {inv.sharesCount} parts
                </div>
                <div style={{ fontSize:10, color:'#9CA3AF', fontFamily:"'Courier New', monospace" }}>
                  Réf. {inv.refVirement ?? '—'}
                </div>
              </div>
              <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                {inv.status === 'VOEU_SOUMIS' && (
                  <Btn size="sm" onClick={() => sendBankInfo.mutateAsync(inv.id)} disabled={sendBankInfo.isPending}>
                    Envoyer coordos →
                  </Btn>
                )}
                {inv.status === 'VIREMENT_EN_ATTENTE' && (
                  <Btn size="sm" onClick={() => { setSelected(inv); setMontant(String(inv.amount ?? '')); }}>
                    💰 Confirmer
                  </Btn>
                )}
                {inv.status === 'VIREMENT_RECU' && (
                  <Btn size="sm" onClick={() => activateParts.mutateAsync(inv.id)} disabled={activateParts.isPending}>
                    ✅ Activer parts
                  </Btn>
                )}
                <Btn variant="secondary" size="sm" onClick={() => setSelected(inv)}>Dossier</Btn>
              </div>
            </div>
          );
        })}
      </Card>

      {/* Modal confirmation virement */}
      {selected && selected.status === 'VIREMENT_EN_ATTENTE' && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}
          onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <Card style={{ maxWidth:460, width:'100%', margin:20 }}>
            <div style={{ fontSize:16, fontWeight:700, color:'#111827', marginBottom:16 }}>💰 Confirmer le virement</div>
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'#111827', marginBottom:4 }}>{selected.member?.name}</div>
              <div style={{ fontSize:12, color:'#6B7280', fontFamily:"'Courier New', monospace" }}>Réf. {selected.refVirement}</div>
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:12, fontWeight:600, color:'#374151', display:'block', marginBottom:5 }}>Montant réellement reçu (FCFA) *</label>
              <input type="number" value={montant} onChange={e => setMontant(e.target.value)} min={5000} step={5000}
                style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:'1.5px solid #E5E7EB', fontFamily:"'Courier New', monospace", fontSize:18, fontWeight:700, outline:'none', boxSizing:'border-box' }}/>
            </div>
            {montant && parseInt(montant) >= 5000 && (
              <div style={{ marginBottom:14, padding:'12px', background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:10 }}>
                <div style={{ fontSize:12, fontWeight:600, color:'#065F46', marginBottom:4 }}>Parts à attribuer</div>
                <div style={{ fontSize:26, fontWeight:700, color:VERT }}>{Math.floor(parseInt(montant)/5000)} parts</div>
              </div>
            )}
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:12, fontWeight:600, color:'#374151', display:'block', marginBottom:5 }}>Notes (optionnel)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:'1.5px solid #E5E7EB', fontFamily:F, fontSize:13, outline:'none', resize:'vertical', boxSizing:'border-box' }}/>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <Btn onClick={async () => {
                await confirmVirement.mutateAsync({ id:selected.id, notes });
                setSelected(null); setMontant(''); setNotes('');
              }} disabled={!montant || parseInt(montant) < 5000 || confirmVirement.isPending}>
                ✅ Confirmer et calculer les parts
              </Btn>
              <Btn variant="secondary" onClick={() => setSelected(null)}>Annuler</Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
