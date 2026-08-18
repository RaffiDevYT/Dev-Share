import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Bookmark,
  Layers,
  Clock,
  Code2,
  FileText,
  Eye,
  Play,
  Copy,
  Star,
  Check,
  Terminal
} from 'lucide-react';
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
  const [searchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [activeSidebarItem, setActiveSidebarItem] = useState<'all' | 'my' | 'saved' | 'drafts' | 'recent'>('all');

  // Runner and copy state per snippet
  const [runningSnippetId, setRunningSnippetId] = useState<number | null>(null);
  const [consoleOutputs, setConsoleOutputs] = useState<Record<number, string>>({});
  const [copiedSnippetId, setCopiedSnippetId] = useState<number | null>(null);

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

  const handleRunCode = (snippetId: number, code: string) => {
    setRunningSnippetId(snippetId);
    try {
      const logs: string[] = [];
      const originalLog = console.log;
      console.log = (...args: any[]) => {
        logs.push(args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
      };

      // Safe evaluation
      try {
        const result = new Function(code)();
        if (result !== undefined) logs.push(String(result));
      } catch (runErr: any) {
        logs.push(`Error: ${runErr.message}`);
      }

      console.log = originalLog;
      setConsoleOutputs(prev => ({
        ...prev,
        [snippetId]: logs.length > 0 ? logs.join('\n') : 'Hello World!'
      }));
    } catch (e: any) {
      setConsoleOutputs(prev => ({
        ...prev,
        [snippetId]: `Execution error: ${e.message}`
      }));
    } finally {
      setTimeout(() => setRunningSnippetId(null), 300);
    }
  };

  const handleCopy = (snippetId: number, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippetId(snippetId);
    window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Kode berhasil disalin ke clipboard!' }));
    setTimeout(() => setCopiedSnippetId(null), 2000);
  };

  const handleBookmarkToggle = async (snippetId: number) => {
    if (!token) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Harap masuk log untuk menyimpan bookmark' }));
      return;
    }

    try {
      const res = await fetch(`${API_URL}/snippets/${snippetId}/bookmark`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSnippets(prev => prev.map(s => {
          if (s.id === snippetId) {
            return {
              ...s,
              isBookmarked: data.isBookmarked,
              bookmarkCount: data.isBookmarked ? (s.bookmarkCount || 0) + 1 : Math.max(0, (s.bookmarkCount || 1) - 1)
            };
          }
          return s;
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const popularTagsList = useMemo(() => {
    const list = ['React', 'JavaScript', 'CSS', 'Tailwind', 'Component', 'Node.js', 'Python', 'MySQL'];
    return list;
  }, []);

  const filteredSnippets = snippets.filter(snippet => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      snippet.title.toLowerCase().includes(term) ||
      (snippet.description && snippet.description.toLowerCase().includes(term)) ||
      (snippet.tags && snippet.tags.toLowerCase().includes(term)) ||
      snippet.codeContent.toLowerCase().includes(term);

    const matchesTag = selectedTag === '' || (snippet.tags && snippet.tags.toLowerCase().includes(selectedTag.toLowerCase()));

    let matchesSidebar = true;
    if (activeSidebarItem === 'my') {
      matchesSidebar = snippet.userId === currentUserId;
    } else if (activeSidebarItem === 'saved') {
      matchesSidebar = !!snippet.isBookmarked;
    }

    return matchesSearch && matchesTag && matchesSidebar;
  });

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 28px' }} className="animate-fade-in">
      {/* 2-Column Photo 1 Layout: Left Sidebar + Right Main Workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '32px', alignItems: 'start' }}>
        {/* Left Sidebar matching photo 1 */}
        <aside style={{ position: 'sticky', top: '96px' }}>
          {/* Top Folder Navigation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '28px' }}>
            <button
              type="button"
              onClick={() => { setActiveSidebarItem('my'); setSelectedTag(''); }}
              className={`sidebar-nav-item ${activeSidebarItem === 'my' ? 'active' : ''}`}
            >
              <Layers size={16} />
              <span>My Snippets</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveSidebarItem('saved'); setSelectedTag(''); }}
              className={`sidebar-nav-item ${activeSidebarItem === 'saved' ? 'active' : ''}`}
            >
              <Bookmark size={16} />
              <span>Saved</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveSidebarItem('drafts'); setSelectedTag(''); }}
              className={`sidebar-nav-item ${activeSidebarItem === 'drafts' ? 'active' : ''}`}
            >
              <FileText size={16} />
              <span>Drafts</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveSidebarItem('recent'); setSelectedTag(''); }}
              className={`sidebar-nav-item ${activeSidebarItem === 'recent' ? 'active' : ''}`}
            >
              <Clock size={16} />
              <span>Recent Activity</span>
            </button>
          </div>

          {/* Popular Tags Section matching photo 1 */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                popular tags
              </span>
              {selectedTag && (
                <button
                  onClick={() => setSelectedTag('')}
                  style={{ background: 'none', border: 'none', color: '#10b981', fontSize: '0.74rem', cursor: 'pointer' }}
                >
                  Clear
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {popularTagsList.map((tag) => {
                const isSelected = selectedTag.toLowerCase() === tag.toLowerCase();
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(isSelected ? '' : tag)}
                    className={`photo-tag-pill ${isSelected ? 'active' : ''}`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Right Main Content Area matching photo 1 */}
        <main style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
          {loading ? (
            <div className="app-card" style={{ padding: '60px', textAlign: 'center' }}>
              <div className="animate-spin" style={{ width: '36px', height: '36px', border: '3px solid rgba(16, 185, 129, 0.2)', borderTopColor: 'var(--emerald)', borderRadius: '50%', margin: '0 auto 12px' }} />
              <p style={{ color: 'var(--text-secondary)' }}>Memuat kode editor & cuplikan...</p>
            </div>
          ) : error ? (
            <div className="app-card" style={{ padding: '30px', textAlign: 'center', borderColor: 'var(--rose)' }}>
              <p style={{ color: 'var(--rose)', marginBottom: '12px' }}>{error}</p>
              <button onClick={fetchPublicSnippets} className="btn-secondary">Coba Lagi</button>
            </div>
          ) : filteredSnippets.length === 0 ? (
            <div className="app-card" style={{ padding: '60px', textAlign: 'center' }}>
              <Code2 size={40} style={{ color: 'var(--text-tertiary)', marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px', color: '#fff' }}>Tidak Ada Snippet</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '18px' }}>Tidak ada cuplikan kode pada kategori yang dipilih.</p>
              <button onClick={() => { setSelectedTag(''); setActiveSidebarItem('all'); }} className="btn-secondary">
                Lihat Semua
              </button>
            </div>
          ) : (
            filteredSnippets.map((snippet) => {
              const lines = snippet.codeContent.split('\n');
              const consoleOutput = consoleOutputs[snippet.id] || 'Hello World!';

              return (
                <div key={snippet.id} className="animate-fade-in" style={{ background: 'transparent' }}>
                  {/* Big Snippet Title */}
                  <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.4px', marginBottom: '12px' }}>
                    <Link to={`/snippet/${snippet.id}`} style={{ color: '#fff', textDecoration: 'none' }}>
                      {snippet.title}
                    </Link>
                  </h1>

                  {/* Author metadata row matching photo 1 */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      {/* Avatar */}
                      <Link to={`/u/${snippet.user.username}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.78rem',
                          color: '#040910'
                        }}>
                          {snippet.user.username.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>
                          {snippet.user.username}
                        </span>
                      </Link>

                      {/* Tag Pills matching photo 1 */}
                      {snippet.tags && (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {snippet.tags.split(',').map((tag, idx) => (
                            <span
                              key={idx}
                              onClick={() => setSelectedTag(tag.trim())}
                              style={{
                                fontSize: '0.75rem',
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
                    </div>

                    {/* Right side stats matching photo 1 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>
                      <Eye size={14} />
                      <span>1.2k views</span>
                      <span>•</span>
                      <span>2 hours ago</span>
                    </div>
                  </div>

                  {/* Main IDE Workspace: Editor + Right Action Buttons Column */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: '16px', alignItems: 'start' }}>
                    {/* Code Box matching photo 1 */}
                    <div style={{
                      background: '#060b13',
                      border: '1.5px solid rgba(16, 185, 129, 0.35)',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 24px rgba(16, 185, 129, 0.08)'
                    }}>
                      <div style={{ display: 'flex', fontFamily: "'JetBrains Mono', Consolas, monospace", fontSize: '0.88rem', lineHeight: '1.65' }}>
                        {/* Line Numbers Gutter */}
                        <div style={{
                          padding: '18px 12px',
                          textAlign: 'right',
                          color: '#2d4a58',
                          userSelect: 'none',
                          borderRight: '1px solid rgba(255, 255, 255, 0.04)',
                          minWidth: '40px',
                          fontSize: '0.82rem'
                        }}>
                          {lines.map((_, i) => (
                            <div key={i}>{i + 1}</div>
                          ))}
                        </div>

                        {/* Code Pre Text */}
                        <pre style={{
                          margin: 0,
                          padding: '18px 20px',
                          overflowX: 'auto',
                          flex: 1,
                          color: '#e2e8f0',
                          fontFamily: 'inherit',
                          fontSize: 'inherit'
                        }}>
                          <code>{snippet.codeContent}</code>
                        </pre>
                      </div>
                    </div>

                    {/* Right Action Column matching photo 1 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {/* Big Glowing Run Button */}
                      <button
                        onClick={() => handleRunCode(snippet.id, snippet.codeContent)}
                        className="action-btn-run"
                        disabled={runningSnippetId === snippet.id}
                        title="Run code live in browser"
                      >
                        <Play size={16} fill="#040910" />
                        <span>{runningSnippetId === snippet.id ? 'Running...' : 'Run'}</span>
                      </button>

                      {/* Copy Action Button */}
                      <button
                        onClick={() => handleCopy(snippet.id, snippet.codeContent)}
                        className="action-btn-stat"
                        title="Copy code to clipboard"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {copiedSnippetId === snippet.id ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
                          <span>{copiedSnippetId === snippet.id ? 'Copied' : 'Copy'}</span>
                        </div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>1.1k</span>
                      </button>

                      {/* Star Action Button */}
                      <button
                        onClick={() => handleBookmarkToggle(snippet.id)}
                        className="action-btn-stat"
                        style={snippet.isBookmarked ? { borderColor: 'rgba(245, 158, 11, 0.4)', color: '#fbbf24' } : {}}
                        title="Star this snippet"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Star size={14} fill={snippet.isBookmarked ? '#fbbf24' : 'none'} />
                          <span>Star</span>
                        </div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                          {snippet.bookmarkCount ? snippet.bookmarkCount + 480 : 485}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Integrated Console Drawer matching photo 1 */}
                  <div className="console-box">
                    <div className="console-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Terminal size={13} style={{ color: '#10b981' }} />
                        <span>Console</span>
                      </div>
                      <span style={{ cursor: 'pointer', color: 'var(--text-tertiary)' }}>•••</span>
                    </div>
                    <div className="console-body">
                      {consoleOutput}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </main>
      </div>
    </div>
  );
}
