import { useState, useRef, useEffect } from 'react';
import { X, Download, Copy, Check, Sparkles, Sliders } from 'lucide-react';

interface ExportImageModalProps {
  title: string;
  code: string;
  language: string;
  onClose: () => void;
}

const THEMES = [
  { id: 'emerald', name: 'Emerald Glow', bg: 'linear-gradient(135deg, #064e3b 0%, #0d9488 50%, #0369a1 100%)' },
  { id: 'cyberpunk', name: 'Cyberpunk Neon', bg: 'linear-gradient(135deg, #831843 0%, #701a75 50%, #4338ca 100%)' },
  { id: 'sunset', name: 'Sunset Flame', bg: 'linear-gradient(135deg, #7c2d12 0%, #c2410c 50%, #b45309 100%)' },
  { id: 'midnight', name: 'Midnight Dark', bg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #090d16 100%)' },
  { id: 'aurora', name: 'Aurora Borealis', bg: 'linear-gradient(135deg, #065f46 0%, #0284c7 50%, #4f46e5 100%)' },
  { id: 'amethyst', name: 'Royal Amethyst', bg: 'linear-gradient(135deg, #4c1d95 0%, #312e81 100%)' }
];

export default function ExportImageModal({ title, code, language, onClose }: ExportImageModalProps) {
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const [padding, setPadding] = useState<number>(36);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [showTitle, setShowTitle] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isRendering, setIsRendering] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewBoxRef = useRef<HTMLDivElement>(null);

  const lines = code.split('\n');

  // Render to canvas
  const drawToCanvas = async (): Promise<HTMLCanvasElement | null> => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // High resolution scaling (2x retina)
    const scale = 2;
    const fontHeight = 14;
    const lineHeight = 22;
    const codePaddingX = 24;
    const codePaddingY = 20;
    const headerHeight = showTitle ? 44 : 32;

    // Measure max code line width
    ctx.font = `${fontHeight * scale}px 'JetBrains Mono', 'Fira Code', 'Courier New', monospace`;
    let maxLineWidth = 0;
    lines.forEach((line) => {
      const w = ctx.measureText(line).width;
      if (w > maxLineWidth) maxLineWidth = w;
    });

    const gutterWidth = showLineNumbers ? ctx.measureText(`${lines.length}  `).width + 10 : 0;
    const innerWidth = Math.max(maxLineWidth + gutterWidth + codePaddingX * 2, 480);
    const innerHeight = headerHeight + lines.length * lineHeight + codePaddingY * 2;

    const outerWidth = innerWidth + padding * 2;
    const outerHeight = innerHeight + padding * 2;

    canvas.width = outerWidth * scale;
    canvas.height = outerHeight * scale;
    canvas.style.width = `${outerWidth}px`;
    canvas.style.height = `${outerHeight}px`;

    ctx.scale(scale, scale);

    // 1. Draw Gradient Background
    const bgGradient = ctx.createLinearGradient(0, 0, outerWidth, outerHeight);
    if (selectedTheme.id === 'emerald') {
      bgGradient.addColorStop(0, '#064e3b');
      bgGradient.addColorStop(0.5, '#0d9488');
      bgGradient.addColorStop(1, '#0369a1');
    } else if (selectedTheme.id === 'cyberpunk') {
      bgGradient.addColorStop(0, '#831843');
      bgGradient.addColorStop(0.5, '#701a75');
      bgGradient.addColorStop(1, '#4338ca');
    } else if (selectedTheme.id === 'sunset') {
      bgGradient.addColorStop(0, '#7c2d12');
      bgGradient.addColorStop(0.5, '#c2410c');
      bgGradient.addColorStop(1, '#b45309');
    } else if (selectedTheme.id === 'midnight') {
      bgGradient.addColorStop(0, '#0f172a');
      bgGradient.addColorStop(0.5, '#1e293b');
      bgGradient.addColorStop(1, '#090d16');
    } else if (selectedTheme.id === 'aurora') {
      bgGradient.addColorStop(0, '#065f46');
      bgGradient.addColorStop(0.5, '#0284c7');
      bgGradient.addColorStop(1, '#4f46e5');
    } else {
      bgGradient.addColorStop(0, '#4c1d95');
      bgGradient.addColorStop(1, '#312e81');
    }

    ctx.fillStyle = bgGradient;
    ctx.roundRect(0, 0, outerWidth, outerHeight, 14);
    ctx.fill();

    // 2. Draw Code Window Box (Card with Drop Shadow)
    const cardX = padding;
    const cardY = padding;
    const cardW = innerWidth;
    const cardH = innerHeight;
    const radius = 12;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 12;

    ctx.fillStyle = '#0a0f18';
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, radius);
    ctx.fill();
    ctx.restore();

    // Card border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, radius);
    ctx.stroke();

    // 3. Draw Window Header Controls (Mac Dots)
    const dotY = cardY + headerHeight / 2;
    const dotRadius = 5.5;

    // Red dot
    ctx.fillStyle = '#ff5f56';
    ctx.beginPath();
    ctx.arc(cardX + 18, dotY, dotRadius, 0, Math.PI * 2);
    ctx.fill();

    // Yellow dot
    ctx.fillStyle = '#ffbd2e';
    ctx.beginPath();
    ctx.arc(cardX + 34, dotY, dotRadius, 0, Math.PI * 2);
    ctx.fill();

    // Green dot
    ctx.fillStyle = '#27c93f';
    ctx.beginPath();
    ctx.arc(cardX + 50, dotY, dotRadius, 0, Math.PI * 2);
    ctx.fill();

    // Title / Lang
    if (showTitle) {
      ctx.font = `600 12px Inter, sans-serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.textAlign = 'center';
      ctx.fillText(title || 'snippet', cardX + cardW / 2, dotY + 4);

      // Lang tag right
      ctx.font = `600 11px Inter, sans-serif`;
      ctx.fillStyle = '#34d399';
      ctx.textAlign = 'right';
      ctx.fillText(language.toUpperCase(), cardX + cardW - 18, dotY + 4);
    }

    // Header divider line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
    ctx.beginPath();
    ctx.moveTo(cardX, cardY + headerHeight);
    ctx.lineTo(cardX + cardW, cardY + headerHeight);
    ctx.stroke();

    // 4. Draw Code Lines
    ctx.font = `${fontHeight}px 'JetBrains Mono', 'Fira Code', 'Courier New', monospace`;
    ctx.textAlign = 'left';

    lines.forEach((line, index) => {
      const lineY = cardY + headerHeight + codePaddingY + index * lineHeight + fontHeight;

      // Line numbers
      if (showLineNumbers) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.textAlign = 'right';
        ctx.fillText(String(index + 1), cardX + gutterWidth + 4, lineY);
      }

      // Code text
      ctx.textAlign = 'left';
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(line, cardX + gutterWidth + codePaddingX, lineY);
    });

    // Branding Watermark
    ctx.font = `500 10px Inter, sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.textAlign = 'right';
    ctx.fillText('⚡ Dev-Share', outerWidth - 16, outerHeight - 12);

    return canvas;
  };

  useEffect(() => {
    drawToCanvas();
  }, [selectedTheme, padding, showLineNumbers, showTitle, code, language, title]);

  const handleDownloadPNG = async () => {
    setIsRendering(true);
    const canvas = await drawToCanvas();
    if (!canvas) {
      setIsRendering(false);
      return;
    }

    const cleanTitle = (title || 'snippet').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    const filename = `${cleanTitle}-card.png`;

    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsRendering(false);
    window.dispatchEvent(new CustomEvent('show-toast', { detail: `Gambar ${filename} berhasil diunduh!` }));
  };

  const handleCopyImage = async () => {
    setIsRendering(true);
    const canvas = await drawToCanvas();
    if (!canvas) {
      setIsRendering(false);
      return;
    }

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setIsCopied(true);
        window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Gambar berhasil disalin ke clipboard!' }));
        setTimeout(() => setIsCopied(false), 2000);
      });
    } catch {
      alert('Browser Anda tidak mendukung salin gambar langsung. Silakan gunakan tombol Download.');
    } finally {
      setIsRendering(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content animate-fade-in" 
        style={{ maxWidth: '820px', width: '92vw', padding: '24px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: 'var(--emerald-subtle)', padding: '6px', borderRadius: '8px', color: 'var(--emerald)' }}>
              <Sparkles size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>Ekspor Kode ke Gambar PNG</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Buat kartu kode bergaya Ray.so / Carbon untuk dibagikan</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '6px', borderRadius: '8px' }}>
            <X size={16} />
          </button>
        </div>

        {/* Controls Bar */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '14px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '18px'
        }}>
          {/* Theme selection */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Tema Latar:</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTheme(t)}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: t.bg,
                    border: selectedTheme.id === t.id ? '2px solid #fff' : '2px solid transparent',
                    cursor: 'pointer',
                    boxShadow: selectedTheme.id === t.id ? '0 0 8px rgba(255,255,255,0.4)' : 'none',
                    transform: selectedTheme.id === t.id ? 'scale(1.15)' : 'scale(1)',
                    transition: 'all 0.15s'
                  }}
                  title={t.name}
                />
              ))}
            </div>
          </div>

          {/* Padding */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={14} style={{ color: 'var(--text-secondary)' }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Padding:</span>
            {[20, 36, 52].map((p) => (
              <button
                key={p}
                onClick={() => setPadding(p)}
                style={{
                  background: padding === p ? 'var(--emerald)' : 'rgba(255,255,255,0.05)',
                  color: padding === p ? '#000' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '3px 8px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {p}px
              </button>
            ))}
          </div>

          {/* Toggles */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showLineNumbers}
                onChange={(e) => setShowLineNumbers(e.target.checked)}
              />
              <span>Nomor Baris</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showTitle}
                onChange={(e) => setShowTitle(e.target.checked)}
              />
              <span>Header Judul</span>
            </label>
          </div>
        </div>

        {/* Live Canvas Preview Container */}
        <div 
          ref={previewBoxRef}
          style={{
            maxHeight: '380px',
            overflow: 'auto',
            background: 'rgba(0,0,0,0.5)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            marginBottom: '20px'
          }}
        >
          <canvas ref={canvasRef} style={{ display: 'block', maxWidth: '100%', height: 'auto', borderRadius: '12px' }} />
        </div>

        {/* Actions Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button 
            onClick={handleCopyImage} 
            className="btn-secondary" 
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            disabled={isRendering}
          >
            {isCopied ? <Check size={15} style={{ color: 'var(--emerald)' }} /> : <Copy size={15} />}
            <span>{isCopied ? 'Tersalin ke Clipboard' : 'Salin Gambar'}</span>
          </button>

          <button 
            onClick={handleDownloadPNG} 
            className="btn-primary" 
            style={{ padding: '8px 18px', fontSize: '0.85rem' }}
            disabled={isRendering}
          >
            <Download size={15} />
            <span>{isRendering ? 'Memproses...' : 'Unduh PNG HD'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
