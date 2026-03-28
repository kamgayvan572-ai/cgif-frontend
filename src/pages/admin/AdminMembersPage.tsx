
import { useState } from 'react';
import { useMembers, useUpdateMemberStatus } from '../../services/api';
import { Spinner, ErrorBox, Card, Badge, Btn, EmptyState } from '../../components/ui/PageShell';

const F = "'Plus Jakarta Sans', sans-serif";
const VERT = '#0D2818';

const STATUS_COLORS: Record<string, 'green'|'amber'|'red'|'gray'|'blue'> = {
  ACTIVE:'green', PENDING:'amber', SUSPENDED:'red', BANNED:'red', MODERATOR:'blue',
};

export default function AdminMembersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<any>(null);

  const { data, isLoading, error, refetch } = useMembers(
    statusFilter ? { status:statusFilter } : undefined
  );
  const updateStatus = useUpdateMemberStatus();

  const members = (data?.users ?? data?.members ?? []) as any[];
  const shown = search
    ? members.filter((m: any) => m.name?.toLowerCase().includes(search.toLowerCase()) || m.email?.toLowerCase().includes(search.toLowerCase()))
    : members;

  const changeStatus = async (id: string, status: string) => {
    await updateStatus.mutateAsync({ id, status });
    setSelected(null);
  };

  return (
    <div style={{ fontFamily:F, display:'flex', flexDirection:'column', gap:20 }}>

      <div style={{ background:`linear-gradient(135deg, ${VERT} 0%, #13883C 100%)`, borderRadius:20, padding:'24px 28px', color:'#fff' }}>
        <div style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,.55)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:6 }}>Administration</div>
        <div style={{ fontSize:22, fontWeight:700 }}>Gestion des membres</div>
        <div style={{ fontSize:13, color:'rgba(255,255,255,.75)', marginTop:4 }}>
          {members.length} membre{members.length>1?'s':''} · Validation · KYC · Statuts
        </div>
      </div>

      {/* Filtres + recherche */}
      <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Rechercher un membre…"
          style={{ flex:1, minWidth:200, padding:'10px 14px', borderRadius:10, border:'1.5px solid #E5E7EB', fontFamily:F, fontSize:13, outline:'none' }}
        />
        {['','PENDING','ACTIVE','SUSPENDED'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{
            padding:'8px 14px', borderRadius:99, border:`1.5px solid ${statusFilter===s ? VERT : '#E5E7EB'}`,
            background: statusFilter===s ? VERT : '#fff', color: statusFilter===s ? '#fff' : '#374151',
            fontFamily:F, fontSize:12, fontWeight:600, cursor:'pointer', transition:'all .15s',
          }}>
            {s === '' ? 'Tous' : s}
          </button>
        ))}
      </div>

      {isLoading && <Spinner />}
      {error && <ErrorBox msg="Impossible de charger les membres" onRetry={refetch} />}
      {!isLoading && shown.length === 0 && <EmptyState icon="👥" title="Aucun membre" desc="Aucun membre ne correspond à ce filtre." />}

      <Card style={{ padding:0, overflow:'hidden' }}>
        {shown.map((m: any, i: number) => (
          <div key={m.id} style={{
            display:'flex', alignItems:'center', gap:14, padding:'14px 20px',
            borderBottom: i < shown.length-1 ? '1px solid #F3F4F6' : 'none',
            background: m.status === 'PENDING' ? 'rgba(200,130,26,.03)' : '#fff',
          }}>
            <div style={{ width:40, height:40, borderRadius:'50%', background:'#F0FDF4', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:VERT, flexShrink:0 }}>
              {m.initials ?? m.name?.slice(0,2) ?? 'M'}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap', marginBottom:2 }}>
                <span style={{ fontSize:13, fontWeight:600, color:'#111827' }}>{m.name}</span>
                <Badge label={m.status} color={STATUS_COLORS[m.status] ?? 'gray'} />
                <Badge label={`KYC: ${m.kycStatus ?? 'NONE'}`} color={STATUS_COLORS[m.kycStatus ?? 'NONE'] ?? 'gray'} />
              </div>
              <div style={{ fontSize:11, color:'#6B7280' }}>
                {m.email} · {m.country ?? '—'} · {m.cluster?.name ?? '—'}
              </div>
              {m.specialization && <div style={{ fontSize:10, color:'#9CA3AF' }}>{m.specialization}</div>}
            </div>
            <Btn variant="ghost" size="sm" onClick={() => setSelected(m)}>
              Gérer
            </Btn>
          </div>
        ))}
      </Card>

      {/* Modal gestion membre */}
      {selected && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}
          onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <Card style={{ maxWidth:480, width:'100%', margin:20 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <div style={{ fontSize:16, fontWeight:700, color:'#111827' }}>Gérer {selected.name}</div>
              <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', color:'#6B7280' }}>×</button>
            </div>

            <div style={{ marginBottom:16 }}>
              {[['Email', selected.email], ['Pays', selected.country ?? '—'], ['Cluster', selected.cluster?.name ?? '—'], ['Statut', selected.status], ['KYC', selected.kycStatus ?? 'NONE']].map(([l,v]) => (
                <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #F3F4F6', fontSize:13 }}>
                  <span style={{ color:'#6B7280', fontWeight:600 }}>{l}</span>
                  <span style={{ color:'#111827' }}>{v}</span>
                </div>
              ))}
            </div>

            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {selected.status === 'PENDING' && (
                <Btn onClick={() => changeStatus(selected.id, 'ACTIVE')} disabled={updateStatus.isPending}>
                  ✅ Activer le compte
                </Btn>
              )}
              {selected.status === 'ACTIVE' && (
                <Btn variant="danger" onClick={() => changeStatus(selected.id, 'SUSPENDED')} disabled={updateStatus.isPending}>
                  Suspendre
                </Btn>
              )}
              {selected.status === 'SUSPENDED' && (
                <Btn onClick={() => changeStatus(selected.id, 'ACTIVE')} disabled={updateStatus.isPending}>
                  Réactiver
                </Btn>
              )}
              <Btn variant="secondary" onClick={() => setSelected(null)}>Fermer</Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
