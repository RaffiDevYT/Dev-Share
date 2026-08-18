import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  MessageSquare,
  Plus,
  Search,
  Send,
  Trash2,
  HelpCircle,
  Lightbulb,
  Rocket,
  Flame,
  ArrowLeft,
  X,
  Layers,
  ChevronRight
} from 'lucide-react';
import { API_URL } from '../config/api';

interface ForumReply {
  id: number;
  content: string;
  topicId: number;
  userId: number;
  createdAt: string;
  user: {
    id: number;
    username: string;
    bio?: string | null;
  };
}

interface ForumTopic {
  id: number;
  title: string;
  content: string;
  category: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  author: {
    id: number;
    username: string;
  };
  replyCount: number;
  lastReply?: {
    createdAt: string;
    username: string;
  } | null;
  user?: {
    id: number;
    username: string;
    bio?: string | null;
  };
  replies?: ForumReply[];
}

const CATEGORIES = [
  { id: 'Semua', label: 'Semua Kategori', icon: Layers, color: '#10b981' },
  { id: 'Tanya Jawab', label: 'Tanya Jawab & Debug', icon: HelpCircle, color: '#f43f5e' },
  { id: 'Tips & Trik', label: 'Tips & Best Practice', icon: Lightbulb, color: '#fbbf24' },
  { id: 'Showcase', label: 'Showcase & Review', icon: Rocket, color: '#38bdf8' },
  { id: 'Umum', label: 'Diskusi Santai', icon: MessageSquare, color: '#a855f7' }
];

