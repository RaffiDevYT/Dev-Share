import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Code2,
  Calendar,
  Tag as TagIcon,
  Filter,
  Lock,
  Globe,
  Folder as FolderIcon,
  Star,
  User,
  Layers
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
  folder: string | null;
  isPublic: boolean;
  createdAt: string;
  bookmarkCount?: number;
  commentCount?: number;
  isBookmarked?: boolean;
  user?: {
    username: string;
  };
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'my' | 'bookmarked'>('my');
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [bookmarkedSnippets, setBookmarkedSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'public' | 'private'>('all');

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchSnippets();
    fetchBookmarkedSnippets();
  }, [token]);

  const fetchSnippets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/snippets?mine=true`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          window.dispatchEvent(new Event('auth-change'));
          navigate('/login');
          return;
        }
        throw new Error('Gagal mengambil data snippet');
      }

      const data = await response.json();
      setSnippets(data);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memuat data snippet');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarkedSnippets = async () => {
    try {
      const response = await fetch(`${API_URL}/snippets/bookmarks/mine`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setBookmarkedSnippets(data);
      }
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus snippet ini?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/snippets/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Gagal menghapus snippet');
      }

      setSnippets(prev => prev.filter(s => s.id !== id));
      window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Snippet berhasil dihapus' }));
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus snippet');
    }
  };

  const currentDataset = activeTab === 'my' ? snippets : bookmarkedSnippets;

  const totalCount = snippets.length;
  const publicCount = snippets.filter(s => s.isPublic).length;
  const privateCount = snippets.filter(s => !s.isPublic).length;
  const uniqueLanguages = useMemo(() => Array.from(new Set(currentDataset.map(s => s.language))).filter(Boolean), [currentDataset]);

  // Unique Folders
  const uniqueFolders = useMemo(() => {
    return Array.from(new Set(currentDataset.map(s => s.folder).filter(Boolean))) as string[];
  }, [currentDataset]);

  const popularTags = useMemo(() => {
    const tagMap: Record<string, number> = {};
    currentDataset.forEach(s => {
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
  }, [currentDataset]);

  const filteredSnippets = currentDataset.filter(snippet => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      snippet.title.toLowerCase().includes(term) ||
      (snippet.description && snippet.description.toLowerCase().includes(term)) ||
      (snippet.tags && snippet.tags.toLowerCase().includes(term)) ||
      (snippet.folder && snippet.folder.toLowerCase().includes(term)) ||
      snippet.codeContent.toLowerCase().includes(term);
      
    const matchesLanguage = selectedLanguage === '' || snippet.language.toLowerCase() === selectedLanguage.toLowerCase();
    const matchesFolder = selectedFolder === '' || (snippet.folder && snippet.folder.toLowerCase() === selectedFolder.toLowerCase());
    const matchesTag = selectedTag === '' || (snippet.tags && snippet.tags.toLowerCase().includes(selectedTag.toLowerCase()));

    const matchesVisibility = 
      activeTab === 'bookmarked' ||
      visibilityFilter === 'all' ||
      (visibilityFilter === 'public' && snippet.isPublic) ||
      (visibilityFilter === 'private' && !snippet.isPublic);

    return matchesSearch && matchesLanguage && matchesFolder && matchesTag && matchesVisibility;
  });

  return (
    <div className="container animate-fade-in">
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
              Dashboard Saya
            </h1>
            {username && (
              <Link
                to={`/u/${username}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.78rem',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: 'var(--emerald-subtle)',
                  color: '#34d399',
                  textDecoration: 'none',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}
              >
                <User size={12} />
                <span>Lihat Profil Publik</span>
              </Link>
            )}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Kelola repositori cuplikan kode pribadi dan publik Anda
          </p>
        </div>

        <Link to="/create" className="btn-primary">
          <Plus size={16} />
          <span>Buat Snippet Baru</span>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="metrics-row">
        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: 'var(--emerald-subtle)', color: 'var(--emerald)' }}>
            <Code2 size={19} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.4px' }}>TOTAL SNIPPET</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>{totalCount}</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--emerald-light)' }}>
            <Globe size={19} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.4px' }}>PUBLIK</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#34d399' }}>{publicCount}</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: 'var(--amber-subtle)', color: 'var(--amber)' }}>
            <Lock size={19} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.4px' }}>PRIVAT</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--amber)' }}>{privateCount}</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: 'var(--blue-subtle)', color: '#38bdf8' }}>
            <Star size={19} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.4px' }}>DISIMPAN / STAR</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fbbf24' }}>{bookmarkedSnippets.length}</div>
          </div>
        </div>
      </div>

      {/* Tab Switcher: Snippet Saya vs Snippet Disimpan */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '12px'
      }}>
        <button
          onClick={() => setActiveTab('my')}
          className={`btn-secondary ${activeTab === 'my' ? 'active' : ''}`}
          style={{
            background: activeTab === 'my' ? 'var(--emerald-subtle)' : 'transparent',
            borderColor: activeTab === 'my' ? 'rgba(16, 185, 129, 0.4)' : 'transparent',
            color: activeTab === 'my' ? '#34d399' : 'var(--text-secondary)',
            padding: '8px 16px',
            fontSize: '0.88rem'
          }}
        >
          <Layers size={15} />
          <span>Snippet Saya ({snippets.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('bookmarked')}
          className={`btn-secondary ${activeTab === 'bookmarked' ? 'active' : ''}`}
          style={{
            background: activeTab === 'bookmarked' ? 'var(--amber-subtle)' : 'transparent',
            borderColor: activeTab === 'bookmarked' ? 'rgba(245, 158, 11, 0.4)' : 'transparent',
            color: activeTab === 'bookmarked' ? '#fbbf24' : 'var(--text-secondary)',
            padding: '8px 16px',
            fontSize: '0.88rem'
          }}
        >
          <Star size={15} fill={activeTab === 'bookmarked' ? '#fbbf24' : 'none'} />
          <span>Snippet Disimpan ({bookmarkedSnippets.length})</span>
        </button>
      </div>

      <div className="dashboard-layout">
        {/* Sidebar Filters */}
        <aside className="app-card sidebar-sticky-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '7px' }}>
              <Filter size={15} style={{ color: 'var(--emerald)' }} />
              <span>Filter Snippet</span>
            </h3>
            {(searchTerm || selectedLanguage || selectedFolder || selectedTag || (activeTab === 'my' && visibilityFilter !== 'all')) && (
              <button
                onClick={() => { setSearchTerm(''); setSelectedLanguage(''); setSelectedFolder(''); setSelectedTag(''); setVisibilityFilter('all'); }}
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
                  placeholder="Cari judul, folder, tag..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ fontSize: '0.85rem' }}
                />
              </div>
            </div>

            {/* Language Filter */}
            <div className="form-group">
              <label className="form-label">Bahasa Pemrograman</label>
              <select
                className="app-input"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                style={{ fontSize: '0.85rem', cursor: 'pointer' }}
              >
                <option value="">Semua Bahasa ({currentDataset.length})</option>
                {uniqueLanguages.map(lang => {
                  const count = currentDataset.filter(s => s.language.toLowerCase() === lang.toLowerCase()).length;
                  return (
                    <option key={lang} value={lang}>
                      {lang.toUpperCase()} ({count})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Folder / Collection Filter */}
            {uniqueFolders.length > 0 && (
              <div className="form-group">
                <label className="form-label">
                  <FolderIcon size={13} style={{ color: 'var(--amber)' }} />
                  <span>Folder / Koleksi</span>
                </label>
                <select
                  className="app-input"
                  value={selectedFolder}
                  onChange={(e) => setSelectedFolder(e.target.value)}
                  style={{ fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  <option value="">Semua Folder ({currentDataset.length})</option>
                  {uniqueFolders.map(folderName => {
                    const count = currentDataset.filter(s => s.folder?.toLowerCase() === folderName.toLowerCase()).length;
                    return (
                      <option key={folderName} value={folderName}>
                        📁 {folderName} ({count})
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {/* Visibility Toggle (only for My Snippets) */}
            {activeTab === 'my' && (
              <div className="form-group">
                <label className="form-label">Status Visibilitas</label>
                <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '9px', padding: '3px', border: '1px solid var(--border-subtle)' }}>
                  <button
                    type="button"
                    onClick={() => setVisibilityFilter('all')}
                    style={{
                      flex: 1,
                      background: visibilityFilter === 'all' ? 'var(--emerald-subtle)' : 'transparent',
                      border: visibilityFilter === 'all' ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid transparent',
                      borderRadius: '6px',
                      color: visibilityFilter === 'all' ? '#34d399' : 'var(--text-secondary)',
                      padding: '5px 4px',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    Semua
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisibilityFilter('public')}
                    style={{
                      flex: 1,
                      background: visibilityFilter === 'public' ? 'rgba(16, 185, 129, 0.18)' : 'transparent',
                      border: visibilityFilter === 'public' ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid transparent',
                      borderRadius: '6px',
                      color: visibilityFilter === 'public' ? '#34d399' : 'var(--text-secondary)',
                      padding: '5px 4px',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    Publik
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisibilityFilter('private')}
                    style={{
                      flex: 1,
                      background: visibilityFilter === 'private' ? 'rgba(245, 158, 11, 0.18)' : 'transparent',
                      border: visibilityFilter === 'private' ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid transparent',
                      borderRadius: '6px',
                      color: visibilityFilter === 'private' ? '#fbbf24' : 'var(--text-secondary)',
                      padding: '5px 4px',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    Privat
                  </button>
                </div>
              </div>
            )}

            {/* Popular Tags */}
            {popularTags.length > 0 && (
              <div className="form-group" style={{ gap: '8px' }}>
                <label className="form-label">
                  <TagIcon size={12} style={{ color: 'var(--emerald)' }} />
                  <span>Tag Snippet</span>
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

        {/* Snippets List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {loading ? (
            <div className="app-card" style={{ padding: '50px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)' }}>Memuat koleksi snippet Anda...</p>
            </div>
          ) : error ? (
            <div className="app-card" style={{ padding: '30px', textAlign: 'center', borderColor: 'var(--rose)' }}>
              <p style={{ color: 'var(--rose)', marginBottom: '12px' }}>{error}</p>
              <button onClick={fetchSnippets} className="btn-secondary">Coba Lagi</button>
            </div>
          ) : filteredSnippets.length === 0 ? (
            <div className="app-card" style={{ padding: '50px', textAlign: 'center' }}>
              <Code2 size={36} style={{ color: 'var(--text-tertiary)', marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>
                {activeTab === 'my' ? 'Tidak Ada Snippet' : 'Belum Ada Bookmark'}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginBottom: '18px' }}>
                {activeTab === 'my' 
                  ? (snippets.length === 0 
                      ? 'Anda belum memiliki snippet. Mulai simpan potongan kode pertama Anda!' 
                      : 'Tidak ada snippet yang sesuai dengan filter yang dipilih.')
                  : 'Anda belum menyimpan snippet developer lain ke bookmark.'}
              </p>
              {activeTab === 'my' && snippets.length === 0 ? (
                <Link to="/create" className="btn-primary">
                  <Plus size={15} />
                  <span>Buat Snippet Pertama</span>
                </Link>
              ) : (
                <button 
                  onClick={() => { setSearchTerm(''); setSelectedLanguage(''); setSelectedFolder(''); setSelectedTag(''); setVisibilityFilter('all'); }} 
                  className="btn-secondary"
                >
                  Reset Filter
                </button>
              )}
            </div>
          ) : (
            filteredSnippets.map((snippet) => (
              <article key={snippet.id} className="snippet-article animate-fade-in">
                {/* Top Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '14px', marginBottom: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', flexWrap: 'wrap' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        padding: '2px 7px',
                        borderRadius: '5px',
                        background: snippet.isPublic ? 'rgba(16, 185, 129, 0.12)' : 'var(--amber-subtle)',
                        color: snippet.isPublic ? '#34d399' : 'var(--amber)',
                        border: `1px solid ${snippet.isPublic ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)'}`
                      }}>
                        {snippet.isPublic ? <Eye size={11} /> : <EyeOff size={11} />}
                        <span>{snippet.isPublic ? 'Publik' : 'Privat'}</span>
                      </span>

                      {snippet.user && (
                        <Link
                          to={`/u/${snippet.user.username}`}
                          style={{ fontSize: '0.76rem', color: 'var(--emerald-light)', textDecoration: 'none' }}
                        >
                          Oleh @{snippet.user.username}
                        </Link>
                      )}

                      {snippet.folder && (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          padding: '2px 7px',
                          borderRadius: '5px',
                          background: 'var(--amber-subtle)',
                          color: '#fbbf24',
                          border: '1px solid rgba(245, 158, 11, 0.25)'
                        }}>
                          <FolderIcon size={10} />
                          <span>{snippet.folder}</span>
                        </span>
                      )}

                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        <Calendar size={11} />
                        <span>{new Date(snippet.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </span>
                    </div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.3px' }}>
                      <Link to={`/snippet/${snippet.id}`} style={{ color: '#fff', textDecoration: 'none' }}>
                        {snippet.title}
                      </Link>
                    </h2>
                  </div>

                  {/* Actions */}
                  {activeTab === 'my' ? (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button 
                        onClick={() => navigate(`/edit/${snippet.id}`)} 
                        className="btn-secondary"
                        style={{ padding: '6px 11px', borderRadius: '7px', fontSize: '0.78rem' }}
                        title="Edit Snippet"
                      >
                        <Edit size={13} />
                        <span>Edit</span>
                      </button>
                      <button 
                        onClick={() => handleDelete(snippet.id)} 
                        className="btn-danger"
                        title="Hapus Snippet"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ) : (
                    <Link to={`/snippet/${snippet.id}`} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                      Lihat Detail
                    </Link>
                  )}
                </div>

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

                {/* CodeBlock */}
                <CodeBlock
                  id={snippet.id}
                  title={snippet.title}
                  code={snippet.codeContent}
                  language={snippet.language}
                  canFork={activeTab === 'bookmarked'}
                  initialIsBookmarked={snippet.isBookmarked ?? (activeTab === 'bookmarked')}
                  initialBookmarkCount={snippet.bookmarkCount || 0}
                  maxCollapsedLines={7}
                />
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
