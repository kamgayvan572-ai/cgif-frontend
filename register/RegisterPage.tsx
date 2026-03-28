import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../context/auth.store';
import { CLUSTERS, getSpecsByClusterId } from '../../data/clusters';

const F = "'Plus Jakarta Sans', sans-serif";
const VERT  = '#0D2818';
const VERT2 = '#13883C';
const AMBRE = '#C8821A';

const PAYS = [
  'France', 'Belgique', 'Suisse', 'Canada', 'Allemagne', 'Royaume-Uni',
  'Pays-Bas', 'Espagne', 'Italie', 'Portugal', 'États-Unis', 'Cameroun',
  'Autre',
];

const STEPS = ['Compte', 'Profil', 'Cluster', 'Spécialisation', 'Confirmation'];

const inp = (extra?: object): React.CSSProperties => ({
  width: '100%', padding: '10px 12px', borderRadius: 10,
  border: '1.5px solid #E5E7EB', fontFamily: F, fontSize: 13,
  outline: 'none', boxSizing: 'border-box', ...extra,
});

const lbl = (): React.CSSProperties => ({
  fontSize: 12, fontWeight: 600, color: '#374151',
  display: 'block', marginBottom: 5, fontFamily: F,
});

const DOMAIN_CLR: Record<string, { bg: string; c: string }> = {
  engineering: { bg: '#EFF6FF', c: '#1E40AF' },
  health:      { bg: '#F0FDF4', c: '#166534' },
  business:    { bg: '#FEF3C7', c: '#92400E' },
  education:   { bg: '#F5F3FF', c: '#5B21B6' },
  arts:        { bg: '#FDF2F8', c: '#86198F' },
  law:         { bg: '#F0F9FF', c: '#075985' },
};

