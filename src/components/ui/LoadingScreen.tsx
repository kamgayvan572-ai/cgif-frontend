export default function LoadingScreen() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#F4F6F3', flexDirection: 'column', gap: 16,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: '50%',
        border: '3px solid #E5E7EB',
        borderTopColor: '#0D2818',
        animation: 'spin 0.8s linear infinite',
      }}/>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, color: '#6B7280' }}>
        Chargement…
      </div>
    </div>
  );
}
