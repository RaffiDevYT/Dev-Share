import { useState } from 'react';
import { Sparkles, X, Brain, Zap, ArrowRightLeft, Copy, Check, RefreshCw } from 'lucide-react';
import { API_URL } from '../config/api';

interface AIAssistantModalProps {
  code: string;
  language: string;
  onClose: () => void;
  onApplyCode?: (newCode: string, newLanguage?: string) => void;
}

const SUPPORTED_LANGUAGES = [
  { id: 'javascript', name: 'JavaScript' },
  { id: 'typescript', name: 'TypeScript' },
  { id: 'python', name: 'Python' },
  { id: 'php', name: 'PHP' },
  { id: 'go', name: 'Go' },
  { id: 'rust', name: 'Rust' },
  { id: 'java', name: 'Java' },
  { id: 'cpp', name: 'C++' },
  { id: 'sql', name: 'SQL' }
];

export default function AIAssistantModal({ code, language, onClose, onApplyCode }: AIAssistantModalProps) {
  const [activeTab, setActiveTab] = useState<'explain' | 'optimize' | 'translate'>('explain');
  const [targetLang, setTargetLang] = useState('python');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [explainResult, setExplainResult] = useState<string | null>(null);
  const [optimizeResult, setOptimizeResult] = useState<{ result: string; optimizedCode?: string } | null>(null);
  const [translateResult, setTranslateResult] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Teks berhasil disalin ke clipboard!' }));
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleExplain = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/ai/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language })
      });
      if (!res.ok) throw new Error('Gagal menganalisis kode');
      const data = await res.json();
      setExplainResult(data.explanation);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memproses penjelasan');
    } finally {
      setLoading(false);
    }
  };

  const handleOptimize = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/ai/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language })
      });
      if (!res.ok) throw new Error('Gagal mengoptimasi kode');
      const data = await res.json();
      setOptimizeResult({ result: data.result, optimizedCode: data.optimizedCode });
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memproses optimasi');
    } finally {
      setLoading(false);
    }
  };

  const handleTranslate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/ai/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, fromLanguage: language, toLanguage: targetLang })
      });
      if (!res.ok) throw new Error('Gagal mengonversi kode');
      const data = await res.json();
      setTranslateResult(data.translatedCode);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memproses translasi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content animate-fade-in"
        style={{ maxWidth: '780px', width: '92vw', padding: '24px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #10b981, #06b6d4)',
              padding: '6px',
              borderRadius: '8px',
              color: '#030712'
            }}>
              <Sparkles size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>AI Code Assistant</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Analisis, optimasi, dan terjemahkan kode secara instan</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '6px', borderRadius: '8px' }}>
            <X size={16} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '10px',
          marginBottom: '18px'
        }}>
          <button
            onClick={() => setActiveTab('explain')}
            className={`btn-secondary ${activeTab === 'explain' ? 'active' : ''}`}
            style={{
              background: activeTab === 'explain' ? 'var(--emerald-subtle)' : 'transparent',
              borderColor: activeTab === 'explain' ? 'rgba(16, 185, 129, 0.4)' : 'transparent',
              color: activeTab === 'explain' ? '#34d399' : 'var(--text-secondary)',
              fontSize: '0.82rem',
              padding: '6px 12px'
            }}
          >
            <Brain size={14} />
            <span>Jelaskan Kode</span>
          </button>

          <button
            onClick={() => setActiveTab('optimize')}
            className={`btn-secondary ${activeTab === 'optimize' ? 'active' : ''}`}
            style={{
              background: activeTab === 'optimize' ? 'var(--emerald-subtle)' : 'transparent',
              borderColor: activeTab === 'optimize' ? 'rgba(16, 185, 129, 0.4)' : 'transparent',
              color: activeTab === 'optimize' ? '#34d399' : 'var(--text-secondary)',
              fontSize: '0.82rem',
              padding: '6px 12px'
            }}
          >
            <Zap size={14} />
            <span>Optimalkan & Refactor</span>
          </button>

          <button
            onClick={() => setActiveTab('translate')}
            className={`btn-secondary ${activeTab === 'translate' ? 'active' : ''}`}
            style={{
              background: activeTab === 'translate' ? 'var(--emerald-subtle)' : 'transparent',
              borderColor: activeTab === 'translate' ? 'rgba(16, 185, 129, 0.4)' : 'transparent',
              color: activeTab === 'translate' ? '#34d399' : 'var(--text-secondary)',
              fontSize: '0.82rem',
              padding: '6px 12px'
            }}
          >
            <ArrowRightLeft size={14} />
            <span>Konversi Bahasa</span>
          </button>
        </div>

        {/* Tab 1: Explain */}
        {activeTab === 'explain' && (
          <div>
            {!explainResult ? (
              <div style={{ textAlign: 'center', padding: '30px 20px' }}>
                <Brain size={36} style={{ color: 'var(--emerald)', marginBottom: '10px' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '6px' }}>Pahami Alur Kerja Snippet</h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 16px' }}>
                  AI akan menguraikan tujuan fungsi, alur eksekusi, serta perkiraan kompleksitas waktu (time complexity).
                </p>
                <button
                  onClick={handleExplain}
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  <span>{loading ? 'Sedang Menganalisis...' : 'Mulai Analisis Kode'}</span>
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Hasil Penjelasan:</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={handleExplain}
                      className="btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      disabled={loading}
                    >
                      <RefreshCw size={11} />
                      <span>Analisis Ulang</span>
                    </button>
                    <button
                      onClick={() => handleCopy(explainResult, 'explain')}
                      className="btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                    >
                      {copiedKey === 'explain' ? <Check size={11} /> : <Copy size={11} />}
                      <span>Salin</span>
                    </button>
                  </div>
                </div>
                <div style={{
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: '10px',
                  padding: '16px',
                  border: '1px solid var(--border-subtle)',
                  maxHeight: '340px',
                  overflowY: 'auto',
                  fontSize: '0.86rem',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap'
                }}>
                  {explainResult}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Optimize */}
        {activeTab === 'optimize' && (
          <div>
            {!optimizeResult ? (
              <div style={{ textAlign: 'center', padding: '30px 20px' }}>
                <Zap size={36} style={{ color: 'var(--amber)', marginBottom: '10px' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '6px' }}>Optimalkan Performa & Kerapian</h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 16px' }}>
                  Dapatkan rekomendasi refactoring, perbaikan potensi bug, dan standarisasi sintaksis modern.
                </p>
                <button
                  onClick={handleOptimize}
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
                  <span>{loading ? 'Mengoptimalkan...' : 'Optimalkan Kode'}</span>
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Rekomendasi Optimasi:</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {onApplyCode && optimizeResult.optimizedCode && (
                      <button
                        onClick={() => {
                          onApplyCode(optimizeResult.optimizedCode!);
                          onClose();
                        }}
                        className="btn-primary"
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      >
                        <Check size={11} />
                        <span>Terapkan Kode</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleCopy(optimizeResult.result, 'optimize')}
                      className="btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                    >
                      {copiedKey === 'optimize' ? <Check size={11} /> : <Copy size={11} />}
                      <span>Salin</span>
                    </button>
                  </div>
                </div>
                <div style={{
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: '10px',
                  padding: '16px',
                  border: '1px solid var(--border-subtle)',
                  maxHeight: '340px',
                  overflowY: 'auto',
                  fontSize: '0.86rem',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap'
                }}>
                  {optimizeResult.result}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Translate */}
        {activeTab === 'translate' && (
          <div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Konversi dari <strong>{language.toUpperCase()}</strong> ke:</span>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="app-input"
                style={{ width: '160px', padding: '6px 10px', fontSize: '0.82rem' }}
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
              <button
                onClick={handleTranslate}
                className="btn-primary"
                style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                disabled={loading}
              >
                {loading ? <RefreshCw size={13} className="animate-spin" /> : <ArrowRightLeft size={13} />}
                <span>{loading ? 'Menerjemahkan...' : 'Konversi'}</span>
              </button>
            </div>

            {translateResult && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 600 }}>Kode Hasil Konversi ({targetLang.toUpperCase()}):</span>
                  <button
                    onClick={() => handleCopy(translateResult, 'translate')}
                    className="btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                  >
                    {copiedKey === 'translate' ? <Check size={11} /> : <Copy size={11} />}
                    <span>Salin Kode</span>
                  </button>
                </div>
                <div style={{
                  background: '#050912',
                  borderRadius: '10px',
                  padding: '14px',
                  border: '1px solid var(--border-subtle)',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.82rem',
                  maxHeight: '300px',
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap'
                }}>
                  {translateResult}
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div style={{ marginTop: '14px', padding: '10px', background: 'var(--rose-subtle)', color: 'var(--rose)', borderRadius: '8px', fontSize: '0.82rem' }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
