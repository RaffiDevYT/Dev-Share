import { useState, useMemo } from 'react';
import Prism from 'prismjs';
import {
  Copy,
  Check,
  Download,
  GitFork,
  ChevronDown,
  ChevronUp,
  Play,
  Terminal,
  Trash2,
  X,
  Sparkles,
  Camera,
  Star,
  Code2
} from 'lucide-react';
import ExportImageModal from './ExportImageModal';
import AIAssistantModal from './AIAssistantModal';
import EmbedModal from './EmbedModal';
import { API_URL } from '../config/api';

// Import Prism language components
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-markdown';

interface CodeBlockProps {
  id?: number;
  title?: string;
  code: string;
  language: string;
  canFork?: boolean;
  onForkSuccess?: () => void;
  maxCollapsedLines?: number;
  initialIsBookmarked?: boolean;
  initialBookmarkCount?: number;
  onCodeChange?: (newCode: string) => void;
}

const EXTENSION_MAP: Record<string, string> = {
  javascript: 'js',
  typescript: 'ts',
  python: 'py',
  php: 'php',
  html: 'html',
  css: 'css',
  sql: 'sql',
  bash: 'sh',
  c: 'c',
  cpp: 'cpp',
  csharp: 'cs',
  java: 'java',
  go: 'go',
  rust: 'rs',
  json: 'json',
  yaml: 'yaml',
  markdown: 'md'
};

interface ExecutionLog {
  type: 'log' | 'info' | 'warn' | 'error' | 'return';
  content: string;
}

