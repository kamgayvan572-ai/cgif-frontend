
import { useState } from 'react';
import { useAdminKycList, useApproveKyc, useRejectKyc } from '../../services/api';
import { Spinner, ErrorBox, Card, Badge, Btn, EmptyState } from '../../components/ui/PageShell';

const F = "'Plus Jakarta Sans', sans-serif";
const VERT = '#0D2818';

const KYC_COLORS: Record<string, 'green'|'amber'|'red'|'gray'|'blue'> = {
  APPROVED:'green', PENDING:'amber', REVIEWING:'blue', REJECTED:'red', NONE:'gray',
};

export default function AdminKycPage() {
  const [filter, setFilter] = useState('PENDING');
  const [selected, setSelected] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data, isLoading, error, refetch } = useAdminKycList({ status:filter });
  const approve = useApproveKyc();
  const reject  = useRejectKyc();

  const records = data?.kyc ?? data?.records ?? [] as any[];

  return (
    <div style={{ fontFamily:F, display:'flex', flexDirection:'column', gap:20 }}>

      <div style={{ background:`linear-gradient(135deg, ${VERT} 0%, #13883C 100%)`, borderRadius:20, padding:'24px 28px', color:'#fff' }}>
        <div style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,.55)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:6 }}>Administration</div>
        <div style={{ fontSize:22, fontWeight:700 }}>Vérification KYC</div>
        <div style={{ fontSize:13, color:'rgba(255,255,255,.75)', marginTop:4 }}>Dossiers d'identité · Norme OHADA</div>
      </div>

      <div style={{ display:'flex', gap:6 }}>
        {['PENDING','REVIEWING','APPROVED','REJECTED','NONE'].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding:'7px 14px', borderRadius:99, border:`1.5px solid ${filter===s ? VERT : '#E5E7EB'}`,
            background: filter===s ? VERT : '#fff', color: filter===s ? '#fff' : '#374151',
            fontFamily:F, fontSize:12, fontWeight:600, cursor:'pointer', transition:'all .15s',
          }}>
            {s}
          </button>
        ))}
      </div>

      {isLoading && <Spinner />}
      {error && <ErrorBox msg="Impossible de charger les dossiers KYC" onRetry={refetch} />}
      {!isLoading && records.length === 0 && <EmptyState icon="🪪" title="Aucun dossier" desc="Aucun dossier KYC pour ce statut." />}

      {(records as any[]).map((r: any) => (
        <Card key={r.id} style={{ display:'flex', gap:14, alignItems:'center' }}>
          <div style={{ width:44, height:44, borderRadius:'50%', background:'#F0FDF4', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:VERT, flexShrink:0 }}>
            {r.member?.initials ?? 'M'}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', gap:8, marginBottom:4, flexWrap:'wrap', alignItems:'center' }}>
              <span style={{ fontSize:13, fontWeight:600, color:'#111827' }}>{r.member?.name ?? 'Membre'}</span>
              <Badge label={r.status} color={KYC_COLORS[r.status] ?? 'gray'} />
            </div>
            <div style={{ fontSize:11, color:'#6B7280' }}>
              {r.member?.email} · {r.member?.country ?? '—'}
            </div>
            {r.nom && <div style={{ fontSize:11, color:'#9CA3AF' }}>{r.prenom} {r.nom} · {r.nationalite ?? '—'}</div>}
            {r.submittedAt && <div style={{ fontSize:10, color:'#9CA3AF', marginTop:2 }}>Soumis le {new Date(r.submittedAt).toLocaleDateString('fr-FR')}</div>}
          </div>
          {(r.status === 'PENDING' || r.status === 'REVIEWING') && (
            <div style={{ display:'flex', gap:6', flexShrink:0 }}>
              <Btn size="sm" onClick={() => approve.mutateAsync({ id:r.id })} disabled={approve.isPending}>
                ✅ Valider
              </Btn>
              <Btn variant="secondary" size="sm" onClick={() => setSelected(r)}>
                Détail
              </Btn>
            </div>
          )}
          {r.status === 'APPROVED' && <Badge label="Validé ✓" color="green" />}
        </Card>
      ))}

      {/* Modal rejet */}
      {selected && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}
          onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <Card style={{ maxWidth:480, width:'100%', margin:20 }}>
            <div style={{ fontSize:16, fontWeight:700, color:'#111827', marginBottom:16 }}>Dossier KYC — {selected.member?.name}</div>
            <div style={{ marginBottom:16 }}>
              {[['Nom complet', `${selected.prenom ?? ''} ${selected.nom ?? ''}`], ['Nationalité', selected.nationalite ?? '—'], ['Date naissance', selected.dateNaissance ?? '—'], ['Adresse', selected.adresse ?? '—'], ['Document', selected.docType ?? '—']].map(([l,v]) => (
                <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #F3F4F6', fontSize:13 }}>
                  <span style={{ color:'#6B7280', fontWeight:600 }}>{l}</span>
                  <span style={{ color:'#111827' }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:12, fontWeight:600, color:'#374151', display:'block', marginBottom:5 }}>Motif de rejet (si rejeté)</label>
              <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3}
                placeholder="Document illisible, informations incomplètes…"
                style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:'1.5px solid #E5E7EB', fontFamily:F, fontSize:13, outline:'none', resize:'vertical', boxSizing:'border-box' }}
              />
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <Btn onClick={async () => { await approve.mutateAsync({ id:selected.id }); setSelected(null); }} disabled={approve.isPending}>
                ✅ Valider
              </Btn>
              <Btn variant="danger" onClick={async () => { await reject.mutateAsync({ id:selected.id, reason:rejectReason }); setSelected(null); setRejectReason(''); }} disabled={!rejectReason || reject.isPending}>
                ❌ Rejeter
              </Btn>
              <Btn variant="secondary" onClick={() => setSelected(null)}>Annuler</Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
