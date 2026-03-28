
import { useState } from 'react';
import { useMyKyc, useSubmitKyc } from '../../services/api';
import { useAuth } from '../../context/auth.store';
import { Spinner, ErrorBox, Card, SectionTitle, Btn, Badge } from '../../components/ui/PageShell';

const F = "'Plus Jakarta Sans', sans-serif";
const VERT = '#0D2818';

const KYC_STATUS_CFG: Record<string, {label:string;color:'green'|'amber'|'red'|'gray'|'blue';desc:string}> = {
  NONE:      { label:'Non soumis',    color:'gray',  desc:"Vous n'avez pas encore soumis votre dossier KYC." },
  PENDING:   { label:'Soumis',        color:'blue',  desc:"Votre dossier est en attente d'examen par l'équipe CGIF." },
  REVIEWING: { label:'En révision',   color:'amber', desc:"L'équipe CGIF examine votre dossier." },
  APPROVED:  { label:'Approuvé ✓',   color:'green', desc:"Votre identité est vérifiée. Vous pouvez investir." },
  REJECTED:  { label:'Rejeté',        color:'red',   desc:"Votre dossier a été rejeté. Veuillez le resoumetter." },
};

export default function KycPage() {
  const { user } = useAuth();
  const { data: kycData, isLoading, error, refetch } = useMyKyc();
  const submitKyc = useSubmitKyc();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    nom:'', prenom:'', dateNaissance:'', nationalite:'Camerounaise',
    pieceIdentite:'CNI', adresse:'',
    docType:'CNI', proofType:'FACTURE',
  });
  const [submitted, setSubmitted] = useState(false);

  const F2 = (k: string) => (v: string) => setForm(f => ({ ...f, [k]:v }));
  const inp = (key: string, label: string, type='text', placeholder='') => (
    <div style={{ marginBottom:14 }}>
      <label style={{ fontSize:12, fontWeight:600, color:'#374151', display:'block', marginBottom:5 }}>{label}</label>
      <input type={type} value={(form as any)[key]} onChange={e => F2(key)(e.target.value)}
        placeholder={placeholder}
        style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:'1.5px solid #E5E7EB', fontFamily:F, fontSize:13, outline:'none', boxSizing:'border-box' }}
      />
    </div>
  );

  const submit = async () => {
    await submitKyc.mutateAsync(form);
    setSubmitted(true);
  };

  if (isLoading) return <Spinner />;
  if (error) return <ErrorBox msg="Impossible de charger votre KYC" onRetry={refetch} />;

  const status = kycData?.status ?? user?.kycStatus ?? 'NONE';
  const cfg = KYC_STATUS_CFG[status] ?? KYC_STATUS_CFG.NONE;
  const canSubmit = status === 'NONE' || status === 'REJECTED';

  if (submitted) return (
    <Card style={{ textAlign:'center', padding:40 }}>
      <div style={{ fontSize:48, marginBottom:12 }}>🎉</div>
      <div style={{ fontSize:20, fontWeight:700, color:VERT, marginBottom:8 }}>Dossier soumis avec succès</div>
      <div style={{ fontSize:13, color:'#6B7280', lineHeight:1.7 }}>
        L'équipe CGIF va examiner votre dossier sous 48h. Vous serez notifié par email.
      </div>
    </Card>
  );

  return (
    <div style={{ fontFamily:F, display:'flex', flexDirection:'column', gap:20 }}>

      <div style={{ background:`linear-gradient(135deg, ${VERT} 0%, #13883C 100%)`, borderRadius:20, padding:'24px 28px', color:'#fff' }}>
        <div style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,.55)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:6 }}>Vérification</div>
        <div style={{ fontSize:22, fontWeight:700 }}>Vérification d'identité (KYC)</div>
        <div style={{ fontSize:13, color:'rgba(255,255,255,.75)', marginTop:4 }}>Obligatoire pour investir · Norme OHADA</div>
      </div>

      {/* Statut actuel */}
      <Card style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
        <div style={{ width:44, height:44, borderRadius:12, background:'#F0FDF4', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>
          {status === 'APPROVED' ? '✅' : status === 'REJECTED' ? '❌' : '🪪'}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:6 }}>
            <span style={{ fontSize:14, fontWeight:700, color:'#111827' }}>Statut KYC</span>
            <Badge label={cfg.label} color={cfg.color} />
          </div>
          <div style={{ fontSize:13, color:'#6B7280', lineHeight:1.6 }}>{cfg.desc}</div>
          {kycData?.rejectionReason && (
            <div style={{ marginTop:8, padding:'8px 12px', background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:8, fontSize:12, color:'#DC2626' }}>
              Motif de rejet : {kycData.rejectionReason}
            </div>
          )}
          {kycData?.reviewedAt && (
            <div style={{ fontSize:11, color:'#9CA3AF', marginTop:6 }}>
              Examiné le {new Date(kycData.reviewedAt).toLocaleDateString('fr-FR')}
            </div>
          )}
        </div>
      </Card>

      {/* Formulaire KYC si besoin */}
      {canSubmit && (
        <>
          {/* Stepper */}
          <div style={{ display:'flex', gap:0, background:'#F3F4F6', borderRadius:12, overflow:'hidden' }}>
            {['Identité', 'Documents', 'Confirmation'].map((s, i) => (
              <div key={i} style={{
                flex:1, padding:'9px 4px', textAlign:'center', fontSize:10, fontWeight:600,
                borderRight: i < 2 ? '1px solid #E5E7EB' : 'none',
                background: step===i+1 ? VERT : step>i+1 ? '#D1FAE5' : '#fff',
                color: step===i+1 ? '#fff' : step>i+1 ? '#065F46' : '#9CA3AF', transition:'all .2s',
              }}>{step>i+1?'✓':i+1}. {s}</div>
            ))}
          </div>

          <Card>
            {step === 1 && (
              <>
                <SectionTitle>Informations personnelles</SectionTitle>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px' }}>
                  <div>{inp('prenom','Prénom *','text','Jean')}</div>
                  <div>{inp('nom','Nom *','text','Mbarga')}</div>
                </div>
                {inp('dateNaissance','Date de naissance *','date')}
                {inp('nationalite','Nationalité *','text','Camerounaise')}
                {inp('adresse','Adresse complète *','text','123 rue des Fleurs, Paris 75001')}
              </>
            )}

            {step === 2 && (
              <>
                <SectionTitle>Documents d'identité</SectionTitle>
                <div style={{ marginBottom:14 }}>
                  <label style={{ fontSize:12, fontWeight:600, color:'#374151', display:'block', marginBottom:5 }}>Type de pièce d'identité *</label>
                  <select value={form.docType} onChange={e => F2('docType')(e.target.value)}
                    style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:'1.5px solid #E5E7EB', fontFamily:F, fontSize:13, outline:'none' }}>
                    <option value="CNI">Carte Nationale d'Identité</option>
                    <option value="PASSEPORT">Passeport</option>
                    <option value="SEJOUR">Titre de séjour</option>
                  </select>
                </div>
                <div style={{ padding:'16px', background:'#F9FAFB', border:'2px dashed #E5E7EB', borderRadius:12, textAlign:'center', marginBottom:14 }}>
                  <div style={{ fontSize:32, marginBottom:8 }}>📎</div>
                  <div style={{ fontSize:13, fontWeight:600, color:'#374151', marginBottom:4 }}>Pièce d'identité (recto-verso)</div>
                  <div style={{ fontSize:11, color:'#9CA3AF' }}>PDF, JPG ou PNG · Max 5 Mo · Upload disponible prochainement</div>
                </div>
                <div style={{ marginBottom:14 }}>
                  <label style={{ fontSize:12, fontWeight:600, color:'#374151', display:'block', marginBottom:5 }}>Justificatif de domicile *</label>
                  <select value={form.proofType} onChange={e => F2('proofType')(e.target.value)}
                    style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:'1.5px solid #E5E7EB', fontFamily:F, fontSize:13, outline:'none' }}>
                    <option value="FACTURE">Facture (eau, électricité, gaz)</option>
                    <option value="LOYER">Quittance de loyer</option>
                    <option value="BANQUE">Relevé bancaire</option>
                  </select>
                </div>
                <div style={{ padding:'16px', background:'#F9FAFB', border:'2px dashed #E5E7EB', borderRadius:12, textAlign:'center' }}>
                  <div style={{ fontSize:32, marginBottom:8 }}>🏠</div>
                  <div style={{ fontSize:13, fontWeight:600, color:'#374151', marginBottom:4 }}>Justificatif de domicile</div>
                  <div style={{ fontSize:11, color:'#9CA3AF' }}>Moins de 3 mois · Upload disponible prochainement</div>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <SectionTitle>Confirmation</SectionTitle>
                {[['Prénom', form.prenom], ['Nom', form.nom], ['Date naissance', form.dateNaissance], ['Nationalité', form.nationalite], ['Adresse', form.adresse], ['Document', form.docType], ['Justificatif', form.proofType]].map(([l,v]) => (
                  <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #F3F4F6', fontSize:13 }}>
                    <span style={{ color:'#6B7280', fontWeight:600 }}>{l}</span>
                    <span style={{ color:'#111827' }}>{v}</span>
                  </div>
                ))}
                <div style={{ marginTop:16, padding:'12px 14px', background:'#FEF3C7', border:'1px solid #FDE68A', borderRadius:10, fontSize:12, color:'#92400E' }}>
                  ⚖️ En soumettant ce dossier, vous certifiez que toutes les informations fournies sont exactes et conformes au droit OHADA.
                </div>
              </>
            )}

            <div style={{ display:'flex', gap:10, marginTop:24 }}>
              {step > 1 && <Btn variant="secondary" onClick={() => setStep(s => s-1)}>← Retour</Btn>}
              {step < 3 && <Btn onClick={() => setStep(s => s+1)} style={{ flex:1, textAlign:'center' }}>Suivant →</Btn>}
              {step === 3 && (
                <Btn onClick={submit} disabled={submitKyc.isPending} style={{ flex:1, textAlign:'center' }}>
                  {submitKyc.isPending ? 'Envoi…' : '✅ Soumettre mon dossier KYC'}
                </Btn>
              )}
            </div>
          </Card>
        </>
      )}

      {status === 'APPROVED' && (
        <div style={{ padding:'16px 20px', background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:12, fontSize:13, color:'#065F46', fontWeight:600 }}>
          ✅ Votre KYC est validé. Vous êtes autorisé à investir sur la plateforme CGIF.
        </div>
      )}
    </div>
  );
}
