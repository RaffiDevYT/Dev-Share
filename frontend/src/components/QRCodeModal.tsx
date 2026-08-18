import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, QrCode, Copy, Check, ExternalLink } from 'lucide-react';

interface QRCodeModalProps {
  url: string;
  title: string;
  onClose: () => void;
}

export default function QRCodeModal({ url, title, onClose }: QRCodeModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    QRCode.toDataURL(url, {
      width: 240,
      margin: 2,
      color: {
        dark: '#080c14',
        light: '#ffffff'
      }
    })
      .then(setQrDataUrl)
      .catch(console.error);
  }, [url]);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div 
        className="app-card neon-top-beam animate-fade-in" 
        style={{
          width: '100%',
          maxWidth: '380px',
          padding: '28px 24px',
          textAlign: 'center',
          background: 'var(--bg-card)',
          boxShadow: 'var(--shadow-modal)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <QrCode size={18} style={{ color: 'var(--emerald)' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>Pindai QR Code</h3>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
          Pindai dengan kamera ponsel Anda untuk membuka snippet <strong>"{title}"</strong> langsung di mobile browser.
        </p>

        {/* QR Box */}
        <div style={{
          background: '#ffffff',
          padding: '14px',
          borderRadius: '12px',
          display: 'inline-block',
          marginBottom: '18px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
        }}>
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="Snippet QR Code" style={{ width: '210px', height: '210px', display: 'block' }} />
          ) : (
            <div style={{ width: '210px', height: '210px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
              Membuat QR Code...
            </div>
          )}
        </div>

        {/* URL Box */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--bg-input)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '8px 12px',
          marginBottom: '14px'
        }}>
          <input 
            type="text" 
            readOnly 
            value={url} 
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '0.78rem',
              width: '100%',
              outline: 'none',
              fontFamily: "'JetBrains Mono', monospace"
            }}
          />
          <button 
            onClick={handleCopy}
            className="code-action-btn"
            style={{ flexShrink: 0 }}
          >
            {copied ? <Check size={12} style={{ color: 'var(--emerald)' }} /> : <Copy size={12} />}
            <span>{copied ? 'Tersalin' : 'Salin'}</span>
          </button>
        </div>

        <button 
          onClick={() => window.open(url, '_blank')} 
          className="btn-secondary" 
          style={{ width: '100%', padding: '9px', fontSize: '0.82rem' }}
        >
          <ExternalLink size={14} />
          <span>Buka di Tab Baru</span>
        </button>
      </div>
    </div>
  );
}
