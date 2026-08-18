import { useState, useEffect, useMemo } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Save,
  ArrowLeft,
  AlertTriangle,
  Code2,
  Globe,
  Lock,
  FileCode,
  Tag as TagIcon,
  Folder as FolderIcon,
  ShieldAlert,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { API_URL } from '../config/api';

const COMMON_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'php', label: 'PHP' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'csharp', label: 'C#' },
  { value: 'cpp', label: 'C++' },
  { value: 'java', label: 'Java' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'sql', label: 'SQL' },
  { value: 'bash', label: 'Bash / Shell' }
];

const SUGGESTED_FOLDERS = [
  'Backend Helpers',
  'Frontend Components',
  'Database Queries',
  'DevOps & Docker',
  'Auth & Security',
  'Algorithms',
  'Utilities'
];

const SECRET_PATTERNS = [
  { name: 'OpenAI API Key', regex: /sk-[a-zA-Z0-9_\-]{20,}/ },
  { name: 'GitHub Token', regex: /(ghp|gho|ghu|ghs|ghr)_[a-zA-Z0-9]{30,}/ },
  { name: 'AWS Access Key', regex: /AKIA[0-9A-Z]{16}/ },
  { name: 'Private Key', regex: /-----BEGIN (?:[A-Z]+ )?PRIVATE KEY-----/ },
  { name: 'JWT Secret Token', regex: /eyJ[a-zA-Z0-9_\-]{15,}\.eyJ[a-zA-Z0-9_\-]{15,}\.[a-zA-Z0-9_\-]+/ },
  { name: 'Password plaintext', regex: /(?:password|passwd|pwd|db_pass)\s*[:=]\s*['"][a-zA-Z0-9@#$%^&*!_+=-]{6,}['"]/i }
];

export default function SnippetForm() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [codeContent, setCodeContent] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [customLanguage, setCustomLanguage] = useState('');
  const [isCustomLanguage, setIsCustomLanguage] = useState(false);
  const [tags, setTags] = useState('');
  const [folder, setFolder] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    if (isEditMode) {
      fetchSnippetDetails();
    }
  }, [id, token]);

  const detectedSecret = useMemo(() => {
    if (!codeContent) return null;
    for (const rule of SECRET_PATTERNS) {
      if (rule.regex.test(codeContent)) {
        return rule.name;
      }
    }
    return null;
  }, [codeContent]);

  const lineCount = useMemo(() => {
    return codeContent ? codeContent.split('\n').length : 0;
  }, [codeContent]);

  const charCount = useMemo(() => {
    return codeContent ? codeContent.length : 0;
  }, [codeContent]);

  const fetchSnippetDetails = async () => {
    setFetching(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/snippets/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil data snippet');
      }

      const data = await response.json();
      setTitle(data.title);
      setDescription(data.description || '');
      setCodeContent(data.codeContent);
      
      const foundLang = COMMON_LANGUAGES.find(l => l.value === data.language.toLowerCase());
      if (foundLang) {
        setLanguage(foundLang.value);
        setIsCustomLanguage(false);
      } else {
        setLanguage('other');
        setCustomLanguage(data.language);
        setIsCustomLanguage(true);
      }

      setTags(data.tags || '');
      setFolder(data.folder || '');
      setIsPublic(data.isPublic);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memuat snippet');
    } finally {
      setFetching(false);
    }
  };

  const handleLanguageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setLanguage(val);
    if (val === 'other') {
      setIsCustomLanguage(true);
    } else {
      setIsCustomLanguage(false);
      setCustomLanguage('');
    }
  };

  const handleAiAutoFill = async () => {
    if (!codeContent.trim()) {
      setError('Harap tempel atau ketik kode terlebih dahulu untuk menggunakan AI Auto-Fill');
      return;
    }

    setAiLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/ai/auto-metadata`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeContent })
      });

      if (!res.ok) throw new Error('Gagal menganalisis kode dengan AI');
      const data = await res.json();

      if (data.title && !title) setTitle(data.title);
      if (data.description && !description) setDescription(data.description);
      if (data.tags && !tags) setTags(data.tags);

      if (data.language) {
        const found = COMMON_LANGUAGES.find(l => l.value === data.language.toLowerCase());
        if (found) {
          setLanguage(found.value);
          setIsCustomLanguage(false);
        } else {
          setLanguage('other');
          setCustomLanguage(data.language);
          setIsCustomLanguage(true);
        }
      }

      window.dispatchEvent(new CustomEvent('show-toast', { detail: '✨ Metadata snippet berhasil diisi otomatis oleh AI!' }));
    } catch (err: any) {
      setError(err.message || 'Gagal memproses AI Auto-Fill');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const finalLanguage = isCustomLanguage ? customLanguage.trim() : language;

    if (!title.trim() || !codeContent.trim() || !finalLanguage) {
      setError('Judul, kode, dan bahasa pemrograman wajib diisi');
      return;
    }

    setLoading(true);

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      codeContent,
      language: finalLanguage.toLowerCase(),
      tags: tags.trim() || null,
      folder: folder.trim() || null,
      isPublic
    };

    try {
      const url = isEditMode 
        ? `${API_URL}/snippets/${id}` 
        : `${API_URL}/snippets`;

      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal menyimpan snippet');
      }

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: isEditMode ? 'Snippet berhasil diperbarui!' : 'Snippet berhasil dibuat!' 
      }));

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menyimpan data');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Memuat data snippet...</p>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '780px', margin: '0 auto' }}>
      <div style={{ marginBottom: '18px' }}>
        <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem' }}>
          <ArrowLeft size={15} />
          <span>Kembali ke Dashboard</span>
        </Link>
      </div>

      <div className="app-card neon-top-beam" style={{ padding: '32px 28px' }}>
        {/* Header Title */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: '44px', 
              height: '44px', 
              borderRadius: '12px', 
              background: 'var(--emerald-subtle)', 
              color: 'var(--emerald)',
              border: '1px solid rgba(16, 185, 129, 0.25)'
            }}>
              <Code2 size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>
                {isEditMode ? 'Edit Snippet Kode' : 'Buat Snippet Baru'}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                {isEditMode ? 'Perbarui detail potongan kode Anda' : 'Simpan potongan kode penting ke repositori Anda'}
              </p>
            </div>
          </div>

          {/* AI Auto-Fill Button */}
          <button
            type="button"
            onClick={handleAiAutoFill}
            disabled={aiLoading || !codeContent.trim()}
            className="btn-secondary"
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.15))',
              borderColor: 'rgba(16, 185, 129, 0.4)',
              color: '#34d399',
              padding: '7px 14px',
              fontSize: '0.82rem'
            }}
            title="Deteksi bahasa, buat judul, dan tag otomatis dari kode"
          >
            {aiLoading ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
            <span>{aiLoading ? 'Menganalisis...' : '✨ AI Auto-Fill'}</span>
          </button>
        </div>

        {error && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: 'rgba(244, 63, 94, 0.1)', 
            border: '1px solid rgba(244, 63, 94, 0.25)', 
            padding: '10px 14px', 
            borderRadius: '9px', 
            color: '#fda4af',
            fontSize: '0.82rem',
            marginBottom: '18px'
          }}>
            <AlertTriangle size={15} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Secret Scanner Warning */}
        {detectedSecret && (
          <div className="secret-alert-banner" style={{ marginBottom: '20px' }}>
            <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#f43f5e' }} />
            <div>
              <strong style={{ color: '#fff' }}>Peringatan Keamanan Terdeteksi!</strong>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem' }}>
                Kode Anda terdeteksi mengandung <strong>{detectedSecret}</strong>. Pastikan tidak membagikan kunci API rahasia atau kredensial sensitif ke publik.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Code Editor Container First for AI flow */}
          <div className="form-group">
            <label className="form-label" style={{ justifyContent: 'space-between' }}>
              <span>Konten Kode</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                {isCustomLanguage ? customLanguage.toUpperCase() || 'CODE' : language.toUpperCase()}
              </span>
            </label>

            <div className="code-wrapper" style={{ margin: 0 }}>
              <div className="code-header">
                <div className="window-dots">
                  <span className="window-dot" style={{ background: '#ff5f56' }} />
                  <span className="window-dot" style={{ background: '#ffbd2e' }} />
                  <span className="window-dot" style={{ background: '#27c93f' }} />
                </div>
                <span className="lang-pill">
                  {isCustomLanguage ? customLanguage.toUpperCase() || 'CUSTOM' : language.toUpperCase()}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>IDE Editor</span>
              </div>

              <textarea
                value={codeContent}
                onChange={(e) => setCodeContent(e.target.value)}
                placeholder="// Tempel atau ketik potongan kode Anda di sini..."
                style={{ 
                  width: '100%',
                  minHeight: '240px', 
                  fontFamily: "'JetBrains Mono', Consolas, monospace", 
                  fontSize: '0.88rem',
                  lineHeight: '1.6',
                  background: '#06090f',
                  color: '#e2e8f0',
                  border: 'none',
                  outline: 'none',
                  padding: '16px',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
                required
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 14px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '0.74rem', color: 'var(--text-tertiary)', fontFamily: "'JetBrains Mono', monospace" }}>
                <span>UTF-8</span>
                <span>{lineCount} Baris | {charCount} Karakter</span>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="form-label">
              <FileCode size={14} style={{ color: 'var(--emerald)' }} />
              <span>Judul Snippet</span>
            </label>
            <input
              type="text"
              className="app-input"
              placeholder="cth: Koneksi Prisma Database MySQL"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Deskripsi (Opsional)</label>
            <textarea
              className="app-input"
              placeholder="Jelaskan fungsi atau kegunaan potongan kode ini..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ minHeight: '65px', resize: 'vertical' }}
            />
          </div>

          {/* Language Selection */}
          <div style={{ display: 'grid', gridTemplateColumns: isCustomLanguage ? '1fr 1fr' : '1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Bahasa Pemrograman</label>
              <select
                className="app-input"
                value={language}
                onChange={handleLanguageChange}
                style={{ cursor: 'pointer' }}
              >
                {COMMON_LANGUAGES.map(lang => (
                  <option key={lang.value} value={lang.value}>{lang.label}</option>
                ))}
                <option value="other">Lainnya (Kustom)</option>
              </select>
            </div>

            {isCustomLanguage && (
              <div className="form-group">
                <label className="form-label">Nama Bahasa</label>
                <input
                  type="text"
                  className="app-input"
                  placeholder="cth: kotlin, rust, swift"
                  value={customLanguage}
                  onChange={(e) => setCustomLanguage(e.target.value)}
                  required={isCustomLanguage}
                />
              </div>
            )}
          </div>

          {/* Folder & Tags Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {/* Folder / Collection */}
            <div className="form-group">
              <label className="form-label">
                <FolderIcon size={13} style={{ color: 'var(--amber)' }} />
                <span>Folder / Koleksi (Opsional)</span>
              </label>
              <input
                type="text"
                className="app-input"
                placeholder="cth: Backend Helpers, Database"
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                list="suggested-folders"
              />
              <datalist id="suggested-folders">
                {SUGGESTED_FOLDERS.map(f => (
                  <option key={f} value={f} />
                ))}
              </datalist>
            </div>

            {/* Tags */}
            <div className="form-group">
              <label className="form-label">
                <TagIcon size={13} style={{ color: 'var(--cyan)' }} />
                <span>Tags (Pisahkan dengan koma)</span>
              </label>
              <input
                type="text"
                className="app-input"
                placeholder="cth: backend, database, mysql"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
          </div>

          {/* Visibility Control */}
          <div className="form-group">
            <label className="form-label">Pengaturan Visibilitas</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div 
                className={`toggle-option-card ${isPublic ? 'active' : ''}`}
                onClick={() => setIsPublic(true)}
              >
                <div style={{
                  padding: '7px',
                  borderRadius: '8px',
                  background: isPublic ? 'var(--emerald-subtle)' : 'rgba(255, 255, 255, 0.04)',
                  color: isPublic ? 'var(--emerald)' : 'var(--text-tertiary)'
                }}>
                  <Globe size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isPublic ? '#fff' : 'var(--text-secondary)' }}>
                    Publik
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                    Dapat dilihat & disalin oleh semua developer
                  </div>
                </div>
              </div>

              <div 
                className={`toggle-option-card ${!isPublic ? 'active' : ''}`}
                onClick={() => setIsPublic(false)}
              >
                <div style={{
                  padding: '7px',
                  borderRadius: '8px',
                  background: !isPublic ? 'var(--amber-subtle)' : 'rgba(255, 255, 255, 0.04)',
                  color: !isPublic ? 'var(--amber)' : 'var(--text-tertiary)'
                }}>
                  <Lock size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: !isPublic ? '#fff' : 'var(--text-secondary)' }}>
                    Privat
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                    Hanya dapat diakses oleh Anda
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <Link to="/dashboard" className="btn-secondary" style={{ padding: '9px 16px' }}>
              Batal
            </Link>
            <button type="submit" className="btn-primary" style={{ padding: '9px 22px' }} disabled={loading}>
              <Save size={16} />
              <span>{loading ? 'Menyimpan...' : 'Simpan Snippet'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
