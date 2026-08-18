import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  Code2,
  MessageSquare,
  Calendar,
  ExternalLink,
  Edit3,
  Check,
  Globe,
  Share2,
  MapPin,
  Sparkles,
  Layers,
  Search,
  CheckCircle2,
  Award,
  Flame,
  Zap,
  Clock,
  UserCheck
} from 'lucide-react';
import CodeBlock from '../components/CodeBlock';
import { API_URL } from '../config/api';

interface TopLanguage {
  language: string;
  count: number;
}

interface UserProfileData {
  id: number;
  username: string;
  bio: string | null;
  githubUrl: string | null;
  websiteUrl?: string | null;
  location?: string | null;
  skills?: string | null;
  createdAt: string;
  stats: {
    totalSnippets: number;
    totalStars: number;
    totalComments: number;
    topLanguages: TopLanguage[];
  };
  snippets: {
    id: number;
    title: string;
    description: string | null;
    codeContent: string;
    language: string;
    tags: string | null;
    folder: string | null;
    isPublic: boolean;
    createdAt: string;
    bookmarkCount: number;
    commentCount: number;
    user: {
      username: string;
    };
  }[];
}

const LANGUAGE_COLORS: Record<string, string> = {
  javascript: '#f7df1e',
  typescript: '#3178c6',
  python: '#3776ab',
  php: '#777bb4',
  html: '#e34f26',
  css: '#1572b6',
  sql: '#e38c00',
  bash: '#4eaa25',
  java: '#b07219',
  csharp: '#178600',
  cpp: '#f34b7d',
  go: '#00add8',
  rust: '#dea584'
};

