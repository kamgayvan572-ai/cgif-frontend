
import { useState } from 'react';
import { useNews } from '../../services/api';
import { useAuth } from '../../context/auth.store';
import { Spinner, ErrorBox, Card, Badge, EmptyState } from '../../components/ui/PageShell';

const F = "'Plus Jakarta Sans', sans-serif";
const VERT = '#0D2818';

export default function ActualitesPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('');
  const { data, isLoading, error, refetch } = useNews(filter ? { domain:filter } : undefined);
  const articles = data?.articles ?? data ?? [];

  if (isLoading) return <Spinner />;
  if (error) return <ErrorBox msg="Impossible de charger les actualités" onRetry={refetch} />;

  return (
    <div style={{ fontFamily:F, display:'flex', flexDirection:'column', gap:20 }}>

      <div style={{ background:`linear-gradient(135deg, ${VERT} 0%, #13883C 100%)`, borderRadius:20, padding:'24px 28px', color:'#fff' }}>
        <div style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,.55)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:6 }}>Fil d'information · Agent IA</div>
        <div style={{ fontSize:22, fontWeight:700 }}>Actualités Cameroun</div>
        <div style={{ fontSize:13, color:'rgba(255,255,255,.75)', marginTop:4 }}>Classifiées par IA · Filtrées par votre cluster</div>
      </div>

      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
        {['', 'engineering', 'health', 'business', 'education'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding:'6px 14px', borderRadius:99, border:`1.5px solid ${filter===f ? VERT : '#E5E7EB'}`,
            background: filter===f ? VERT : '#fff', color: filter===f ? '#fff' : '#374151',
            fontFamily:F, fontSize:12, fontWeight:600, cursor:'pointer', transition:'all .15s',
          }}>
            {f === '' ? 'Tous' : f.charAt(0).toUpperCase()+f.slice(1)}
          </button>
        ))}
      </div>

      {(articles as any[]).length === 0 && (
        <EmptyState icon="📰" title="Aucun article" desc="Aucun article pour ce filtre." />
      )}

      {(articles as any[]).map((a: any) => (
        <Card key={a.id} style={{ display:'flex', gap:14 }}>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', gap:8, marginBottom:6, flexWrap:'wrap', alignItems:'center' }}>
              <Badge label={a.domain ?? a.domaine ?? 'Info'} color="blue" />
              {a.relevanceScore && (
                <span style={{ fontSize:10, color:'#9CA3AF' }}>🤖 IA {Math.round((a.relevanceScore ?? 0)*100)}%</span>
              )}
              <span style={{ fontSize:10, color:'#9CA3AF', marginLeft:'auto' }}>
                {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString('fr-FR') : a.date ?? ''}
              </span>
            </div>
            <div style={{ fontSize:14, fontWeight:700, color:'#111827', marginBottom:6, lineHeight:1.35 }}>{a.title ?? a.titre}</div>
            <div style={{ fontSize:12, color:'#6B7280', lineHeight:1.65, marginBottom:8 }}>{a.summary ?? a.resume}</div>
            <div style={{ display:'flex', gap:8, alignItems:'center', fontSize:11, color:'#9CA3AF' }}>
              <span>{a.source ?? 'CGIF'}</span>
              {a.url && (
                <a href={a.url} target="_blank" rel="noreferrer" style={{ color:VERT, fontWeight:600, textDecoration:'none' }}>
                  Lire l'article →
                </a>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
