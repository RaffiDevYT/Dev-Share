import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, UserPlus, LogOut, CheckCircle2, Search, Sparkles } from 'lucide-react';
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
      {/* Brand Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Link to="/" className="brand-link">
          <div className="brand-logo-box">
            <span>ds</span>
          </div>
          <span>Dev-Share</span>
        </Link>

        {/* Navigation Tabs matching photo */}
        <nav className="nav-tabs">
          <Link
            to="/"
            className={`nav-tab-item ${location.pathname === '/' ? 'active' : ''}`}
          >
            Snippets
          </Link>
          <Link
            to="/forum"
            className={`nav-tab-item ${location.pathname.startsWith('/forum') ? 'active' : ''}`}
          >
            Forums
          </Link>
          {token && (
            <Link
              to="/dashboard"
              className={`nav-tab-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
            >
              Dashboard
            </Link>
          )}
        </nav>
      </div>

      {/* Center Glowing Search Pill matching photo */}
      <div className="search-pill-container">
        <input
          type="text"
          className="search-pill-input"
          placeholder="Search code, tags, authors (Ctrl + K)"
          onClick={openPalette}
          readOnly
        />
        <button className="search-pill-btn" onClick={openPalette} title="Search (Ctrl+K)">
          <Search size={16} />
        </button>
      </div>

      {/* Right User & Notification Controls matching photo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {token ? (
          <>
            {/* Notification Bell with Badge */}
            <div style={{ position: 'relative', cursor: 'pointer' }} title="Notifikasi">
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)'
              }}>
                <Sparkles size={16} />
              </div>
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                background: '#10b981',
                color: '#040910',
                fontSize: '0.68rem',
                fontWeight: 800,
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 6px #10b981'
              }}>
                3
              </span>
            </div>

            {/* Profile Avatar with Online Dot */}
            <Link
              to={`/u/${username}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '4px 12px 4px 5px',
                borderRadius: '24px'
              }}
              title="Lihat Profil"
            >
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  color: '#040910'
                }}>
                  {username ? username.charAt(0).toUpperCase() : 'U'}
                </div>
                <span style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#10b981',
                  border: '2px solid #080c14'
                }} />
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>{username}</span>
            </Link>

            <button
              onClick={handleLogout}
              className="btn-secondary"
              style={{ padding: '6px 10px', borderRadius: '8px', fontSize: '0.78rem' }}
              title="Keluar"
            >
              <LogOut size={13} />
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link to="/login" className="btn-secondary" style={{ padding: '7px 16px', fontSize: '0.85rem' }}>
              <LogIn size={14} />
              <span>Masuk</span>
            </Link>
            <Link to="/register" className="btn-primary" style={{ padding: '7px 18px', fontSize: '0.85rem' }}>
              <UserPlus size={14} />
              <span>Daftar</span>
            </Link>
          </div>
        )}
      </div>
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
