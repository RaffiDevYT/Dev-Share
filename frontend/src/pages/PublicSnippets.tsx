import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Sparkles,
  Bookmark,
  Layers,
  Clock,
  Zap,
  Code2
} from 'lucide-react';
import CodeBlock from '../components/CodeBlock';
import { API_URL } from '../config/api';

interface Snippet {
  id: number;
  title: string;
  description: string | null;
  codeContent: string;
  language: string;
  tags: string | null;
  isPublic: boolean;
  userId: number;
  createdAt: string;
  bookmarkCount?: number;
  isBookmarked?: boolean;
  user: {
    username: string;
  };
}

export default function PublicSnippets() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [activeQuickFilter, setActiveQuickFilter] = useState<'all' | 'saved' | 'my'>('all');

  const currentUserId = localStorage.getItem('userId') ? parseInt(localStorage.getItem('userId')!) : null;
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchPublicSnippets();
  }, []);

  const fetchPublicSnippets = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/snippets?visibility=public`, {
        headers
      });

      if (!response.ok) {
        throw new Error('Gagal memuat repositori snippet publik');
      }

      const data = await response.json();
      setSnippets(data);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  const uniqueLanguages = useMemo(() => {
    return Array.from(new Set(snippets.map(s => s.language))).filter(Boolean);
  }, [snippets]);

  const popularTags = useMemo(() => {
    const tagMap: Record<string, number> = {};
    snippets.forEach(s => {
      if (s.tags) {
        s.tags.split(',').forEach(rawTag => {
          const t = rawTag.trim().toLowerCase();
          if (t) {
            tagMap[t] = (tagMap[t] || 0) + 1;
          }
        });
      }
    });
    return Object.entries(tagMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [snippets]);

  const filteredSnippets = snippets.filter(snippet => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      snippet.title.toLowerCase().includes(term) ||
      (snippet.description && snippet.description.toLowerCase().includes(term)) ||
      (snippet.tags && snippet.tags.toLowerCase().includes(term)) ||
      snippet.codeContent.toLowerCase().includes(term);

    const matchesLanguage = selectedLanguage === '' || snippet.language.toLowerCase() === selectedLanguage.toLowerCase();
    const matchesTag = selectedTag === '' || (snippet.tags && snippet.tags.toLowerCase().includes(selectedTag.toLowerCase()));

    let matchesQuick = true;
    if (activeQuickFilter === 'saved') {
      matchesQuick = !!snippet.isBookmarked;
    } else if (activeQuickFilter === 'my') {
      matchesQuick = snippet.userId === currentUserId;
    }

    return matchesSearch && matchesLanguage && matchesTag && matchesQuick;
  });

  return (
    <div className="container animate-fade-in">
      {/* Top Banner */}
      <section className="app-card neon-top-beam" style={{ padding: '28px 32px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--emerald-subtle)', padding: '3px 10px', borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', fontSize: '0.75rem', fontWeight: 700, marginBottom: '8px' }}>
              <Sparkles size={12} />
              <span>Explore Modern Developer Repository</span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', marginBottom: '6px' }}>
              Code Snippets & Live Playground
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', maxWidth: '640px', lineHeight: '1.5' }}>
              Temukan algoritma, fungsi, dan komponen siap pakai. Jalankan kode langsung di browser secara interaktif.
            </p>
          </div>

          {token && (
            <Link to="/create" className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={15} fill="#040910" />
              <span>+ Buat Snippet Baru</span>
            </Link>
          )}
        </div>
      </section>

      {/* Main Grid: Sidebar + Snippet Stream */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Left Sidebar matching hero_preview.jpg */}
        <aside className="app-card" style={{ padding: '20px', position: 'sticky', top: '88px' }}>
          {/* Quick Filters */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
              Menu Koleksi
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button
                type="button"
                onClick={() => { setActiveQuickFilter('all'); setSelectedTag(''); }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: activeQuickFilter === 'all' && !selectedTag ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                  border: activeQuickFilter === 'all' && !selectedTag ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
                  color: activeQuickFilter === 'all' && !selectedTag ? '#34d399' : 'var(--text-secondary)',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <Layers size={15} />
                <span>All Snippets</span>
              </button>

              {token && (
                <>
                  <button
                    type="button"
                    onClick={() => { setActiveQuickFilter('my'); setSelectedTag(''); }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: activeQuickFilter === 'my' ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                      border: activeQuickFilter === 'my' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
                      color: activeQuickFilter === 'my' ? '#34d399' : 'var(--text-secondary)',
                      fontSize: '0.86rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <Code2 size={15} />
                    <span>My Snippets</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setActiveQuickFilter('saved'); setSelectedTag(''); }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: activeQuickFilter === 'saved' ? 'rgba(245, 158, 11, 0.12)' : 'transparent',
                      border: activeQuickFilter === 'saved' ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid transparent',
                      color: activeQuickFilter === 'saved' ? '#fbbf24' : 'var(--text-secondary)',
                      fontSize: '0.86rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <Bookmark size={15} />
                    <span>Saved / Bookmarks</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Search Box */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                className="app-input"
                placeholder="Cari snippet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '32px', height: '36px', fontSize: '0.82rem' }}
              />
            </div>
          </div>

          {/* Language Selection */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
              Bahasa
            </label>
            <select
              className="app-input"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              style={{ fontSize: '0.82rem', height: '36px' }}
            >
              <option value="">Semua Bahasa ({snippets.length})</option>
              {uniqueLanguages.map(lang => (
                <option key={lang} value={lang}>
                  {lang.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Popular Tags matching hero_preview.jpg */}
          {popularTags.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Popular Tags
                </h4>
                {selectedTag && (
                  <button
                    onClick={() => setSelectedTag('')}
                    style={{ background: 'none', border: 'none', color: 'var(--emerald)', fontSize: '0.72rem', cursor: 'pointer' }}
                  >
                    Reset
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {popularTags.map(([tag, count]) => {
                  const isSelected = selectedTag === tag;
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSelectedTag(isSelected ? '' : tag)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.76rem',
                        fontWeight: 600,
                        background: isSelected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                        border: isSelected ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)',
                        color: isSelected ? '#34d399' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      #{tag} <span style={{ opacity: 0.6, fontSize: '0.68rem' }}>({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </aside>

        {/* Snippets Stream */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {loading ? (
            <div className="app-card" style={{ padding: '60px', textAlign: 'center' }}>
              <div className="animate-spin" style={{ width: '32px', height: '32px', border: '3px solid rgba(16, 185, 129, 0.2)', borderTopColor: 'var(--emerald)', borderRadius: '50%', margin: '0 auto 12px' }} />
              <p style={{ color: 'var(--text-secondary)' }}>Memuat repositori cuplikan kode...</p>
            </div>
          ) : error ? (
            <div className="app-card" style={{ padding: '30px', textAlign: 'center', borderColor: 'var(--rose)' }}>
              <p style={{ color: 'var(--rose)', marginBottom: '12px' }}>{error}</p>
              <button onClick={fetchPublicSnippets} className="btn-secondary">Coba Lagi</button>
            </div>
          ) : filteredSnippets.length === 0 ? (
            <div className="app-card" style={{ padding: '60px', textAlign: 'center' }}>
              <Code2 size={40} style={{ color: 'var(--text-tertiary)', marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px', color: '#fff' }}>Tidak Ada Snippet Ditemukan</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '18px' }}>
                {snippets.length === 0 
                  ? 'Belum ada snippet publik yang dibagikan.' 
                  : 'Tidak ada snippet yang cocok dengan kriteria filter.'}
              </p>
              <button 
                onClick={() => { setSearchTerm(''); setSelectedLanguage(''); setSelectedTag(''); setActiveQuickFilter('all'); }} 
                className="btn-secondary"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            filteredSnippets.map((snippet) => {
              const isOwner = currentUserId === snippet.userId;

              return (
                <article key={snippet.id} className="snippet-article animate-fade-in" style={{ padding: '24px' }}>
                  {/* Card Top: Title, Author, Tags, Date */}
                  <div style={{ marginBottom: '12px' }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '8px', letterSpacing: '-0.3px' }}>
                      <Link to={`/snippet/${snippet.id}`} style={{ color: '#fff', textDecoration: 'none' }}>
                        {snippet.title}
                      </Link>
                    </h2>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', fontSize: '0.82rem' }}>
                      {/* Author badge */}
                      <Link 
                        to={`/u/${snippet.user.username}`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none', color: '#fff', fontWeight: 600 }}
                      >
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          color: '#040910'
                        }}>
                          {snippet.user.username.charAt(0).toUpperCase()}
                        </div>
                        <span>{snippet.user.username}</span>
                      </Link>

                      {/* Tag Chips matching photo */}
                      {snippet.tags && (
                        <div style={{ display: 'inline-flex', gap: '4px', flexWrap: 'wrap' }}>
                          {snippet.tags.split(',').map((tag, idx) => (
                            <span
                              key={idx}
                              onClick={() => setSelectedTag(tag.trim())}
                              style={{
                                fontSize: '0.74rem',
                                color: 'var(--text-secondary)',
                                background: 'rgba(255, 255, 255, 0.04)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                cursor: 'pointer'
                              }}
                            >
                              #{tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}

                      <span style={{ color: 'var(--text-tertiary)' }}>•</span>

                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--text-tertiary)' }}>
                        <Clock size={12} />
                        <span>{new Date(snippet.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  {snippet.description && (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '14px' }}>
                      {snippet.description}
                    </p>
                  )}

                  {/* CodeBlock Component with glowing Run button */}
                  <CodeBlock
                    id={snippet.id}
                    title={snippet.title}
                    code={snippet.codeContent}
                    language={snippet.language}
                    canFork={!isOwner}
                    initialIsBookmarked={snippet.isBookmarked}
                    initialBookmarkCount={snippet.bookmarkCount || 0}
                    maxCollapsedLines={8}
                  />
                </article>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
