import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  MessageSquare,
  Plus,
  Send,
  Trash2,
  HelpCircle,
  Lightbulb,
  Rocket,
  Flame,
  ArrowLeft,
  X,
  Layers,
  TrendingUp,
  Tag as TagIcon
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
  { id: 'Semua', label: 'All Discussions', icon: Layers, color: '#10b981', badge: 'Active' },
  { id: 'Tanya Jawab', label: 'Q&A', icon: HelpCircle, color: '#10b981', badge: 'Emerald' },
  { id: 'Showcase', label: 'Showcase', icon: Rocket, color: '#a855f7', badge: 'Purple' },
  { id: 'Tips & Trik', label: 'Tips', icon: Lightbulb, color: '#06b6d4', badge: 'Cyan' },
  { id: 'Umum', label: 'Resources', icon: MessageSquare, color: '#f59e0b', badge: 'Orange' }
];

const CHANNELS = ['#react', '#ai-dev', '#general-chat', '#backend-node', '#database-sql'];

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
      {/* 3-Column Layout matching forum_preview.jpg */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 280px', gap: '22px', alignItems: 'start' }}>
        {/* Left Column: Categories & Channels */}
        <aside className="app-card" style={{ padding: '20px', position: 'sticky', top: '88px' }}>
          {/* Categories */}
          <div style={{ marginBottom: '22px' }}>
            <h4 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
              Categories
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: isActive ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                      border: isActive ? `1px solid ${cat.color}` : '1px solid transparent',
                      color: isActive ? '#fff' : 'var(--text-secondary)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '0.68rem',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        background: `${cat.color}20`,
                        color: cat.color,
                        fontWeight: 700
                      }}>
                        {cat.label}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                      {topics.filter(t => cat.id === 'Semua' || t.category === cat.id).length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* My Channels matching photo */}
          <div>
            <h4 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
              My Channels
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {CHANNELS.map((ch) => (
                <div
                  key={ch}
                  onClick={() => setSearchQuery(ch.replace('#', ''))}
                  style={{
                    fontSize: '0.82rem',
                    color: 'var(--text-secondary)',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <TagIcon size={12} style={{ color: 'var(--emerald)' }} />
                  <span>{ch}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Center Column: Discussions Feed & Thread View */}
        <div>
          {activeTopic ? (
            /* DETAIL THREAD VIEW */
            <div className="animate-fade-in">
              <button
                onClick={() => setSearchParams({})}
                className="btn-secondary"
                style={{ padding: '7px 14px', fontSize: '0.82rem', marginBottom: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <ArrowLeft size={14} />
                <span>Back to Discussions</span>
              </button>

              <div className="app-card" style={{ padding: '24px', marginBottom: '18px', borderLeft: `4px solid ${getCategoryColor(activeTopic.category)}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <span style={{
                      fontSize: '0.72rem',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${getCategoryColor(activeTopic.category)}`,
                      color: getCategoryColor(activeTopic.category),
                      fontWeight: 700,
                      display: 'inline-block',
                      marginBottom: '8px'
                    }}>
                      {activeTopic.category}
                    </span>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', lineHeight: '1.3' }}>
                      {activeTopic.title}
                    </h2>
                  </div>

                  {currentUsername?.toLowerCase() === activeTopic.user?.username?.toLowerCase() && (
                    <button
                      onClick={() => handleDeleteTopic(activeTopic.id)}
                      className="btn-secondary"
                      style={{ color: 'var(--rose)', borderColor: 'rgba(244, 63, 94, 0.3)', padding: '5px 10px', fontSize: '0.76rem' }}
                    >
                      <Trash2 size={13} />
                      <span>Hapus</span>
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    color: '#040910'
                  }}>
                    {activeTopic.user?.username ? activeTopic.user.username.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <Link to={`/u/${activeTopic.user?.username}`} style={{ color: '#fff', fontWeight: 600, fontSize: '0.86rem', textDecoration: 'none' }}>
                      @{activeTopic.user?.username}
                    </Link>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                      {new Date(activeTopic.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                <div style={{ color: 'var(--text-primary)', fontSize: '0.92rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                  {activeTopic.content}
                </div>
              </div>

              {/* Replies */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>
                  Replies ({activeTopic.replies?.length || 0})
                </h4>

                {loadingDetail ? (
                  <p style={{ color: 'var(--text-tertiary)' }}>Memuat percakapan...</p>
                ) : (!activeTopic.replies || activeTopic.replies.length === 0) ? (
                  <div className="app-card" style={{ padding: '24px', textAlign: 'center', marginBottom: '14px' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem' }}>Belum ada balasan pada topik ini.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                    {activeTopic.replies.map((reply) => (
                      <div key={reply.id} className="chat-message-item" style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Link to={`/u/${reply.user?.username}`} style={{ color: '#fff', fontWeight: 700, fontSize: '0.84rem', textDecoration: 'none' }}>
                              @{reply.user?.username}
                            </Link>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                              {new Date(reply.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {currentUsername?.toLowerCase() === reply.user?.username?.toLowerCase() && (
                            <button
                              onClick={() => handleDeleteReply(reply.id)}
                              style={{ background: 'none', border: 'none', color: 'var(--rose)', cursor: 'pointer' }}
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                        <div style={{ color: 'var(--text-primary)', fontSize: '0.88rem', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                          {reply.content}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <form onSubmit={handleSendReply} className="chat-compose-card">
                  <textarea
                    className="chat-input"
                    placeholder={token ? 'Write a reply or code solution...' : 'Login to reply in discussion'}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    disabled={!token || submittingReply}
                    style={{ minHeight: '70px' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                    <button
                      type="submit"
                      className="btn-primary"
                      style={{ padding: '7px 18px', fontSize: '0.82rem' }}
                      disabled={!token || !replyContent.trim() || submittingReply}
                    >
                      <Send size={12} />
                      <span>{submittingReply ? 'Mengirim...' : 'Reply'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            /* TOPIC FEED matching forum_preview.jpg */
            <div>
              {/* Feed Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <div>
                  <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>
                    Community Discussions
                  </h2>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ background: '#10b981', color: '#030712', fontSize: '0.75rem', fontWeight: 800, padding: '3px 10px', borderRadius: '16px' }}>
                    Active threads
                  </span>
                  {token && (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="btn-primary"
                      style={{ padding: '7px 16px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Plus size={14} />
                      <span>New Thread</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Discussions List matching photo */}
              {loading ? (
                <div className="app-card" style={{ padding: '40px', textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-secondary)' }}>Loading community threads...</p>
                </div>
              ) : displayedTopics.length === 0 ? (
                <div className="app-card" style={{ padding: '48px 20px', textAlign: 'center' }}>
                  <MessageSquare size={36} style={{ color: 'var(--text-tertiary)', marginBottom: '10px' }} />
                  <h4 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 700, marginBottom: '4px' }}>No Discussions Found</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem' }}>Be the first to start a conversation in this category!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {displayedTopics.map((topic) => (
                    <div
                      key={topic.id}
                      onClick={() => setSearchParams({ topic: String(topic.id) })}
                      className="app-card highlight-hover animate-fade-in"
                      style={{
                        padding: '18px 20px',
                        cursor: 'pointer',
                        borderLeft: `3px solid ${getCategoryColor(topic.category)}`
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '14px' }}>
                        <div style={{ flex: 1 }}>
                          {/* Category Tag pill matching photo */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span style={{
                              fontSize: '0.7rem',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              background: `${getCategoryColor(topic.category)}20`,
                              border: `1px solid ${getCategoryColor(topic.category)}50`,
                              color: getCategoryColor(topic.category),
                              fontWeight: 700
                            }}>
                              {topic.category}
                            </span>
                            <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>
                              {new Date(topic.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>

                          <h3 style={{ fontSize: '1.12rem', fontWeight: 700, color: '#fff', marginBottom: '6px', lineHeight: '1.4' }}>
                            {topic.title}
                          </h3>

                          {/* Author info */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                            <div style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              color: '#040910'
                            }}>
                              {topic.author?.username?.charAt(0).toUpperCase()}
                            </div>
                            <span>{topic.author?.username}</span>
                            <span>•</span>
                            <span>Developer</span>
                          </div>
                        </div>

                        {/* Reply count pill matching photo */}
                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
                            {topic.replyCount}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>replies</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Active Discussions & Who's Online matching forum_preview.jpg */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '18px', position: 'sticky', top: '88px' }}>
          {/* Active Discussions Card */}
          <div className="app-card" style={{ padding: '18px' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TrendingUp size={14} style={{ color: 'var(--emerald)' }} />
              <span>Active Discussions</span>
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {topics.slice(0, 3).map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSearchParams({ topic: String(t.id) })}
                  style={{ cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '8px' }}
                >
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff', lineHeight: '1.3', marginBottom: '3px' }}>
                    {t.title}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                    by @{t.author?.username} • {t.replyCount} replies
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Who's Online Card matching photo */}
          <div className="app-card" style={{ padding: '18px' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>
              Who's Online
            </h4>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {['R', 'A', 'D', 'S', 'M'].map((letter, idx) => (
                <div
                  key={idx}
                  style={{
                    position: 'relative',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${idx % 2 === 0 ? '#10b981, #06b6d4' : '#3b82f6, #8b5cf6'})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    color: '#fff'
                  }}
                >
                  {letter}
                  <span style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: '#10b981',
                    border: '1.5px solid #080c14'
                  }} />
                </div>
              ))}
            </div>
          </div>

          {/* Live Chat Hub Info Box */}
          <div className="app-card" style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.04)', borderColor: 'rgba(16, 185, 129, 0.25)' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#34d399', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Flame size={13} />
              <span>Dev-Share Live Hub</span>
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Share knowledge, solve coding problems, and connect with other developers worldwide.
            </p>
          </div>
        </aside>
      </div>

      {/* Create Topic Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content animate-fade-in" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={18} style={{ color: 'var(--emerald)' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>Mulai Topik Diskusi Baru</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="modal-close-btn">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateTopic} style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                  Kategori Diskusi
                </label>
                <select
                  className="app-input"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  style={{ fontSize: '0.88rem' }}
                >
                  <option value="Tanya Jawab">Q&A / Debug Error</option>
                  <option value="Tips & Trik">Tips & Best Practice</option>
                  <option value="Showcase">Showcase Project & Code</option>
                  <option value="Umum">General Resources & Discussion</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                  Judul Topik
                </label>
                <input
                  type="text"
                  placeholder="Cth: Optimizing React Performance with Concurrent Mode"
                  className="app-input"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  style={{ fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                  Isi Pembahasan / Pertanyaan
                </label>
                <textarea
                  className="app-input"
                  placeholder="Tuliskan pertanyaan, konteks kode, atau topik yang ingin dibahas..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  required
                  rows={5}
                  style={{ resize: 'vertical', fontSize: '0.88rem', lineHeight: '1.5' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
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
                  style={{ padding: '8px 20px' }}
                  disabled={submittingTopic || !newTitle.trim() || !newContent.trim()}
                >
                  {submittingTopic ? 'Mempublikasikan...' : 'Publikasikan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
