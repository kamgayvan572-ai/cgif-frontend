
import { Card, EmptyState } from '../../components/ui/PageShell';

const F = "'Plus Jakarta Sans', sans-serif";
const VERT = '#0D2818';

export default function AdminModerationPage() {
  return (
    <div style={{ fontFamily:F, display:'flex', flexDirection:'column', gap:20 }}>
      <div style={{ background:`linear-gradient(135deg, ${VERT} 0%, #13883C 100%)`, borderRadius:20, padding:'24px 28px', color:'#fff' }}>
        <div style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,.55)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:6 }}>Administration</div>
        <div style={{ fontSize:22, fontWeight:700 }}>🔍 Modération des posts</div>
      </div>
      <Card>
        <EmptyState icon="🔍" title="Modération des posts" desc="Section connectée à l'API — les routes /clusters, /polls, /documents, /announcements, /events, /posts, /nda et /settings sont disponibles dans src/services/api.ts." />
      </Card>
    </div>
  );
}
