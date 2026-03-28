
import { useState } from 'react';
import { useAuditLogs } from '../../services/api';
import { Spinner, ErrorBox, Card, Badge, EmptyState } from '../../components/ui/PageShell';

const F = "'Plus Jakarta Sans', sans-serif";
const VERT = '#0D2818';

const SEV_COLORS: Record<string, 'green'|'amber'|'red'|'gray'|'blue'> = {
  info:'blue', success:'green', warning:'amber', error:'red', critical:'red',
};

export default function AdminAuditPage() {
  const [filter, setFilter] = useState('');
  const { data, isLoading, error, refetch } = useAuditLogs(filter ? { type:filter } : undefined);
  const logs = data?.logs ?? data ?? [] as any[];

  return (
    <div style={{ fontFamily:F, display:'flex', flexDirection:'column', gap:20 }}>

      <div style={{ background:`linear-gradient(135deg, ${VERT} 0%, #13883C 100%)`, borderRadius:20, padding:'24px 28px', color:'#fff' }}>
        <div style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,.55)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:6 }}>Administration · Traçabilité</div>
        <div style={{ fontSize:22, fontWeight:700 }}>Journal d'audit</div>
      </div>

      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
        {['','member','investment','kyc','admin','project'].map(t => (
          <button key={t} onClick={() => setFilter(t)} style={{
            padding:'6px 12px', borderRadius:99, border:`1.5px solid ${filter===t ? VERT : '#E5E7EB'}`,
            background: filter===t ? VERT : '#fff', color: filter===t ? '#fff' : '#374151',
            fontFamily:F, fontSize:11, fontWeight:600, cursor:'pointer', transition:'all .15s',
          }}>
            {t === '' ? 'Tous' : t}
          </button>
        ))}
      </div>

      {isLoading && <Spinner />}
      {error && <ErrorBox msg="Impossible de charger le journal d'audit" onRetry={refetch} />}
      {!isLoading && (logs as any[]).length === 0 && <EmptyState icon="📋" title="Aucune entrée d'audit" />}

      <Card style={{ padding:0, overflow:'hidden' }}>
        {(logs as any[]).map((l: any, i: number) => (
          <div key={l.id ?? i} style={{
            display:'flex', gap:14, alignItems:'flex-start', padding:'14px 20px',
            borderBottom: i < (logs as any[]).length-1 ? '1px solid #F3F4F6' : 'none',
          }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:'flex', gap:8, marginBottom:4, alignItems:'center', flexWrap:'wrap' }}>
                <span style={{ fontSize:12, fontWeight:700, color:'#111827' }}>{l.action}</span>
                <Badge label={l.type ?? 'system'} color="blue" />
                {l.severity && <Badge label={l.severity} color={SEV_COLORS[l.severity] ?? 'gray'} />}
              </div>
              <div style={{ fontSize:11, color:'#6B7280', marginBottom:2 }}>
                Cible : <strong>{l.target ?? '—'}</strong>
              </div>
              {l.detail && <div style={{ fontSize:11, color:'#9CA3AF', lineHeight:1.5 }}>{l.detail}</div>}
              <div style={{ fontSize:10, color:'#D1D5DB', marginTop:4 }}>
                par {l.actor ?? l.actorId ?? '—'} · {l.actorRole ?? '—'}
              </div>
            </div>
            <span style={{ fontSize:10, color:'#9CA3AF', whiteSpace:'nowrap', flexShrink:0 }}>
              {l.createdAt ? new Date(l.createdAt).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}) : l.date ?? ''}
            </span>
          </div>
        ))}
      </Card>
    </div>
  );
}
