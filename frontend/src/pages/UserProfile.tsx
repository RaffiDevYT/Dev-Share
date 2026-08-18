import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  ExternalLink,
  Edit3,
  Check,
  Globe,
  Share2,
  MapPin,
  Sparkles,
  GitFork,
  Activity,
  Plus,
  Terminal
} from 'lucide-react';
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

  // Available skills array
  const skillsArray = useMemo(() => {
    if (profile?.skills) {
      return profile.skills.split(',').map(s => s.trim()).filter(Boolean);
    }
    return ['React', 'TypeScript', 'Node.js', 'MySQL', 'Python', 'Docker'];
  }, [profile?.skills]);

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
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px', color: '#fff' }}>Profil Tidak Ditemukan</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.9rem' }}>{error || 'Pengguna ini tidak terdaftar di sistem Dev-Share.'}</p>
          <Link to="/" className="btn-secondary" style={{ padding: '8px 18px' }}>Kembali ke Beranda</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in">
      {/* 4-Card Multi Grid matching profile_preview.jpg */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(280px, 320px) 1fr 1fr',
        gap: '18px',
        marginBottom: '28px'
      }}>
        {/* Card 1: Developer Card with Avatar & Online Status */}
        <div className="app-card neon-top-beam" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            {/* Avatar with glowing ring */}
            <div style={{ position: 'relative' }}>
              <div style={{
                width: '76px',
                height: '76px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 800,
                color: '#030712',
                border: '3px solid #10b981',
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
              }}>
                {profile.username.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Online Status Pill */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              padding: '3px 9px',
              borderRadius: '20px',
              fontSize: '0.72rem',
              color: '#34d399',
              fontWeight: 700
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
              <span>ONLINE</span>
            </div>
          </div>

          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px', marginBottom: '2px' }}>
              {profile.username}
            </h2>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>@{profile.username}</span>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5' }}>
            {profile.bio || 'Full-Stack Developer & Open Source Enthusiast. Passionate about building scalable applications and sleek interfaces.'}
          </p>

          {/* Location & Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', color: 'var(--text-tertiary)', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={13} style={{ color: 'var(--text-secondary)' }} />
              <span>{profile.location || 'San Francisco, CA'}</span>
            </span>

            {profile.websiteUrl ? (
              <a href={profile.websiteUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--cyan)', textDecoration: 'none' }}>
                <Globe size={13} />
                <span>{profile.websiteUrl.replace(/https?:\/\//, '')}</span>
              </a>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--cyan)' }}>
                <Globe size={13} />
                <span>dev-share.io/{profile.username}</span>
              </span>
            )}

            {profile.githubUrl && (
              <a href={profile.githubUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--emerald-light)', textDecoration: 'none' }}>
                <ExternalLink size={13} />
                <span>GitHub Profile</span>
              </a>
            )}
          </div>

          {/* Profile Actions */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            {isOwnProfile && (
              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="btn-primary"
                style={{ flex: 1, padding: '7px 12px', fontSize: '0.8rem', justifyContent: 'center' }}
              >
                <Edit3 size={13} />
                <span>Edit Profile</span>
              </button>
            )}
            <button
              onClick={handleCopyProfileLink}
              className="btn-secondary"
              style={{ padding: '7px 12px', fontSize: '0.8rem' }}
              title="Bagikan Tautan Profil"
            >
              <Share2 size={13} />
            </button>
          </div>
        </div>

        {/* Right Side 3-Card Stack matching profile_preview.jpg */}
        <div style={{ gridColumn: '2 / -1', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Top Row: Tech Stack Card + Performance Metrics Card */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
            {/* Tech Stack Card */}
            <div className="app-card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Terminal size={15} style={{ color: 'var(--emerald)' }} />
                <span>Tech Stack</span>
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {skillsArray.map((skill, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      padding: '5px 12px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Sparkles size={11} style={{ color: 'var(--emerald)' }} />
                    <span>{skill}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Performance Metrics Card */}
            <div className="app-card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Activity size={15} style={{ color: 'var(--cyan)' }} />
                <span>Performance Metrics</span>
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Stars Received</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Star size={14} fill="#fbbf24" />
                    <span>{profile.stats.totalStars}</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Public Snippets</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--emerald)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>{profile.stats.totalSnippets}</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Discussions</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--cyan)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>{profile.stats.totalComments}</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Platform Repos</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#a78bfa', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>{profile.stats.totalSnippets}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Language Proficiency Card matching photo */}
          <div className="app-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Globe size={15} style={{ color: 'var(--emerald)' }} />
              <span>Language Proficiency</span>
            </h3>

            {profile.stats.topLanguages.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem' }}>Belum ada data bahasa pemrograman.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                {profile.stats.topLanguages.slice(0, 4).map((l) => {
                  const total = profile.stats.totalSnippets || 1;
                  const percent = Math.round((l.count / total) * 100);
                  const color = LANGUAGE_COLORS[l.language.toLowerCase()] || '#10b981';

                  return (
                    <div key={l.language}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, color: '#fff', textTransform: 'uppercase' }}>{l.language}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{percent}%</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '4px', overflow: 'hidden' }}>
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
        </div>
      </div>

      {/* Quick Edit Drawer */}
      {isEditingProfile && (
        <div className="app-card animate-fade-in" style={{ padding: '24px', marginBottom: '28px', background: 'rgba(0, 0, 0, 0.35)' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Edit3 size={16} style={{ color: 'var(--emerald)' }} />
            <span>Perbarui Profil & Portofolio Developer</span>
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
                placeholder="Cth: San Francisco, CA atau Jakarta"
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
                placeholder="React, TypeScript, Node.js, MySQL, Python, Docker, GraphQL"
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

      {/* Public Snippets Gallery Section matching profile_preview.jpg */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>
            Public Snippets Gallery ({profile.snippets.length})
          </h3>

          {isOwnProfile && (
            <Link
              to="/create"
              className="btn-primary"
              style={{ padding: '7px 16px', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={14} />
              <span>Add New Snippet</span>
            </Link>
          )}
        </div>

        {profile.snippets.length === 0 ? (
          <div className="app-card" style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)' }}>Developer ini belum membagikan snippet publik.</p>
          </div>
        ) : (
          /* 3-Column Card Grid matching profile_preview.jpg */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '18px' }}>
            {profile.snippets.map((snippet) => (
              <div key={snippet.id} className="app-card highlight-hover animate-fade-in" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  {/* Card Header: Title & Language */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', lineHeight: '1.4' }}>
                      <Link to={`/snippet/${snippet.id}`} style={{ color: '#fff', textDecoration: 'none' }}>
                        {snippet.title}
                      </Link>
                    </h4>
                    <span className="lang-pill" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                      {snippet.language}
                    </span>
                  </div>

                  {snippet.description && (
                    <p style={{
                      color: 'var(--text-secondary)',
                      fontSize: '0.82rem',
                      lineHeight: '1.5',
                      marginBottom: '12px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {snippet.description}
                    </p>
                  )}

                  {/* Code Snippet Preview Box matching photo */}
                  <div style={{
                    background: '#04070d',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.78rem',
                    color: '#34d399',
                    maxHeight: '110px',
                    overflow: 'hidden',
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.5',
                    marginBottom: '12px'
                  }}>
                    {snippet.codeContent.slice(0, 160)}
                    {snippet.codeContent.length > 160 && '...'}
                  </div>
                </div>

                {/* Footer: Tags & Metrics */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px', marginTop: '6px' }}>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {snippet.tags && snippet.tags.split(',').slice(0, 2).map((tag, idx) => (
                      <span key={idx} style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', background: 'rgba(255,255,255,0.04)', padding: '1px 6px', borderRadius: '4px' }}>
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#fbbf24' }}>
                      <Star size={11} fill="#fbbf24" />
                      <span>{snippet.bookmarkCount}</span>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--emerald)' }}>
                      <GitFork size={11} />
                      <span>Forks</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
