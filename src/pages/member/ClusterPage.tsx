
import { useState } from 'react';
import { useAuth } from '../../context/auth.store';
import { usePosts, useCreatePost } from '../../services/api';
import { Spinner, ErrorBox, Card, SectionTitle, Btn, EmptyState } from '../../components/ui/PageShell';

const F = "'Plus Jakarta Sans', sans-serif";
const VERT = '#0D2818';

export default function ClusterPage() {
  const { user } = useAuth();
  const clusterId = user?.clusterId;
  const [tab, setTab] = useState<'forum'|'docs'>('forum');
  const [composing, setComposing] = useState(false);
  const [content, setContent] = useState('');

  const { data: postsData, isLoading, error, refetch } = usePosts(
    clusterId ? { clusterId, status:'APPROVED' } : undefined
  );
  const createPost = useCreatePost();

  const posts = postsData?.posts ?? [];

  const submit = async () => {
    if (!content.trim() || !clusterId) return;
    await createPost.mutateAsync({ content, clusterId, section:'forum' });
    setContent('');
    setComposing(false);
  };

  return (
    <div style={{ fontFamily:F, display:'flex', flexDirection:'column', gap:20 }}>

      {/* Header */}
      <div style={{ background:`linear-gradient(135deg, ${VERT} 0%, #13883C 100%)`, borderRadius:20, padding:'24px 28px', color:'#fff' }}>
        <div style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,.55)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:6 }}>Mon cluster</div>
        <div style={{ fontSize:22, fontWeight:700, marginBottom:4 }}>{user?.cluster?.name ?? '—'}</div>
        <div style={{ fontSize:13, color:'rgba(255,255,255,.75)' }}>
          Spécialisation : {user?.specialization ?? '—'} · Code : {user?.cluster?.code ?? '—'}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:6, background:'#F3F4F6', borderRadius:12, padding:4, width:'fit-content' }}>
        {(['forum','docs'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding:'7px 20px', borderRadius:9, border:'none', cursor:'pointer', fontFamily:F, fontSize:12, fontWeight:600,
            background: tab===t ? '#fff' : 'transparent',
            color: tab===t ? VERT : '#6B7280',
            boxShadow: tab===t ? '0 1px 4px rgba(0,0,0,.08)' : 'none',
            transition:'all .15s',
          }}>
            {t === 'forum' ? '💬 Forum' : '📎 Documents'}
          </button>
        ))}
      </div>

      {tab === 'forum' && (
        <>
          {/* Composer */}
          <Card>
            {!composing ? (
              <div onClick={() => setComposing(true)} style={{ display:'flex', gap:12, alignItems:'center', cursor:'pointer' }}>
                <div style={{ width:36, height:36, borderRadius:'50%', background:'#F0FDF4', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:VERT }}>
                  {user?.initials ?? 'M'}
                </div>
                <div style={{ flex:1, padding:'10px 14px', background:'#F9FAFB', borderRadius:10, fontSize:13, color:'#9CA3AF', border:'1px solid #E5E7EB' }}>
                  Partager quelque chose avec votre cluster…
                </div>
              </div>
            ) : (
              <>
                <textarea
                  autoFocus value={content} onChange={e => setContent(e.target.value)}
                  placeholder="Partagez vos réflexions, actualités, demandes d'expertise…"
                  style={{ width:'100%', minHeight:100, padding:'12px 14px', borderRadius:10, border:'1.5px solid #0D2818', fontFamily:F, fontSize:13, resize:'vertical', outline:'none', boxSizing:'border-box' }}
                />
                <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:10 }}>
                  <Btn variant="secondary" onClick={() => { setComposing(false); setContent(''); }}>Annuler</Btn>
                  <Btn onClick={submit} disabled={!content.trim() || createPost.isPending}>
                    {createPost.isPending ? 'Publication…' : 'Publier'}
                  </Btn>
                </div>
              </>
            )}
          </Card>

          {/* Posts */}
          {isLoading && <Spinner />}
          {error && <ErrorBox msg="Impossible de charger le forum" onRetry={refetch} />}
          {!isLoading && posts.length === 0 && (
            <EmptyState icon="💬" title="Aucune publication" desc="Soyez le premier à partager quelque chose dans votre cluster." />
          )}
          {posts.map((p: any) => (
            <Card key={p.id}>
              <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
                <div style={{ width:36, height:36, borderRadius:'50%', background:'#F0FDF4', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:VERT, flexShrink:0 }}>
                  {p.author?.initials ?? 'M'}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                    <span style={{ fontSize:13, fontWeight:600, color:'#111827' }}>{p.author?.name ?? 'Membre'}</span>
                    <span style={{ fontSize:11, color:'#9CA3AF' }}>{new Date(p.createdAt).toLocaleDateString('fr-FR', { day:'numeric', month:'short' })}</span>
                  </div>
                  <div style={{ fontSize:13, color:'#374151', lineHeight:1.65 }}>{p.content}</div>
                  <div style={{ display:'flex', gap:12, marginTop:10, fontSize:11, color:'#9CA3AF' }}>
                    <span>👍 {p.likesCount ?? 0}</span>
                    <span>💬 {p._count?.comments ?? 0} commentaires</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </>
      )}

      {tab === 'docs' && (
        <EmptyState icon="📎" title="Documents du cluster" desc="Connectez la route /documents avec filtrage par clusterId." />
      )}
    </div>
  );
}
