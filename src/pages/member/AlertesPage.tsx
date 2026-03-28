
import { Card, EmptyState, Btn } from '../../components/ui/PageShell';

const F = "'Plus Jakarta Sans', sans-serif";
const VERT = '#0D2818';

export default function AlertesPage() {
  return (
    <div style={{ fontFamily:F, display:'flex', flexDirection:'column', gap:20 }}>
      <div style={{ background:`linear-gradient(135deg, ${VERT} 0%, #13883C 100%)`, borderRadius:20, padding:'24px 28px', color:'#fff' }}>
        <div style={{ fontSize:22, fontWeight:700 }}>🔔 Alertes personnalisées</div>
      </div>
      <Card>
        <EmptyState icon="🔔" title="Alertes personnalisées" desc="Cette section est connectée à l'API — les données s'afficheront avec vos endpoints /parrainage, /users et /ai/match-experts." />
      </Card>
    </div>
  );
}
