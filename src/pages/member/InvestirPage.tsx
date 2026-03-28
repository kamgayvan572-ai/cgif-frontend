
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useProjects, useSubmitInvestment } from '../../services/api';
import { useAuth } from '../../context/auth.store';
import { Spinner, ErrorBox, Card, SectionTitle, Btn, Badge } from '../../components/ui/PageShell';

const F = "'Plus Jakarta Sans', sans-serif";
const VERT = '#0D2818';
const AMBRE = '#C8821A';

const MOYENS = [
  { id:'VIREMENT_SEPA', label:'Virement SEPA', ico:'🏦', desc:'Depuis votre banque européenne' },
  { id:'VIREMENT_CAMEROUN', label:'Virement Cameroun', ico:'🏛️', desc:'Depuis une banque camerounaise' },
  { id:'ORANGE_MONEY', label:'Orange Money', ico:'📱', desc:'Mobile money Cameroun' },
  { id:'MTN_MOBILE', label:'MTN Mobile Money', ico:'📲', desc:'Mobile money MTN' },
];

const BANK_INFO = {
  titulaire: 'CGIF SA',
  iban: 'FR76 1234 5678 9012 3456 7890 123',
  swift: 'BNPAFRPPXXX',
  banque: 'BNP Paribas — Paris, France',
  ref_format: 'CGIF-[VOTRE_NOM]-[DATE]',
};

