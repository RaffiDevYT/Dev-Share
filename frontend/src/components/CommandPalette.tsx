import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Layers, Globe, LogIn, UserPlus, Code2, ArrowRight, MessageSquare } from 'lucide-react';
import { API_URL } from '../config/api';

interface SnippetResult {
  id: number;
  title: string;
  language: string;
  isPublic: boolean;
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [snippets, setSnippets] = useState<SnippetResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Listen for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleOpenEvent = () => setIsOpen(true);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-command-palette', handleOpenEvent);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-command-palette', handleOpenEvent);
    };
  }, []);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Search snippets when query changes
  useEffect(() => {
    if (!query.trim()) {
      setSnippets([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${API_URL}/snippets?search=${encodeURIComponent(query)}`, {
          headers
        });
        if (res.ok) {
          const data = await res.json();
          setSnippets(data.slice(0, 6));
        }
      } catch (err) {
        console.error(err);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, token]);

  // Static navigation actions
  const staticActions = [
    { label: 'Jelajahi Snippet Publik', path: '/', icon: Globe, color: 'var(--emerald)' },
    { label: 'Forum Diskusi & Komunitas', path: '/forum', icon: MessageSquare, color: 'var(--cyan)' },
    ...(token ? [
      { label: 'Buat Snippet Baru', path: '/create', icon: Plus, color: 'var(--emerald)' },
      { label: 'Buka Dashboard Saya', path: '/dashboard', icon: Layers, color: 'var(--cyan)' },
    ] : [
      { label: 'Masuk ke Akun', path: '/login', icon: LogIn, color: 'var(--cyan)' },
      { label: 'Daftar Akun Baru', path: '/register', icon: UserPlus, color: 'var(--emerald)' },
    ])
  ];

  const totalItems = staticActions.length + snippets.length;

  const handleSelect = (index: number) => {
    if (index < staticActions.length) {
      navigate(staticActions[index].path);
    } else {
      const snippet = snippets[index - staticActions.length];
      navigate(`/snippet/${snippet.id}`);
    }
    setIsOpen(false);
  };

  const handleKeyDownList = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (totalItems || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + totalItems) % (totalItems || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSelect(selectedIndex);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh',
        zIndex: 300,
        padding: '12vh 20px 20px'
      }}
      onClick={() => setIsOpen(false)}
    >
      <div 
        className="app-card neon-top-beam animate-fade-in" 
        style={{
          width: '100%',
          maxWidth: '560px',
          padding: '0',
          background: 'var(--bg-card)',
          boxShadow: 'var(--shadow-modal)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '14px 18px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <Search size={18} style={{ color: 'var(--emerald)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Ketik nama snippet atau aksi cepat..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDownList}
            style={{
              width: '100%',
              background: 'none',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: '0.95rem',
              fontFamily: 'inherit'
            }}
          />
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '2px',
            fontSize: '0.7rem',
            background: 'rgba(255, 255, 255, 0.06)',
            padding: '2px 6px',
            borderRadius: '4px',
            color: 'var(--text-tertiary)'
          }}>
            ESC
          </span>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: '340px', overflowY: 'auto', padding: '8px' }}>
          {/* Static Actions */}
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-tertiary)', padding: '6px 12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Aksi Cepat
          </div>
          {staticActions.map((action, idx) => {
            const Icon = action.icon;
            const isSelected = selectedIndex === idx;
            return (
              <div
                key={action.label}
                onClick={() => handleSelect(idx)}
                onMouseEnter={() => setSelectedIndex(idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: isSelected ? 'var(--emerald-subtle)' : 'transparent',
                  color: isSelected ? '#fff' : 'var(--text-secondary)',
                  transition: 'all 0.1s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={15} style={{ color: action.color }} />
                  <span style={{ fontSize: '0.86rem', fontWeight: isSelected ? 600 : 500 }}>{action.label}</span>
                </div>
                <ArrowRight size={13} style={{ opacity: isSelected ? 1 : 0 }} />
              </div>
            );
          })}

          {/* Dynamic Snippets Search Results */}
          {snippets.length > 0 && (
            <>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-tertiary)', padding: '10px 12px 6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Hasil Snippet
              </div>
              {snippets.map((s, i) => {
                const itemIndex = staticActions.length + i;
                const isSelected = selectedIndex === itemIndex;
                return (
                  <div
                    key={s.id}
                    onClick={() => handleSelect(itemIndex)}
                    onMouseEnter={() => setSelectedIndex(itemIndex)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      background: isSelected ? 'var(--emerald-subtle)' : 'transparent',
                      color: isSelected ? '#fff' : 'var(--text-secondary)',
                      transition: 'all 0.1s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Code2 size={15} style={{ color: 'var(--cyan)' }} />
                      <span style={{ fontSize: '0.86rem', fontWeight: isSelected ? 600 : 500 }}>{s.title}</span>
                    </div>
                    <span className="lang-pill" style={{ fontSize: '0.68rem' }}>{s.language}</span>
                  </div>
                );
              })}
            </>
          )}

          {query.trim() && snippets.length === 0 && (
            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.84rem' }}>
              Tidak ada snippet yang cocok dengan "{query}"
            </div>
          )}
        </div>

        {/* Footer info */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 16px',
          background: 'rgba(0, 0, 0, 0.2)',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.72rem',
          color: 'var(--text-tertiary)'
        }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <span>↑↓ untuk navigasi</span>
            <span>↵ untuk memilih</span>
          </div>
          <span>Dev-Share Spotlight</span>
        </div>
      </div>
    </div>
  );
}
