
import { useState } from 'react';
import { useProjects, useUpdateProjectStatus } from '../../services/api';
import { Spinner, ErrorBox, Card, Badge, Btn, EmptyState } from '../../components/ui/PageShell';

const F = "'Plus Jakarta Sans', sans-serif";
const VERT = '#0D2818';

const WORKFLOW = ['PENDING','REVIEW','VOTING','FUNDING','FUNDED','DONE','REJECTED'];
const STATUS_COLORS: Record<string, 'green'|'amber'|'blue'|'gray'|'red'> = {
  PENDING:'gray', REVIEW:'amber', VOTING:'blue', FUNDING:'green', FUNDED:'green', DONE:'gray', REJECTED:'red',
};

export default function AdminProjectsPage() {
  const [filter, setFilter] = useState('');
  const { data, isLoading, error, refetch } = useProjects(filter ? { status:filter } : undefined);
  const updateStatus = useUpdateProjectStatus();

  const projects = data?.projects ?? [] as any[];

  const nextStatus = (current: string): string | null => {
    const idx = WORKFLOW.indexOf(current);
    return idx >= 0 && idx < WORKFLOW.length - 1 ? WORKFLOW[idx+1] : null;
  };

  return (
    <div style={{ fontFamily:F, display:'flex', flexDirection:'column', gap:20 }}>

      <div style={{ background:`linear-gradient(135deg, ${VERT} 0%, #13883C 100%)`, borderRadius:20, padding:'24px 28px', color:'#fff' }}>
        <div style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,.55)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:6 }}>Administration</div>
        <div style={{ fontSize:22, fontWeight:700 }}>Gestion des projets</div>
        <div style={{ fontSize:13, color:'rgba(255,255,255,.75)', marginTop:4 }}>
          {projects.length} projet{projects.length>1?'s':''} · Workflow CGIF
        </div>
      </div>

      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
        {['', ...WORKFLOW].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding:'6px 12px', borderRadius:99, border:`1.5px solid ${filter===s ? VERT : '#E5E7EB'}`,
            background: filter===s ? VERT : '#fff', color: filter===s ? '#fff' : '#374151',
            fontFamily:F, fontSize:11, fontWeight:600, cursor:'pointer', transition:'all .15s',
          }}>
            {s === '' ? 'Tous' : s}
          </button>
        ))}
      </div>

      {isLoading && <Spinner />}
      {error && <ErrorBox msg="Impossible de charger les projets" onRetry={refetch} />}
      {!isLoading && projects.length === 0 && <EmptyState icon="🏗️" title="Aucun projet" />}

      {(projects as any[]).map((p: any) => {
        const ns = nextStatus(p.status);
        return (
          <Card key={p.id}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12, gap:12, flexWrap:'wrap' }}>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', gap:8, marginBottom:4, flexWrap:'wrap', alignItems:'center' }}>
                  <span style={{ fontSize:14, fontWeight:700, color:'#111827' }}>{p.title}</span>
                  <Badge label={p.status} color={STATUS_COLORS[p.status] ?? 'gray'} />
                </div>
                <div style={{ fontSize:12, color:'#6B7280' }}>
                  {p.cluster?.name ?? 'CGIF'} · Soumis le {p.createdAt ? new Date(p.createdAt).toLocaleDateString('fr-FR') : '—'}
                </div>
              </div>
              <div style={{ display:'flex', gap:6 }}>
                {ns && ns !== 'REJECTED' && (
                  <Btn size="sm" onClick={() => updateStatus.mutateAsync({ id:p.id, status:ns })} disabled={updateStatus.isPending}>
                    → {ns}
                  </Btn>
                )}
                <Btn variant="danger" size="sm" onClick={() => updateStatus.mutateAsync({ id:p.id, status:'REJECTED' })} disabled={updateStatus.isPending || p.status === 'REJECTED'}>
                  Rejeter
                </Btn>
              </div>
            </div>

            {p.description && (
              <div style={{ fontSize:12, color:'#6B7280', lineHeight:1.6, marginBottom:12 }}>{p.description}</div>
            )}

            {p.status === 'FUNDING' && (
              <div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#6B7280', marginBottom:4 }}>
                  <span>{(p.collectedAmount ?? 0).toLocaleString('fr-FR')} FCFA collectés</span>
                  <span style={{ fontWeight:700, color:VERT }}>{p.progress ?? 0}%</span>
                </div>
                <div style={{ height:6, background:'#E5E7EB', borderRadius:99, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${Math.min(100, p.progress ?? 0)}%`, background:VERT, borderRadius:99 }}/>
                </div>
                <div style={{ fontSize:11, color:'#9CA3AF', marginTop:4 }}>Objectif : {(p.targetAmount ?? 0).toLocaleString('fr-FR')} FCFA</div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