export default function InvestirPage() {
  const { user } = useAuth();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [selectedProject, setSelectedProject] = useState<string>(location.state?.projectId ?? '');
  const [moyen, setMoyen] = useState('VIREMENT_SEPA');
  const [montant, setMontant] = useState('');
  const [refVirement, setRefVirement] = useState('');
  const [success, setSuccess] = useState(false);

  const { data: projectsData, isLoading, error } = useProjects({ status:'FUNDING' });
  const projects = projectsData?.projects ?? [];
  const submitInvest = useSubmitInvestment(selectedProject);

  const sharePrice = 5000;
  const parts = montant ? Math.floor(parseInt(montant) / sharePrice) : 0;
  const selectedP = projects.find((p: any) => p.id === selectedProject);

  const canNext = () => {
    if (step === 1) return !!selectedProject;
    if (step === 2) return parts >= 1;
    if (step === 3) return !!moyen;
    if (step === 4) return !!refVirement.trim();
    return false;
  };

  const kycOk = user?.kycStatus === 'APPROVED';

  const submitFinal = async () => {
    await submitInvest.mutateAsync({
      amount: parseInt(montant),
      sharesRequested: parts,
      paymentMethod: moyen,
      refVirement,
      sharePrice,
    });
    setSuccess(true);
  };

  if (isLoading) return <Spinner />;
  if (error) return <ErrorBox msg="Impossible de charger les projets" />;

  if (!kycOk) return (
    <div style={{ fontFamily:F }}>
      <div style={{ background:'#FEF3C7', border:'1px solid #FDE68A', borderRadius:16, padding:'24px 28px' }}>
        <div style={{ fontSize:18, fontWeight:700, color:'#92400E', marginBottom:8 }}>⚠️ KYC requis avant d'investir</div>
        <div style={{ fontSize:13, color:'#B45309', lineHeight:1.7 }}>
          Vous devez compléter votre vérification d'identité (KYC) avant de pouvoir investir sur CGIF. Statut actuel : <strong>{user?.kycStatus ?? 'NONE'}</strong>
        </div>
        <Btn onClick={() => window.location.href='/kyc'} style={{ marginTop:16 }}>
          Compléter mon KYC →
        </Btn>
      </div>
    </div>
  );

  if (success) return (
    <Card style={{ textAlign:'center', padding:40 }}>
      <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
      <div style={{ fontSize:20, fontWeight:700, color:VERT, marginBottom:8 }}>Votre vœu d'investissement est soumis</div>
      <div style={{ fontSize:13, color:'#6B7280', lineHeight:1.7, marginBottom:20 }}>
        L'équipe CGIF va traiter votre demande. Vous recevrez les coordonnées bancaires par email sous 24h.
      </div>
      <Btn onClick={() => { setSuccess(false); setStep(1); setMontant(''); setRefVirement(''); }}>
        Faire un autre investissement
      </Btn>
    </Card>
  );

  const STEPS = ['Projet', 'Montant', 'Paiement', 'Référence', 'Confirmation'];

  return (
    <div style={{ fontFamily:F, display:'flex', flexDirection:'column', gap:20 }}>

      <div style={{ background:`linear-gradient(135deg, ${VERT} 0%, #13883C 100%)`, borderRadius:20, padding:'24px 28px', color:'#fff' }}>
        <div style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,.55)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:6 }}>Investir</div>
        <div style={{ fontSize:22, fontWeight:700 }}>Rejoignez un projet CGIF</div>
        <div style={{ fontSize:13, color:'rgba(255,255,255,.75)', marginTop:4 }}>Parts à 5 000 FCFA · Dividendes annuels</div>
      </div>

      {/* Stepper */}
      <div style={{ display:'flex', gap:0, background:'#F3F4F6', borderRadius:12, overflow:'hidden' }}>
        {STEPS.map((s, i) => (
          <div key={i} style={{
            flex:1, padding:'9px 4px', textAlign:'center', fontSize:10, fontWeight:600,
            borderRight: i < 4 ? '1px solid #E5E7EB' : 'none',
            background: step===i+1 ? VERT : step>i+1 ? '#D1FAE5' : '#fff',
            color: step===i+1 ? '#fff' : step>i+1 ? '#065F46' : '#9CA3AF',
            transition:'all .2s',
          }}>
            {step>i+1?'✓':i+1}. {s}
          </div>
        ))}
      </div>

      <Card>
        {/* Étape 1 — Choisir le projet */}
        {step === 1 && (
          <>
            <SectionTitle>Choisissez un projet</SectionTitle>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {projects.map((p: any) => (
                <div key={p.id} onClick={() => setSelectedProject(p.id)} style={{
                  display:'flex', alignItems:'center', gap:12, padding:'14px 16px', borderRadius:12, cursor:'pointer',
                  border:`1.5px solid ${selectedProject===p.id ? VERT : '#E5E7EB'}`,
                  background: selectedProject===p.id ? '#F0FDF4' : '#fff',
                  transition:'all .15s',
                }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'#111827' }}>{p.title}</div>
                    <div style={{ fontSize:11, color:'#6B7280', marginTop:2 }}>{p.cluster?.name} · {p.progress}% financé</div>
                  </div>
                  {selectedProject===p.id && <span style={{ color:VERT, fontSize:18 }}>✓</span>}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Étape 2 — Montant */}
        {step === 2 && (
          <>
            <SectionTitle>Montant de votre investissement</SectionTitle>
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:12, fontWeight:600, color:'#374151', display:'block', marginBottom:6 }}>Montant (FCFA) *</label>
              <input type="number" value={montant} onChange={e => setMontant(e.target.value)}
                placeholder="Ex: 25000" step={sharePrice} min={sharePrice}
                style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:'1.5px solid #E5E7EB', fontFamily:F, fontSize:16, fontWeight:700, outline:'none', boxSizing:'border-box' }}
              />
            </div>
            {parts > 0 && (
              <div style={{ padding:'14px 16px', background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:12 }}>
                <div style={{ fontSize:11, fontWeight:600, color:'#065F46', marginBottom:4 }}>Parts à acquérir</div>
                <div style={{ fontSize:28, fontWeight:700, color:VERT }}>{parts} parts</div>
                <div style={{ fontSize:11, color:'#6B7280', marginTop:4 }}>{parseInt(montant).toLocaleString('fr-FR')} FCFA ÷ {sharePrice.toLocaleString('fr-FR')} FCFA / part</div>
              </div>
            )}
          </>
        )}

        {/* Étape 3 — Moyen de paiement */}
        {step === 3 && (
          <>
            <SectionTitle>Moyen de paiement</SectionTitle>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {MOYENS.map(m => (
                <div key={m.id} onClick={() => setMoyen(m.id)} style={{
                  display:'flex', alignItems:'center', gap:12, padding:'14px 16px', borderRadius:12, cursor:'pointer',
                  border:`1.5px solid ${moyen===m.id ? VERT : '#E5E7EB'}`,
                  background: moyen===m.id ? '#F0FDF4' : '#fff', transition:'all .15s',
                }}>
                  <span style={{ fontSize:24 }}>{m.ico}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'#111827' }}>{m.label}</div>
                    <div style={{ fontSize:11, color:'#6B7280' }}>{m.desc}</div>
                  </div>
                  {moyen===m.id && <span style={{ color:VERT }}>✓</span>}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Étape 4 — Référence virement */}
        {step === 4 && (
          <>
            <SectionTitle>Coordonnées CGIF & référence</SectionTitle>
            <div style={{ background:'#1E293B', borderRadius:12, padding:'16px 20px', marginBottom:16 }}>
              {[['Titulaire', BANK_INFO.titulaire], ['IBAN', BANK_INFO.iban], ['SWIFT', BANK_INFO.swift], ['Banque', BANK_INFO.banque]].map(([l, v]) => (
                <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid rgba(255,255,255,.1)', fontSize:12 }}>
                  <span style={{ color:'rgba(255,255,255,.5)' }}>{l}</span>
                  <span style={{ color:'#86EFAC', fontFamily:"'Courier New', monospace", fontWeight:600 }}>{v}</span>
                </div>
              ))}
            </div>
            <div>
              <label style={{ fontSize:12, fontWeight:600, color:'#374151', display:'block', marginBottom:6 }}>
                Votre référence de virement * <span style={{ fontWeight:400, color:'#9CA3AF' }}>(format: CGIF-NOM-DATE)</span>
              </label>
              <input value={refVirement} onChange={e => setRefVirement(e.target.value)}
                placeholder={`CGIF-${user?.name?.split(' ')[0]?.toUpperCase()}-${new Date().toISOString().slice(0,10)}`}
                style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:'1.5px solid #E5E7EB', fontFamily:"'Courier New', monospace", fontSize:14, outline:'none', boxSizing:'border-box' }}
              />
            </div>
          </>
        )}

        {/* Étape 5 — Confirmation */}
        {step === 5 && (
          <>
            <SectionTitle>Récapitulatif</SectionTitle>
            {[
              ['Projet', selectedP?.title ?? '—'],
              ['Montant', `${parseInt(montant).toLocaleString('fr-FR')} FCFA`],
              ['Parts', `${parts} parts à ${sharePrice.toLocaleString('fr-FR')} FCFA`],
              ['Moyen', MOYENS.find(m => m.id===moyen)?.label ?? moyen],
              ['Référence', refVirement],
            ].map(([l, v]) => (
              <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #F3F4F6', fontSize:13 }}>
                <span style={{ color:'#6B7280', fontWeight:600 }}>{l}</span>
                <span style={{ color:'#111827' }}>{v}</span>
              </div>
            ))}
            <div style={{ marginTop:16, padding:'12px 14px', background:'#EFF6FF', border:'1px solid #BFDBFE', borderRadius:10, fontSize:12, color:'#1E40AF' }}>
              📧 Après soumission, l'équipe CGIF vous enverra les coordonnées bancaires définitives par email.
            </div>
          </>
        )}

        {/* Navigation */}
        <div style={{ display:'flex', gap:10, marginTop:24 }}>
          {step > 1 && <Btn variant="secondary" onClick={() => setStep(s => s-1)}>← Retour</Btn>}
          {step < 5 && (
            <Btn onClick={() => setStep(s => s+1)} disabled={!canNext()} style={{ flex:1, textAlign:'center' }}>
              Suivant →
            </Btn>
          )}
          {step === 5 && (
            <Btn onClick={submitFinal} disabled={submitInvest.isPending} style={{ flex:1, textAlign:'center' }}>
              {submitInvest.isPending ? 'Envoi…' : '✅ Soumettre mon vœu d'investissement'}
            </Btn>
          )}
        </div>
      </Card>
    </div>
  );
}
