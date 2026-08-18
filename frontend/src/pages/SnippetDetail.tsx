import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Calendar,
  Tag as TagIcon,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  MessageSquare,
  Send,
  Trash,
  CornerDownRight
} from 'lucide-react';
import CodeBlock from '../components/CodeBlock';
import { API_URL } from '../config/api';

interface CommentItem {
  id: number;
  content: string;
  createdAt: string;
  userId: number;
  user: {
    id: number;
    username: string;
  };
}

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
  bookmarkCount: number;
  commentCount: number;
  isBookmarked: boolean;
  user: {
    id: number;
    username: string;
    bio: string | null;
    githubUrl: string | null;
  };
}

export default function SnippetDetail() {
  const { id } = useParams<{ id: string }>();
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Comments state
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const currentUserId = localStorage.getItem('userId') ? parseInt(localStorage.getItem('userId')!) : null;

  useEffect(() => {
    fetchSnippet();
    fetchComments();
  }, [id]);

  const fetchSnippet = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/snippets/${id}`, {
        headers
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Snippet ini bersifat privat dan hanya dapat diakses oleh pemiliknya.');
        }
        if (response.status === 404) {
          throw new Error('Snippet tidak ditemukan.');
        }
        throw new Error('Gagal memuat detail snippet.');
      }

      const data = await response.json();
      setSnippet(data);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memuat snippet.');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(`${API_URL}/snippets/${id}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Harap masuk log untuk menulis komentar' }));
      return;
    }
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await fetch(`${API_URL}/snippets/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newComment.trim() })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Gagal mengirim komentar');
      }

      const data = await res.json();
      setComments(prev => [...prev, data.comment]);
      setNewComment('');
      window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Komentar berhasil dikirim!' }));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('Hapus komentar ini?')) return;
    try {
      const res = await fetch(`${API_URL}/snippets/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Gagal menghapus komentar');
      setComments(prev => prev.filter(c => c.id !== commentId));
      window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Komentar dihapus' }));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async () => {
    if (!snippet || !window.confirm('Apakah Anda yakin ingin menghapus snippet ini?')) return;
    try {
      const response = await fetch(`${API_URL}/snippets/${snippet.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Gagal menghapus snippet');
      window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Snippet berhasil dihapus' }));
      navigate('/dashboard');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const isOwner = snippet && currentUserId === snippet.userId;

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '860px', margin: '0 auto' }}>
      <div style={{ marginBottom: '18px' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ background: 'none', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '7px', color: 'var(--text-secondary)', fontSize: '0.85rem', cursor: 'pointer' }}
        >
          <ArrowLeft size={15} />
          <span>Kembali</span>
        </button>
      </div>

      {loading ? (
        <div className="app-card" style={{ padding: '60px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Memuat detail cuplikan kode...</p>
        </div>
      ) : error ? (
        <div className="app-card" style={{ padding: '40px', textAlign: 'center', borderColor: 'var(--rose)' }}>
          <p style={{ color: 'var(--rose)', marginBottom: '16px' }}>{error}</p>
          <Link to="/" className="btn-secondary">Kembali ke Beranda</Link>
        </div>
      ) : snippet ? (
        <>
          <div className="app-card neon-top-beam" style={{ padding: '32px 28px', marginBottom: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
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

                  {/* Author with Profile Link */}
                  <Link
                    to={`/u/${snippet.user.username}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '0.8rem',
                      color: 'var(--text-primary)',
                      textDecoration: 'none',
                      background: 'rgba(255,255,255,0.04)',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-subtle)'
                    }}
                    title="Lihat profil developer"
                  >
                    <User size={12} style={{ color: 'var(--emerald)' }} />
                    <span><strong>{snippet.user.username}</strong></span>
                  </Link>

                  <span>•</span>

                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <Calendar size={12} />
                    <span>{new Date(snippet.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </span>
                </div>

                <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.4px' }}>
                  {snippet.title}
                </h1>
              </div>

              {isOwner && (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button 
                    onClick={() => navigate(`/edit/${snippet.id}`)} 
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  >
                    <Edit size={13} />
                    <span>Edit</span>
                  </button>
                  <button 
                    onClick={handleDelete} 
                    className="btn-danger"
                    style={{ padding: '6px 9px' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </div>

            {/* Description */}
            {snippet.description && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '18px', background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                {snippet.description}
              </p>
            )}

            {/* Tags */}
            {snippet.tags && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '16px' }}>
                {snippet.tags.split(',').map((tag, idx) => (
                  <span key={idx} className="tag-badge" style={{ padding: '3px 9px', fontSize: '0.75rem' }}>
                    <TagIcon size={11} style={{ color: 'var(--emerald)' }} />
                    {tag.trim()}
                  </span>
                ))}
              </div>
            )}

            {/* CodeBlock */}
            <CodeBlock
              id={snippet.id}
              title={snippet.title}
              code={snippet.codeContent}
              language={snippet.language}
              canFork={!isOwner}
              initialIsBookmarked={snippet.isBookmarked}
              initialBookmarkCount={snippet.bookmarkCount}
              maxCollapsedLines={1000}
            />
          </div>

          {/* Comments & Discussions Section */}
          <div className="app-card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={17} style={{ color: 'var(--emerald)' }} />
                <span>Diskusi & Komentar ({comments.length})</span>
              </h3>
            </div>

            {/* Input Comment Box */}
            <form onSubmit={handlePostComment} style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#040910',
                  flexShrink: 0
                }}>
                  {token ? (localStorage.getItem('username') || 'U').charAt(0).toUpperCase() : '?'}
                </div>

                <div style={{ flex: 1 }}>
                  <textarea
                    rows={2}
                    placeholder={token ? "Tulis tanggapan, saran optimasi, atau pertanyaan..." : "Harap masuk log terlebih dahulu untuk menulis komentar"}
                    disabled={!token}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="app-input"
                    style={{ fontSize: '0.85rem', resize: 'vertical', minHeight: '64px', marginBottom: '8px' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="submit"
                      disabled={!token || submittingComment || !newComment.trim()}
                      className="btn-primary"
                      style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                    >
                      <Send size={13} />
                      <span>{submittingComment ? 'Mengirim...' : 'Kirim Komentar'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {/* Comments List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {comments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-tertiary)', fontSize: '0.86rem' }}>
                  Belum ada diskusi untuk cuplikan kode ini. Jadilah yang pertama berkomentar!
                </div>
              ) : (
                comments.map((c) => (
                  <div 
                    key={c.id} 
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '10px',
                      padding: '14px 16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Link 
                          to={`/u/${c.user.username}`}
                          style={{
                            fontWeight: 700,
                            color: 'var(--emerald-light)',
                            fontSize: '0.85rem',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <CornerDownRight size={12} style={{ color: 'var(--text-tertiary)' }} />
                          {c.user.username}
                        </Link>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                          {new Date(c.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {currentUserId === c.userId && (
                        <button
                          onClick={() => handleDeleteComment(c.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '2px 6px', borderRadius: '4px' }}
                          title="Hapus komentar Anda"
                        >
                          <Trash size={12} />
                        </button>
                      )}
                    </div>

                    <p style={{ color: 'var(--text-primary)', fontSize: '0.86rem', lineHeight: '1.5', margin: 0, paddingLeft: '16px' }}>
                      {c.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
