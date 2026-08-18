import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, UserPlus, LogOut, Code2, Globe, Layers, CheckCircle2, Search, Command, MessageSquare } from 'lucide-react';
import PublicSnippets from './pages/PublicSnippets';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SnippetForm from './pages/SnippetForm';
import SnippetDetail from './pages/SnippetDetail';
import UserProfile from './pages/UserProfile';
import Forum from './pages/Forum';
import CommandPalette from './components/CommandPalette';
import Footer from './components/Footer';

function NavHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [username, setUsername] = useState<string | null>(localStorage.getItem('username'));

  useEffect(() => {
    const handleAuthChange = () => {
      setToken(localStorage.getItem('token'));
      setUsername(localStorage.getItem('username'));
    };

    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('auth-change', handleAuthChange);
    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    setToken(null);
    setUsername(null);
    window.dispatchEvent(new Event('auth-change'));
    window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Berhasil keluar dari akun' }));
    navigate('/login');
  };

  const openPalette = () => {
    window.dispatchEvent(new Event('open-command-palette'));
  };

  return (
    <header className="nav-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <Link to="/" className="brand-link">
          <div className="brand-logo-box">
            <Code2 size={19} />
          </div>
          <span>Dev-Share</span>
        </Link>

        {/* Global Command Palette Trigger */}
        <button
          onClick={openPalette}
          style={{
            background: 'rgba(255, 255, 255, 0.035)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '5px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--text-secondary)',
            fontSize: '0.82rem',
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
          title="Buka Command Palette (Ctrl+K)"
        >
          <Search size={14} style={{ color: 'var(--emerald)' }} />
          <span>Cari cepat...</span>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '2px',
            background: 'rgba(255, 255, 255, 0.08)',
            padding: '1px 5px',
            borderRadius: '4px',
            fontSize: '0.7rem',
            color: 'var(--text-tertiary)'
          }}>
            <Command size={10} />K
          </span>
        </button>
      </div>

      <nav className="nav-links">
        <Link 
          to="/" 
          className={`nav-btn ${location.pathname === '/' ? 'active' : ''}`}
        >
          <Globe size={16} />
          <span>Snippet Publik</span>
        </Link>

        <Link 
          to="/forum" 
          className={`nav-btn ${location.pathname.startsWith('/forum') ? 'active' : ''}`}
        >
          <MessageSquare size={16} />
          <span>Forum Diskusi</span>
        </Link>

        {token ? (
          <>
            <Link 
              to="/dashboard" 
              className={`nav-btn ${location.pathname === '/dashboard' ? 'active' : ''}`}
            >
              <Layers size={16} />
              <span>Dashboard Saya</span>
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '6px' }}>
                <Link 
                  to={`/u/${username}`}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    padding: '5px 12px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.85rem',
                    textDecoration: 'none'
                  }}
                  title="Lihat Profil Saya"
                >
                  <div style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#040910'
                  }}>
                    {username ? username.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{username}</span>
                </Link>

              <button 
                onClick={handleLogout} 
                className="btn-secondary"
                style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.82rem' }}
                title="Keluar dari akun"
              >
                <LogOut size={14} />
                <span>Keluar</span>
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link to="/login" className="btn-secondary" style={{ padding: '7px 14px', fontSize: '0.85rem' }}>
              <LogIn size={15} />
              <span>Masuk</span>
            </Link>
            <Link to="/register" className="btn-primary" style={{ padding: '7px 16px', fontSize: '0.85rem' }}>
              <UserPlus size={15} />
              <span>Daftar</span>
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}

export default function App() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setToastMessage(customEvent.detail);
      setTimeout(() => {
        setToastMessage(null);
      }, 2500);
    };

    window.addEventListener('show-toast', handleToast);
    return () => {
      window.removeEventListener('show-toast', handleToast);
    };
  }, []);

  return (
    <Router>
      <CommandPalette />
      <NavHeader />
      <main style={{ minHeight: 'calc(100vh - 64px)' }}>
        <Routes>
          <Route path="/" element={<PublicSnippets />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/snippet/:id" element={<SnippetDetail />} />
          <Route path="/u/:username" element={<UserProfile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create" element={<SnippetForm />} />
          <Route path="/edit/:id" element={<SnippetForm />} />
        </Routes>
      </main>

      <Footer />

      {toastMessage && (
        <div className="copy-toast">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}
    </Router>
  );
}
