import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Code2, Calendar, Tag as TagIcon, Filter, User, Sparkles } from 'lucide-react';
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

  const currentUserId = localStorage.getItem('userId') ? parseInt(localStorage.getItem('userId')!) : null;

  useEffect(() => {
    fetchPublicSnippets();
  }, []);

  const fetchPublicSnippets = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
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
      .slice(0, 12);
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

    return matchesSearch && matchesLanguage && matchesTag;
  });

  return (
    <div className="container animate-fade-in">
      {/* Hero Header */}
      <section className="hero-box">
        <div className="hero-badge">
          <Sparkles size={13} />
          <span>Repositori Terbuka Developer</span>
        </div>
        <h1 className="hero-heading">
          Repositori Cuplikan Kode Modern
        </h1>
        <p className="hero-desc">
          Temukan, simpan, dan salin fungsi, skrip, dan algoritma penting secara instan. Tingkatkan kecepatan kerja coding harian Anda.
        </p>
      </section>

      <div className="dashboard-layout">
        {/* Sidebar Filters */}
        <aside className="app-card sidebar-sticky-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '7px' }}>
              <Filter size={15} style={{ color: 'var(--emerald)' }} />
              <span>Filter Kode</span>
            </h3>
            {(searchTerm || selectedLanguage || selectedTag) && (
              <button
                onClick={() => { setSearchTerm(''); setSelectedLanguage(''); setSelectedTag(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--emerald)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
              >
                Reset
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Search Input */}
            <div className="form-group">
              <label className="form-label">Pencarian</label>
              <div className="input-container">
                <Search size={15} className="input-icon-left" />
                <input
                  type="text"
                  className="app-input has-left-icon"
                  placeholder="Cari judul, tag, kode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ fontSize: '0.85rem' }}
                />
              </div>
            </div>

            {/* Language Selection */}
            <div className="form-group">
              <label className="form-label">Bahasa Pemrograman</label>
              <select
                className="app-input"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                style={{ fontSize: '0.85rem', cursor: 'pointer' }}
              >
                <option value="">Semua Bahasa ({snippets.length})</option>
                {uniqueLanguages.map(lang => {
                  const count = snippets.filter(s => s.language.toLowerCase() === lang.toLowerCase()).length;
                  return (
                    <option key={lang} value={lang}>
                      {lang.toUpperCase()} ({count})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Popular Tags Cloud */}
            {popularTags.length > 0 && (
              <div className="form-group" style={{ gap: '8px' }}>
                <label className="form-label">
                  <TagIcon size={12} style={{ color: 'var(--cyan)' }} />
                  <span>Tag Populer</span>
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {popularTags.map(([tag, count]) => (
                    <button
                      key={tag}
                      type="button"
                      className={`tag-cloud-pill ${selectedTag === tag ? 'active' : ''}`}
                      onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                    >
                      <span>#{tag}</span>
                      <span style={{ fontSize: '0.68rem', opacity: 0.65 }}>({count})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Snippets Stream */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {loading ? (
            <div className="app-card" style={{ padding: '50px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)' }}>Memuat repositori cuplikan kode...</p>
            </div>
          ) : error ? (
            <div className="app-card" style={{ padding: '30px', textAlign: 'center', borderColor: 'var(--rose)' }}>
              <p style={{ color: 'var(--rose)', marginBottom: '12px' }}>{error}</p>
              <button onClick={fetchPublicSnippets} className="btn-secondary">Coba Lagi</button>
            </div>
          ) : filteredSnippets.length === 0 ? (
            <div className="app-card" style={{ padding: '50px', textAlign: 'center' }}>
              <Code2 size={36} style={{ color: 'var(--text-tertiary)', marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>Tidak Ada Snippet Ditemukan</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginBottom: '18px' }}>
                {snippets.length === 0 
                  ? 'Belum ada snippet publik yang dibagikan.' 
                  : 'Tidak ada snippet yang cocok dengan kriteria filter.'}
              </p>
              {snippets.length > 0 && (
                <button 
                  onClick={() => { setSearchTerm(''); setSelectedLanguage(''); setSelectedTag(''); }} 
                  className="btn-secondary"
                >
                  Reset Filter
                </button>
              )}
            </div>
          ) : (
            filteredSnippets.map((snippet) => {
              const isOwner = currentUserId === snippet.userId;

              return (
                <article key={snippet.id} className="snippet-article animate-fade-in">
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '14px', marginBottom: '8px' }}>
                    <div>
                      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '5px', letterSpacing: '-0.3px' }}>
                        {snippet.title}
                      </h2>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.78rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                        <Link 
                          to={`/u/${snippet.user.username}`}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none', color: 'var(--text-secondary)' }}
                        >
                          <User size={12} style={{ color: 'var(--emerald)' }} />
                          <span>Oleh <strong style={{ color: 'var(--emerald-light)' }}>{snippet.user.username}</strong></span>
                        </Link>
                        <span>•</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={12} />
                          <span>{new Date(snippet.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {snippet.description && (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: '1.5', marginBottom: '12px' }}>
                      {snippet.description}
                    </p>
                  )}

                  {/* Tags */}
                  {snippet.tags && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '10px' }}>
                      {snippet.tags.split(',').map((tag, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="tag-badge"
                          style={{ border: 'none', cursor: 'pointer' }}
                          onClick={() => setSelectedTag(tag.trim())}
                        >
                          <TagIcon size={9} style={{ color: 'var(--emerald)' }} />
                          <span>{tag.trim()}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* CodeBlock Component */}
                  <CodeBlock
                    id={snippet.id}
                    title={snippet.title}
                    code={snippet.codeContent}
                    language={snippet.language}
                    canFork={!isOwner}
                    initialIsBookmarked={snippet.isBookmarked}
                    initialBookmarkCount={snippet.bookmarkCount || 0}
                    maxCollapsedLines={7}
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