export default function CodeBlock({
  id,
  title = 'snippet',
  code,
  language,
  canFork = false,
  onForkSuccess,
  maxCollapsedLines = 7,
  initialIsBookmarked = false,
  initialBookmarkCount = 0,
  onCodeChange
}: CodeBlockProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isForking, setIsForking] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Bookmarking state
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [bookmarkCount, setBookmarkCount] = useState(initialBookmarkCount);
  const [isBookmarking, setIsBookmarking] = useState(false);

  // Modals
  const [showImageExport, setShowImageExport] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showEmbedModal, setShowEmbedModal] = useState(false);

  // Code Runner States
  const [isRunning, setIsRunning] = useState(false);
  const [showRunner, setShowRunner] = useState(false);
  const [runnerLogs, setRunnerLogs] = useState<ExecutionLog[]>([]);
  const [execTime, setExecTime] = useState<number | null>(null);

  const normalizedLang = useMemo(() => {
    const l = language.toLowerCase();
    if (l === 'js') return 'javascript';
    if (l === 'ts') return 'typescript';
    if (l === 'py') return 'python';
    if (l === 'sh' || l === 'shell') return 'bash';
    return l;
  }, [language]);

  const isRunnable = normalizedLang === 'javascript' || normalizedLang === 'typescript' || normalizedLang === 'html';

  const highlightedCode = useMemo(() => {
    const grammar = Prism.languages[normalizedLang] || Prism.languages.javascript || Prism.languages.markup;
    try {
      return Prism.highlight(code, grammar, normalizedLang);
    } catch {
      return code;
    }
  }, [code, normalizedLang]);

  const lines = useMemo(() => code.split('\n'), [code]);
  const lineCount = lines.length;
  const shouldShowToggle = lineCount > maxCollapsedLines;
  
  const displayedHighlightedCode = useMemo(() => {
    if (isExpanded || !shouldShowToggle) {
      return highlightedCode;
    }
    const collapsedCode = lines.slice(0, maxCollapsedLines).join('\n');
    const grammar = Prism.languages[normalizedLang] || Prism.languages.javascript || Prism.languages.markup;
    try {
      return Prism.highlight(collapsedCode, grammar, normalizedLang);
    } catch {
      return collapsedCode;
    }
  }, [highlightedCode, isExpanded, shouldShowToggle, lines, maxCollapsedLines, normalizedLang]);

  const displayedLineCount = isExpanded || !shouldShowToggle ? lineCount : maxCollapsedLines;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Kode berhasil disalin ke clipboard!' }));
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = EXTENSION_MAP[normalizedLang] || 'txt';
    const cleanTitle = title.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    const filename = `${cleanTitle}.${ext}`;
    
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    window.dispatchEvent(new CustomEvent('show-toast', { detail: `File ${filename} berhasil diunduh!` }));
  };

  const handleBookmarkToggle = async () => {
    if (!id) return;
    const token = localStorage.getItem('token');
    if (!token) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Harap masuk log untuk menyimpan snippet ke bookmark' }));
      return;
    }

    setIsBookmarking(true);
    try {
      const res = await fetch(`${API_URL}/snippets/${id}/bookmark`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Gagal memperbarui bookmark');
      const data = await res.json();
      setIsBookmarked(data.isBookmarked);
      setBookmarkCount(prev => data.isBookmarked ? prev + 1 : Math.max(0, prev - 1));
      window.dispatchEvent(new CustomEvent('show-toast', { detail: data.message }));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsBookmarking(false);
    }
  };

  const handleFork = async () => {
    if (!id) return;
    const token = localStorage.getItem('token');
    if (!token) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Harap masuk log untuk melakukan fork snippet' }));
      return;
    }

    setIsForking(true);
    try {
      const response = await fetch(`${API_URL}/snippets/${id}/fork`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Gagal melakukan fork');
      }

      window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Snippet berhasil di-fork ke koleksi Anda!' }));
      if (onForkSuccess) onForkSuccess();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsForking(false);
    }
  };

  // Run in-browser code safely
  const handleRunCode = () => {
    setIsRunning(true);
    setShowRunner(true);
    const logs: ExecutionLog[] = [];
    const startTime = performance.now();

    try {
      const originalLog = console.log;
      const originalWarn = console.warn;
      const originalError = console.error;
      const originalInfo = console.info;

      const formatArg = (arg: any) => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg, null, 2);
          } catch {
            return String(arg);
          }
        }
        return String(arg);
      };

      console.log = (...args: any[]) => logs.push({ type: 'log', content: args.map(formatArg).join(' ') });
      console.info = (...args: any[]) => logs.push({ type: 'info', content: args.map(formatArg).join(' ') });
      console.warn = (...args: any[]) => logs.push({ type: 'warn', content: args.map(formatArg).join(' ') });
      console.error = (...args: any[]) => logs.push({ type: 'error', content: args.map(formatArg).join(' ') });

      let runnableCode = code
        .replace(/export\s+default\s+/g, '')
        .replace(/export\s+(const|let|var|function|class)\s+/g, '$1 ')
        .replace(/import\s+.*?from\s+['"].*?['"];?/g, '');

      const runnerFunc = new Function(runnableCode);
      const result = runnerFunc();

      if (result !== undefined) {
        logs.push({ type: 'return', content: `=> Return: ${formatArg(result)}` });
      }

      console.log = originalLog;
      console.info = originalInfo;
      console.warn = originalWarn;
      console.error = originalError;

      if (logs.length === 0) {
        logs.push({ type: 'info', content: '✓ Kode selesai dieksekusi tanpa pesan log.' });
      }
    } catch (err: any) {
      logs.push({ type: 'error', content: `Runtime Error: ${err.message}` });
    }

    const endTime = performance.now();
    setExecTime(Math.round((endTime - startTime) * 100) / 100);
    setRunnerLogs(logs);
    setIsRunning(false);
  };

  return (
    <>
      <div className="code-wrapper">
        {/* Code Header */}
        <div className="code-header">
          <div className="window-dots">
            <span className="window-dot" style={{ background: '#ff5f56' }} />
            <span className="window-dot" style={{ background: '#ffbd2e' }} />
            <span className="window-dot" style={{ background: '#27c93f' }} />
          </div>

          <span className="lang-pill">{language}</span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
            {/* Live Runner Button */}
            {isRunnable && (
              <button 
                onClick={handleRunCode}
                className="code-action-btn"
                style={{ 
                  background: 'var(--emerald-subtle)', 
                  borderColor: 'rgba(16, 185, 129, 0.35)', 
                  color: '#34d399' 
                }}
                title="Jalankan kode di browser"
                disabled={isRunning}
              >
                <Play size={12} fill="#34d399" />
                <span>{isRunning ? 'Berjalan...' : 'Jalankan'}</span>
              </button>
            )}

            {/* AI Assistant Button */}
            <button
              onClick={() => setShowAIModal(true)}
              className="code-action-btn"
              style={{
                background: 'rgba(99, 102, 241, 0.15)',
                borderColor: 'rgba(99, 102, 241, 0.35)',
                color: '#a5b4fc'
              }}
              title="Analisis & Optimasi dengan AI"
            >
              <Sparkles size={12} />
              <span>AI</span>
            </button>

            {/* Export as Image Button */}
            <button
              onClick={() => setShowImageExport(true)}
              className="code-action-btn"
              title="Ekspor ke Gambar PNG (Ray.so / Carbon style)"
            >
              <Camera size={12} />
              <span>PNG</span>
            </button>

            {/* Star / Bookmark Button */}
            {id && (
              <button
                onClick={handleBookmarkToggle}
                className={`code-action-btn ${isBookmarked ? 'active' : ''}`}
                style={isBookmarked ? { color: '#fbbf24', borderColor: 'rgba(245, 158, 11, 0.4)', background: 'var(--amber-subtle)' } : {}}
                title={isBookmarked ? 'Hapus dari Bookmark' : 'Simpan ke Bookmark'}
                disabled={isBookmarking}
              >
                <Star size={12} fill={isBookmarked ? '#fbbf24' : 'none'} />
                <span>{bookmarkCount > 0 ? bookmarkCount : 'Star'}</span>
              </button>
            )}

            {/* Embed / Raw Button */}
            {id && (
              <button
                onClick={() => setShowEmbedModal(true)}
                className="code-action-btn"
                title="Sematkan / Dapatkan Raw URL"
              >
                <Code2 size={12} />
                <span>Embed</span>
              </button>
            )}


            {/* Fork Button */}
            {canFork && id && (
              <button 
                onClick={handleFork} 
                className="code-action-btn" 
                title="Fork ke Dashboard Pribadi"
                disabled={isForking}
              >
                <GitFork size={12} style={{ color: 'var(--emerald)' }} />
                <span>{isForking ? 'Forking...' : 'Fork'}</span>
              </button>
            )}

            {/* Download File Button */}
            <button 
              onClick={handleDownload} 
              className="code-action-btn" 
              title="Unduh sebagai file"
            >
              <Download size={12} />
              <span>Unduh</span>
            </button>

            {/* Copy Button */}
            <button 
              onClick={handleCopy} 
              className={`code-action-btn ${isCopied ? 'active' : ''}`}
              title="Salin ke Clipboard"
            >
              {isCopied ? <Check size={12} /> : <Copy size={12} />}
              <span>{isCopied ? 'Tersalin' : 'Salin'}</span>
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="code-content-layout">
          <div className="code-gutter">
            {Array.from({ length: displayedLineCount }).map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          <pre className="code-pre">
            <code 
              className={`language-${normalizedLang}`}
              dangerouslySetInnerHTML={{ __html: displayedHighlightedCode }} 
            />
          </pre>
        </div>

        {/* Expansion Toggle */}
        {shouldShowToggle && (
          <div 
            className="code-footer-toggle"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                <ChevronUp size={13} style={{ marginRight: '4px' }} />
                <span>Tutup Kode Penuh</span>
              </>
            ) : (
              <>
                <ChevronDown size={13} style={{ marginRight: '4px' }} />
                <span>Lihat Kode Penuh ({lineCount} baris)</span>
              </>
            )}
          </div>
        )}

        {/* Interactive In-Browser Runner Terminal Console */}
        {showRunner && (
          <div style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            background: '#04070d',
            padding: '12px 16px',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.8rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Terminal size={14} style={{ color: 'var(--emerald)' }} />
                <strong style={{ color: '#fff', fontSize: '0.78rem' }}>Terminal Output</strong>
                {execTime !== null && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>({execTime} ms)</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button 
                  onClick={() => setRunnerLogs([])}
                  style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem' }}
                  title="Bersihkan konsol"
                >
                  <Trash2 size={11} />
                  <span>Clear</span>
                </button>
                <button 
                  onClick={() => setShowRunner(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  title="Tutup console"
                >
                  <X size={13} />
                </button>
              </div>
            </div>

            <div style={{
              maxHeight: '160px',
              overflowY: 'auto',
              background: 'rgba(0,0,0,0.4)',
              borderRadius: '8px',
              padding: '10px 12px',
              border: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              {runnerLogs.map((log, idx) => (
                <div key={idx} style={{
                  color: log.type === 'error' ? '#f43f5e' : log.type === 'warn' ? '#fbbf24' : log.type === 'return' ? '#34d399' : '#e2e8f0',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  lineHeight: '1.5'
                }}>
                  {log.content}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>


      {/* Image Export Modal */}
      {showImageExport && (
        <ExportImageModal
          title={title}
          code={code}
          language={language}
          onClose={() => setShowImageExport(false)}
        />
      )}

      {/* AI Assistant Modal */}
      {showAIModal && (
        <AIAssistantModal
          code={code}
          language={language}
          onClose={() => setShowAIModal(false)}
          onApplyCode={(newCode) => {
            if (onCodeChange) onCodeChange(newCode);
          }}
        />
      )}

      {/* Embed Modal */}
      {showEmbedModal && id && (
        <EmbedModal
          id={id}
          title={title}
          onClose={() => setShowEmbedModal(false)}
        />
      )}
    </>
  );
}
