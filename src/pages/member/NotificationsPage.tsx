
import { useNotifications, useMarkAllRead } from '../../services/api';
import { Spinner, ErrorBox, Card, Btn, EmptyState } from '../../components/ui/PageShell';

const F = "'Plus Jakarta Sans', sans-serif";
const VERT = '#0D2818';

export default function NotificationsPage() {
  const { data: notifs = [], isLoading, error, refetch } = useNotifications();
  const markAll = useMarkAllRead();

  const unread = (notifs as any[]).filter((n: any) => !n.read).length;

  const TYPE_BG: Record<string, string> = {
    success: '#F0FDF4', info: '#EFF6FF', warning: '#FEF3C7', error: '#FEF2F2',
  };

  if (isLoading) return <Spinner />;
  if (error) return <ErrorBox msg="Impossible de charger les notifications" onRetry={refetch} />;

  return (
    <div style={{ fontFamily:F, display:'flex', flexDirection:'column', gap:20 }}>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
        <div>
          <div style={{ fontSize:22, fontWeight:700, color:'#111827' }}>🔔 Notifications</div>
          {unread > 0 && <div style={{ fontSize:13, color:'#6B7280', marginTop:2 }}>{unread} non lue{unread>1?'s':''}</div>}
        </div>
        {unread > 0 && (
          <Btn variant="secondary" onClick={() => markAll.mutate()} disabled={markAll.isPending}>
            {markAll.isPending ? '…' : 'Tout marquer comme lu'}
          </Btn>
        )}
      </div>

      {(notifs as any[]).length === 0 && (
        <EmptyState icon="🔔" title="Aucune notification" desc="Vous êtes à jour — aucune notification en attente." />
      )}

      {(notifs as any[]).map((n: any) => (
        <Card key={n.id} style={{
          display:'flex', gap:14, alignItems:'flex-start',
          background: n.read ? '#fff' : TYPE_BG[n.type] ?? '#F9FAFB',
          borderLeft: n.read ? '1px solid #E5E7EB' : `4px solid ${n.type==='success'?'#059669':n.type==='warning'?'#D97706':n.type==='error'?'#DC2626':'#2563EB'}`,
        }}>
          <span style={{ fontSize:22 }}>{n.icon ?? '📌'}</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:n.read ? 400 : 700, color:'#111827', marginBottom:4 }}>{n.title}</div>
            <div style={{ fontSize:12, color:'#6B7280', lineHeight:1.6 }}>{n.message}</div>
            <div style={{ fontSize:10, color:'#9CA3AF', marginTop:6 }}>
              {new Date(n.createdAt ?? Date.now()).toLocaleDateString('fr-FR', { day:'numeric', month:'long', hour:'2-digit', minute:'2-digit' })}
            </div>
          </div>
          {!n.read && <span style={{ width:8, height:8, borderRadius:'50%', background:VERT, marginTop:4, flexShrink:0 }}/>}
        </Card>
      ))}
    </div>
  );
}
