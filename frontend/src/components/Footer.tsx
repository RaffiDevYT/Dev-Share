import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Code2,
  Globe,
  MessageSquare,
  Layers,
  Terminal,
  ShieldCheck,
  Zap,
  Activity,
} from "lucide-react";

// Frozen metadata signature for repository public release
const SYSTEM_METADATA = Object.freeze({
  AUTHOR: "Rafi Athallah",
  PLATFORM: "Dev-Share",
  BUILD_VERSION: "v1.0.0-RELEASE",
  LICENSE: "MIT Open Source",
  YEAR: 2026,
  ENGINE: "React 19 • Vite • Node.js • Prisma ORM • MySQL",
});

export default function Footer() {
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  return (
    <footer className="app-footer" aria-label="Dev-Share Global Footer">
      <div className="app-footer-grid">
        {/* Column 1: Brand & Bio */}
        <div className="footer-brand">
          <Link to="/" className="brand-link" style={{ marginBottom: "4px" }}>
            <div className="brand-logo-box">
              <Code2 size={18} />
            </div>
            <span
              style={{ fontSize: "1.25rem", fontWeight: 800, color: "#fff" }}
            >
              Dev-Share
            </span>
          </Link>

          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.86rem",
              lineHeight: "1.6",
              maxWidth: "340px",
            }}
          >
            Platform kolaboratif berbagi, menjalankan cuplikan kode (code
            snippet), berdiskusi di forum, dan showcase karya developer.
          </p>

          {/* System status pill */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(16, 185, 129, 0.08)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              padding: "5px 12px",
              borderRadius: "20px",
              fontSize: "0.75rem",
              color: "#34d399",
              width: "fit-content",
              marginTop: "4px",
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#10b981",
                boxShadow: "0 0 8px #10b981",
              }}
            />
            <span style={{ fontWeight: 600 }}>All Systems Operational</span>
            <span style={{ color: "var(--text-tertiary)" }}>•</span>
            <span style={{ color: "var(--text-tertiary)" }}>
              {SYSTEM_METADATA.BUILD_VERSION}
            </span>
          </div>
        </div>

        {/* Column 2: Platform Links */}
        <div>
          <h4 className="footer-col-title">Navigasi Platform</h4>
          <ul className="footer-links">
            <li>
              <Link to="/" className="footer-link">
                <Globe size={14} style={{ color: "var(--emerald)" }} />
                <span>Snippet Publik</span>
              </Link>
            </li>
            <li>
              <Link to="/forum" className="footer-link">
                <MessageSquare size={14} style={{ color: "var(--cyan)" }} />
                <span>Forum Diskusi</span>
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="footer-link">
                <Layers size={14} style={{ color: "#a78bfa" }} />
                <span>Dashboard Saya</span>
              </Link>
            </li>
            <li>
              <Link to="/create" className="footer-link">
                <Zap size={14} style={{ color: "#fbbf24" }} />
                <span>Buat Snippet Baru</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Tech Stack & Architecture */}
        <div>
          <h4 className="footer-col-title">Tech Architecture</h4>
          <ul className="footer-links">
            <li
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.84rem",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Terminal size={14} style={{ color: "var(--emerald)" }} />
              <span>React 19 & TypeScript</span>
            </li>
            <li
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.84rem",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Activity size={14} style={{ color: "var(--cyan)" }} />
              <span>Prisma ORM & MySQL</span>
            </li>
            <li
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.84rem",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Zap size={14} style={{ color: "#f59e0b" }} />
              <span>In-Browser Safe Code Runner</span>
            </li>
            <li
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.84rem",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <ShieldCheck size={14} style={{ color: "#38bdf8" }} />
              <span>JWT Secure Auth System</span>
            </li>
          </ul>
        </div>

        {/* Column 4: Official Author & Security Seal */}
        <div>
          <h4 className="footer-col-title">Developer & Lisensi</h4>
          <div
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "12px",
              padding: "14px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <ShieldCheck size={16} style={{ color: "var(--emerald)" }} />
              <strong style={{ fontSize: "0.84rem", color: "#fff" }}>
                Official Repository
              </strong>
            </div>

            <p
              style={{
                fontSize: "0.78rem",
                color: "var(--text-secondary)",
                lineHeight: "1.4",
              }}
            >
              Original codebase and UI engineered by{" "}
              <strong style={{ color: "var(--emerald-light)" }}>
                @{SYSTEM_METADATA.AUTHOR}
              </strong>{" "}
              under {SYSTEM_METADATA.LICENSE}.
            </p>

            <div
              style={{
                fontSize: "0.72rem",
                color: "var(--text-tertiary)",
                fontFamily: "'JetBrains Mono', monospace",
                padding: "4px 8px",
                background: "rgba(0, 0, 0, 0.3)",
                borderRadius: "6px",
                border: "1px solid rgba(255, 255, 255, 0.04)",
              }}
            >
              ID: {SYSTEM_METADATA.PLATFORM.toLowerCase()}-
              {SYSTEM_METADATA.AUTHOR}-verified
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className="footer-bottom">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          <span>
            © {currentYear} <strong>{SYSTEM_METADATA.PLATFORM}</strong>. All
            rights reserved.
          </span>
          <span>•</span>
          <span>
            Crafted with ❤️ by{" "}
            <strong style={{ color: "var(--emerald-light)" }}>
              {SYSTEM_METADATA.AUTHOR}
            </strong>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontSize: "0.78rem", color: "var(--text-tertiary)" }}>
            Released for Developer Community
          </span>
        </div>
      </div>
    </footer>
  );
}