export default function UserProfile() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active Tab: 'snippets' | 'stats'
  const [activeTab, setActiveTab] = useState<'snippets' | 'stats'>('snippets');

  // Snippets Filter & Search
  const [snippetSearch, setSnippetSearch] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');

  // Edit Profile form
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [bioInput, setBioInput] = useState('');
  const [githubInput, setGithubInput] = useState('');
  const [websiteInput, setWebsiteInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const currentUsername = localStorage.getItem('username');
  const token = localStorage.getItem('token');
  const isOwnProfile = currentUsername?.toLowerCase() === username?.toLowerCase();

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/users/${username}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error('Pengguna tidak ditemukan');
        throw new Error('Gagal memuat profil pengguna');
      }
      const data = await res.json();
      setProfile(data);
      setBioInput(data.bio || '');
      setGithubInput(data.githubUrl || '');
      setWebsiteInput(data.websiteUrl || '');
      setLocationInput(data.location || '');
      setSkillsInput(data.skills || '');
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memuat profil');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!token) return;
    setSavingProfile(true);
    try {
      const res = await fetch(`${API_URL}/users/profile/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bio: bioInput,
          githubUrl: githubInput,
          websiteUrl: websiteInput,
          location: locationInput,
          skills: skillsInput
        })
      });

      if (!res.ok) throw new Error('Gagal menyimpan profil');
      const data = await res.json();
      if (profile) {
        setProfile({
          ...profile,
          bio: data.user.bio,
          githubUrl: data.user.githubUrl,
          websiteUrl: data.user.websiteUrl,
          location: data.user.location,
          skills: data.user.skills
        });
      }
      setIsEditingProfile(false);
      window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Profil berhasil diperbarui!' }));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCopyProfileLink = () => {
    navigator.clipboard.writeText(window.location.href);
    window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Link profil developer berhasil disalin!' }));
  };

  // Filtered Snippets
  const filteredSnippets = useMemo(() => {
    if (!profile) return [];
    return profile.snippets.filter(s => {
      const matchesSearch = s.title.toLowerCase().includes(snippetSearch.toLowerCase()) ||
        (s.description && s.description.toLowerCase().includes(snippetSearch.toLowerCase())) ||
        (s.tags && s.tags.toLowerCase().includes(snippetSearch.toLowerCase()));
      const matchesLang = selectedLanguage === 'all' || s.language.toLowerCase() === selectedLanguage.toLowerCase();
      return matchesSearch && matchesLang;
    });
  }, [profile, snippetSearch, selectedLanguage]);

  // Available skills array
  const skillsArray = useMemo(() => {
    if (!profile?.skills) return [];
    return profile.skills.split(',').map(s => s.trim()).filter(Boolean);
  }, [profile?.skills]);

  // Unique Languages in user's snippets
  const uniqueLanguages = useMemo(() => {
    if (!profile) return [];
    const set = new Set<string>();
    profile.snippets.forEach(s => set.add(s.language.toLowerCase()));
    return Array.from(set);
  }, [profile]);

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div className="animate-spin" style={{ width: '36px', height: '36px', border: '3px solid rgba(16, 185, 129, 0.2)', borderTopColor: 'var(--emerald)', borderRadius: '50%' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Memuat profil developer...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div className="app-card" style={{ maxWidth: '500px', margin: '0 auto', borderColor: 'var(--rose)', padding: '36px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--rose-subtle)', color: 'var(--rose)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <UserCheck size={24} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px', color: '#fff' }}>Profil Tidak Ditemukan</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.9rem' }}>{error || 'Pengguna ini tidak terdaftar di sistem Dev-Share.'}</p>
          <Link to="/" className="btn-secondary" style={{ padding: '8px 18px' }}>Kembali ke Beranda</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in">
      {/* Hero Header Banner */}
      <div className="profile-hero">
        <div className="profile-hero-bg-glow" />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Avatar & Online status */}
            <div className="profile-avatar-wrapper">
              <div className="profile-avatar">
                {profile.username.charAt(0).toUpperCase()}
              </div>
              <div className="profile-status-indicator" title="Developer Aktif" />
            </div>

            {/* Profile Info */}
            <div style={{ maxWidth: '650px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
                  {profile.username}
                </h1>
                
                <span style={{
                  fontSize: '0.75rem',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2))',
                  color: '#34d399',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Zap size={12} fill="#34d399" />
                  {profile.stats.totalSnippets >= 10 ? 'Senior Architect' : profile.stats.totalSnippets >= 3 ? 'Code Contributor' : 'Developer'}
                </span>

                {isOwnProfile && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '4px' }}>
                    Akun Anda
                  </span>
                )}
              </div>

              {/* Bio */}
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '14px' }}>
                {profile.bio || (isOwnProfile ? 'Tulis bio developer Anda agar orang lain dapat mengenal Anda lebih dekat.' : 'Belum ada bio developer.')}
              </p>

              {/* Metadata tags */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', fontSize: '0.82rem', color: 'var(--text-tertiary)', marginBottom: '14px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <Calendar size={14} style={{ color: 'var(--emerald)' }} />
                  <span>Bergabung {new Date(profile.createdAt).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span>
                </span>

                {profile.location && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <MapPin size={14} style={{ color: '#f43f5e' }} />
                    <span>{profile.location}</span>
                  </span>
                )}

                {profile.websiteUrl && (
                  <a
                    href={profile.websiteUrl.startsWith('http') ? profile.websiteUrl : `https://${profile.websiteUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--cyan)', textDecoration: 'none' }}
                  >
                    <Globe size={14} />
                    <span>Website</span>
                  </a>
                )}

                {profile.githubUrl && (
                  <a
                    href={profile.githubUrl.startsWith('http') ? profile.githubUrl : `https://${profile.githubUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--emerald-light)', textDecoration: 'none' }}
                  >
                    <ExternalLink size={14} />
                    <span>GitHub</span>
                  </a>
                )}
              </div>

              {/* Skills Chips */}
              {skillsArray.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                  {skillsArray.map((skill, idx) => (
                    <span key={idx} className="skill-tag">
                      <Sparkles size={11} style={{ color: 'var(--emerald)' }} />
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Link
              to="/forum"
              className="btn-secondary"
              style={{ padding: '8px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Buka Forum Diskusi Komunitas"
            >
              <MessageSquare size={14} style={{ color: 'var(--emerald)' }} />
              <span>Forum Diskusi</span>
            </Link>

            <button
              onClick={handleCopyProfileLink}
              className="btn-secondary"
              style={{ padding: '8px 14px', fontSize: '0.82rem' }}
              title="Bagikan tautan profil ini"
            >
              <Share2 size={14} />
              <span>Bagikan</span>
            </button>

            {isOwnProfile && (
              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="btn-primary"
                style={{ padding: '8px 16px', fontSize: '0.82rem' }}
              >
                <Edit3 size={14} />
                <span>{isEditingProfile ? 'Tutup Edit' : 'Edit Profil'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Edit Form Drawer */}
        {isEditingProfile && (
          <div style={{
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-medium)',
            background: 'rgba(0, 0, 0, 0.25)',
            borderRadius: '12px',
            padding: '20px'
          }} className="animate-fade-in">
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Edit3 size={15} style={{ color: 'var(--emerald)' }} />
              <span>Perbarui Informasi Profil Anda</span>
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Bio Singkat</label>
                <input
                  type="text"
                  placeholder="Ceritakan tentang diri Anda & ketertarikan teknologi..."
                  className="app-input"
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  style={{ fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Lokasi / Domisili</label>
                <input
                  type="text"
                  placeholder="Cth: Jakarta, Indonesia"
                  className="app-input"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  style={{ fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>URL GitHub</label>
                <input
                  type="text"
                  placeholder="https://github.com/username"
                  className="app-input"
                  value={githubInput}
                  onChange={(e) => setGithubInput(e.target.value)}
                  style={{ fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Website / Portofolio</label>
                <input
                  type="text"
                  placeholder="https://portfolio.dev"
                  className="app-input"
                  value={websiteInput}
                  onChange={(e) => setWebsiteInput(e.target.value)}
                  style={{ fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Tech Stack / Keahlian (pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  placeholder="React, TypeScript, Node.js, Next.js, MySQL, TailwindCSS"
                  className="app-input"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  style={{ fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="btn-secondary"
                style={{ padding: '7px 14px', fontSize: '0.82rem' }}
              >
                Batal
              </button>
              <button
                onClick={handleSaveProfile}
                className="btn-primary"
                style={{ padding: '7px 18px', fontSize: '0.82rem' }}
                disabled={savingProfile}
              >
                <Check size={14} />
                <span>{savingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px',
          marginTop: '28px',
          paddingTop: '20px',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Snippet Publik</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <Code2 size={18} style={{ color: 'var(--emerald)' }} />
              <span>{profile.stats.totalSnippets}</span>
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Stars Diterima</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <Star size={18} fill="#fbbf24" />
              <span>{profile.stats.totalStars}</span>
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Komentar Snippet</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <MessageSquare size={18} />
              <span>{profile.stats.totalComments}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="profile-tab-bar">
        <button
          onClick={() => setActiveTab('snippets')}
          className={`profile-tab-btn ${activeTab === 'snippets' ? 'active' : ''}`}
        >
          <Globe size={16} />
          <span>Koleksi Snippet ({profile.snippets.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`profile-tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
        >
          <Award size={16} />
          <span>Statistik & Tech Stack</span>
        </button>
      </div>

      {/* TAB 1: SNIPPETS */}
      {activeTab === 'snippets' && (
        <div className="animate-fade-in">
          {/* Search & Language Filters */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
            <div style={{ position: 'relative', flex: '1', minWidth: '220px', maxWidth: '360px' }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                placeholder="Cari snippet developer ini..."
                className="app-input"
                style={{ paddingLeft: '36px', height: '38px', fontSize: '0.85rem' }}
                value={snippetSearch}
                onChange={(e) => setSnippetSearch(e.target.value)}
              />
            </div>

            {uniqueLanguages.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  onClick={() => setSelectedLanguage('all')}
                  className={`btn-secondary ${selectedLanguage === 'all' ? 'active' : ''}`}
                  style={{ padding: '6px 12px', fontSize: '0.78rem', borderRadius: '8px' }}
                >
                  Semua ({profile.snippets.length})
                </button>
                {uniqueLanguages.map(lang => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLanguage(lang)}
                    className={`btn-secondary ${selectedLanguage === lang ? 'active' : ''}`}
                    style={{
                      padding: '6px 12px',
                      fontSize: '0.78rem',
                      borderRadius: '8px',
                      borderColor: selectedLanguage === lang ? 'var(--emerald)' : undefined,
                      color: selectedLanguage === lang ? '#34d399' : undefined
                    }}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
          </div>

          {filteredSnippets.length === 0 ? (
            <div className="app-card" style={{ padding: '48px', textAlign: 'center' }}>
              <Code2 size={40} style={{ color: 'var(--text-tertiary)', marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
                {snippetSearch || selectedLanguage !== 'all' ? 'Tidak ada snippet yang sesuai filter' : 'Belum Ada Snippet Publik'}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                {snippetSearch || selectedLanguage !== 'all'
                  ? 'Coba ganti kata kunci atau pilih semua bahasa pemrograman.'
                  : 'Developer ini belum membagikan snippet publik ke komunitas.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {filteredSnippets.map((snippet) => (
                <article key={snippet.id} className="snippet-article animate-fade-in">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '14px', marginBottom: '10px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
                        <Link to={`/snippet/${snippet.id}`} style={{ color: '#fff', textDecoration: 'none' }}>
                          {snippet.title}
                        </Link>
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} />
                          {new Date(snippet.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        {snippet.bookmarkCount > 0 && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#fbbf24', fontWeight: 600 }}>
                            <Star size={12} fill="#fbbf24" /> {snippet.bookmarkCount} Stars
                          </span>
                        )}
                        {snippet.commentCount > 0 && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#38bdf8' }}>
                            <MessageSquare size={12} /> {snippet.commentCount} Komentar
                          </span>
                        )}
                        {snippet.folder && (
                          <span style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem' }}>
                            📁 {snippet.folder}
                          </span>
                        )}
                      </div>
                    </div>

                    <Link to={`/snippet/${snippet.id}`} className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
                      Buka Detail
                    </Link>
                  </div>

                  {snippet.description && (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '14px' }}>
                      {snippet.description}
                    </p>
                  )}

                  <CodeBlock
                    id={snippet.id}
                    title={snippet.title}
                    code={snippet.codeContent}
                    language={snippet.language}
                    canFork={!isOwnProfile}
                    maxCollapsedLines={7}
                  />
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: STATS & TECH STACK */}
      {activeTab === 'stats' && (
        <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* Language Breakdown */}
          <div className="app-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} style={{ color: 'var(--emerald)' }} />
              <span>Distribusi Bahasa Pemrograman</span>
            </h3>

            {profile.stats.topLanguages.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Belum ada data bahasa pemrograman.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {profile.stats.topLanguages.map((l) => {
                  const total = profile.stats.totalSnippets || 1;
                  const percent = Math.round((l.count / total) * 100);
                  const color = LANGUAGE_COLORS[l.language.toLowerCase()] || '#10b981';

                  return (
                    <div key={l.language}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: '5px' }}>
                        <span style={{ fontWeight: 600, color: '#fff', textTransform: 'uppercase' }}>{l.language}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{l.count} snippet ({percent}%)</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${percent}%`,
                            height: '100%',
                            background: color,
                            borderRadius: '4px',
                            transition: 'width 0.6s ease'
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Developer Achievements & Badges */}
          <div className="app-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={18} style={{ color: '#fbbf24' }} />
              <span>Lencana & Pencapaian Developer</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center', padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--emerald-subtle)', color: 'var(--emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Flame size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>Pembuat Snippet Aktif</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Telah mempublikasikan {profile.stats.totalSnippets} snippet berkualitas</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px', alignItems: 'center', padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--amber-subtle)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Star size={20} fill="#fbbf24" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>Star Collector</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Menerima total {profile.stats.totalStars} bintang dari komunitas</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px', alignItems: 'center', padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>Developer Terverifikasi</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Akun developer aktif dan terhubung di platform Dev-Share</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
