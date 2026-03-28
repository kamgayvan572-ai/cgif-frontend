export default function RegisterPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0D2818 0%, #13883C 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 40, width: '100%', maxWidth: 400, textAlign: 'center' }}>
        <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 700, color: '#0D2818', marginBottom: 16 }}>Inscription CGIF</div>
        <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, color: '#6B7280' }}>
          L'inscription est sur invitation. Contactez un administrateur CGIF ou utilisez un lien de parrainage.
        </p>
      </div>
    </div>
  );
}
