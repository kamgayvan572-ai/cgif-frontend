import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth.store';

const F = "'Plus Jakarta Sans', sans-serif";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #0D2818 0%, #13883C 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        background: '#fff', borderRadius: 20, padding: 40, width: '100%', maxWidth: 400,
        boxShadow: '0 24px 64px rgba(0,0,0,.2)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 60, height: 60, borderRadius: 16, background: '#0D2818',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px', fontSize: 24, fontWeight: 900, color: '#fff', fontFamily: F,
          }}>C</div>
          <div style={{ fontFamily: F, fontWeight: 800, fontSize: 22, color: '#0D2818' }}>CGIF</div>
          <div style={{ fontFamily: F, fontSize: 12, color: '#6B7280', marginTop: 4 }}>
            Cameroon Global Intelligence Forum
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontFamily: F, fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="votre@email.com"
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #E5E7EB',
                fontFamily: F, fontSize: 14, outline: 'none', boxSizing: 'border-box',
                transition: 'border-color .2s',
              }}
              onFocus={e => e.target.style.borderColor = '#0D2818'}
              onBlur={e => e.target.style.borderColor = '#E5E7EB'}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontFamily: F, fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
              Mot de passe
            </label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} required
              placeholder="••••••••"
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #E5E7EB',
                fontFamily: F, fontSize: 14, outline: 'none', boxSizing: 'border-box',
                transition: 'border-color .2s',
              }}
              onFocus={e => e.target.style.borderColor = '#0D2818'}
              onBlur={e => e.target.style.borderColor = '#E5E7EB'}
            />
          </div>

          {error && (
            <div style={{
              marginBottom: 16, padding: '10px 14px', borderRadius: 8,
              background: '#FEF2F2', border: '1px solid #FECACA',
              fontFamily: F, fontSize: 13, color: '#DC2626',
            }}>{error}</div>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '12px', borderRadius: 10, border: 'none',
            background: loading ? '#9CA3AF' : '#0D2818', color: '#fff',
            fontFamily: F, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background .2s',
          }}>
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <div style={{ marginTop: 24, padding: '14px', background: '#F9FAFB', borderRadius: 10 }}>
          <div style={{ fontFamily: F, fontSize: 11, color: '#9CA3AF', marginBottom: 6, fontWeight: 600 }}>Comptes de démo</div>
          <div style={{ fontFamily: "'Courier New', monospace", fontSize: 11, color: '#374151', lineHeight: 1.8 }}>
            Admin  : yvan@cgif.cm<br/>
            Membre : amina@cgif.cm<br/>
            <span style={{ color: '#6B7280' }}>Mot de passe : Admin@CGIF2024!</span>
          </div>
        </div>
      </div>
    </div>
  );
}
