import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Key, Mail, AlertTriangle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { API_URL } from '../config/api';

export default function Login() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emailOrUsername, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login gagal');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.user.username);
      localStorage.setItem('userId', data.user.id.toString());

      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('auth-change'));
      window.dispatchEvent(new CustomEvent('show-toast', { detail: `Selamat datang kembali, ${data.user.username}!` }));

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat masuk');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 120px)', padding: '24px' }}>
      <div className="app-card neon-top-beam animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '36px 30px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: '48px', 
            height: '48px', 
            borderRadius: '12px', 
            background: 'var(--emerald-subtle)', 
            color: 'var(--emerald)',
            marginBottom: '12px',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            boxShadow: '0 0 16px rgba(16, 185, 129, 0.2)'
          }}>
            <LogIn size={22} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '4px', letterSpacing: '-0.3px' }}>
            Masuk Akun
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Akses repositori cuplikan kode pribadi Anda
          </p>
        </div>

        {error && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: 'rgba(244, 63, 94, 0.1)', 
            border: '1px solid rgba(244, 63, 94, 0.25)', 
            padding: '10px 14px', 
            borderRadius: '9px', 
            color: '#fda4af',
            fontSize: '0.82rem',
            marginBottom: '16px'
          }}>
            <AlertTriangle size={14} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div className="form-group">
            <label className="form-label">Email / Username</label>
            <div className="input-container">
              <Mail size={15} className="input-icon-left" />
              <input
                type="text"
                className="app-input has-left-icon"
                placeholder="Masukkan email atau username"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-container">
              <Key size={15} className="input-icon-left" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="app-input has-left-icon"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: '38px' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-tertiary)',
                  cursor: 'pointer',
                  padding: '3px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '6px', width: '100%', padding: '11px' }} disabled={loading}>
            <span>{loading ? 'Memproses...' : 'Masuk Sekarang'}</span>
            {!loading && <ArrowRight size={15} />}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          Belum memiliki akun?{' '}
          <Link to="/register" style={{ color: 'var(--emerald)', textDecoration: 'none', fontWeight: 600 }}>
            Daftar Akun
          </Link>
        </p>
      </div>
    </div>
  );
}
