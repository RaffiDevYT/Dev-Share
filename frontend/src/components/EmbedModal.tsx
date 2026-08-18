import { useState } from 'react';
import { X, Code2, Link as LinkIcon, FileText, Check, Copy } from 'lucide-react';
import { API_URL } from '../config/api';

interface EmbedModalProps {
  id: number;
  title: string;
  onClose: () => void;
}

export default function EmbedModal({ id, title, onClose }: EmbedModalProps) {
  const [activeTab, setActiveTab] = useState<'raw' | 'markdown' | 'iframe'>('raw');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const rawUrl = `${API_URL}/snippets/${id}/raw`;
  const snippetUrl = `${window.location.origin}/snippet/${id}`;

  const markdownSnippet = `[![Dev-Share Snippet](https://img.shields.io/badge/Dev--Share-${encodeURIComponent(title)}-10b981?style=flat-square&logo=code)](${snippetUrl})`;
  
  const iframeSnippet = `<iframe src="${snippetUrl}" width="100%" height="450" frameborder="0" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; overflow: hidden;" title="${title}"></iframe>`;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Tautan/Kode embed berhasil disalin!' }));
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content animate-fade-in"
        style={{ maxWidth: '640px', width: '92vw', padding: '24px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: 'var(--emerald-subtle)', color: 'var(--emerald)', padding: '6px', borderRadius: '8px' }}>
              <Code2 size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>Bagikan & Sematkan (Embed)</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Sematkan cuplikan kode ke blog, Notion, atau README</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '6px', borderRadius: '8px' }}>
            <X size={16} />
          </button>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px', marginBottom: '18px' }}>
          <button
            onClick={() => setActiveTab('raw')}
            className={`btn-secondary ${activeTab === 'raw' ? 'active' : ''}`}
            style={{
              background: activeTab === 'raw' ? 'var(--emerald-subtle)' : 'transparent',
              borderColor: activeTab === 'raw' ? 'rgba(16, 185, 129, 0.4)' : 'transparent',
              color: activeTab === 'raw' ? '#34d399' : 'var(--text-secondary)',
              fontSize: '0.82rem',
              padding: '5px 12px'
            }}
          >
            <FileText size={13} />
            <span>Raw Code URL</span>
          </button>

          <button
            onClick={() => setActiveTab('markdown')}
            className={`btn-secondary ${activeTab === 'markdown' ? 'active' : ''}`}
            style={{
              background: activeTab === 'markdown' ? 'var(--emerald-subtle)' : 'transparent',
              borderColor: activeTab === 'markdown' ? 'rgba(16, 185, 129, 0.4)' : 'transparent',
              color: activeTab === 'markdown' ? '#34d399' : 'var(--text-secondary)',
              fontSize: '0.82rem',
              padding: '5px 12px'
            }}
          >
            <LinkIcon size={13} />
            <span>Markdown Badge</span>
          </button>

          <button
            onClick={() => setActiveTab('iframe')}
            className={`btn-secondary ${activeTab === 'iframe' ? 'active' : ''}`}
            style={{
              background: activeTab === 'iframe' ? 'var(--emerald-subtle)' : 'transparent',
              borderColor: activeTab === 'iframe' ? 'rgba(16, 185, 129, 0.4)' : 'transparent',
              color: activeTab === 'iframe' ? '#34d399' : 'var(--text-secondary)',
              fontSize: '0.82rem',
              padding: '5px 12px'
            }}
          >
            <Code2 size={13} />
            <span>HTML Iframe</span>
          </button>
        </div>

        {/* Content based on Tab */}
        {activeTab === 'raw' && (
          <div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
              Endpoint teks murni (plain text) langsung tanpa wrapper HTML untuk curl atau script otomatis:
            </p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              <input
                type="text"
                readOnly
                value={rawUrl}
                className="app-input"
                style={{ fontSize: '0.82rem', fontFamily: 'monospace' }}
              />
              <button
                onClick={() => handleCopy(rawUrl, 'raw')}
                className="btn-primary"
                style={{ padding: '0 14px', flexShrink: 0 }}
              >
                {copiedKey === 'raw' ? <Check size={14} /> : <Copy size={14} />}
                <span>Salin</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'markdown' && (
          <div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
              Tempelkan badge ini pada file <code>README.md</code> GitHub atau dokumentasi proyek Anda:
            </p>
            <textarea
              readOnly
              rows={3}
              value={markdownSnippet}
              className="app-input"
              style={{ fontSize: '0.82rem', fontFamily: 'monospace', marginBottom: '10px', resize: 'none' }}
            />
            <button
              onClick={() => handleCopy(markdownSnippet, 'markdown')}
              className="btn-primary"
              style={{ padding: '6px 14px', fontSize: '0.82rem' }}
            >
              {copiedKey === 'markdown' ? <Check size={14} /> : <Copy size={14} />}
              <span>Salin Markdown</span>
            </button>
          </div>
        )}

        {activeTab === 'iframe' && (
          <div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
              Sematkan widget interaktif snippet langsung ke blog WordPress, Medium, atau website HTML:
            </p>
            <textarea
              readOnly
              rows={3}
              value={iframeSnippet}
              className="app-input"
              style={{ fontSize: '0.82rem', fontFamily: 'monospace', marginBottom: '10px', resize: 'none' }}
            />
            <button
              onClick={() => handleCopy(iframeSnippet, 'iframe')}
              className="btn-primary"
              style={{ padding: '6px 14px', fontSize: '0.82rem' }}
            >
              {copiedKey === 'iframe' ? <Check size={14} /> : <Copy size={14} />}
              <span>Salin Kode Iframe</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
