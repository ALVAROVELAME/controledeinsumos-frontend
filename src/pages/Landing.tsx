// src/pages/Landing.tsx
import { useState, useEffect, useRef, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

/* ============================================================
   Links e caminhos (edite aqui)
   ============================================================ */
const LINKS = {
  api: 'https://controle-insumos-api.duckdns.org/docs',
  portfolio: 'https://alvarovelame.vercel.app',
  github: 'https://github.com/ALVAROVELAME',
  linkedin: 'https://www.linkedin.com/in/alvaro-velame/',
  email: 'alvarovelameprofissional@gmail.com',
};
// Arquivos em public/ são servidos a partir da raiz do site.
const LOGO_SRC = '/logo.svg';

/* ============================================================
   Ícones SVG (traço, 24x24)
   ============================================================ */
const ICONS: Record<string, string[]> = {
  box: ['m7.5 4.27 9 5.15', 'M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z', 'm3.3 7 8.7 5 8.7-5', 'M12 22V12'],
  swap: ['M8 3 4 7l4 4', 'M4 7h16', 'm16 21 4-4-4-4', 'M20 17H4'],
  trend: ['M22 7 13.5 15.5 8.5 10.5 2 17', 'M16 7h6v6'],
  chart: ['M3 3v18h18', 'M18 17V9', 'M13 17V5', 'M8 17v-3'],
  bell: ['M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9', 'M10.3 21a1.94 1.94 0 0 0 3.4 0'],
  building: ['M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z', 'M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2', 'M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2', 'M10 6h4', 'M10 10h4', 'M10 14h4', 'M10 18h4'],
  check: ['M20 6 9 17l-5-5'],
  arrow: ['M5 12h14', 'm12 5 7 7-7 7'],
  github: ['M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4', 'M9 18c-4.51 2-5-2-7-2'],
  linkedin: ['M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z', 'M2 9h4v12H2z', 'M6 4a2 2 0 1 1-4 0 2 2 0 0 1 4 0'],
  mail: ['m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7', 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z'],
  globe: ['M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20', 'M2 12h20', 'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'],
  code: ['m16 18 6-6-6-6', 'm8 6-6 6 6 6'],
  menu: ['M4 6h16', 'M4 12h16', 'M4 18h16'],
  close: ['M18 6 6 18', 'm6 6 12 12'],
  shield: ['M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z', 'm9 12 2 2 4-4'],
  zap: ['M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z'],
  download: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'm7 10 5 5 5-5', 'M12 15V3'],
  external: ['M15 3h6v6', 'M10 14 21 3', 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6'],
};

function Icon({ name, size = 20 }: { name: keyof typeof ICONS | string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {(ICONS[name] ?? []).map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}

/* ============================================================
   CSS do componente — Paleta: Navy + Blue + Cyan (AA)
   ============================================================ */
const STYLES = `
.ag {
  --bg: #ffffff;
  --bg-soft: #f1f5ff;
  --ink: #0b1220;
  --ink-soft: #1e293b;
  --muted: #475569;
  --line: #dbe3f0;
  --brand: #2563eb;
  --brand-2: #3b82f6;
  --brand-3: #1d4ed8;
  --accent: #22d3ee;
  --navy: #0b1220;
  --navy-2: #111a2e;
  --radius: 20px;
  --shadow-md: 0 14px 34px -14px rgba(15,23,42,.25);
  --shadow-lg: 0 40px 80px -30px rgba(2,6,23,.6);

  font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  color: var(--ink); background: var(--bg);
  overflow-x: clip; line-height: 1.55;
  -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;
}
.ag *, .ag *::before, .ag *::after { box-sizing: border-box; }
.ag :where(h1, h2, h3, h4) { margin: 0; letter-spacing: -.02em; color: var(--ink); }
.ag p { margin: 0; }
.ag :where(a) { text-decoration: none; color: inherit; }
.ag button { font-family: inherit; }
.ag [id] { scroll-margin-top: 92px; }
.sr-only {
  position: absolute !important; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;
}

/* Foco visível */
.ag a:focus-visible, .ag button:focus-visible, .ag input:focus-visible {
  outline: 3px solid var(--brand); outline-offset: 3px; border-radius: 10px;
}
.ag-nav :focus-visible, .ag-hero :focus-visible, .ag-dev :focus-visible,
.ag-footer :focus-visible, .ag-plan.featured :focus-visible { outline-color: var(--accent) !important; }
.ag-final :focus-visible { outline-color: #fff !important; }

/* Skip link */
.ag-skip {
  position: absolute; top: -100px; left: 12px; z-index: 9999;
  padding: 12px 18px; background: #fff; color: var(--brand-3) !important;
  font-weight: 700; font-size: 14px; border-radius: 0 0 12px 12px;
  box-shadow: 0 10px 24px -10px rgba(0,0,0,.4); transition: top .18s ease;
}
.ag-skip:focus { top: 0; }

/* Barra de progresso */
.ag-progress {
  position: fixed; top: 0; left: 0; right: 0; height: 3px; z-index: 200;
  background: linear-gradient(90deg, var(--brand-2), var(--accent));
  transform: scaleX(0); transform-origin: left; pointer-events: none;
}

/* Reveal */
.ag [data-reveal] { opacity: 0; transform: translateY(22px); transition: opacity .7s cubic-bezier(.2,.7,.2,1), transform .7s cubic-bezier(.2,.7,.2,1); }
.ag [data-reveal].is-visible { opacity: 1; transform: none; }

.ag-container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }

/* ===== NAV (vidro escuro) ===== */
.ag-nav {
  position: fixed; inset: 0 0 auto 0; z-index: 100;
  background: #0b1220;
  backdrop-filter: saturate(180%) blur(16px); -webkit-backdrop-filter: saturate(180%) blur(16px);
  border-bottom: 1px solid rgba(148,163,184,.14);
  transition: background .25s ease, box-shadow .25s ease;
}
.ag-nav.is-scrolled { background: #0b1220; box-shadow: 0 12px 30px -18px rgba(0,0,0,.6); }
.ag-nav-inner { max-width: 1200px; margin: 0 auto; padding: 12px 24px; display: flex; align-items: center; justify-content: space-between; gap: 24px; }
.ag-logo { display: inline-flex; align-items: center; gap: 10px; color: #fff; font-weight: 700; font-size: 17px; letter-spacing: -.02em; flex-shrink: 0; }
.ag-logo img { width: 36px; height: 36px; display: block; border-radius: 10px; }
.ag-nav-links { display: flex; gap: 2px; align-items: center; }
.ag-nav-link { background: transparent; border: 0; padding: 9px 14px; font-size: 14px; font-weight: 500; color: #cbd5e1; border-radius: 10px; cursor: pointer; transition: color .2s, background .2s; }
.ag-nav-link:hover { color: #fff; background: rgba(255,255,255,.08); }
.ag-nav-actions { display: flex; gap: 8px; align-items: center; }
.ag-btn-ghost { display: inline-flex; align-items: center; justify-content: center; padding: 10px 16px; font-size: 14px; font-weight: 600; color: #e2e8f0; border-radius: 10px; transition: background .2s; }
.ag-btn-ghost:hover { background: rgba(255,255,255,.08); }
.ag-btn-primary {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  padding: 10px 18px; font-size: 14px; font-weight: 700; color: #fff;
  background: linear-gradient(135deg, var(--brand-2), var(--brand-3)); border-radius: 10px;
  box-shadow: 0 8px 22px -10px rgba(59,130,246,.9), inset 0 1px 0 rgba(255,255,255,.25);
  transition: transform .15s ease, box-shadow .2s ease;
}
.ag-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 12px 26px -10px rgba(59,130,246,1), inset 0 1px 0 rgba(255,255,255,.3); }
.ag-burger { display: none; width: 44px; height: 44px; background: transparent; border: 1px solid rgba(148,163,184,.35); border-radius: 12px; color: #fff; cursor: pointer; align-items: center; justify-content: center; flex-shrink: 0; }
.ag-drawer { display: none; background: var(--navy); border-top: 1px solid rgba(148,163,184,.14); padding: 8px 0 20px; animation: agDrop .25s ease; }
@keyframes agDrop { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
.ag-drawer-link { display: flex; width: 100%; text-align: left; background: transparent; border: 0; cursor: pointer; padding: 15px 24px; font-size: 16px; font-weight: 500; color: #e2e8f0; }
.ag-drawer-link:hover { background: rgba(255,255,255,.06); }
.ag-drawer-actions { display: flex; gap: 10px; padding: 12px 24px 0; }
.ag-drawer-actions > * { flex: 1 1 0; min-width: 0; }
@media (max-width: 900px) {
  .ag-nav-links, .ag-nav-actions { display: none; }
  .ag-burger { display: inline-flex; }
  .ag-drawer { display: block; }
}

/* ===== HERO ===== */
.ag-hero { position: relative; padding: 140px 0 110px; background: var(--navy); color: #fff; overflow: hidden; isolation: isolate; }
.ag-hero::before {
  content: ""; position: absolute; inset: 0; z-index: -2;
  background-image:
    linear-gradient(rgba(148,163,184,.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148,163,184,.08) 1px, transparent 1px);
  background-size: 48px 48px;
  -webkit-mask-image: radial-gradient(ellipse 70% 70% at 60% 40%, #000 30%, transparent 100%);
  mask-image: radial-gradient(ellipse 70% 70% at 60% 40%, #000 30%, transparent 100%);
}
.ag-glow { position: absolute; border-radius: 50%; filter: blur(90px); z-index: -1; pointer-events: none; animation: agDrift 14s ease-in-out infinite alternate; }
.ag-glow.g1 { width: 520px; height: 520px; top: -160px; right: -80px; background: rgba(37,99,235,.55); }
.ag-glow.g2 { width: 420px; height: 420px; bottom: -160px; left: -100px; background: rgba(34,211,238,.28); animation-delay: -6s; }
@keyframes agDrift { from { transform: translate3d(0,0,0) scale(1); } to { transform: translate3d(-30px,24px,0) scale(1.08); } }

.ag-hero-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; display: grid; grid-template-columns: 1fr 1.05fr; gap: 56px; align-items: center; }
.ag-badge { display: inline-flex; align-items: center; gap: 10px; background: rgba(37,99,235,.18); color: #bfdbfe; border: 1px solid rgba(96,165,250,.4); padding: 7px 14px; border-radius: 999px; font-size: 13px; font-weight: 600; margin-bottom: 24px; }
.ag-badge-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); animation: agPulse 2s ease-out infinite; }
@keyframes agPulse { 0% { box-shadow: 0 0 0 0 rgba(34,211,238,.6); } 100% { box-shadow: 0 0 0 10px rgba(34,211,238,0); } }
.ag .ag-hero-title { font-size: clamp(36px, 5.2vw, 62px); font-weight: 800; line-height: 1.04; letter-spacing: -.04em; margin-bottom: 22px; color: #fff; }
.ag-hero-title em { font-style: normal; background: linear-gradient(120deg, #60a5fa 0%, #22d3ee 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }
.ag-hero-sub { font-size: 18px; line-height: 1.65; color: #cbd5e1; max-width: 520px; margin-bottom: 34px; }
.ag-hero-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 30px; }
.ag-cta { display: inline-flex; align-items: center; gap: 10px; padding: 15px 26px; border-radius: 14px; font-size: 15px; font-weight: 700; white-space: nowrap; transition: transform .15s ease, box-shadow .2s ease, background .2s ease; cursor: pointer; }
.ag-cta-primary { background: linear-gradient(135deg, var(--brand-2), var(--brand-3)); color: #fff; border: 0; box-shadow: 0 16px 34px -14px rgba(59,130,246,.95), inset 0 1px 0 rgba(255,255,255,.25); }
.ag-cta-primary:hover { transform: translateY(-2px); box-shadow: 0 22px 40px -14px rgba(59,130,246,1), inset 0 1px 0 rgba(255,255,255,.3); }
.ag-cta-ghost { background: rgba(255,255,255,.06); color: #fff; border: 1px solid rgba(148,163,184,.45); }
.ag-cta-ghost:hover { background: rgba(255,255,255,.12); transform: translateY(-2px); }
.ag-trust { display: flex; flex-wrap: wrap; gap: 10px 22px; list-style: none; padding: 0; margin: 0; }
.ag-trust li { font-size: 14px; color: #cbd5e1; display: inline-flex; align-items: center; gap: 8px; font-weight: 500; }
.ag-trust svg { color: var(--accent); }

/* Cena 3D */
.ag-scene-wrap { perspective: 1400px; min-width: 0; }
.ag-tilt { transform-style: preserve-3d; will-change: transform; transition: transform .18s ease-out; }
.ag-scene { transform: rotateX(calc(var(--rx, 0deg) + 6deg)) rotateY(calc(var(--ry, 0deg) - 12deg)); position: relative; }
.ag-panel { position: relative; border-radius: 22px; background: linear-gradient(180deg, rgba(30,41,59,.92), rgba(15,23,42,.94)); border: 1px solid rgba(148,163,184,.28); box-shadow: var(--shadow-lg), inset 0 1px 0 rgba(255,255,255,.08); overflow: hidden; }
.ag-panel-head { display: flex; align-items: center; gap: 6px; padding: 12px 16px; border-bottom: 1px solid rgba(148,163,184,.18); background: rgba(2,6,23,.4); }
.ag-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.ag-url { margin-left: 12px; font-size: 11px; color: #cbd5e1; background: rgba(148,163,184,.14); padding: 4px 12px; border-radius: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
.ag-panel-body { padding: 20px; }
.ag-kpis { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px; }
.ag-kpi { background: rgba(148,163,184,.1); border: 1px solid rgba(148,163,184,.2); border-radius: 14px; padding: 12px 10px; min-width: 0; }
.ag-kpi-label { font-size: 10px; color: #cbd5e1; text-transform: uppercase; letter-spacing: .08em; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ag-kpi-value { font-size: 18px; font-weight: 800; color: #fff; margin-top: 4px; white-space: nowrap; }
.ag-kpi-value.up { color: #67e8f9; }
.ag-chart { width: 100%; height: auto; display: block; margin-bottom: 14px; }
.ag-chart .line { stroke-dasharray: 1; stroke-dashoffset: 1; animation: agDraw 2.2s .4s cubic-bezier(.3,.7,.2,1) forwards; }
.ag-chart .area { opacity: 0; animation: agFadeIn 1s 1.6s ease forwards; }
@keyframes agDraw { to { stroke-dashoffset: 0; } }
@keyframes agFadeIn { to { opacity: 1; } }
.ag-bars { display: grid; gap: 8px; }
.ag-bar-row { display: grid; grid-template-columns: 74px 1fr 52px; gap: 10px; align-items: center; }
.ag-bar-label, .ag-bar-value { font-size: 12px; font-weight: 600; color: #cbd5e1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ag-bar-value { text-align: right; font-variant-numeric: tabular-nums; }
.ag-bar { height: 8px; background: rgba(148,163,184,.22); border-radius: 999px; overflow: hidden; }
.ag-bar-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, var(--brand-2), var(--accent)); transform-origin: left; animation: agGrow 1.2s cubic-bezier(.2,.7,.2,1) both; }
@keyframes agGrow { from { transform: scaleX(0); } to { transform: scaleX(1); } }

/* Camadas flutuantes (profundidade + paralaxe) */
.ag-layer { position: absolute; z-index: 3; transform-style: preserve-3d; transform: translate3d(calc(var(--px, 0) * var(--dx, 16) * 1px), calc(var(--py, 0) * var(--dy, 12) * 1px), var(--z, 70px)); transition: transform .2s ease-out; }
.ag-chip { display: flex; align-items: center; gap: 10px; padding: 11px 15px; border-radius: 14px; background: rgba(15,23,42,.9); border: 1px solid rgba(148,163,184,.35); box-shadow: 0 20px 40px -16px rgba(0,0,0,.65); color: #fff; font-size: 13px; font-weight: 600; white-space: nowrap; animation: agFloat 6s ease-in-out infinite; }
.ag-chip small { display: block; font-size: 11px; font-weight: 500; color: #cbd5e1; }
.ag-chip-ic { width: 32px; height: 32px; border-radius: 10px; display: grid; place-items: center; flex-shrink: 0; }
.ag-chip-ic.warn { background: rgba(251,191,36,.18); color: #fcd34d; }
.ag-chip-ic.ok { background: rgba(34,211,238,.18); color: #67e8f9; }
.ag-layer.l1 { top: -22px; right: -14px; --z: 90px; --dx: 22; --dy: 16; }
.ag-layer.l2 { bottom: 48px; left: -26px; --z: 60px; --dx: -16; --dy: -10; }
.ag-layer.l2 .ag-chip { animation-delay: -2.5s; }
.ag-layer.l3 { bottom: -26px; right: 28px; --z: 110px; --dx: 28; --dy: 20; }
.ag-layer.l3 img { width: 64px; height: 64px; border-radius: 18px; display: block; box-shadow: 0 24px 40px -14px rgba(0,0,0,.7); animation: agFloat 7s ease-in-out infinite -1s; }
@keyframes agFloat { 0%, 100% { translate: 0 0; } 50% { translate: 0 -10px; } }

@media (max-width: 960px) {
  .ag-hero { padding: 116px 0 80px; }
  .ag-hero-inner { grid-template-columns: 1fr; gap: 64px; }
  .ag-hero-text { max-width: 640px; }
  .ag-scene { transform: none; }
}
@media (max-width: 640px) {
  .ag-layer.l1 { right: 6px; top: -30px; }
  .ag-layer.l2 { display: none; }
  .ag-layer.l3 { right: 12px; }
}
@media (max-width: 480px) {
  .ag-panel-body { padding: 14px; }
  .ag-bar-row { grid-template-columns: 62px 1fr 46px; gap: 8px; }
  .ag-kpi-value { font-size: 14px; }
  .ag-hero-actions { flex-direction: column; align-items: stretch; }
  .ag-cta { justify-content: center; }
}

/* ===== STATS ===== */
.ag-stats { background: var(--navy-2); border-top: 1px solid rgba(148,163,184,.14); border-bottom: 1px solid rgba(148,163,184,.14); padding: 52px 24px; color: #fff; }
.ag-stats-inner { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; text-align: center; list-style: none; padding: 0; }
.ag-stat-num { font-size: clamp(30px, 3.6vw, 44px); font-weight: 800; letter-spacing: -.03em; line-height: 1; background: linear-gradient(120deg, #fff, #93c5fd); -webkit-background-clip: text; background-clip: text; color: transparent; }
.ag-stat-label { font-size: 14px; color: #cbd5e1; margin-top: 10px; font-weight: 500; }
@media (max-width: 720px) { .ag-stats-inner { grid-template-columns: repeat(2, 1fr); gap: 32px 20px; } }

/* ===== SEÇÕES ===== */
.ag-section { padding: 108px 0; }
.ag-section.soft { background: var(--bg-soft); }
.ag-section-head { text-align: center; max-width: 680px; margin: 0 auto 60px; }
.ag-eyebrow { display: inline-block; font-size: 12px; font-weight: 800; letter-spacing: .16em; color: var(--brand-3); text-transform: uppercase; margin-bottom: 14px; }
.ag-title { font-size: clamp(28px, 3.6vw, 42px); font-weight: 800; line-height: 1.1; letter-spacing: -.03em; margin-bottom: 14px; }
.ag-subtitle { font-size: 17px; color: var(--muted); line-height: 1.65; }
@media (max-width: 640px) { .ag-section { padding: 76px 0; } .ag-section-head { margin-bottom: 40px; } }

/* Cards 3D (tilt + brilho) */
.ag-grid3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; perspective: 1400px; }
.ag-card {
  position: relative; height: 100%; background: #fff; border: 1px solid var(--line); border-radius: var(--radius);
  padding: 30px 26px; overflow: hidden;
  transform: rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
  box-shadow: 0 1px 2px rgba(15,23,42,.05);
  transition: transform .18s ease-out, box-shadow .25s ease, border-color .25s ease;
}
.ag-card::after { content: ""; position: absolute; inset: 0; pointer-events: none; opacity: 0; transition: opacity .25s ease; background: radial-gradient(360px circle at var(--mx, 50%) var(--my, 50%), rgba(59,130,246,.14), transparent 60%); }
.ag-card:hover { box-shadow: var(--shadow-md); border-color: #bfd0ee; }
.ag-card:hover::after { opacity: 1; }
.ag-card > * { transform: translateZ(24px); }
.ag-feature-icon { width: 52px; height: 52px; border-radius: 14px; display: grid; place-items: center; color: #fff; margin-bottom: 20px; background: linear-gradient(135deg, var(--brand-2), var(--brand-3)); box-shadow: 0 12px 24px -10px rgba(37,99,235,.7), inset 0 1px 0 rgba(255,255,255,.3); }
.ag-feature-title { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
.ag-feature-desc { font-size: 15px; color: var(--muted); line-height: 1.65; }
@media (max-width: 960px) { .ag-grid3 { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 600px) { .ag-grid3 { grid-template-columns: 1fr; } }

/* Simulador */
.ag-sim { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; align-items: stretch; max-width: 1000px; margin: 0 auto; perspective: 1400px; }
.ag-sim-panel { background: #fff; border: 1px solid var(--line); border-radius: 24px; padding: 32px; box-shadow: var(--shadow-md); }
.ag-sim-result { background: linear-gradient(160deg, var(--navy-2), var(--navy)); color: #fff; border-color: rgba(148,163,184,.25); transform: rotateY(var(--ry, 0deg)) rotateX(var(--rx, 0deg)); transition: transform .18s ease-out; transform-style: preserve-3d; }
.ag-field { margin-bottom: 24px; }
.ag-field:last-child { margin-bottom: 0; }
.ag-field-top { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 10px; }
.ag-field label { font-size: 14px; font-weight: 700; color: var(--ink-soft); }
.ag-field output { font-size: 15px; font-weight: 800; color: var(--brand-3); font-variant-numeric: tabular-nums; }
.ag-field input[type=range] { width: 100%; height: 28px; accent-color: var(--brand); cursor: pointer; }
.ag-sim-label { font-size: 12px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: #93c5fd; margin-bottom: 8px; }
.ag-sim-big { font-size: clamp(40px, 6vw, 60px); font-weight: 800; letter-spacing: -.04em; line-height: 1; transform: translateZ(40px); }
.ag-sim-big.neg { color: #fda4af; }
.ag-sim-big.pos { color: #67e8f9; }
.ag-sim-status { display: inline-flex; margin-top: 12px; font-size: 13px; font-weight: 700; padding: 5px 12px; border-radius: 999px; background: rgba(148,163,184,.18); color: #e2e8f0; }
.ag-sim-cols { display: flex; align-items: flex-end; gap: 20px; height: 120px; margin: 28px 0 8px; transform: translateZ(20px); }
.ag-sim-col { flex: 1; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; gap: 8px; height: 100%; }
.ag-sim-col span { font-size: 12px; font-weight: 600; color: #cbd5e1; }
.ag-sim-col i { display: block; width: 100%; max-width: 72px; border-radius: 10px 10px 4px 4px; transition: height .35s cubic-bezier(.2,.7,.2,1); }
.ag-sim-col.buy i { background: linear-gradient(180deg, #64748b, #334155); }
.ag-sim-col.sell i { background: linear-gradient(180deg, #22d3ee, #2563eb); }
.ag-sim-total { margin-top: 18px; font-size: 14px; color: #cbd5e1; }
.ag-sim-total strong { color: #fff; }
@media (max-width: 800px) { .ag-sim { grid-template-columns: 1fr; } .ag-sim-panel { padding: 24px; } }

/* Passos */
.ag-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; list-style: none; padding: 0; margin: 0; }
.ag-step { position: relative; text-align: center; padding: 0 12px; }
.ag-step-num { font-size: 12px; font-weight: 800; color: var(--brand-3); letter-spacing: .2em; margin-bottom: 14px; }
.ag-step-icon { width: 80px; height: 80px; margin: 0 auto 20px; border-radius: 24px; background: #fff; display: grid; place-items: center; color: var(--brand); border: 1px solid var(--line); box-shadow: 0 16px 30px -16px rgba(37,99,235,.5); transition: transform .3s ease; }
.ag-step:hover .ag-step-icon { transform: translateY(-6px) rotate(-4deg); }
.ag-step-title { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
.ag-step-desc { font-size: 15px; color: var(--muted); max-width: 290px; margin: 0 auto; }
.ag-step:not(:last-child)::after { content: ""; position: absolute; top: 58px; right: -14%; width: 28%; border-top: 2px dashed #b6c6e3; }
@media (max-width: 900px) { .ag-steps { grid-template-columns: 1fr; gap: 44px; } .ag-step::after { display: none; } }

/* Casos de uso */
.ag-use-tag { display: inline-block; font-size: 12px; font-weight: 700; color: var(--brand-3); background: #e0e9ff; padding: 4px 10px; border-radius: 999px; margin-bottom: 14px; }
.ag-use-list { list-style: none; padding: 0; margin: 16px 0 0; display: grid; gap: 8px; }
.ag-use-list li { display: flex; gap: 10px; align-items: flex-start; font-size: 14px; color: var(--ink-soft); }
.ag-use-list svg { color: var(--brand); flex-shrink: 0; margin-top: 2px; }

/* Preços */
.ag-pricing { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; align-items: stretch; padding-top: 14px; perspective: 1400px; }
.ag-plan { position: relative; height: 100%; background: #fff; border: 1px solid var(--line); border-radius: 24px; padding: 34px 28px; display: flex; flex-direction: column; transform: rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)); transition: transform .18s ease-out, box-shadow .25s; }
.ag-plan:hover { box-shadow: var(--shadow-md); }
.ag-plan.featured { background: linear-gradient(170deg, var(--navy-2), var(--navy)); border-color: rgba(96,165,250,.55); box-shadow: 0 30px 70px -28px rgba(37,99,235,.7); color: #fff; }
.ag-plan.featured h3, .ag-plan.featured .ag-plan-value { color: #fff; }
.ag-plan-badge { position: absolute; top: -13px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, var(--brand-2), var(--brand-3)); color: #fff; font-size: 11px; font-weight: 800; letter-spacing: .12em; padding: 6px 14px; border-radius: 999px; white-space: nowrap; }
.ag-plan-name { font-size: 16px; font-weight: 700; color: var(--ink-soft); }
.ag-plan.featured .ag-plan-name { color: #bfdbfe; }
.ag-plan-price { display: flex; align-items: baseline; gap: 6px; margin: 14px 0 6px; flex-wrap: wrap; }
.ag-plan-value { font-size: 42px; font-weight: 800; letter-spacing: -.04em; color: var(--ink); }
.ag-plan-period { font-size: 14px; color: var(--muted); }
.ag-plan.featured .ag-plan-period, .ag-plan.featured .ag-plan-desc { color: #cbd5e1; }
.ag-plan-desc { font-size: 14px; color: var(--muted); margin-bottom: 24px; }
.ag-plan-feats { list-style: none; padding: 0; margin: 0 0 28px; flex: 1; display: flex; flex-direction: column; gap: 12px; }
.ag-plan-feat { font-size: 14px; color: var(--ink-soft); display: flex; align-items: center; gap: 10px; }
.ag-plan.featured .ag-plan-feat { color: #e2e8f0; }
.ag-check { width: 22px; height: 22px; border-radius: 50%; display: inline-grid; place-items: center; background: #dbe8ff; color: var(--brand-3); flex-shrink: 0; }
.ag-plan.featured .ag-check { background: rgba(34,211,238,.2); color: #67e8f9; }
.ag-plan-cta { display: block; text-align: center; padding: 13px 20px; border-radius: 12px; font-size: 14px; font-weight: 700; border: 1.5px solid var(--brand); color: var(--brand-3); transition: background .2s, color .2s, transform .15s; }
.ag-plan-cta:hover { background: var(--brand); color: #fff; transform: translateY(-1px); }
.ag-plan.featured .ag-plan-cta { background: linear-gradient(135deg, var(--brand-2), var(--brand-3)); color: #fff; border-color: transparent; }
.ag-note { text-align: center; font-size: 13px; color: var(--muted); margin-top: 28px; }
@media (max-width: 960px) { .ag-pricing { grid-template-columns: 1fr; max-width: 460px; margin: 0 auto; gap: 32px; } }

/* FAQ */
.ag-faq { max-width: 780px; margin: 0 auto; }
.ag-faq-item { border-bottom: 1px solid var(--line); }
.ag-faq-btn { width: 100%; display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 22px 4px; background: transparent; border: 0; cursor: pointer; text-align: left; color: var(--ink); }
.ag-faq-q { font-size: 17px; font-weight: 600; }
.ag-faq-ic { width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0; display: grid; place-items: center; background: #e0e9ff; color: var(--brand-3); font-size: 18px; font-weight: 700; line-height: 1; transition: transform .25s ease, background .2s; }
.ag-faq-item.open .ag-faq-ic { transform: rotate(45deg); background: #c7dafe; }
.ag-faq-a { font-size: 15px; color: var(--ink-soft); line-height: 1.75; padding: 0 4px 24px; animation: agFade .3s ease; }
@keyframes agFade { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }

/* Projeto / contato */
.ag-dev { background: var(--navy); color: #fff; position: relative; overflow: hidden; isolation: isolate; }
.ag-dev .ag-title, .ag-dev .ag-eyebrow { color: #fff; }
.ag-dev .ag-eyebrow { color: #93c5fd; }
.ag-dev .ag-subtitle { color: #cbd5e1; }
.ag-dev .ag-glow.g1 { top: -200px; right: auto; left: 20%; opacity: .6; }
.ag-links { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; list-style: none; padding: 0; margin: 0; perspective: 1200px; }
.ag-link-card { display: flex; flex-direction: column; gap: 10px; height: 100%; padding: 22px 18px; border-radius: 18px; background: rgba(148,163,184,.08); border: 1px solid rgba(148,163,184,.28); color: #fff; transform: rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)); transition: transform .18s ease-out, background .2s, border-color .2s; }
.ag-link-card:hover { background: rgba(59,130,246,.18); border-color: rgba(96,165,250,.7); }
.ag-link-ic { width: 42px; height: 42px; border-radius: 12px; display: grid; place-items: center; background: rgba(34,211,238,.14); color: #67e8f9; transform: translateZ(20px); }
.ag-link-name { font-size: 15px; font-weight: 700; transform: translateZ(14px); }
.ag-link-desc { font-size: 13px; color: #cbd5e1; word-break: break-word; }
@media (max-width: 1000px) { .ag-links { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 640px) { .ag-links { grid-template-columns: 1fr 1fr; } }
@media (max-width: 400px) { .ag-links { grid-template-columns: 1fr; } }

/* CTA final */
.ag-final { position: relative; overflow: hidden; background: #1e40af; color: #fff; padding: 96px 24px; text-align: center; }
.ag-final::before { content: ""; position: absolute; inset: 0; background: radial-gradient(700px 300px at 50% 0%, rgba(255,255,255,.16), transparent 60%); pointer-events: none; }
.ag-final-inner { max-width: 720px; margin: 0 auto; position: relative; }
.ag .ag-final-title { font-size: clamp(28px, 4vw, 46px); font-weight: 800; letter-spacing: -.03em; line-height: 1.1; margin: 0 0 16px; color: #fff; }
.ag .ag-final-sub { font-size: 18px; color: #e0ecff; margin: 0 0 34px; }
.ag .ag-final-btn { display: inline-flex; align-items: center; gap: 10px; padding: 16px 32px; border-radius: 14px; background: #fff; color: var(--brand-3); font-size: 16px; font-weight: 800; box-shadow: 0 22px 44px -18px rgba(0,0,0,.55); transition: transform .15s ease; }
.ag .ag-final-btn:hover { transform: translateY(-2px); }
.ag .ag-final-btn:focus-visible { outline-color: #fff; }
.ag .ag-final-note { font-size: 14px; color: #dbeafe; margin: 16px 0 0; }

/* Footer */
.ag-footer { background: #070b14; color: #cbd5e1; padding: 64px 24px 28px; }
.ag-footer-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 2fr 1fr 1fr 1.4fr; gap: 40px; padding-bottom: 44px; }
.ag-footer-col { display: flex; flex-direction: column; gap: 10px; min-width: 0; }
.ag-footer-title { font-size: 12px; font-weight: 700; color: #fff; text-transform: uppercase; letter-spacing: .14em; margin-bottom: 6px; }
.ag-footer-desc { font-size: 14px; line-height: 1.7; color: #cbd5e1; margin-top: 8px; max-width: 320px; }
.ag-footer-link { font-size: 14px; color: #cbd5e1; background: transparent; border: 0; padding: 2px 0; text-align: left; cursor: pointer; font-family: inherit; width: fit-content; display: inline-flex; align-items: center; gap: 8px; transition: color .2s; }
.ag-footer-link:hover { color: #fff; text-decoration: underline; }
.ag-footer-bottom { max-width: 1200px; margin: 0 auto; padding-top: 24px; border-top: 1px solid rgba(255,255,255,.12); display: flex; justify-content: space-between; flex-wrap: wrap; gap: 12px; font-size: 13px; color: #cbd5e1; }

/* Fundos dos botões mantêm contraste suficiente com texto branco. */
.ag-btn-primary, .ag-cta-primary, .ag-plan-badge, .ag-plan.featured .ag-plan-cta {
  background: linear-gradient(135deg, #1d4ed8, #1e40af);
}
@media (max-width: 860px) { .ag-footer-inner { grid-template-columns: 1fr 1fr; gap: 32px; } .ag-footer-col:first-child { grid-column: 1 / -1; } }
@media (max-width: 520px) { .ag-footer-inner { grid-template-columns: 1fr; gap: 28px; } }

/* Movimento reduzido */
@media (prefers-reduced-motion: reduce) {
  .ag [data-reveal] { opacity: 1; transform: none; transition: none; }
  .ag *, .ag *::before, .ag *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
  .ag-chart .line { stroke-dashoffset: 0; }
  .ag-chart .area { opacity: 1; }
  .ag-scene { transform: none; }
  .ag-layer { transform: none; }
}
`;

/* ============================================================
   Hooks e helpers
   ============================================================ */
const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/** Inclina o elemento seguindo o ponteiro. global=true segue o mouse na janela toda. */
function Tilt({
  children,
  className = '',
  max = 8,
  global = false,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  global?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduce) return;

    let raf = 0;
    const apply = (x: number, y: number) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--ry', `${((x - 0.5) * max * 2).toFixed(2)}deg`);
        el.style.setProperty('--rx', `${((0.5 - y) * max * 2).toFixed(2)}deg`);
        el.style.setProperty('--px', ((x - 0.5) * 2).toFixed(3));
        el.style.setProperty('--py', ((y - 0.5) * 2).toFixed(3));
        el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
        el.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
      });
    };
    const onMove = (e: PointerEvent) => {
      if (global) {
        apply(e.clientX / window.innerWidth, e.clientY / window.innerHeight);
      } else {
        const r = el.getBoundingClientRect();
        apply((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
      }
    };
    const reset = () => {
      cancelAnimationFrame(raf);
      ['--rx', '--ry'].forEach((p) => el.style.setProperty(p, '0deg'));
      ['--px', '--py'].forEach((p) => el.style.setProperty(p, '0'));
      ['--mx', '--my'].forEach((p) => el.style.setProperty(p, '50%'));
    };

    const target: Window | HTMLElement = global ? window : el;
    target.addEventListener('pointermove', onMove as EventListener);
    if (!global) el.addEventListener('pointerleave', reset);
    return () => {
      cancelAnimationFrame(raf);
      target.removeEventListener('pointermove', onMove as EventListener);
      if (!global) el.removeEventListener('pointerleave', reset);
    };
  }, [max, global]);

  return (
    <div ref={ref} className={`ag-tilt ${className}`}>
      {children}
    </div>
  );
}

function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <div data-reveal className={className} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function CountUp({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [v, setV] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || typeof IntersectionObserver === 'undefined') {
      setV(to);
      return;
    }
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / 1300, 1);
          setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to]);

  return (
    <span ref={ref}>
      {v}
      {suffix}
    </span>
  );
}

function ExtLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  return (
    <a href={href} className={className} target="_blank" rel="noopener noreferrer">
      {children}
      <span className="sr-only"> (abre em nova aba)</span>
    </a>
  );
}

/* ============================================================
   Página
   ============================================================ */
export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  // Simulador de margem
  const [compra, setCompra] = useState(40);
  const [venda, setVenda] = useState(65);
  const [qtd, setQtd] = useState(100);
  const lucroUn = venda - compra;
  const margem = venda > 0 ? (lucroUn / venda) * 100 : 0;
  const lucroTotal = lucroUn * qtd;
  const maxBar = Math.max(compra, venda, 1);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${h > 0 ? Math.min(window.scrollY / h, 1) : 0})`;
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuAberto) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuAberto(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener('keydown', onKey);
    };
  }, [menuAberto]);

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.ag [data-reveal]'));
    const reveal = (el: Element) => el.classList.add('is-visible');
    els.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.95 && r.bottom > 0) reveal(el);
    });
    if (typeof IntersectionObserver === 'undefined') {
      els.forEach(reveal);
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            reveal(e.target);
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.05, rootMargin: '0px 0px -8% 0px' }
    );
    els.forEach((el) => !el.classList.contains('is-visible') && io.observe(el));
    return () => io.disconnect();
  }, []);

  const scrollPara = (id: string) => {
    setMenuAberto(false);
    requestAnimationFrame(() => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    });
  };

  const navItems: [string, string][] = [
    ['features', 'Recursos'],
    ['simulador', 'Simulador'],
    ['como-funciona', 'Como funciona'],
    ['precos', 'Preços'],
    ['faq', 'FAQ'],
  ];

  return (
    <>
      <style>{STYLES}</style>
      <div className="ag">
        <a href="#ag-main" className="ag-skip">Ir para o conteúdo principal</a>
        <div className="ag-progress" ref={progressRef} aria-hidden="true" />

        {/* ===================== NAVBAR ===================== */}
        <header className={`ag-nav${scrolled ? ' is-scrolled' : ''}`}>
          <div className="ag-nav-inner">
            <Link to="/" className="ag-logo" onClick={() => setMenuAberto(false)} aria-label="Controle de Insumos — início">
              <img src={LOGO_SRC} alt="" width={36} height={36} />
              <span>Controle de Insumos</span>
            </Link>

            <nav className="ag-nav-links" aria-label="Principal">
              {navItems.map(([id, label]) => (
                <button key={id} type="button" className="ag-nav-link" onClick={() => scrollPara(id)}>{label}</button>
              ))}
            </nav>

            <div className="ag-nav-actions">
              <Link to="/login" className="ag-btn-ghost">Entrar</Link>
              <Link to="/signup" className="ag-btn-primary">Criar conta</Link>
            </div>

            <button
              type="button"
              className="ag-burger"
              onClick={() => setMenuAberto((v) => !v)}
              aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={menuAberto}
              aria-controls="ag-menu-mobile"
            >
              <Icon name={menuAberto ? 'close' : 'menu'} size={22} />
            </button>
          </div>

          {menuAberto && (
            <div className="ag-drawer" id="ag-menu-mobile">
              {navItems.map(([id, label]) => (
                <button key={id} type="button" className="ag-drawer-link" onClick={() => scrollPara(id)}>{label}</button>
              ))}
              <div className="ag-drawer-actions">
                <Link to="/login" className="ag-btn-ghost" onClick={() => setMenuAberto(false)}>Entrar</Link>
                <Link to="/signup" className="ag-btn-primary" onClick={() => setMenuAberto(false)}>Criar conta</Link>
              </div>
            </div>
          )}
        </header>

        <main id="ag-main">
          {/* ===================== HERO ===================== */}
          <section className="ag-hero" aria-labelledby="hero-title">
            <div className="ag-glow g1" aria-hidden="true" />
            <div className="ag-glow g2" aria-hidden="true" />
            <div className="ag-hero-inner">
              <div className="ag-hero-text" data-reveal>
                <span className="ag-badge">
                  <span className="ag-badge-dot" aria-hidden="true" />
                  Novo — gráficos de lucro e margem
                </span>

                <h1 id="hero-title" className="ag-hero-title">
                  Controle seus insumos.
                  <br />
                  <em>Veja o lucro crescer.</em>
                </h1>

                <p className="ag-hero-sub">
                  Registre compras e vendas, acompanhe o estoque em tempo real e
                  descubra sua margem por produto. Sem planilha, sem cálculo manual.
                </p>

                <div className="ag-hero-actions">
                  <Link to="/signup" className="ag-cta ag-cta-primary">
                    Começar grátis <Icon name="arrow" size={18} />
                  </Link>
                  <button type="button" className="ag-cta ag-cta-ghost" onClick={() => scrollPara('simulador')}>
                    <Icon name="zap" size={18} /> Testar o simulador
                  </button>
                </div>

                <ul className="ag-trust">
                  {['Sem cartão de crédito', 'Configuração em 1 minuto', 'Cálculos automáticos'].map((t) => (
                    <li key={t}><Icon name="check" size={16} /> {t}</li>
                  ))}
                </ul>
              </div>

              {/* Cena 3D interativa (decorativa) */}
              <div className="ag-scene-wrap" data-reveal aria-hidden="true">
                <Tilt className="ag-scene" max={9} global>
                  <div className="ag-panel">
                    <div className="ag-panel-head">
                      <span className="ag-dot" style={{ background: '#ff5f56' }} />
                      <span className="ag-dot" style={{ background: '#ffbd2e' }} />
                      <span className="ag-dot" style={{ background: '#27c93f' }} />
                      <span className="ag-url">insumos.vercel.app/dashboard</span>
                    </div>
                    <div className="ag-panel-body">
                      <div className="ag-kpis">
                        <div className="ag-kpi"><div className="ag-kpi-label">Investido</div><div className="ag-kpi-value">R$ 12,4k</div></div>
                        <div className="ag-kpi"><div className="ag-kpi-label">Recebido</div><div className="ag-kpi-value">R$ 18,3k</div></div>
                        <div className="ag-kpi"><div className="ag-kpi-label">Lucro</div><div className="ag-kpi-value up">R$ 5,9k</div></div>
                      </div>

                      <svg className="ag-chart" viewBox="0 0 300 110" role="presentation">
                        <defs>
                          <linearGradient id="agArea" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor="#22d3ee" stopOpacity=".35" />
                            <stop offset="1" stopColor="#22d3ee" stopOpacity="0" />
                          </linearGradient>
                          <linearGradient id="agLine" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0" stopColor="#3b82f6" />
                            <stop offset="1" stopColor="#22d3ee" />
                          </linearGradient>
                        </defs>
                        <path d="M0 27.5H300M0 55H300M0 82.5H300" stroke="rgba(148,163,184,.18)" strokeWidth="1" />
                        <path className="area" d="M0 92 C30 84 50 88 80 62 S130 58 160 42 S230 32 300 12 L300 110 L0 110 Z" fill="url(#agArea)" />
                        <path className="line" pathLength={1} d="M0 92 C30 84 50 88 80 62 S130 58 160 42 S230 32 300 12" fill="none" stroke="url(#agLine)" strokeWidth="3" strokeLinecap="round" />
                      </svg>

                      <div className="ag-bars">
                        {[
                          { nome: 'Cimento', valor: 'R$ 8,2k', pct: 100 },
                          { nome: 'Tintas', valor: 'R$ 4,1k', pct: 62 },
                          { nome: 'Areia', valor: 'R$ 2,8k', pct: 42 },
                          { nome: 'Ferragens', valor: 'R$ 1,5k', pct: 24 },
                        ].map((ins, i) => (
                          <div key={ins.nome} className="ag-bar-row">
                            <span className="ag-bar-label">{ins.nome}</span>
                            <div className="ag-bar">
                              <div className="ag-bar-fill" style={{ width: `${ins.pct}%`, animationDelay: `${i * 0.12 + 0.5}s` }} />
                            </div>
                            <span className="ag-bar-value">{ins.valor}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="ag-layer l1">
                    <div className="ag-chip">
                      <span className="ag-chip-ic ok"><Icon name="trend" size={18} /></span>
                      <span>Margem +32%<small>Cimento CP-II</small></span>
                    </div>
                  </div>
                  <div className="ag-layer l2">
                    <div className="ag-chip">
                      <span className="ag-chip-ic warn"><Icon name="bell" size={18} /></span>
                      <span>Estoque baixo<small>Areia fina · 4 un</small></span>
                    </div>
                  </div>
                  <div className="ag-layer l3">
                    <img src={LOGO_SRC} alt="" width={64} height={64} />
                  </div>
                </Tilt>
              </div>
            </div>
          </section>

          {/* ===================== STATS ===================== */}
          <section className="ag-stats" aria-label="O produto em números">
            <ul className="ag-stats-inner">
              <li><div className="ag-stat-num"><CountUp to={6} /></div><div className="ag-stat-label">Módulos integrados</div></li>
              <li><div className="ag-stat-num"><CountUp to={3} /></div><div className="ag-stat-label">Tipos de movimentação</div></li>
              <li><div className="ag-stat-num"><CountUp to={100} suffix="%" /></div><div className="ag-stat-label">Web e responsivo</div></li>
              <li><div className="ag-stat-num">AA</div><div className="ag-stat-label">Contraste WCAG</div></li>
            </ul>
          </section>

          {/* ===================== FEATURES ===================== */}
          <section id="features" className="ag-section" aria-labelledby="features-title">
            <div className="ag-container">
              <header className="ag-section-head" data-reveal>
                <span className="ag-eyebrow">Recursos</span>
                <h2 id="features-title" className="ag-title">Tudo que sua operação precisa</h2>
                <p className="ag-subtitle">
                  Ferramentas pensadas para controlar compras, vendas e margem,
                  sem depender de planilhas ou cálculos manuais.
                </p>
              </header>

              <div className="ag-grid3">
                {[
                  { icon: 'box', titulo: 'Cadastro de insumos', desc: 'Nome, categoria, unidade, estoque mínimo e preço de compra e venda por item.' },
                  { icon: 'swap', titulo: 'Compras e vendas', desc: 'Registre cada movimentação com preço unitário, quantidade, data e fornecedor ou cliente.' },
                  { icon: 'trend', titulo: 'Lucro e margem', desc: 'Cálculo automático do lucro por unidade e da margem percentual em cada insumo.' },
                  { icon: 'chart', titulo: 'Gráficos comparativos', desc: 'Compras vs vendas ao longo do tempo e evolução do lucro mês a mês.' },
                  { icon: 'bell', titulo: 'Alerta de estoque baixo', desc: 'Defina a quantidade mínima e seja avisado antes do insumo acabar.' },
                  { icon: 'building', titulo: 'Fornecedores', desc: 'Cadastro simples com documento, contato e total comprado de cada fornecedor.' },
                ].map((f, i) => (
                  <Reveal key={f.titulo} delay={i * 50}>
                    <Tilt className="ag-card" max={7}>
                      <div className="ag-feature-icon"><Icon name={f.icon} size={24} /></div>
                      <h3 className="ag-feature-title">{f.titulo}</h3>
                      <p className="ag-feature-desc">{f.desc}</p>
                    </Tilt>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* ===================== SIMULADOR ===================== */}
          <section id="simulador" className="ag-section soft" aria-labelledby="sim-title">
            <div className="ag-container">
              <header className="ag-section-head" data-reveal>
                <span className="ag-eyebrow">Simulador</span>
                <h2 id="sim-title" className="ag-title">Descubra sua margem em segundos</h2>
                <p className="ag-subtitle">Mexa nos controles e veja o lucro por unidade, a margem e o total se atualizarem na hora.</p>
              </header>

              <Reveal>
                <div className="ag-sim">
                  <div className="ag-sim-panel">
                    <div className="ag-field">
                      <div className="ag-field-top">
                        <label htmlFor="sim-compra">Preço de compra</label>
                        <output htmlFor="sim-compra">{brl(compra)}</output>
                      </div>
                      <input id="sim-compra" type="range" min={1} max={200} step={1} value={compra} onChange={(e) => setCompra(Number(e.target.value))} />
                    </div>
                    <div className="ag-field">
                      <div className="ag-field-top">
                        <label htmlFor="sim-venda">Preço de venda</label>
                        <output htmlFor="sim-venda">{brl(venda)}</output>
                      </div>
                      <input id="sim-venda" type="range" min={1} max={300} step={1} value={venda} onChange={(e) => setVenda(Number(e.target.value))} />
                    </div>
                    <div className="ag-field">
                      <div className="ag-field-top">
                        <label htmlFor="sim-qtd">Quantidade vendida</label>
                        <output htmlFor="sim-qtd">{qtd} un</output>
                      </div>
                      <input id="sim-qtd" type="range" min={1} max={1000} step={1} value={qtd} onChange={(e) => setQtd(Number(e.target.value))} />
                    </div>
                  </div>

                  <Tilt className="ag-sim-panel ag-sim-result" max={6}>
                    <div aria-live="polite" aria-atomic="true">
                      <div className="ag-sim-label">Margem</div>
                      <div className={`ag-sim-big ${margem < 0 ? 'neg' : 'pos'}`}>{margem.toFixed(1).replace('.', ',')}%</div>
                      <span className="ag-sim-status">
                        {margem < 0 ? 'Prejuízo por unidade' : margem < 15 ? 'Margem apertada' : 'Margem saudável'}
                      </span>
                      <div className="ag-sim-total">
                        Lucro por unidade: <strong>{brl(lucroUn)}</strong>
                        <br />
                        Lucro total: <strong>{brl(lucroTotal)}</strong>
                      </div>
                    </div>
                    <div className="ag-sim-cols" aria-hidden="true">
                      <div className="ag-sim-col buy"><span>Compra</span><i style={{ height: `${(compra / maxBar) * 80}%` }} /></div>
                      <div className="ag-sim-col sell"><span>Venda</span><i style={{ height: `${(venda / maxBar) * 80}%` }} /></div>
                    </div>
                  </Tilt>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ===================== COMO FUNCIONA ===================== */}
          <section id="como-funciona" className="ag-section" aria-labelledby="como-title">
            <div className="ag-container">
              <header className="ag-section-head" data-reveal>
                <span className="ag-eyebrow">Como funciona</span>
                <h2 id="como-title" className="ag-title">Comece em 3 passos simples</h2>
                <p className="ag-subtitle">Do cadastro ao primeiro relatório de lucro em poucos minutos.</p>
              </header>

              <ol className="ag-steps">
                {[
                  { num: '01', icon: 'shield', titulo: 'Crie sua conta', desc: 'Cadastro gratuito, sem cartão de crédito. Confirme o e-mail e pronto.' },
                  { num: '02', icon: 'box', titulo: 'Cadastre seus insumos', desc: 'Adicione nome, categoria, unidade e estoque mínimo. Registre compras e vendas.' },
                  { num: '03', icon: 'chart', titulo: 'Acompanhe o lucro', desc: 'Veja margens, totais e gráficos atualizados a cada movimentação.' },
                ].map((p, i) => (
                  <li key={p.num} className="ag-step" data-reveal style={{ transitionDelay: `${i * 90}ms` }}>
                    <div className="ag-step-num" aria-hidden="true">{p.num}</div>
                    <div className="ag-step-icon" aria-hidden="true"><Icon name={p.icon} size={32} /></div>
                    <h3 className="ag-step-title">{p.titulo}</h3>
                    <p className="ag-step-desc">{p.desc}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* ===================== PARA QUEM ===================== */}
          <section className="ag-section soft" aria-labelledby="uso-title">
            <div className="ag-container">
              <header className="ag-section-head" data-reveal>
                <span className="ag-eyebrow">Para quem é</span>
                <h2 id="uso-title" className="ag-title">Feito para quem compra e revende</h2>
                <p className="ag-subtitle">Do pequeno comércio à distribuidora: onde há estoque e margem, há ganho de clareza.</p>
              </header>

              <div className="ag-grid3">
                {[
                  { tag: 'Comércio', titulo: 'Lojas e varejo', itens: ['Descubra produtos com margem negativa', 'Ajuste preços com base em dados', 'Acabe com a planilha de estoque'] },
                  { tag: 'Compras', titulo: 'Distribuidoras', itens: ['Alerta antes do item crítico acabar', 'Total comprado por fornecedor', 'Compras vs vendas no tempo'] },
                  { tag: 'Obras', titulo: 'Construção e serviços', itens: ['Controle cimento, tinta, areia e mais', 'Entradas e saídas por data', 'Exporte as movimentações em CSV'] },
                ].map((c, i) => (
                  <Reveal key={c.titulo} delay={i * 60}>
                    <Tilt className="ag-card" max={7}>
                      <span className="ag-use-tag">{c.tag}</span>
                      <h3 className="ag-feature-title">{c.titulo}</h3>
                      <ul className="ag-use-list">
                        {c.itens.map((it) => (
                          <li key={it}><Icon name="check" size={16} /> {it}</li>
                        ))}
                      </ul>
                    </Tilt>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* ===================== PREÇOS ===================== */}
          <section id="precos" className="ag-section" aria-labelledby="precos-title">
            <div className="ag-container">
              <header className="ag-section-head" data-reveal>
                <span className="ag-eyebrow">Preços</span>
                <h2 id="precos-title" className="ag-title">Planos para todos os tamanhos</h2>
                <p className="ag-subtitle">Comece grátis e evolua conforme sua operação cresce. Sem surpresas.</p>
              </header>

              <div className="ag-pricing">
                {[
                  { nome: 'Grátis', preco: 'R$ 0', periodo: '/ sempre', desc: 'Ideal para quem está começando', features: ['Até 50 insumos', 'Até 200 movimentações/mês', 'Dashboard com KPIs', 'Exportar CSV', 'Suporte por e-mail'], cta: 'Começar grátis', destaque: false },
                  { nome: 'Pro', preco: 'R$ 29', periodo: '/ mês', desc: 'Para quem quer controle total', features: ['Insumos ilimitados', 'Movimentações ilimitadas', 'Gráficos avançados', 'Alertas de estoque', 'Gestão de fornecedores', 'Suporte prioritário'], cta: 'Assinar Pro', destaque: true },
                  { nome: 'Empresa', preco: 'R$ 99', periodo: '/ mês', desc: 'Multi-usuários e integrações', features: ['Tudo do Pro', 'Multi-usuários', 'API de integração', 'Relatórios personalizados', 'Gerente de conta'], cta: 'Falar com vendas', destaque: false },
                ].map((p, i) => (
                  <Reveal key={p.nome} delay={i * 60}>
                    <Tilt className={`ag-plan${p.destaque ? ' featured' : ''}`} max={5}>
                      {p.destaque && <span className="ag-plan-badge">MAIS POPULAR</span>}
                      <h3 className="ag-plan-name">{p.nome}</h3>
                      <div className="ag-plan-price">
                        <span className="ag-plan-value">{p.preco}</span>
                        <span className="ag-plan-period">{p.periodo}</span>
                      </div>
                      <p className="ag-plan-desc">{p.desc}</p>
                      <ul className="ag-plan-feats">
                        {p.features.map((f) => (
                          <li key={f} className="ag-plan-feat">
                            <span className="ag-check"><Icon name="check" size={13} /></span> {f}
                          </li>
                        ))}
                      </ul>
                      <Link to="/signup" className="ag-plan-cta">{p.cta}</Link>
                    </Tilt>
                  </Reveal>
                ))}
              </div>
              <p className="ag-note">Planos ilustrativos — projeto de portfólio.</p>
            </div>
          </section>

          {/* ===================== FAQ ===================== */}
          <section id="faq" className="ag-section soft" aria-labelledby="faq-title">
            <div className="ag-container">
              <header className="ag-section-head" data-reveal>
                <span className="ag-eyebrow">Perguntas frequentes</span>
                <h2 id="faq-title" className="ag-title">Dúvidas? A gente responde</h2>
              </header>

              <div className="ag-faq" data-reveal>
                {[
                  { q: 'Preciso instalar algo?', a: 'Não. O Controle de Insumos é 100% web. Basta acessar pelo navegador do computador, tablet ou celular.' },
                  { q: 'Como funciona o cálculo de lucro e margem?', a: 'O lucro por unidade é o preço de venda menos o preço de compra. A margem é o lucro dividido pelo preço de venda. Tudo calculado automaticamente.' },
                  { q: 'O estoque é atualizado sozinho?', a: 'Sim. Cada compra soma, cada venda subtrai e ajustes aplicam a correção de inventário. Você não precisa mexer no estoque manualmente.' },
                  { q: 'Posso cadastrar meus fornecedores?', a: 'Sim. Você cadastra nome, documento, telefone e e-mail. No histórico de compras, cada fornecedor aparece com o total comprado.' },
                  { q: 'Meus dados ficam seguros?', a: 'Seus dados ficam salvos na nuvem e você pode exportar um CSV das movimentações a qualquer momento.' },
                  { q: 'Existe uma API?', a: 'Sim. A API do projeto é documentada e pode ser explorada ao vivo pela página de documentação interativa, linkada na seção “Conheça o projeto”.' },
                ].map((item, i) => (
                  <FaqItem key={item.q} index={i} pergunta={item.q} resposta={item.a} />
                ))}
              </div>
            </div>
          </section>

          {/* ===================== CONHEÇA O PROJETO ===================== */}
          <section id="projeto" className="ag-section ag-dev" aria-labelledby="dev-title">
            <div className="ag-glow g1" aria-hidden="true" />
            <div className="ag-container">
              <header className="ag-section-head" data-reveal>
                <span className="ag-eyebrow">Conheça o projeto</span>
                <h2 id="dev-title" className="ag-title">Construído por Álvaro Velame</h2>
                <p className="ag-subtitle">
                  Um produto full stack feito do zero. Explore a API, o código e fale comigo.
                </p>
              </header>

              <ul className="ag-links">
                {[
                  { icon: 'code', nome: 'Documentação da API', desc: 'Teste os endpoints ao vivo', href: LINKS.api },
                  { icon: 'globe', nome: 'Portfólio', desc: 'alvarovelame.vercel.app', href: LINKS.portfolio },
                  { icon: 'github', nome: 'GitHub', desc: 'ALVAROVELAME', href: LINKS.github },
                  { icon: 'linkedin', nome: 'LinkedIn', desc: 'alvaro-velame', href: LINKS.linkedin },
                  { icon: 'mail', nome: 'E-mail', desc: LINKS.email, href: `mailto:${LINKS.email}` },
                ].map((l, i) => (
                  <li key={l.nome} data-reveal style={{ transitionDelay: `${i * 60}ms` }}>
                    <Tilt max={9}>
                      {l.href.startsWith('mailto:') ? (
                        <a href={l.href} className="ag-link-card">
                          <span className="ag-link-ic"><Icon name={l.icon} size={22} /></span>
                          <span className="ag-link-name">{l.nome}</span>
                          <span className="ag-link-desc">{l.desc}</span>
                        </a>
                      ) : (
                        <ExtLink href={l.href} className="ag-link-card">
                          <span className="ag-link-ic"><Icon name={l.icon} size={22} /></span>
                          <span className="ag-link-name">{l.nome}</span>
                          <span className="ag-link-desc">{l.desc}</span>
                        </ExtLink>
                      )}
                    </Tilt>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* ===================== CTA FINAL ===================== */}
          <section className="ag-final" aria-labelledby="cta-final-title">
            <div className="ag-final-inner" data-reveal>
              <h2 id="cta-final-title" className="ag-final-title">Pronto para ver seu lucro real?</h2>
              <p className="ag-final-sub">
                Troque a planilha por controle real de insumos. Comece grátis hoje.
              </p>
              <Link to="/signup" className="ag-final-btn">
                Criar conta gratuita <Icon name="arrow" size={20} />
              </Link>
              <p className="ag-final-note">Sem cartão de crédito · Cancele quando quiser</p>
            </div>
          </section>
        </main>

        {/* ===================== FOOTER ===================== */}
        <footer className="ag-footer">
          <div className="ag-footer-inner">
            <div className="ag-footer-col">
              <div className="ag-logo">
                <img src={LOGO_SRC} alt="" width={36} height={36} />
                <span>Controle de Insumos</span>
              </div>
              <p className="ag-footer-desc">
                Gestão de insumos, compras, vendas e lucro para pequenos e médios negócios.
              </p>
            </div>

            <nav className="ag-footer-col" aria-label="Produto">
              <h4 className="ag-footer-title">Produto</h4>
              <button type="button" className="ag-footer-link" onClick={() => scrollPara('features')}>Recursos</button>
              <button type="button" className="ag-footer-link" onClick={() => scrollPara('simulador')}>Simulador</button>
              <button type="button" className="ag-footer-link" onClick={() => scrollPara('precos')}>Preços</button>
              <button type="button" className="ag-footer-link" onClick={() => scrollPara('faq')}>FAQ</button>
            </nav>

            <nav className="ag-footer-col" aria-label="Conta">
              <h4 className="ag-footer-title">Conta</h4>
              <Link to="/login" className="ag-footer-link">Entrar</Link>
              <Link to="/signup" className="ag-footer-link">Criar conta</Link>
            </nav>

            <nav className="ag-footer-col" aria-label="Contato e links">
              <h4 className="ag-footer-title">Contato</h4>
              <a href={`mailto:${LINKS.email}`} className="ag-footer-link"><Icon name="mail" size={16} /> {LINKS.email}</a>
              <ExtLink href={LINKS.linkedin} className="ag-footer-link"><Icon name="linkedin" size={16} /> LinkedIn</ExtLink>
              <ExtLink href={LINKS.github} className="ag-footer-link"><Icon name="github" size={16} /> GitHub</ExtLink>
              <ExtLink href={LINKS.portfolio} className="ag-footer-link"><Icon name="globe" size={16} /> Portfólio</ExtLink>
              <ExtLink href={LINKS.api} className="ag-footer-link"><Icon name="code" size={16} /> Documentação da API</ExtLink>
            </nav>
          </div>

          <div className="ag-footer-bottom">
            <span>© {new Date().getFullYear()} Controle de Insumos. Projeto de portfólio por Álvaro Velame.</span>
            <span>Feito no Brasil</span>
          </div>
        </footer>
      </div>
    </>
  );
}

/* ============================================================
   Subcomponentes
   ============================================================ */
function FaqItem({ index, pergunta, resposta }: { index: number; pergunta: string; resposta: string }) {
  const [aberto, setAberto] = useState(false);
  const id = `faq-resp-${index}`;
  return (
    <div className={`ag-faq-item${aberto ? ' open' : ''}`}>
      <h3 style={{ margin: 0 }}>
        <button
          type="button"
          className="ag-faq-btn ag-light-focus"
          onClick={() => setAberto((v) => !v)}
          aria-expanded={aberto}
          aria-controls={id}
        >
          <span className="ag-faq-q">{pergunta}</span>
          <span className="ag-faq-ic" aria-hidden="true">+</span>
        </button>
      </h3>
      {aberto && (
        <p className="ag-faq-a" id={id}>
          {resposta}
        </p>
      )}
    </div>
  );
}