export default function Forum() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTopicId = searchParams.get('topic');

  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');

  // Detail Topic state
  const [activeTopic, setActiveTopic] = useState<ForumTopic | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  // Create Topic Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Tanya Jawab');
  const [newContent, setNewContent] = useState('');
  const [submittingTopic, setSubmittingTopic] = useState(false);

  const token = localStorage.getItem('token');
  const currentUsername = localStorage.getItem('username');

  useEffect(() => {
    fetchTopics();
  }, [activeCategory]);

  useEffect(() => {
    if (selectedTopicId) {
      fetchTopicDetail(parseInt(selectedTopicId, 10));
    } else {
      setActiveTopic(null);
    }
  }, [selectedTopicId]);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      let url = `${API_URL}/forum`;
      const params = new URLSearchParams();
      if (activeCategory !== 'Semua') params.append('category', activeCategory);
      if (searchQuery) params.append('search', searchQuery);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setTopics(data);
      }
    } catch (err) {
      console.error('Error fetching forum topics:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopicDetail = async (id: number) => {
    setLoadingDetail(true);
    try {
      const res = await fetch(`${API_URL}/forum/${id}`);
      if (res.ok) {
        const data = await res.json();
        setActiveTopic(data);
      }
    } catch (err) {
      console.error('Error fetching topic detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    if (!token) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Harap masuk log untuk membuat topik diskusi' }));
      return;
    }

    setSubmittingTopic(true);
    try {
      const res = await fetch(`${API_URL}/forum`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newTitle,
          category: newCategory,
          content: newContent
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Gagal membuat topik');
      }

      const data = await res.json();
      setShowCreateModal(false);
      setNewTitle('');
      setNewContent('');
      fetchTopics();
      if (data.topic?.id) {
        setSearchParams({ topic: String(data.topic.id) });
      }
      window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Topik diskusi berhasil dipublikasikan!' }));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingTopic(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTopic || !replyContent.trim()) return;
    if (!token) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Harap masuk log untuk mengirim balasan' }));
      return;
    }

    setSubmittingReply(true);
    try {
      const res = await fetch(`${API_URL}/forum/${activeTopic.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: replyContent })
      });

      if (!res.ok) throw new Error('Gagal mengirim balasan');

      setReplyContent('');
      fetchTopicDetail(activeTopic.id);
      fetchTopics();
      window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Balasan terkirim!' }));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleDeleteTopic = async (topicId: number) => {
    if (!token) return;
    if (!confirm('Apakah Anda yakin ingin menghapus topik diskusi ini?')) return;

    try {
      const res = await fetch(`${API_URL}/forum/${topicId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Gagal menghapus topik');

      setSearchParams({});
      setActiveTopic(null);
      fetchTopics();
      window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Topik diskusi berhasil dihapus' }));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteReply = async (replyId: number) => {
    if (!token || !activeTopic) return;
    if (!confirm('Hapus balasan ini?')) return;

    try {
      const res = await fetch(`${API_URL}/forum/replies/${replyId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Gagal menghapus balasan');

      fetchTopicDetail(activeTopic.id);
      window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Balasan berhasil dihapus' }));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getCategoryColor = (cat: string) => {
    const item = CATEGORIES.find(c => c.id === cat);
    return item ? item.color : '#10b981';
  };

  // Filtered list by query
  const displayedTopics = useMemo(() => {
    if (!searchQuery.trim()) return topics;
    const q = searchQuery.toLowerCase();
    return topics.filter(t => t.title.toLowerCase().includes(q) || t.content.toLowerCase().includes(q));
  }, [topics, searchQuery]);

  return (
    <div className="container animate-fade-in">
      {/* Forum Banner */}
      <div className="app-card neon-top-beam" style={{ padding: '28px 32px', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ background: 'var(--emerald-subtle)', color: 'var(--emerald-light)', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid rgba(16, 185, 129, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Flame size={12} /> Community Hub
              </span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', marginBottom: '6px' }}>
              Forum Diskusi & Chat Developer
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '620px' }}>
              Tempat bertukar pikiran, tanya jawab error, membagikan tips coding, dan mengobrol bersama sesama developer di Dev-Share.
            </p>
          </div>

          <button
            onClick={() => {
              if (!token) {
                window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Silakan masuk log untuk membuat topik baru' }));
                return;
              }
              setShowCreateModal(true);
            }}
            className="btn-primary"
            style={{ padding: '10px 20px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={16} />
            <span>Mulai Topik Diskusi</span>
          </button>
        </div>
      </div>

      {/* Main Content Layout: If activeTopic open, show thread view, else show topic list */}
      {activeTopic ? (
        /* DETAIL THREAD VIEW */
        <div className="animate-fade-in">
          {/* Back button */}
          <button
            onClick={() => setSearchParams({})}
            className="btn-secondary"
            style={{ padding: '7px 14px', fontSize: '0.82rem', marginBottom: '18px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Daftar Forum</span>
          </button>

          {/* Main Topic Header & Content */}
          <div className="app-card" style={{ padding: '28px', marginBottom: '20px', borderLeft: `4px solid ${getCategoryColor(activeTopic.category)}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '14px', marginBottom: '14px', flexWrap: 'wrap' }}>
              <div>
                <span style={{
                  fontSize: '0.72rem',
                  padding: '3px 10px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${getCategoryColor(activeTopic.category)}`,
                  color: getCategoryColor(activeTopic.category),
                  fontWeight: 600,
                  display: 'inline-block',
                  marginBottom: '8px'
                }}>
                  {activeTopic.category}
                </span>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff', lineHeight: '1.3' }}>
                  {activeTopic.title}
                </h2>
              </div>

              {currentUsername?.toLowerCase() === activeTopic.user?.username?.toLowerCase() && (
                <button
                  onClick={() => handleDeleteTopic(activeTopic.id)}
                  className="btn-secondary"
                  style={{ color: 'var(--rose)', borderColor: 'rgba(244, 63, 94, 0.3)', padding: '6px 12px', fontSize: '0.78rem' }}
                  title="Hapus topik ini"
                >
                  <Trash2 size={13} />
                  <span>Hapus Topik</span>
                </button>
              )}
            </div>

            {/* Author info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
                color: '#030712'
              }}>
                {activeTopic.user?.username ? activeTopic.user.username.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <Link to={`/u/${activeTopic.user?.username}`} style={{ color: '#fff', fontWeight: 600, fontSize: '0.88rem', textDecoration: 'none' }}>
                  @{activeTopic.user?.username}
                </Link>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  Diposting {new Date(activeTopic.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>

            {/* Body */}
            <div style={{ color: 'var(--text-primary)', fontSize: '0.94rem', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
              {activeTopic.content}
            </div>
          </div>

          {/* Replies Section */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={16} style={{ color: 'var(--emerald)' }} />
              <span>Balasan Komunitas ({activeTopic.replies?.length || 0})</span>
            </h3>

            {loadingDetail ? (
              <div style={{ textAlign: 'center', padding: '30px 0' }}>
                <p style={{ color: 'var(--text-tertiary)' }}>Memuat percakapan...</p>
              </div>
            ) : (!activeTopic.replies || activeTopic.replies.length === 0) ? (
              <div className="app-card" style={{ padding: '32px', textAlign: 'center', marginBottom: '16px' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Belum ada balasan pada topik ini. Jadilah yang pertama memberikan solusi atau tanggapan!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                {activeTopic.replies.map((reply) => {
                  const isAuthor = currentUsername?.toLowerCase() === reply.user?.username?.toLowerCase();
                  return (
                    <div key={reply.id} className={`chat-message-item ${isAuthor ? 'is-owner' : ''}`}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            color: '#fff'
                          }}>
                            {reply.user?.username ? reply.user.username.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Link to={`/u/${reply.user?.username}`} style={{ color: '#fff', fontWeight: 600, fontSize: '0.86rem', textDecoration: 'none' }}>
                                @{reply.user?.username}
                              </Link>
                              {reply.user?.username?.toLowerCase() === activeTopic.user?.username?.toLowerCase() && (
                                <span style={{ fontSize: '0.68rem', background: 'var(--emerald-subtle)', color: 'var(--emerald)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '1px 6px', borderRadius: '4px' }}>
                                  Pembuat Topik
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                              {new Date(reply.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>

                        {isAuthor && (
                          <button
                            onClick={() => handleDeleteReply(reply.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--rose)', cursor: 'pointer', padding: '4px' }}
                            title="Hapus balasan"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>

                      <div style={{ paddingLeft: '42px', color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                        {reply.content}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quick Reply Form */}
            <form onSubmit={handleSendReply} className="chat-compose-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Send size={14} style={{ color: 'var(--emerald)' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>Kirim Tanggapan / Solusi</span>
              </div>

              <textarea
                className="chat-input"
                placeholder={token ? 'Tulis tanggapan, kode solusi, atau jawaban Anda di sini...' : 'Silakan masuk log untuk mengirim balasan pada forum.'}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                disabled={!token || submittingReply}
                style={{ minHeight: '80px' }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '8px 20px', fontSize: '0.85rem' }}
                  disabled={!token || !replyContent.trim() || submittingReply}
                >
                  <Send size={13} />
                  <span>{submittingReply ? 'Mengirim...' : 'Kirim Balasan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        /* TOPIC LIST VIEW */
        <div>
          {/* Categories Bar & Search */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
            {/* Category pills */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`btn-secondary ${isActive ? 'active' : ''}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 14px',
                      fontSize: '0.82rem',
                      borderRadius: '10px',
                      borderColor: isActive ? cat.color : undefined,
                      color: isActive ? '#fff' : undefined,
                      background: isActive ? 'rgba(255, 255, 255, 0.08)' : undefined
                    }}
                  >
                    <Icon size={14} style={{ color: cat.color }} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                placeholder="Cari topik diskusi..."
                className="app-input"
                style={{ paddingLeft: '36px', height: '38px', fontSize: '0.85rem' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Topics List */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div className="animate-spin" style={{ width: '32px', height: '32px', border: '3px solid rgba(16, 185, 129, 0.2)', borderTopColor: 'var(--emerald)', borderRadius: '50%', margin: '0 auto 12px' }} />
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Memuat topik diskusi...</p>
            </div>
          ) : displayedTopics.length === 0 ? (
            <div className="app-card" style={{ padding: '60px 24px', textAlign: 'center' }}>
              <MessageSquare size={44} style={{ color: 'var(--text-tertiary)', marginBottom: '14px' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
                {searchQuery ? 'Topik tidak ditemukan' : 'Belum Ada Topik Diskusi'}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '420px', margin: '0 auto 20px' }}>
                {searchQuery ? 'Coba cari dengan kata kunci lain.' : 'Jadilah yang pertama membuka obrolan atau mengajukan pertanyaan di forum developer.'}
              </p>
              {token && (
                <button onClick={() => setShowCreateModal(true)} className="btn-primary" style={{ padding: '8px 18px' }}>
                  <Plus size={15} /> Buat Topik Pertama
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {displayedTopics.map((topic) => (
                <div
                  key={topic.id}
                  onClick={() => setSearchParams({ topic: String(topic.id) })}
                  className="app-card"
                  style={{
                    padding: '18px 22px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    borderLeft: `3px solid ${getCategoryColor(topic.category)}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: '0.7rem',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: `1px solid ${getCategoryColor(topic.category)}`,
                          color: getCategoryColor(topic.category),
                          fontWeight: 600
                        }}>
                          {topic.category}
                        </span>

                        <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>•</span>

                        <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                          oleh <strong style={{ color: 'var(--text-secondary)' }}>@{topic.author?.username}</strong>
                        </span>

                        <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>•</span>

                        <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                          {new Date(topic.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.08rem', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
                        {topic.title}
                      </h3>

                      <p style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.86rem',
                        lineHeight: '1.5',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {topic.content}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', alignSelf: 'center' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-subtle)'
                      }}>
                        <MessageSquare size={14} style={{ color: 'var(--emerald)' }} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>{topic.replyCount}</span>
                      </div>

                      <ChevronRight size={18} style={{ color: 'var(--text-tertiary)' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Topic Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content animate-fade-in" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={18} style={{ color: 'var(--emerald)' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>Mulai Topik Diskusi Baru</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTopic} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Kategori Diskusi
                </label>
                <select
                  className="app-input"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  style={{ fontSize: '0.88rem' }}
                >
                  <option value="Tanya Jawab">❓ Tanya Jawab & Debug Error</option>
                  <option value="Tips & Trik">💡 Tips, Trik & Best Practice</option>
                  <option value="Showcase">🚀 Showcase Project & Kode</option>
                  <option value="Umum">💬 Diskusi Santai / Obrolan</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Judul Topik
                </label>
                <input
                  type="text"
                  placeholder="Cth: Bagaimana cara optimasi database MySQL di Laravel/NodeJS?"
                  className="app-input"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  style={{ fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Penjelasan / Kode / Pembahasan
                </label>
                <textarea
                  className="app-input"
                  placeholder="Jelaskan pertanyaan atau topik diskusi secara lengkap..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  required
                  rows={6}
                  style={{ resize: 'vertical', fontSize: '0.88rem', lineHeight: '1.5' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary"
                  style={{ padding: '8px 16px' }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '8px 22px' }}
                  disabled={submittingTopic || !newTitle.trim() || !newContent.trim()}
                >
                  {submittingTopic ? 'Mempublikasikan...' : 'Publikasikan Topik'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
