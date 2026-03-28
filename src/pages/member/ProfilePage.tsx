
import { useState } from 'react';
import { useAuth } from '../../context/auth.store';
import { api } from '../../context/auth.store';
import { Card, SectionTitle, Btn, Badge } from '../../components/ui/PageShell';

const F = "'Plus Jakarta Sans', sans-serif";
const VERT = '#0D2818';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name ?? '', bio: user?.bio ?? '', country: user?.country ?? '' });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.patch('/users/me', form);
      setUser({ ...user!, ...data });
      setEditing(false);
    } finally { setSaving(false); }
  };

  const kycColors: Record<string, 'green'|'amber'|'red'|'gray'|'blue'> = {
    APPROVED:'green', PENDING:'amber', REVIEWING:'amber', REJECTED:'red', NONE:'gray',
  };

  return (
    <div style={{ fontFamily:F, display:'flex', flexDirection:'column', gap:20 }}>

      {/* Hero profil */}
      <Card style={{ textAlign:'center', padding:'32px 24px' }}>
        <div style={{ width:72, height:72, borderRadius:'50%', background:`linear-gradient(135deg, ${VERT}, #13883C)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, fontWeight:700, color:'#fff', margin:'0 auto 16px' }}>
          {user?.initials ?? 'M'}
        </div>
        <div style={{ fontSize:20, fontWeight:700, color:'#111827', marginBottom:4 }}>{user?.name}</div>
        <div style={{ fontSize:13, color:'#6B7280', marginBottom:8 }}>{user?.email}</div>
        <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap' }}>
          <Badge label={user?.role ?? 'MEMBER'} color="blue" />
          <Badge label={`KYC: ${user?.kycStatus ?? 'NONE'}`} color={kycColors[user?.kycStatus ?? 'NONE'] ?? 'gray'} />
          {user?.cluster?.code && <Badge label={user.cluster.code} color="green" />}
        </div>
      </Card>

      {/* Informations */}
      <Card>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <SectionTitle>Informations personnelles</SectionTitle>
          <Btn variant="ghost" size="sm" onClick={() => setEditing(!editing)}>
            {editing ? 'Annuler' : '✏️ Modifier'}
          </Btn>
        </div>

        {editing ? (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {[['name','Nom complet'], ['bio','Bio / Présentation'], ['country','Pays']].map(([k, l]) => (
              <div key={k}>
                <label style={{ fontSize:12, fontWeight:600, color:'#374151', display:'block', marginBottom:5 }}>{l}</label>
                {k === 'bio' ? (
                  <textarea value={(form as any)[k]} onChange={e => setForm(f => ({...f, [k]:e.target.value}))} rows={3}
                    style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:'1.5px solid #E5E7EB', fontFamily:F, fontSize:13, outline:'none', resize:'vertical', boxSizing:'border-box' }}/>
                ) : (
                  <input value={(form as any)[k]} onChange={e => setForm(f => ({...f, [k]:e.target.value}))}
                    style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:'1.5px solid #E5E7EB', fontFamily:F, fontSize:13, outline:'none', boxSizing:'border-box' }}/>
                )}
              </div>
            ))}
            <Btn onClick={save} disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer'}</Btn>
          </div>
        ) : (
          <div>
            {[
              ['Nom', user?.name], ['Email', user?.email], ['Pays', user?.country ?? '—'],
              ['Cluster', user?.cluster?.name ?? '—'], ['Spécialisation', user?.specialization ?? '—'],
              ['Membre depuis', user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR',{year:'numeric',month:'long'}) : '—'],
            ].map(([l,v]) => (
              <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #F3F4F6', fontSize:13 }}>
                <span style={{ color:'#6B7280', fontWeight:600 }}>{l}</span>
                <span style={{ color:'#111827', textAlign:'right', maxWidth:240 }}>{v}</span>
              </div>
            ))}
            {user?.bio && (
              <div style={{ marginTop:12, padding:'12px', background:'#F9FAFB', borderRadius:10, fontSize:13, color:'#374151', lineHeight:1.65 }}>
                {user.bio}
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
