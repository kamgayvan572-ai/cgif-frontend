
import { useState } from 'react';
import { useProjects } from '../../services/api';
import { Spinner, ErrorBox, Card, Badge, EmptyState, Btn } from '../../components/ui/PageShell';
import { useNavigate } from 'react-router-dom';

const F = "'Plus Jakarta Sans', sans-serif";
const VERT = '#0D2818';

const STATUS_LABELS: Record<string, {label:string; color:'green'|'amber'|'blue'|'gray'|'red'}> = {
  FUNDING: { label:'En financement', color:'green' },
  REVIEW:  { label:'En révision',    color:'amber'  },
  VOTING:  { label:'Vote ouvert',    color:'blue'   },
  FUNDED:  { label:'Financé',        color:'green'  },
  DONE:    { label:'Terminé',        color:'gray'   },
  PENDING: { label:'En attente',     color:'gray'   },
  REJECTED:{ label:'Rejeté',         color:'red'    },
};

export default function ProjectsPage() {
  const [filter, setFilter] = useState('');
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useProjects(filter ? { status:filter } : undefined);
  const projects = data?.projects ?? [];

  const FILTERS = ['', 'FUNDING', 'REVIEW', 'VOTING', 'FUNDED', 'DONE'];

  return (
    <div style={{ fontFamily:F, display:'flex', flexDirection:'column', gap:20 }}>

      <div style={{ background:`linear-gradient(135deg, ${VERT} 0%, #13883C 100%)`, borderRadius:20, padding:'24px 28px', color:'#fff' }}>
        <div style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,.55)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:6 }}>Opportunités</div>
        <div style={{ fontSize:22, fontWeight:700 }}>Projets CGIF</div>
        <div style={{ fontSize:13, color:'rgba(255,255,255,.75)', marginTop:4 }}>Investissez dans le développement du Cameroun</div>
      </div>

      {/* Filtres statut */}
      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding:'6px 14px', borderRadius:99, border:`1.5px solid ${filter===f ? VERT : '#E5E7EB'}`,
            background: filter===f ? VERT : '#fff', color: filter===f ? '#fff' : '#374151',
            fontFamily:F, fontSize:12, fontWeight:600, cursor:'pointer', transition:'all .15s',
          }}>
            {f === '' ? 'Tous' : STATUS_LABELS[f]?.label ?? f}
          </button>
        ))}
      </div>

      {isLoading && <Spinner />}
      {error && <ErrorBox msg="Impossible de charger les projets" onRetry={refetch} />}
      {!isLoading && projects.length === 0 && <EmptyState icon="📁" title="Aucun projet" desc="Aucun projet ne correspond à ce filtre." />}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:16 }}>
        {projects.map((p: any) => {
          const s = STATUS_LABELS[p.status] ?? { label:p.status, color:'gray' as const };
          return (
            <Card key={p.id} style={{ display:'flex', flexDirection:'column', gap:12, padding:'20px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:700, color:'#111827', marginBottom:4, lineHeight:1.3 }}>{p.title}</div>
                  <div style={{ fontSize:11, color:'#6B7280' }}>{p.cluster?.name ?? 'CGIF'}</div>
                </div>
                <Badge label={s.label} color={s.color} />
              </div>

              {p.description && (
                <div style={{ fontSize:12, color:'#6B7280', lineHeight:1.6, display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                  {p.description}
                </div>
              )}

              {/* Barre de progression */}
              {p.status === 'FUNDING' && (
                <div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#6B7280', marginBottom:4 }}>
                    <span>{p.collectedAmount?.toLocaleString('fr-FR') ?? 0} FCFA collectés</span>
                    <span style={{ fontWeight:700, color:VERT }}>{p.progress ?? 0}%</span>
                  </div>
                  <div style={{ height:6, background:'#E5E7EB', borderRadius:99, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${Math.min(100, p.progress ?? 0)}%`, background:VERT, borderRadius:99, transition:'width .3s' }}/>
                  </div>
                  <div style={{ fontSize:11, color:'#9CA3AF', marginTop:4 }}>
                    Objectif : {p.targetAmount?.toLocaleString('fr-FR') ?? 0} FCFA
                  </div>
                </div>
              )}

              <Btn onClick={() => navigate('/investir', { state: { projectId: p.id } })} style={{ width:'100%', textAlign:'center' }}>
                {p.status === 'FUNDING' ? '💰 Investir' : 'Voir le détail'}
              </Btn>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
