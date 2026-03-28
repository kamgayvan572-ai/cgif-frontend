
import { useMessages } from '../../services/api';
import { useAuth } from '../../context/auth.store';
import { Spinner, ErrorBox, EmptyState, Card } from '../../components/ui/PageShell';

const F = "'Plus Jakarta Sans', sans-serif";
const VERT = '#0D2818';

export default function MessagesPage() {
  const { user } = useAuth();
  const { data, isLoading, error, refetch } = useMessages();
  const messages = data?.messages ?? data ?? [];

  if (isLoading) return <Spinner />;
  if (error) return <ErrorBox msg="Impossible de charger la messagerie" onRetry={refetch} />;

  return (
    <div style={{ fontFamily:F, display:'flex', flexDirection:'column', gap:20 }}>

      <div style={{ background:`linear-gradient(135deg, ${VERT} 0%, #13883C 100%)`, borderRadius:20, padding:'24px 28px', color:'#fff' }}>
        <div style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,.55)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:6 }}>Communication</div>
        <div style={{ fontSize:22, fontWeight:700 }}>Messagerie CGIF</div>
        <div style={{ fontSize:13, color:'rgba(255,255,255,.75)', marginTop:4 }}>Messages privés · Annonces cluster</div>
      </div>

      {(messages as any[]).length === 0 && (
        <EmptyState icon="💬" title="Aucun message" desc="Votre boîte de réception est vide." />
      )}

      {(messages as any[]).map((m: any) => {
        const fromMe = m.senderId === user?.id;
        return (
          <Card key={m.id} style={{ display:'flex', gap:12, alignItems:'flex-start', opacity: m.readAt || fromMe ? 1 : 1 }}>
            <div style={{ width:40, height:40, borderRadius:'50%', background: fromMe ? '#F0FDF4' : '#EFF6FF', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color: fromMe ? VERT : '#2563EB', flexShrink:0 }}>
              {fromMe ? (user?.initials ?? 'M') : (m.sender?.initials ?? 'S')}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <span style={{ fontSize:13, fontWeight:600, color:'#111827' }}>
                  {fromMe ? 'Vous' : (m.sender?.name ?? 'Expéditeur')}
                  {fromMe && <span style={{ fontSize:11, color:'#9CA3AF', marginLeft:8 }}>→ {m.recipient?.name ?? 'Destinataire'}</span>}
                </span>
                <span style={{ fontSize:11, color:'#9CA3AF' }}>
                  {new Date(m.createdAt ?? Date.now()).toLocaleDateString('fr-FR', { day:'numeric', month:'short' })}
                </span>
              </div>
              {m.subject && <div style={{ fontSize:12, fontWeight:600, color:'#374151', marginBottom:4 }}>{m.subject}</div>}
              <div style={{ fontSize:12, color:'#6B7280', lineHeight:1.6 }}>{m.content ?? m.body}</div>
            </div>
            {!m.readAt && !fromMe && (
              <span style={{ width:8, height:8, borderRadius:'50%', background:VERT, marginTop:6, flexShrink:0 }}/>
            )}
          </Card>
        );
      })}
    </div>
  );
}
