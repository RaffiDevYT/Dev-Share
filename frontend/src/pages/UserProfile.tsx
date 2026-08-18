import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  Edit3,
  Check,
  Globe,
  Share2,
  MapPin,
  GitFork,
  Activity,
  Plus,
  Mail,
  TrendingUp,
  Folder,
  Layers,
  Settings,
  Users
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

const TECH_STACK_ITEMS = [
  { name: 'React', icon: '⚛', color: '#61dafb' },
  { name: 'TypeScript', icon: 'TS', color: '#3178c6' },
  { name: 'Node.js', icon: '⬡', color: '#339933' },
  { name: 'MySQL', icon: '🐬', color: '#4479a1' },
  { name: 'Python', icon: '🐍', color: '#3776ab' },
  { name: 'GraphQL', icon: '◈', color: '#e535ab' },
  { name: 'Docker', icon: '🐳', color: '#2496ed' }
];

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

  // Custom skills or default
  const customSkills = useMemo(() => {
    if (profile?.skills) {
      return profile.skills.split(',').map(s => s.trim()).filter(Boolean);
    }
    return null;
  }, [profile?.skills]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <div className="animate-spin" style={{ width: '36px', height: '36px', border: '3px solid rgba(16, 185, 129, 0.2)', borderTopColor: 'var(--emerald)', borderRadius: '50%', margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Memuat dashboard profil developer...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div style={{ maxWidth: '500px', margin: '80px auto', textAlign: 'center' }}>
        <div className="app-card" style={{ padding: '36px', borderColor: 'var(--rose)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px', color: '#fff' }}>Profil Tidak Ditemukan</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>{error}</p>
          <Link to="/" className="btn-secondary">Kembali</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 28px' }} className="animate-fade-in">
      {/* 2-Column Photo 3 Layout: Left Sidebar + Right Multi-Card Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '28px', alignItems: 'start' }}>
        {/* Left Sidebar matching photo 3 */}
        <aside style={{ position: 'sticky', top: '96px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div className="sidebar-nav-item active">
              <Layers size={16} />
              <span>Dashboard</span>
            </div>

            <div className="sidebar-nav-item">
              <Folder size={16} />
              <span>Portfolio</span>
            </div>

            <Link to="/" className="sidebar-nav-item">
              <Layers size={16} />
              <span>Snippets</span>
            </Link>

            <div className="sidebar-nav-item">
              <Users size={16} />
              <span>Team</span>
            </div>

            <div className="sidebar-nav-item">
              <Activity size={16} />
              <span>Activity</span>
            </div>

            <div className="sidebar-nav-item" onClick={() => setIsEditingProfile(!isEditingProfile)}>
              <Settings size={16} />
              <span>Settings</span>
            </div>
          </div>

          <div>
            <div className="sidebar-nav-item">
              <Settings size={16} />
              <span>Settings</span>
            </div>
          </div>
        </aside>

        {/* Right Dashboard Area matching photo 3 */}
        <main>
          {/* Top 4-Card Grid matching photo 3 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '300px 1fr 1fr',
            gridTemplateRows: 'auto auto',
            gap: '18px',
            marginBottom: '28px'
          }}>
            {/* Card 1: Developer Profile Card (Span 2 rows on left) */}
            <div style={{
              gridRow: '1 / span 2',
              background: '#0a101b',
              border: '1.5px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 0 24px rgba(16, 185, 129, 0.08)'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  {/* Large Avatar with Green Glowing Ring */}
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.2rem',
                    fontWeight: 800,
                    color: '#030712',
                    border: '3px solid #10b981',
                    boxShadow: '0 0 20px rgba(16, 185, 129, 0.5)'
                  }}>
                    {profile.username.charAt(0).toUpperCase()}
                  </div>

                  {/* Online Status Pill */}
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: 'rgba(16, 185, 129, 0.12)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '0.72rem',
                    color: '#34d399',
                    fontWeight: 700
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
                    <span>ONLINE</span>
                  </div>
                </div>

                {/* Name & Handle */}
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px', marginBottom: '2px' }}>
                  {profile.username}
                </h2>
                <div style={{ fontSize: '0.84rem', color: 'var(--text-tertiary)', marginBottom: '12px' }}>
                  @{profile.username}
                </div>

                {/* Bio */}
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', lineHeight: '1.5', marginBottom: '16px' }}>
                  {profile.bio || 'Full-Stack Developer & Open Source Enthusiast. Passionate about building scalable applications and sleek interfaces.'}
                </p>

                {/* Location & Contact Meta */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', color: 'var(--text-tertiary)', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={14} style={{ color: 'var(--text-secondary)' }} />
                    <span>{profile.location || 'San Francisco, CA'}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--cyan)' }}>
                      <Globe size={14} />
                      <span>{profile.websiteUrl ? profile.websiteUrl.replace(/https?:\/\//, '') : `${profile.username}.dev`}</span>
                    </span>
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                      <Mail size={14} />
                      <span>Team</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action row */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
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

            {/* Card 2: Tech Stack (Top Middle) */}
            <div style={{
              gridColumn: '2 / span 2',
              background: '#0a101b',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '20px'
            }}>
              <h3 style={{ fontSize: '0.94rem', fontWeight: 700, color: '#fff', marginBottom: '14px' }}>
                Tech Stack
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {customSkills ? (
                  customSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: '#060b13',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        padding: '6px 14px',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        color: '#fff',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span style={{ color: '#10b981' }}>◈</span>
                      <span>{skill}</span>
                    </span>
                  ))
                ) : (
                  TECH_STACK_ITEMS.map((item) => (
                    <span
                      key={item.name}
                      style={{
                        background: '#060b13',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        padding: '6px 14px',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        color: '#fff',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>{item.icon}</span>
                      <span>{item.name}</span>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Card 3: Language Proficiency (Bottom Middle) */}
            <div style={{
              background: '#0a101b',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '20px'
            }}>
              <h3 style={{ fontSize: '0.94rem', fontWeight: 700, color: '#fff', marginBottom: '14px' }}>
                Language Proficiency
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { lang: 'Python', pct: '38%', color: '#10b981' },
                  { lang: 'TypeScript', pct: '28%', color: '#06b6d4' },
                  { lang: 'JavaScript', pct: '20%', color: '#10b981' },
                  { lang: 'SQL', pct: '14%', color: '#06b6d4' }
                ].map((item) => (
                  <div key={item.lang}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '3px' }}>
                      <span style={{ color: '#fff', fontWeight: 500 }}>{item.lang}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{item.pct}</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: item.pct, height: '100%', background: item.color, borderRadius: '4px' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 4: Performance Metrics (Bottom Right) */}
            <div style={{
              background: '#0a101b',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '20px'
            }}>
              <h3 style={{ fontSize: '0.94rem', fontWeight: 700, color: '#fff', marginBottom: '14px' }}>
                Performance Metrics
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {/* Stars Received */}
                <div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Stars Received</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
                    <span>2,104</span>
                    <TrendingUp size={16} style={{ color: '#10b981' }} />
                  </div>
                </div>

                {/* Contributions */}
                <div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Contributions</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
                    <span>184</span>
                    <span style={{ fontSize: '0.68rem', color: '#10b981' }}>this year</span>
                  </div>
                </div>

                {/* Followers */}
                <div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Followers</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
                    <span>958</span>
                    <TrendingUp size={16} style={{ color: '#10b981' }} />
                  </div>
                </div>

                {/* Repositories */}
                <div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Repositories</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
                    <span>56</span>
                    <Activity size={16} style={{ color: '#06b6d4' }} />
                  </div>
                </div>
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
                    placeholder="Ceritakan tentang diri Anda..."
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
                    placeholder="Cth: San Francisco, CA"
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
                    placeholder="https://alexdev.com"
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
                    placeholder="React, TypeScript, Node.js, MySQL, Python, Docker"
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

          {/* Public Snippets Gallery matching photo 3 */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>
                Public Snippets Gallery
              </h3>

              <Link
                to="/create"
                style={{
                  background: '#10b981',
                  color: '#030712',
                  padding: '7px 18px',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 0 14px rgba(16, 185, 129, 0.4)'
                }}
              >
                <Plus size={15} />
                <span>Add New Snippet</span>
              </Link>
            </div>

            {profile.snippets.length === 0 ? (
              <div style={{ background: '#0a101b', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)' }}>Developer ini belum membagikan snippet publik.</p>
              </div>
            ) : (
              /* 3-Column Card Grid matching photo 3 */
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
                {profile.snippets.map((snippet) => (
                  <div
                    key={snippet.id}
                    style={{
                      background: '#0a101b',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '16px',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div>
                      {/* Code Snippet Box matching photo 3 */}
                      <div style={{
                        background: '#060b13',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '10px',
                        padding: '12px 14px',
                        fontFamily: "'JetBrains Mono', Consolas, monospace",
                        fontSize: '0.8rem',
                        color: '#34d399',
                        maxHeight: '120px',
                        overflow: 'hidden',
                        lineHeight: '1.55',
                        marginBottom: '12px'
                      }}>
                        {snippet.codeContent.slice(0, 160)}
                      </div>

                      {/* Title & Description */}
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
                        <Link to={`/snippet/${snippet.id}`} style={{ color: '#fff', textDecoration: 'none' }}>
                          {snippet.title}
                        </Link>
                      </h4>

                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: '1.4', marginBottom: '14px' }}>
                        {snippet.description || 'Custom implementation ready to use in production applications.'}
                      </p>
                    </div>

                    <div>
                      {/* Tag Badge */}
                      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                        <span style={{
                          fontSize: '0.74rem',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: 'rgba(16, 185, 129, 0.12)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          color: '#34d399',
                          fontWeight: 700
                        }}>
                          {snippet.language}
                        </span>
                      </div>

                      {/* Stars / Forks Stats Footer */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.78rem', color: 'var(--text-tertiary)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Star size={12} fill="#fbbf24" style={{ color: '#fbbf24' }} />
                          <span>Stars</span>
                        </span>
                        <span>/</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <GitFork size={12} />
                          <span>Forks</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
