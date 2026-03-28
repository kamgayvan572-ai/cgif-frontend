
import { useEvents, useRegisterEvent, useUnregisterEvent } from '../../services/api';
import { useAuth } from '../../context/auth.store';
import { Spinner, ErrorBox, Card, Badge, Btn, EmptyState } from '../../components/ui/PageShell';
import { useState } from 'react';

const F = "'Plus Jakarta Sans', sans-serif";
const VERT = '#0D2818';

const TYPE_CFG: Record<string, {ico:string;color:'green'|'blue'|'amber'|'gray'}> = {
  networking: { ico:'🤝', color:'blue'  },
  webinaire:  { ico:'🎙️', color:'green' },
  formation:  { ico:'📚', color:'amber' },
  assemblee:  { ico:'🏛️', color:'gray'  },
};

export default function CalendrierPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('');
  const { data, isLoading, error, refetch } = useEvents();
  const registerEvent = useRegisterEvent();
  const unregisterEvent = useUnregisterEvent();

  const events = (data?.events ?? data ?? []) as any[];
  const shown = filter ? events.filter((e: any) => e.type === filter) : events;

  const isRegistered = (ev: any) =>
    ev.registrations?.some((r: any) => r.userId === user?.id) ?? ev.isRegistered ?? false;

  const toggle = async (ev: any) => {
    if (isRegistered(ev)) {
      await unregisterEvent.mutateAsync(ev.id);
    } else {
      await registerEvent.mutateAsync(ev.id);
    }
  };

  if (isLoading) return <Spinner />;
  if (error) return <ErrorBox msg="Impossible de charger le calendrier" onRetry={refetch} />;

  return (
    <div style={{ fontFamily:F, display:'flex', flexDirection:'column', gap:20 }}>

      <div style={{ background:`linear-gradient(135deg, ${VERT} 0%, #13883C 100%)`, borderRadius:20, padding:'24px 28px', color:'#fff' }}>
        <div style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,.55)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:6 }}>Agenda</div>
        <div style={{ fontSize:22, fontWeight:700 }}>Calendrier CGIF</div>
        <div style={{ fontSize:13, color:'rgba(255,255,255,.75)', marginTop:4 }}>
          {events.length} événement{events.length>1?'s':''} · Networking · Webinaires · Formations
        </div>
      </div>

      {/* Filtres */}
      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
        {['', 'networking', 'webinaire', 'formation', 'assemblee'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding:'6px 14px', borderRadius:99, border:`1.5px solid ${filter===f ? VERT : '#E5E7EB'}`,
            background: filter===f ? VERT : '#fff', color: filter===f ? '#fff' : '#374151',
            fontFamily:F, fontSize:12, fontWeight:600, cursor:'pointer', transition:'all .15s',
          }}>
            {f === '' ? 'Tous' : `${TYPE_CFG[f]?.ico} ${f.charAt(0).toUpperCase()+f.slice(1)}`}
          </button>
        ))}
      </div>

      {shown.length === 0 && <EmptyState icon="📅" title="Aucun événement" desc="Pas d'événement pour ce filtre." />}

      {shown.map((ev: any) => {
        const cfg = TYPE_CFG[ev.type] ?? { ico:'📅', color:'gray' as const };
        const reg = isRegistered(ev);
        return (
          <Card key={ev.id} style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
            {/* Date */}
            <div style={{ width:50, textAlign:'center', flexShrink:0 }}>
              <div style={{ fontSize:24, fontWeight:700, color:VERT, lineHeight:1 }}>
                {new Date(ev.date).getDate()}
              </div>
              <div style={{ fontSize:10, fontWeight:600, color:'#6B7280', textTransform:'uppercase' }}>
                {new Date(ev.date).toLocaleDateString('fr-FR', { month:'short' })}
              </div>
            </div>
            {/* Icône */}
            <div style={{ width:42, height:42, borderRadius:12, background:'#F0FDF4', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>
              {cfg.ico}
            </div>
            {/* Info */}
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:4, flexWrap:'wrap' }}>
                <span style={{ fontSize:13, fontWeight:700, color:'#111827' }}>{ev.titre ?? ev.title}</span>
                {reg && <Badge label="Inscrit ✓" color="green" />}
                <Badge label={ev.type} color={cfg.color} />
              </div>
              <div style={{ fontSize:11, color:'#6B7280' }}>
                ⏰ {ev.heure ?? ev.time ?? '—'} · {ev.duree ?? ev.duration ? `${ev.duree ?? ev.duration} min` : ''} · 📍 {ev.lieu ?? ev.location ?? 'En ligne'}
              </div>
              {ev.description && (
                <div style={{ fontSize:12, color:'#6B7280', marginTop:4, lineHeight:1.6 }}>{ev.description}</div>
              )}
              <div style={{ fontSize:11, color:'#9CA3AF', marginTop:4 }}>
                {ev.inscrits ?? ev.registrationsCount ?? 0} inscrits
                {ev.maxParticipants ? ` / ${ev.maxParticipants}` : ''}
              </div>
            </div>
            <Btn
              variant={reg ? 'secondary' : 'primary'}
              size="sm"
              onClick={() => toggle(ev)}
              disabled={registerEvent.isPending || unregisterEvent.isPending}
              style={{ flexShrink:0 }}
            >
              {reg ? 'Se désinscrire' : "S'inscrire"}
            </Btn>
          </Card>
        );
      })}
    </div>
  );
}
