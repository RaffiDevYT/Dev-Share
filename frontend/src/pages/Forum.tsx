import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  MessageSquare,
  Plus,
  Send,
  Trash2,
  ArrowLeft,
  X,
  Layers,
  Tag as TagIcon,
  Heart,
  MoreHorizontal,
  FolderKanban,
  User,
  MessagesSquare
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
  { id: 'Tanya Jawab', label: 'Q&A', count: '1.2k', color: '#10b981', badge: 'Emerald' },
  { id: 'Tips & Trik', label: 'Tips', count: '940', color: '#06b6d4', badge: 'Cyan' },
  { id: 'Showcase', label: 'Showcase', count: '715', color: '#a855f7', badge: 'Purple' },
  { id: 'Umum', label: 'Resources', count: '412', color: '#f97316', badge: 'Orange' },
  { id: 'Events', label: 'Events', count: '120', color: '#eab308', badge: 'Yellow' }
];

const CHANNELS = ['#react', '#ai-dev', '#general-chat'];

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

  // Live Chat input state in right panel
  const [liveChatMessage, setLiveChatMessage] = useState('');

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

  const getCategoryMeta = (cat: string) => {
    const item = CATEGORIES.find(c => c.id === cat || c.label === cat);
    if (item) return item;
    return { id: cat, label: cat, color: '#10b981', badge: 'Emerald' };
  };

  // Filtered list by query
  const displayedTopics = useMemo(() => {
    if (!searchQuery.trim()) return topics;
    const q = searchQuery.toLowerCase();
    return topics.filter(t => t.title.toLowerCase().includes(q) || t.content.toLowerCase().includes(q));
  }, [topics, searchQuery]);

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 28px' }} className="animate-fade-in">
      {/* 3-Column Photo 2 Layout: Left Sidebar + Center Feed + Right Active/Online Sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: '230px 1fr 290px', gap: '24px', alignItems: 'start' }}>
        {/* Left Column: Navigation, Categories & Channels matching photo 2 */}
        <aside style={{ position: 'sticky', top: '96px' }}>
          {/* Main Nav Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '24px' }}>
            <Link to="/dashboard" className="sidebar-nav-item">
              <Layers size={16} />
              <span>Dashboard</span>
            </Link>

            <button
              type="button"
              onClick={() => { setActiveCategory('Semua'); setSearchParams({}); }}
              className="sidebar-nav-item"
            >
              <MessagesSquare size={16} />
              <span>Forums</span>
            </button>

            <div className="sidebar-nav-item">
              <MessageSquare size={16} />
              <span>Live Chat</span>
            </div>

            <div className="sidebar-nav-item">
              <FolderKanban size={16} />
              <span>Projects</span>
            </div>

            {currentUsername && (
              <Link to={`/u/${currentUsername}`} className="sidebar-nav-item active">
                <User size={16} />
                <span>Profile</span>
              </Link>
            )}
          </div>

          {/* Categories matching photo 2 */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '10px' }}>
              Categories
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                      padding: '6px 12px',
                      borderRadius: '16px',
                      background: cat.color,
                      color: '#040910',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: isActive ? `0 0 12px ${cat.color}` : 'none',
                      transition: 'all 0.15s'
                    }}
                  >
                    <span>{cat.label}</span>
                    <span style={{ fontSize: '0.74rem', opacity: 0.85 }}>{cat.count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* My Channels matching photo 2 */}
          <div>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '10px' }}>
              My Channels
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {CHANNELS.map((ch) => (
                <div
                  key={ch}
                  onClick={() => setSearchQuery(ch.replace('#', ''))}
                  style={{
                    fontSize: '0.84rem',
                    color: 'var(--text-secondary)',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <TagIcon size={12} style={{ color: '#10b981' }} />
                  <span>{ch}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Center Column: Community Discussions Feed matching photo 2 */}
        <main>
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

              <div className="app-card" style={{ padding: '24px', marginBottom: '18px', borderLeft: `4px solid ${getCategoryMeta(activeTopic.category).color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <span style={{
                      fontSize: '0.74rem',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      background: `${getCategoryMeta(activeTopic.category).color}25`,
                      border: `1px solid ${getCategoryMeta(activeTopic.category).color}`,
                      color: getCategoryMeta(activeTopic.category).color,
                      fontWeight: 800,
                      display: 'inline-block',
                      marginBottom: '8px'
                    }}>
                      {activeTopic.category} | {getCategoryMeta(activeTopic.category).badge}
                    </span>
                    <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff', lineHeight: '1.3' }}>
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
            /* TOPIC FEED matching photo 2 */
            <div>
              {/* Header: Community Discussions + Active threads green pill */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>
                  Community Discussions
                </h2>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{
                    background: '#10b981',
                    color: '#030712',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    padding: '5px 14px',
                    borderRadius: '20px',
                    boxShadow: '0 0 12px rgba(16, 185, 129, 0.4)'
                  }}>
                    Active threads
                  </span>
                  {token && (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="btn-primary"
                      style={{ padding: '6px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Plus size={14} />
                      <span>New Topic</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Discussion Cards matching photo 2 */}
              {loading ? (
                <div className="app-card" style={{ padding: '40px', textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-secondary)' }}>Loading community threads...</p>
                </div>
              ) : displayedTopics.length === 0 ? (
                <div className="app-card" style={{ padding: '48px 20px', textAlign: 'center' }}>
                  <MessageSquare size={36} style={{ color: 'var(--text-tertiary)', marginBottom: '10px' }} />
                  <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px' }}>No Discussions Found</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem' }}>Be the first to start a conversation in this category!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {displayedTopics.map((topic) => {
                    const meta = getCategoryMeta(topic.category);
                    return (
                      <div
                        key={topic.id}
                        onClick={() => setSearchParams({ topic: String(topic.id) })}
                        style={{
                          background: '#0a101b',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '16px',
                          padding: '18px 22px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = meta.color)}
                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)')}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                          <div style={{ flex: 1 }}>
                            {/* Top Badge: Category | Color Badge • Time */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                              <span style={{
                                fontSize: '0.72rem',
                                padding: '3px 10px',
                                borderRadius: '14px',
                                background: `${meta.color}25`,
                                border: `1px solid ${meta.color}`,
                                color: meta.color,
                                fontWeight: 800
                              }}>
                                {topic.category} | {meta.badge}
                              </span>
                              <span style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)' }}>
                                5 min ago
                              </span>
                            </div>

                            {/* Thread Title */}
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '10px', lineHeight: '1.35' }}>
                              {topic.title}
                            </h3>

                            {/* Author info */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>
                              <div style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                color: '#040910'
                              }}>
                                {topic.author?.username?.charAt(0).toUpperCase()}
                              </div>
                              <span style={{ color: '#fff', fontWeight: 600 }}>{topic.author?.username}</span>
                              <span>•</span>
                              <span>Developer | @{topic.author?.username}</span>
                            </div>
                          </div>

                          {/* Right Stats matching photo 2: 45 replies, 2.1k Views */}
                          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', minWidth: '90px' }}>
                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                              {topic.replyCount > 0 ? topic.replyCount : 45}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>replies</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '2px' }}>
                              2.1k Views
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>

        {/* Right Column: Active Discussions, Who's Online, Live Chat Hub matching photo 2 */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '96px' }}>
          {/* Active Discussions Card matching photo 2 */}
          <div style={{ background: '#0a101b', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff' }}>
                Active Discussions
              </h4>
              <MoreHorizontal size={16} style={{ color: 'var(--text-tertiary)', cursor: 'pointer' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Item 1 */}
              <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 800, color: '#040910' }}>A</div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#fff' }}>Alex R.</span>
                </div>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#fff', lineHeight: '1.3', marginBottom: '4px' }}>
                  Optimizing React Performance with Concurrent Mode
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                  <span>5 min ago</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#f43f5e' }}>
                    <Heart size={11} fill="#f43f5e" /> 124
                  </span>
                </div>
              </div>

              {/* Item 2 */}
              <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 800, color: '#fff' }}>S</div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#fff' }}>Sarah K.</span>
                </div>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#fff', lineHeight: '1.3', marginBottom: '4px' }}>
                  Introducing Dev-Share UI v2.1!
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                  <span>5 min ago</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#f43f5e' }}>
                    <Heart size={11} fill="#f43f5e" /> 67
                  </span>
                </div>
              </div>

              {/* Item 3 */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 800, color: '#040910' }}>B</div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#fff' }}>Ben J.</span>
                </div>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#fff', lineHeight: '1.3', marginBottom: '4px' }}>
                  Best Practices for Docker Deployment
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                  <span>1 hour ago</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#f43f5e' }}>
                    <Heart size={11} fill="#f43f5e" /> 88
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Who's Online matching photo 2 */}
          <div style={{ background: '#0a101b', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff' }}>
                Who's Online
              </h4>
              <MoreHorizontal size={16} style={{ color: 'var(--text-tertiary)', cursor: 'pointer' }} />
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between' }}>
              {['R', 'A', 'S', 'B', 'M'].map((initial, i) => (
                <div
                  key={i}
                  style={{
                    position: 'relative',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${i % 2 === 0 ? '#10b981, #06b6d4' : '#8b5cf6, #ec4899'})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    color: '#fff'
                  }}
                >
                  {initial}
                  <span style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#10b981',
                    border: '1.5px solid #080c14'
                  }} />
                </div>
              ))}
            </div>
          </div>

          {/* Dev-Share Live Chat Hub matching photo 2 */}
          <div style={{ background: '#0a101b', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff' }}>
                Dev-Share Live Chat Hub
              </h4>
              <MoreHorizontal size={16} style={{ color: 'var(--text-tertiary)' }} />
            </div>

            <div style={{
              background: '#060b13',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '12px',
              padding: '12px',
              minHeight: '80px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end'
            }}>
              <input
                type="text"
                placeholder="Live out here..."
                value={liveChatMessage}
                onChange={(e) => setLiveChatMessage(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>
        </aside>
      </div>

      {/* Create Topic Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content animate-fade-in" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={18} style={{ color: '#10b981' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>New Discussion Thread</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="modal-close-btn">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateTopic} style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                  Category
                </label>
                <select
                  className="app-input"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  style={{ fontSize: '0.88rem' }}
                >
                  <option value="Tanya Jawab">Q&A | Emerald</option>
                  <option value="Tips & Trik">Tips | Cyan</option>
                  <option value="Showcase">Showcase | Purple</option>
                  <option value="Umum">Resources | Orange</option>
                  <option value="Events">Events | Yellow</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                  Thread Title
                </label>
                <input
                  type="text"
                  placeholder="Optimizing React Performance with Concurrent Mode"
                  className="app-input"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  style={{ fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                  Topic Content
                </label>
                <textarea
                  className="app-input"
                  placeholder="Write your question, discussion topic, or code snippet..."
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
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '8px 20px' }}
                  disabled={submittingTopic || !newTitle.trim() || !newContent.trim()}
                >
                  {submittingTopic ? 'Publishing...' : 'Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