const DOMAIN_LABEL: Record<string, string> = {
  engineering: 'Ingénierie',
  health:      'Sciences de la santé',
  business:    'Business & Management',
  education:   'Éducation',
  arts:        'Arts & Design',
  law:         'Droit & Gouvernance',
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref') || '';

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    country: '', city: '', phone: '',
    clusterId: '', specialization: '',
    refCode: refCode,
    agreeNda: false, agreeTerms: false,
  });

  const F2 = (k: string) => (v: string | boolean) =>
    setForm(f => ({ ...f, [k]: v }));

  // Spécialisations disponibles selon le cluster sélectionné
  const availableSpecs = getSpecsByClusterId(form.clusterId);
  const selectedCluster = CLUSTERS.find(c => c.id === form.clusterId);

  // Réinitialiser la spécialisation si le cluster change
  useEffect(() => {
    setForm(f => ({ ...f, specialization: '' }));
  }, [form.clusterId]);

  // Grouper les clusters par domaine pour l'affichage
  const clustersByDomain = CLUSTERS.reduce<Record<string, typeof CLUSTERS>>((acc, c) => {
    if (!acc[c.domain]) acc[c.domain] = [];
    acc[c.domain].push(c);
    return acc;
  }, {});

  // Validation par étape
  const canNext = (): boolean => {
    if (step === 1) return !!(form.name.trim() && form.email.includes('@') && form.password.length >= 8 && form.password === form.confirmPassword);
    if (step === 2) return !!(form.country && form.city.trim());
    if (step === 3) return !!form.clusterId;
    if (step === 4) return !!form.specialization;
    if (step === 5) return form.agreeNda && form.agreeTerms;
    return false;
  };

  const submit = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/register', {
        name:           form.name,
        email:          form.email,
        password:       form.password,
        country:        form.country,
        city:           form.city,
        phone:          form.phone || undefined,
        clusterId:      form.clusterId,
        specialization: form.specialization,
        refCode:        form.refCode || undefined,
      });
      setSuccess(true);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  // Page succès
  if (success) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB', fontFamily: F }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 40, maxWidth: 440, width: '100%', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,.07)' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 16px' }}>✅</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: VERT, marginBottom: 10 }}>Demande envoyée !</div>
        <div style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.7, marginBottom: 24 }}>
          Votre dossier est en cours de traitement. L'équipe CGIF examinera votre profil et vous contactera sous <strong>48h</strong> pour valider votre accès.
        </div>
        <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#166534' }}>
          📧 Un email de confirmation a été envoyé à <strong>{form.email}</strong>
        </div>
        <button onClick={() => navigate('/login')} style={{ background: VERT, color: '#fff', border: 'none', borderRadius: 12, padding: '12px 28px', cursor: 'pointer', fontFamily: F, fontSize: 14, fontWeight: 700 }}>
          Aller à la connexion →
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', fontFamily: F, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 16px' }}>
      <div style={{ width: '100%', maxWidth: 520 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: VERT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 auto 10px' }}>C</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: VERT }}>CGIF</div>
          <div style={{ fontSize: 12, color: '#9CA3AF' }}>Cameroon Global Intelligence Forum</div>
        </div>

        {/* Stepper */}
        <div style={{ display: 'flex', marginBottom: 20, background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{
              flex: 1, padding: '9px 4px', textAlign: 'center', fontSize: 10,
              fontWeight: 600, borderRight: i < 4 ? '1px solid #E5E7EB' : 'none',
              background: step === i+1 ? VERT : step > i+1 ? '#D1FAE5' : '#fff',
              color:      step === i+1 ? '#fff' : step > i+1 ? '#065F46' : '#9CA3AF',
              transition: 'all .2s',
            }}>
              {step > i+1 ? '✓' : i+1}. {s}
            </div>
          ))}
        </div>

        {/* Carte formulaire */}
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E5E7EB', padding: 'clamp(20px,4vw,32px)', boxShadow: '0 2px 16px rgba(0,0,0,.05)' }}>

          {/* ─── Étape 1 : Compte ──────────────────────────────────────────────── */}
          {step === 1 && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: VERT, marginBottom: 4 }}>Créer votre compte</div>
              <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 20 }}>Informations d'accès à la plateforme</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={lbl()}>Nom complet *</label>
                  <input value={form.name} onChange={e => F2('name')(e.target.value)} placeholder="Ex : Jean-Baptiste Mbarga" style={inp()}/>
                </div>
                <div>
                  <label style={lbl()}>Adresse email *</label>
                  <input type="email" value={form.email} onChange={e => F2('email')(e.target.value)} placeholder="votre@email.com" style={inp()}/>
                </div>
                <div>
                  <label style={lbl()}>Mot de passe * <span style={{ fontWeight: 400, color: '#9CA3AF' }}>(8 caractères min.)</span></label>
                  <input type="password" value={form.password} onChange={e => F2('password')(e.target.value)} style={inp()}/>
                </div>
                <div>
                  <label style={lbl()}>Confirmer le mot de passe *</label>
                  <input type="password" value={form.confirmPassword} onChange={e => F2('confirmPassword')(e.target.value)} style={inp({
                    borderColor: form.confirmPassword && form.password !== form.confirmPassword ? '#EF4444' : '#E5E7EB',
                  })}/>
                  {form.confirmPassword && form.password !== form.confirmPassword && (
                    <div style={{ fontSize: 11, color: '#EF4444', marginTop: 4 }}>Les mots de passe ne correspondent pas</div>
                  )}
                </div>
                <div>
                  <label style={lbl()}>Code de parrainage <span style={{ fontWeight: 400, color: '#9CA3AF' }}>(optionnel)</span></label>
                  <input value={form.refCode} onChange={e => F2('refCode')(e.target.value)} placeholder="Ex : CGIF-KY-2024" style={inp()} />
                </div>
              </div>
            </div>
          )}

          {/* ─── Étape 2 : Profil géographique ─────────────────────────────────── */}
          {step === 2 && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: VERT, marginBottom: 4 }}>Votre profil</div>
              <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 20 }}>Où vous trouvez-vous dans la diaspora ?</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={lbl()}>Pays de résidence *</label>
                  <select value={form.country} onChange={e => F2('country')(e.target.value)} style={inp()}>
                    <option value="">Sélectionner un pays…</option>
                    {PAYS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl()}>Ville *</label>
                  <input value={form.city} onChange={e => F2('city')(e.target.value)} placeholder="Ex : Paris, Montréal, Berlin…" style={inp()}/>
                </div>
                <div>
                  <label style={lbl()}>Téléphone <span style={{ fontWeight: 400, color: '#9CA3AF' }}>(optionnel)</span></label>
                  <input type="tel" value={form.phone} onChange={e => F2('phone')(e.target.value)} placeholder="+33 6 XX XX XX XX" style={inp()}/>
                </div>
              </div>
            </div>
          )}

          {/* ─── Étape 3 : Choix du cluster ─────────────────────────────────────── */}
          {step === 3 && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: VERT, marginBottom: 4 }}>Votre cluster</div>
              <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 20 }}>
                Sélectionnez le domaine qui correspond à votre secteur d'expertise ou d'investissement.
              </div>

              {Object.entries(clustersByDomain).map(([domain, clusters]) => {
                const clr = DOMAIN_CLR[domain] || { bg: '#F3F4F6', c: '#374151' };
                return (
                  <div key={domain} style={{ marginBottom: 16 }}>
                    {/* Label domaine */}
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as any, letterSpacing: '.06em', color: clr.c, background: clr.bg, display: 'inline-block', padding: '2px 10px', borderRadius: 99, marginBottom: 8 }}>
                      {DOMAIN_LABEL[domain]}
                    </div>
                    {/* Clusters du domaine */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {clusters.map(c => {
                        const selected = form.clusterId === c.id;
                        return (
                          <div key={c.id} onClick={() => F2('clusterId')(c.id)} style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '10px 14px', borderRadius: 12, cursor: 'pointer',
                            border: `1.5px solid ${selected ? VERT2 : '#E5E7EB'}`,
                            background: selected ? '#F0FDF4' : '#fff',
                            transition: 'all .15s',
                          }}>
                            {/* Code */}
                            <div style={{ width: 34, height: 34, borderRadius: 9, background: selected ? VERT : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: selected ? '#fff' : '#6B7280', flexShrink: 0, transition: 'all .15s' }}>
                              {c.code}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13, fontWeight: selected ? 700 : 500, color: selected ? VERT : '#111827' }}>{c.name}</div>
                              <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>{c.specializations.length} spécialisation{c.specializations.length > 1 ? 's' : ''}</div>
                            </div>
                            {selected && <span style={{ color: VERT2, fontSize: 16 }}>✓</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ─── Étape 4 : Spécialisation ───────────────────────────────────────── */}
          {step === 4 && selectedCluster && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: VERT, marginBottom: 4 }}>Votre spécialisation</div>
              <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>
                Cluster sélectionné : <strong style={{ color: VERT }}>{selectedCluster.name}</strong>
              </div>

              {/* Badge cluster */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, marginBottom: 20 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: VERT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>
                  {selectedCluster.code}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: VERT }}>{selectedCluster.name}</div>
                  <div style={{ fontSize: 11, color: VERT2 }}>{availableSpecs.length} spécialisations disponibles</div>
                </div>
                <button onClick={() => { setStep(3); }} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: 12, fontFamily: F }}>
                  Changer ↩
                </button>
              </div>

              {/* Grille de spécialisations */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
                {availableSpecs.map(spec => {
                  const selected = form.specialization === spec.id;
                  return (
                    <div key={spec.id} onClick={() => F2('specialization')(spec.id)} style={{
                      padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
                      border: `1.5px solid ${selected ? VERT2 : '#E5E7EB'}`,
                      background: selected ? '#F0FDF4' : '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      gap: 8, transition: 'all .15s',
                    }}>
                      <span style={{ fontSize: 13, fontWeight: selected ? 700 : 400, color: selected ? VERT : '#374151', lineHeight: 1.4 }}>
                        {spec.name}
                      </span>
                      {selected && <span style={{ color: VERT2, fontSize: 16, flexShrink: 0 }}>✓</span>}
                    </div>
                  );
                })}
              </div>

              {/* Message si aucune spé sélectionnée */}
              {!form.specialization && (
                <div style={{ marginTop: 14, fontSize: 12, color: '#9CA3AF', textAlign: 'center' }}>
                  Cliquez sur votre spécialisation pour la sélectionner
                </div>
              )}
            </div>
          )}

          {/* ─── Étape 5 : Confirmation et NDA ─────────────────────────────────── */}
          {step === 5 && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: VERT, marginBottom: 4 }}>Confirmation</div>
              <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 20 }}>Vérifiez vos informations avant de soumettre</div>

              {/* Récapitulatif */}
              <div style={{ background: '#F9FAFB', borderRadius: 14, border: '1px solid #E5E7EB', overflow: 'hidden', marginBottom: 20 }}>
                {[
                  ['Nom',             form.name],
                  ['Email',           form.email],
                  ['Pays',            form.country],
                  ['Ville',           form.city],
                  ['Cluster',         selectedCluster?.name || '—'],
                  ['Spécialisation',  availableSpecs.find(s => s.id === form.specialization)?.name || '—'],
                  ...(form.refCode ? [['Code parrainage', form.refCode]] : []),
                ].map(([label, value], i, arr) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: i < arr.length - 1 ? '1px solid #E5E7EB' : 'none', gap: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', flexShrink: 0 }}>{label}</span>
                    <span style={{ fontSize: 12, color: '#111827', textAlign: 'right' }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* NDA */}
              <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 12, padding: '14px 16px', marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#92400E', marginBottom: 8 }}>📜 Accord de confidentialité (NDA)</div>
                <div style={{ fontSize: 12, color: '#B45309', lineHeight: 1.7, marginBottom: 10 }}>
                  En rejoignant CGIF, je m'engage à respecter la stricte confidentialité de toutes les informations, données financières et projets partagés au sein de la plateforme, conformément au droit OHADA et aux statuts de CGIF SA.
                </div>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.agreeNda} onChange={e => F2('agreeNda')(e.target.checked)} style={{ marginTop: 2, width: 16, height: 16, flexShrink: 0 }}/>
                  <span style={{ fontSize: 12, color: '#92400E', fontWeight: 600 }}>
                    J'accepte l'accord de confidentialité NDA de CGIF *
                  </span>
                </label>
              </div>

              {/* CGU */}
              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.agreeTerms} onChange={e => F2('agreeTerms')(e.target.checked)} style={{ marginTop: 2, width: 16, height: 16, flexShrink: 0 }}/>
                  <span style={{ fontSize: 12, color: '#166534' }}>
                    J'ai lu et j'accepte les <strong>conditions générales d'utilisation</strong> et la politique de confidentialité de CGIF *
                  </span>
                </label>
              </div>

              {error && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#DC2626' }}>
                  ❌ {error}
                </div>
              )}
            </div>
          )}

          {/* ─── Boutons navigation ─────────────────────────────────────────────── */}
          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            {step > 1 && (
              <button onClick={() => setStep(s => s - 1)} style={{ flex: 1, background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: 12, padding: '12px', cursor: 'pointer', fontFamily: F, fontSize: 14, fontWeight: 600 }}>
                ← Retour
              </button>
            )}
            {step < 5 && (
              <button onClick={() => setStep(s => s + 1)} disabled={!canNext()} style={{
                flex: 2, background: canNext() ? VERT : '#D1D5DB', color: '#fff',
                border: 'none', borderRadius: 12, padding: '12px',
                cursor: canNext() ? 'pointer' : 'not-allowed',
                fontFamily: F, fontSize: 14, fontWeight: 700, transition: 'background .2s',
              }}>
                Suivant →
              </button>
            )}
            {step === 5 && (
              <button onClick={submit} disabled={!canNext() || loading} style={{
                flex: 2, background: !canNext() || loading ? '#9CA3AF' : VERT2,
                color: '#fff', border: 'none', borderRadius: 12, padding: '12px',
                cursor: !canNext() || loading ? 'not-allowed' : 'pointer',
                fontFamily: F, fontSize: 14, fontWeight: 700,
              }}>
                {loading ? 'Envoi en cours…' : '✅ Soumettre ma demande'}
              </button>
            )}
          </div>

          {/* Lien connexion */}
          {step === 1 && (
            <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#6B7280' }}>
              Déjà membre ?{' '}
              <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: VERT, fontFamily: F, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                Se connecter →
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: '#9CA3AF' }}>
          CGIF SA · Droit OHADA · Données protégées
        </div>
      </div>
    </div>
  );
}
