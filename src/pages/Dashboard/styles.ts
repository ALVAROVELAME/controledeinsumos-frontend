export const STYLES = `
.dash {
  --bg: #f6f8fb;
  --surface: #ffffff;
  --surface-2: #f1f5f9;
  --surface-3: #e2e8f0;
  --sidebar: #ffffff;
  --ink: #0f172a;
  --ink-soft: #334155;
  --muted: #5b6b82;
  --border: #e2e8f0;
  --border-strong: #cbd5e1;
  --brand: #2563eb;
  --brand-2: #3b82f6;
  --brand-3: #1d4ed8;
  --brand-soft: #eff6ff;
  --brand-ink: #ffffff;
  --danger: #dc2626;
  --danger-soft: #fef2f2;
  --danger-line: #fca5a5;
  --warn: #b45309;
  --warn-soft: #fef3c7;
  --ok: #059669;
  --ok-soft: #ecfdf5;
  --shadow-sm: 0 1px 2px rgba(15,23,42,.05);
  --shadow-md: 0 8px 24px -12px rgba(15,23,42,.22);
  --shadow-lg: 0 24px 60px -20px rgba(15,23,42,.35);
  --radius: 14px;
  --radius-sm: 10px;
  color-scheme: light;

  min-height: 100vh; min-height: 100dvh;
  display: grid; grid-template-columns: 248px minmax(0, 1fr);
  background: var(--bg); color: var(--ink);
  font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.5; -webkit-font-smoothing: antialiased;
}
.dash[data-theme="escuro"] {
  --bg: #0b0f1a; --surface: #111827; --surface-2: #1a2336; --surface-3: #334155;
  --sidebar: #0e1424; --ink: #f1f5f9; --ink-soft: #cbd5e1; --muted: #9fb0c6;
  --border: #263247; --border-strong: #475569;
  --brand: #60a5fa; --brand-2: #93c5fd; --brand-3: #93c5fd; --brand-soft: #172a47; --brand-ink: #0b1220;
  --danger: #f87171; --danger-soft: #3a1214; --danger-line: #7f1d1d;
  --warn: #fbbf24; --warn-soft: #3a2c0f; --ok: #34d399; --ok-soft: #063b2e;
  --shadow-sm: 0 1px 2px rgba(0,0,0,.4); --shadow-md: 0 8px 24px -12px rgba(0,0,0,.6); --shadow-lg: 0 24px 60px -20px rgba(0,0,0,.75);
  color-scheme: dark;
}
.dash *, .dash *::before, .dash *::after { box-sizing: border-box; }
.dash h1, .dash h2, .dash h3 { margin: 0; letter-spacing: -.02em; }
.dash p { margin: 0; }
.dash button, .dash input, .dash select, .dash textarea { font-family: inherit; color: inherit; }
.dash :focus-visible { outline: 3px solid var(--brand-2); outline-offset: 2px; border-radius: 8px; }

.sr-only {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;
}
.skip-link {
  position: fixed; top: 8px; left: 8px; z-index: 3000; padding: 10px 16px; border-radius: 10px;
  background: var(--brand); color: var(--brand-ink); font-weight: 700; font-size: 14px;
  transform: translateY(-200%); text-decoration: none;
}
.skip-link:focus { transform: none; }
kbd.dash-kbd {
  font-family: inherit; font-size: 10.5px; font-weight: 700; padding: 2px 6px; border-radius: 5px;
  background: var(--surface); border: 1px solid var(--border); color: var(--ink-soft); white-space: nowrap;
}

.dash-sidebar {
  display: flex; flex-direction: column; gap: 6px; padding: 18px 12px; background: var(--sidebar);
  border-right: 1px solid var(--border); position: sticky; top: 0; height: 100vh; height: 100dvh; overflow-y: auto;
}
.dash-brand { display: flex; align-items: center; gap: 10px; padding: 4px 8px 16px; margin-bottom: 8px; }
.dash-brand-mark {
  width: 38px; height: 38px; border-radius: 11px; display: grid; place-items: center; font-size: 19px;
  background: var(--brand-soft); border: 1px solid var(--border); flex-shrink: 0;
}
.dash-brand-text { display: flex; flex-direction: column; line-height: 1.25; }
.dash-brand-name { font-weight: 800; font-size: 15px; }
.dash-brand-sub { font-size: 11.5px; color: var(--muted); }
.dash-nav { display: flex; flex-direction: column; gap: 2px; }
.dash-nav-btn {
  display: flex; align-items: center; gap: 12px; width: 100%; min-height: 42px; padding: 9px 12px;
  border: none; border-radius: var(--radius-sm); background: transparent; color: var(--ink-soft);
  cursor: pointer; font-size: 14px; font-weight: 500; text-align: left; transition: background .15s, color .15s;
}
.dash-nav-btn:hover { background: var(--surface-2); color: var(--ink); }
.dash-nav-btn.is-active { background: var(--brand-soft); color: var(--brand); font-weight: 700; }
.dash[data-theme="escuro"] .dash-nav-btn.is-active { color: var(--brand-3); }
.dash-nav-icon { font-size: 16px; width: 20px; text-align: center; flex-shrink: 0; }
.dash-nav-badge {
  margin-left: auto; font-size: 11px; font-weight: 700; background: var(--surface-3); color: var(--ink);
  padding: 1px 8px; border-radius: 999px; font-variant-numeric: tabular-nums;
}
.dash-nav-badge.is-alert { background: var(--danger-soft); color: var(--danger); }
.dash-sidebar-footer { margin-top: auto; padding-top: 12px; border-top: 1px solid var(--border); display: flex; flex-direction: column; gap: 2px; }
.dash-shortcuts { font-size: 12px; color: var(--muted); padding: 8px 12px 0; display: flex; flex-wrap: wrap; gap: 6px 10px; align-items: center; }

.dash-main { display: flex; flex-direction: column; min-width: 0; }
.dash-topbar {
  position: sticky; top: 0; z-index: 30; display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 10px 28px; min-height: 64px;
  background: color-mix(in srgb, var(--bg) 88%, transparent);
  backdrop-filter: saturate(180%) blur(14px); -webkit-backdrop-filter: saturate(180%) blur(14px);
  border-bottom: 1px solid var(--border);
}
.dash-topbar-left { display: flex; align-items: center; gap: 12px; min-width: 0; }
.dash-burger {
  display: none; width: 42px; height: 42px; align-items: center; justify-content: center; background: var(--surface);
  border: 1px solid var(--border); border-radius: var(--radius-sm); cursor: pointer; font-size: 18px;
}
.dash-title { font-size: 18px; font-weight: 800; line-height: 1.2; }
.dash-subtitle { font-size: 12.5px; color: var(--muted); margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dash-topbar-right { display: flex; align-items: center; gap: 8px; }
.dash-cmdk {
  display: inline-flex; align-items: center; gap: 10px; min-height: 42px; padding: 6px 10px 6px 14px;
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm);
  color: var(--muted); font-size: 13px; cursor: pointer; transition: border-color .15s, color .15s;
}
.dash-cmdk:hover { border-color: var(--brand); color: var(--ink); }
.dash-icon-btn {
  display: inline-flex; align-items: center; justify-content: center; width: 42px; height: 42px;
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm);
  cursor: pointer; font-size: 15px; transition: border-color .15s, color .15s;
}
.dash-icon-btn:hover { border-color: var(--brand); color: var(--brand); }
.dash-user { position: relative; }
.dash-user-btn {
  display: inline-flex; align-items: center; gap: 10px; padding: 4px 12px 4px 4px; background: var(--surface);
  border: 1px solid var(--border); border-radius: 999px; cursor: pointer; transition: border-color .15s;
}
.dash-user-btn:hover { border-color: var(--border-strong); }
.dash-user-name { font-size: 13px; font-weight: 600; max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dash-avatar {
  width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center;
  color: var(--brand-ink); font-weight: 700; font-size: 12px; background: var(--brand); flex-shrink: 0;
}
.dash-menu {
  position: absolute; top: calc(100% + 8px); right: 0; min-width: 260px; background: var(--surface);
  border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow-lg); padding: 8px; z-index: 50;
  animation: dashPop .14s ease-out;
}
@keyframes dashPop { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
.dash-menu-header { padding: 10px 12px 12px; border-bottom: 1px solid var(--border); margin-bottom: 6px; }
.dash-menu-name { font-size: 13.5px; font-weight: 700; }
.dash-menu-email { font-size: 12px; color: var(--muted); margin-top: 2px; overflow: hidden; text-overflow: ellipsis; }
.dash-menu-item {
  display: flex; align-items: center; gap: 10px; width: 100%; min-height: 40px; padding: 9px 12px; border: none;
  background: transparent; border-radius: 8px; cursor: pointer; font-size: 13px; text-align: left;
}
.dash-menu-item:hover { background: var(--surface-2); }

.dash-content { padding: 22px 28px 80px; display: flex; flex-direction: column; gap: 20px; max-width: 1680px; width: 100%; margin: 0 auto; outline: none; }

.dash-kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 12px; }
.dash-kpi { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px 16px; display: flex; align-items: center; gap: 12px; }
button.dash-kpi { width: 100%; text-align: left; cursor: pointer; font: inherit; transition: border-color .15s, box-shadow .15s; }
button.dash-kpi:hover { border-color: var(--brand); }
button.dash-kpi.is-active { border-color: var(--brand); box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-2) 28%, transparent); }
.dash-kpi-icon {
  width: 40px; height: 40px; border-radius: 11px; display: grid; place-items: center; font-size: 18px;
  background: var(--brand-soft); flex-shrink: 0;
}
.dash-kpi.is-danger .dash-kpi-icon { background: var(--danger-soft); }
.dash-kpi.is-ok .dash-kpi-icon { background: var(--ok-soft); }
.dash-kpi-body { display: block; min-width: 0; }
.dash-kpi-label { display: block; font-size: 12.5px; color: var(--muted); font-weight: 600; }
.dash-kpi-value { display: block; font-size: 22px; font-weight: 800; letter-spacing: -.03em; font-variant-numeric: tabular-nums; line-height: 1.2; }
.dash-kpi-hint { font-size: 12px; font-weight: 600; color: var(--muted); margin-left: 6px; letter-spacing: 0; }
.dash-kpi-detail { display: block; font-size: 12px; color: var(--muted); margin-top: 2px; }
.dash-kpi.is-danger .dash-kpi-value { color: var(--danger); }
.dash-kpi.is-ok .dash-kpi-value { color: var(--ok); }

.dash-panel { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px 22px; }
.dash-panel-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.dash-panel-title { font-size: 14.5px; font-weight: 700; }
.dash-panel-meta { font-size: 12.5px; color: var(--muted); }

.dash-toolbar { display: flex; flex-direction: column; gap: 10px; }
.dash-filters { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.dash-filters-spacer { margin-left: auto; display: flex; gap: 8px; flex-wrap: wrap; }
.dash-input, .dash-select {
  min-height: 42px; padding: 9px 14px; background: var(--surface); border: 1.5px solid var(--border);
  border-radius: var(--radius-sm); font-size: 14px; transition: border-color .15s, box-shadow .15s;
}
.dash-input { flex: 1 1 220px; min-width: 0; }
.field > .dash-input, .field > .dash-select, .field > .dash-input-group { flex: 0 0 auto; width: 100%; }
.dash input[type="number"] { -moz-appearance: textfield; appearance: textfield; }
.dash input[type="number"]::-webkit-outer-spin-button, .dash input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.dash-input-group { display: flex; align-items: stretch; border: 1.5px solid var(--border); border-radius: var(--radius-sm); background: var(--surface); overflow: hidden; transition: border-color .15s, box-shadow .15s; }
.dash-input-group:hover { border-color: var(--border-strong); }
.dash-input-group:focus-within { border-color: var(--brand); box-shadow: 0 0 0 4px color-mix(in srgb, var(--brand-2) 25%, transparent); }
.dash-input-group:has([aria-invalid="true"]) { border-color: var(--danger); }
.dash-input-group .dash-input { flex: 1 1 auto; border: 0; border-radius: 0; box-shadow: none; background: transparent; width: auto; }
.dash-input-group .dash-input:focus { box-shadow: none; }
.dash-affix { display: flex; align-items: center; padding: 0 12px; background: var(--surface-2); color: var(--muted); font-size: 13px; font-weight: 600; white-space: nowrap; }
.dash-affix--pre { border-right: 1px solid var(--border); }
.dash-affix--suf { border-left: 1px solid var(--border); }
.dash-select { flex: 0 0 auto; min-width: 150px; cursor: pointer; }
.dash-input::placeholder { color: var(--muted); opacity: 1; }
.dash-input:hover, .dash-select:hover { border-color: var(--border-strong); }
.dash-input:focus, .dash-select:focus {
  outline: none; border-color: var(--brand); box-shadow: 0 0 0 4px color-mix(in srgb, var(--brand-2) 25%, transparent);
}
.dash-input[aria-invalid="true"], .dash-select[aria-invalid="true"] { border-color: var(--danger); }
.dash-input[aria-invalid="true"]:focus, .dash-select[aria-invalid="true"]:focus { box-shadow: 0 0 0 4px color-mix(in srgb, var(--danger) 22%, transparent); }
textarea.dash-input { min-height: 84px; resize: vertical; line-height: 1.55; }
.dash-readonly { display: flex; align-items: center; background: var(--surface-2); font-weight: 700; }

.dash-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 42px; padding: 9px 16px;
  border-radius: var(--radius-sm); font-size: 13.5px; font-weight: 600; cursor: pointer; white-space: nowrap;
  border: 1.5px solid transparent; transition: background .15s, border-color .15s, color .15s, filter .15s;
}
.dash-btn-sm { min-height: 34px; padding: 5px 12px; font-size: 12.5px; }
.dash-btn-primary { background: var(--brand); color: var(--brand-ink); }
.dash-btn-primary:hover:not(:disabled) { filter: brightness(1.1); }
.dash-btn-ghost { background: var(--surface); border-color: var(--border); }
.dash-btn-ghost:hover:not(:disabled) { border-color: var(--brand); color: var(--brand); }
.dash-btn-danger { background: var(--danger); color: #fff; }
.dash[data-theme="escuro"] .dash-btn-danger { color: #2a1315; font-weight: 700; }
.dash-btn-danger:hover:not(:disabled) { filter: brightness(1.12); }
.dash-btn-danger-ghost { background: transparent; border-color: var(--danger-line); color: var(--danger); }
.dash-btn-danger-ghost:hover:not(:disabled) { background: var(--danger-soft); }
.dash-btn:disabled { opacity: .55; cursor: not-allowed; }

.dash-row-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 34px; height: 34px; border-radius: 8px; border: 1px solid var(--border);
  background: var(--surface); color: var(--ink-soft); cursor: pointer; transition: border-color .15s, color .15s, background .15s;
}
.dash-row-btn:hover { border-color: var(--brand); color: var(--brand); }
.dash-row-btn.is-danger:hover { border-color: var(--danger); color: var(--danger); background: var(--danger-soft); }
.dash-row-btn svg { width: 15px; height: 15px; }

.dash-table-wrap { border: 1px solid var(--border); border-radius: var(--radius-sm); overflow-x: auto; background: var(--surface); }
.dash-table { width: 100%; border-collapse: collapse; font-size: 13.5px; min-width: 900px; }
.dash-table thead th { text-align: left; padding: 12px 16px; font-size: 12px; font-weight: 700; color: var(--muted); background: var(--surface-2); border-bottom: 1px solid var(--border); white-space: nowrap; }
.dash-table thead th.num { text-align: right; }
.dash-th-btn { display: inline-flex; align-items: center; gap: 6px; background: none; border: 0; padding: 4px 2px; margin: -4px -2px; font: inherit; color: inherit; cursor: pointer; border-radius: 6px; }
.dash-th-btn:hover { color: var(--ink); }
.dash-th-arrow { font-size: 10px; opacity: .55; }
th[aria-sort="ascending"] .dash-th-arrow, th[aria-sort="descending"] .dash-th-arrow { opacity: 1; color: var(--brand); }
.dash-table tbody td { padding: 12px 16px; border-bottom: 1px solid var(--border); vertical-align: middle; }
.dash-table tbody tr:last-child td { border-bottom: none; }
.dash-table tbody tr:hover td { background: var(--surface-2); }
.dash-table .actions-cell { width: 1%; text-align: right; white-space: nowrap; }
.dash-table .num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
.dash-table .num-strong { font-weight: 700; }
.dash-table .nome-cell { font-weight: 650; color: var(--ink); }
.dash-table .cell-muted { color: var(--muted); font-size: 12.5px; }
.cell-muted { color: var(--muted); font-size: 12.5px; }

.dash-empty { text-align: center; padding: 48px 24px; border: 1.5px dashed var(--border-strong); border-radius: var(--radius); background: var(--surface-2); }
.dash-empty-icon { font-size: 40px; line-height: 1; margin-bottom: 12px; display: block; }
.dash-empty-title { font-size: 16px; font-weight: 700; margin-bottom: 6px; }
.dash-empty-desc { font-size: 13.5px; color: var(--muted); max-width: 420px; margin: 0 auto 18px; }

.dash-steps { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
.dash-step { display: flex; align-items: center; gap: 14px; padding: 12px 14px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--surface); flex-wrap: wrap; }
.dash-step.is-done { background: var(--ok-soft); border-color: transparent; }
.dash-step-mark { width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center; font-size: 13px; font-weight: 800; background: var(--surface-3); color: var(--ink); flex-shrink: 0; }
.dash-step.is-done .dash-step-mark { background: var(--ok); color: #fff; }
.dash-step-text { flex: 1 1 220px; min-width: 0; }
.dash-step-title { font-weight: 700; font-size: 14px; }
.dash-step-desc { font-size: 12.5px; color: var(--muted); }

.dash-attention { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.dash-attention-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); flex-wrap: wrap; }
.dash-attention-main { flex: 1 1 200px; min-width: 0; display: flex; flex-direction: column; }
.dash-attention-name { font-weight: 700; font-size: 14px; }
.dash-attention-tip { flex: 1 1 220px; font-size: 12.5px; color: var(--ink-soft); }

.badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 999px; font-size: 11.5px; font-weight: 700; white-space: nowrap; }
.badge.is-ok      { background: var(--ok-soft); color: var(--ok); }
.badge.is-warn    { background: var(--warn-soft); color: var(--warn); }
.badge.is-danger  { background: var(--danger-soft); color: var(--danger); }
.badge.is-neutral { background: var(--surface-2); color: var(--ink-soft); }
.badge.is-brand   { background: var(--brand-soft); color: var(--brand); }
.tipo-Compra { background: var(--brand-soft); color: var(--brand); }
.tipo-Venda  { background: var(--ok-soft); color: var(--ok); }
.tipo-Ajuste { background: var(--warn-soft); color: var(--warn); }

.chart-section { display: grid; grid-template-columns: 1.2fr 1fr; gap: 16px; }
@media (max-width: 1100px) { .chart-section { grid-template-columns: 1fr; } }

.chart-bars {
  display: grid; grid-auto-flow: column; grid-auto-columns: 1fr; gap: 12px;
  align-items: end; padding: 8px 4px 4px; min-height: 220px;
}
.chart-bar-month { display: flex; flex-direction: column; align-items: center; gap: 8px; min-width: 0; }
.chart-bar-pair { display: flex; align-items: end; gap: 6px; height: 180px; width: 100%; justify-content: center; }
.chart-bar {
  width: 22px; border-radius: 6px 6px 0 0; min-height: 3px;
  transition: height .35s cubic-bezier(.2,.7,.2,1), filter .15s;
}
.chart-bar:hover { filter: brightness(1.08); }
.chart-bar--compra { background: linear-gradient(180deg, var(--brand-2), var(--brand-3)); }
.chart-bar--venda  { background: linear-gradient(180deg, #34d399, #059669); }
.chart-bar-label { font-size: 11.5px; color: var(--muted); font-weight: 700; text-transform: uppercase; letter-spacing: .04em; }

.chart-legend { display: flex; gap: 16px; flex-wrap: wrap; font-size: 12.5px; color: var(--ink-soft); font-weight: 600; margin-top: 8px; }
.chart-legend-item { display: inline-flex; align-items: center; gap: 8px; }
.chart-legend-swatch { width: 12px; height: 12px; border-radius: 4px; }
.chart-legend-swatch--compra { background: var(--brand); }
.chart-legend-swatch--venda  { background: #059669; }

.chart-line-svg { width: 100%; height: 220px; display: block; }
.chart-line-path { fill: none; stroke: var(--brand); stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
.chart-line-area { fill: var(--brand); opacity: .10; }
.chart-line-dot { fill: var(--surface); stroke: var(--brand); stroke-width: 2.5; }
.chart-line-grid { stroke: var(--border); stroke-width: 1; stroke-dasharray: 3 5; }
.chart-line-label { font-size: 11px; fill: var(--muted); font-weight: 700; text-anchor: middle; }
.chart-line-zero { stroke: var(--danger); stroke-width: 1; stroke-dasharray: 4 4; opacity: .35; }

.dash-overlay {
  position: fixed; inset: 0; background: rgba(15,23,42,.55); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; padding: 20px; z-index: 1000; animation: dashFade .15s ease;
}
@keyframes dashFade { from { opacity: 0; } to { opacity: 1; } }
.dash-modal {
  width: 100%; max-width: 500px; background: var(--surface); border: 1px solid var(--border); border-radius: 18px; padding: 26px;
  box-shadow: var(--shadow-lg); max-height: calc(100dvh - 40px); overflow-y: auto; animation: dashRise .18s ease-out; outline: none;
}
.dash-modal.is-wide { max-width: 720px; padding: 28px 30px; }
.dash-modal.is-form { padding: 0; display: flex; flex-direction: column; overflow: hidden; }
.dash-modal.is-form > form { display: flex; flex-direction: column; flex: 1 1 auto; min-height: 0; }
.dash-form-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 18px 24px; border-bottom: 1px solid var(--border); flex-shrink: 0; }
.dash-form-head .dash-modal-title { margin: 0; }
.dash-form-body { flex: 1 1 auto; min-height: 0; overflow-y: auto; padding: 8px 24px 20px; overscroll-behavior: contain; }
.dash-form-foot { display: flex; justify-content: flex-end; align-items: center; gap: 10px; padding: 14px 24px; border-top: 1px solid var(--border); background: var(--surface); flex-shrink: 0; }
.dash-fieldset { border: 0; margin: 0; padding: 16px 0 0; min-width: 0; }
.dash-fieldset + .dash-fieldset { border-top: 1px solid var(--border); margin-top: 16px; }
.dash-fieldset > legend { float: left; width: 100%; padding: 0; margin: 0 0 12px; font-size: 13px; font-weight: 800; color: var(--ink-soft); }
.dash-fieldset > legend + * { clear: both; }
.dash-fieldset > .field:last-child, .dash-fieldset > .form-grid:last-child { margin-bottom: 0; }
.form-grid { align-items: start; }
.form-grid.form-grid--3 { grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); }
@keyframes dashRise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
.dash-modal-title { font-size: 19px; font-weight: 800; margin-bottom: 18px; }
.dash-modal-title.is-danger { color: var(--danger); text-align: center; }
.dash-modal-desc { font-size: 13.5px; color: var(--ink-soft); text-align: center; margin-bottom: 20px; }
.dash-modal-label, .form-label { font-size: 13px; font-weight: 600; display: block; }
.dash-modal-label { margin-bottom: 6px; }
.dash-modal-icon { width: 56px; height: 56px; border-radius: 50%; display: grid; place-items: center; font-size: 26px; margin: 0 auto 14px; background: var(--danger-soft); border: 1px solid var(--danger-line); }
.dash-modal-actions { display: flex; justify-content: flex-end; align-items: center; gap: 10px; margin-top: 22px; flex-wrap: wrap; }
.field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 14px; margin-bottom: 16px; }
.form-grid .field { margin-bottom: 0; }
.form-grid .dash-input, .form-grid .dash-select, .field .dash-select, .field .dash-input { width: 100%; }
.field-hint { font-size: 12.5px; color: var(--muted); }
.field-error { font-size: 12.5px; color: var(--danger); font-weight: 600; display: flex; gap: 6px; align-items: flex-start; }
.dash-error-inline { font-size: 12.5px; color: var(--danger); font-weight: 600; margin-top: 8px; }

.tipo-picker { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.tipo-picker-btn {
  display: flex; align-items: center; justify-content: center; gap: 6px; min-height: 44px; padding: 8px 12px;
  border: 1.5px solid var(--border); background: var(--surface); border-radius: var(--radius-sm);
  cursor: pointer; font-size: 13.5px; font-weight: 700; transition: border-color .15s, background .15s, color .15s;
}
.tipo-picker-btn:hover { border-color: var(--border-strong); }
.tipo-picker-btn.is-on[data-tipo="Compra"] { border-color: var(--brand); background: var(--brand-soft); color: var(--brand); }
.tipo-picker-btn.is-on[data-tipo="Venda"]  { border-color: var(--ok);    background: var(--ok-soft);    color: var(--ok); }
.tipo-picker-btn.is-on[data-tipo="Ajuste"] { border-color: var(--warn);  background: var(--warn-soft);  color: var(--warn); }

.dash-modal.dash-palette { max-width: 620px; padding: 12px; align-self: flex-start; margin-top: 9vh; }
.dash-palette-list { list-style: none; margin: 10px 0 0; padding: 0; max-height: min(52vh, 420px); overflow-y: auto; }
.dash-palette-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; cursor: pointer; font-size: 14px; }
.dash-palette-item[aria-selected="true"] { background: var(--brand-soft); color: var(--brand); font-weight: 600; }
.dash-palette-meta { margin-left: auto; display: inline-flex; gap: 8px; align-items: center; font-size: 12px; color: var(--muted); }
.dash-palette-empty { padding: 18px 12px; font-size: 13.5px; color: var(--muted); text-align: center; }

.dash-toasts { position: fixed; bottom: 24px; right: 24px; display: flex; flex-direction: column; gap: 10px; z-index: 2000; max-width: calc(100vw - 32px); pointer-events: none; }
.dash-toast { pointer-events: auto; display: flex; align-items: center; gap: 12px; min-width: 260px; max-width: 420px; padding: 12px 14px; border-radius: 12px; background: var(--surface); border: 1px solid var(--border); box-shadow: var(--shadow-lg); animation: dashSlideIn .2s ease-out; }
@keyframes dashSlideIn { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: none; } }
.dash-toast-icon { width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; font-size: 13px; font-weight: 800; flex-shrink: 0; }
.dash-toast--sucesso .dash-toast-icon { background: var(--ok-soft); color: var(--ok); }
.dash-toast--erro .dash-toast-icon { background: var(--danger-soft); color: var(--danger); }
.dash-toast--info .dash-toast-icon { background: var(--brand-soft); color: var(--brand); }
.dash-toast-text { flex: 1; font-size: 13.5px; line-height: 1.4; }
.dash-toast-action { background: transparent; border: none; color: var(--brand); font-weight: 700; font-size: 13px; cursor: pointer; padding: 8px 10px; border-radius: 6px; }
.dash-toast-action:hover { background: var(--brand-soft); }
.dash-toast-close { background: transparent; border: none; cursor: pointer; color: var(--muted); font-size: 15px; width: 30px; height: 30px; border-radius: 6px; }
.dash-toast-close:hover { background: var(--surface-2); color: var(--ink); }

.dash-mobile-backdrop { position: fixed; inset: 0; background: rgba(15,23,42,.55); z-index: 40; animation: dashFade .15s ease; }
.dash-mobile-drawer { position: fixed; top: 0; left: 0; bottom: 0; width: min(300px, 85vw); background: var(--sidebar); border-right: 1px solid var(--border); padding: 18px 12px; display: flex; flex-direction: column; z-index: 41; overflow-y: auto; animation: dashSlideRight .2s ease-out; }
@keyframes dashSlideRight { from { transform: translateX(-100%); } to { transform: none; } }

.dash-config-row { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 16px 0; border-bottom: 1px solid var(--border); flex-wrap: wrap; }
.dash-config-row:last-child { border-bottom: none; }
.dash-config-label { font-weight: 600; font-size: 14px; }
.dash-config-desc { font-size: 12.5px; color: var(--muted); margin-top: 2px; max-width: 520px; }
.dash-config-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.dash-danger-zone { border: 1px solid var(--danger-line); background: var(--danger-soft); border-radius: var(--radius); padding: 18px 20px; }
.dash-danger-title { display: flex; align-items: center; gap: 8px; color: var(--danger); font-size: 14px; font-weight: 800; margin-bottom: 4px; }
.dash-danger-desc { font-size: 12.5px; color: var(--ink-soft); margin-bottom: 14px; }
.dash-danger-row { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding-top: 14px; border-top: 1px solid color-mix(in srgb, var(--danger) 25%, transparent); flex-wrap: wrap; }

/* ============================================================
   BANNER DE STATUS DA API
   ============================================================ */
.api-banner {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 12px 16px; border-radius: var(--radius-sm);
  border: 1.5px solid var(--border); background: var(--surface);
}
.api-banner--erro  { border-color: var(--danger-line); background: var(--danger-soft); }
.api-banner--aviso { border-color: var(--warn);        background: var(--warn-soft); }
.api-banner--info  { border-color: var(--brand);       background: var(--brand-soft); }

.api-banner-icon {
  font-size: 18px; flex-shrink: 0; margin-top: 1px; line-height: 1;
}

.api-banner-content { flex: 1; min-width: 0; }

.api-banner-title {
  display: block; font-size: 13.5px; font-weight: 700; margin-bottom: 2px;
  color: var(--ink); letter-spacing: -.01em;
}
.api-banner--erro .api-banner-title  { color: var(--danger); }
.api-banner--aviso .api-banner-title { color: var(--warn); }
.api-banner--info .api-banner-title  { color: var(--brand); }

.api-banner-desc {
  font-size: 12.5px; line-height: 1.5; color: var(--ink-soft);
}
.api-banner-desc strong { color: var(--ink); font-weight: 700; }

.api-banner-btn {
  flex-shrink: 0; align-self: center;
}

@media (max-width: 720px) {
  .api-banner {
    flex-wrap: wrap;
    padding: 10px 12px;
  }
  .api-banner-btn {
    width: 100%;
  }
}

@media (max-width: 1024px) {
  .dash { grid-template-columns: minmax(0, 1fr); }
  .dash-sidebar { display: none; }
  .dash-burger { display: inline-flex; }
  .dash-content { padding: 18px 18px 80px; }
  .dash-topbar { padding: 10px 18px; }
}
@media (max-width: 720px) {
  .dash-content { padding: 14px 14px 80px; gap: 14px; }
  .dash-topbar { padding: 8px 12px; }
  .dash-title { font-size: 16px; }
  .dash-user-name, .dash-user-btn .chevron, .dash-cmdk-text, .dash-cmdk kbd { display: none; }
  .dash-cmdk { padding: 6px 12px; }
  .dash-user-btn { padding: 3px; }
  .dash-panel { padding: 14px; }
  .dash-modal, .dash-modal.is-wide { padding: 20px 16px; border-radius: 14px; }
  .dash-modal-actions > * { flex: 1 1 100%; }
  .dash-overlay:has(> .is-form) { padding: 12px 0 0; align-items: flex-end; }
  .dash-modal.is-form { padding: 0; border-radius: 18px 18px 0 0; max-width: none; max-height: calc(100dvh - 12px); }
  .dash-form-head, .dash-form-foot { padding-left: 16px; padding-right: 16px; }
  .dash-form-body { padding: 4px 16px 16px; }
  .dash-form-foot > * { flex: 1 1 0; }
  .dash-toasts { left: 12px; right: 12px; bottom: 12px; }
  .dash-toast { min-width: 0; max-width: none; }
  .dash-filters-spacer { margin-left: 0; width: 100%; }
  .dash-filters-spacer > * { flex: 1 1 auto; }
  .dash-table-wrap { border: none; background: transparent; overflow: visible; }
  .dash-table, .dash-table tbody { display: block; min-width: 0; }
  .dash-table thead { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); }
  .dash-table tbody tr { display: block; margin-bottom: 10px; padding: 6px 0; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--surface); }
  .dash-table tbody td { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 7px 14px; border: none; text-align: right; }
  .dash-table tbody td::before { content: attr(data-label); font-weight: 600; font-size: 12.5px; color: var(--muted); text-align: left; flex-shrink: 0; }
  .dash-table tbody tr:hover td { background: transparent; }
  .dash-table .actions-cell { width: auto; justify-content: flex-end; }
  .dash-table .actions-cell::before { content: none; }
}
@media (max-width: 480px) {
  .dash-kpis { grid-template-columns: 1fr 1fr; gap: 8px; }
  .dash-kpi { padding: 10px 12px; gap: 8px; }
  .dash-kpi-icon { width: 34px; height: 34px; font-size: 15px; }
  .dash-kpi-value { font-size: 18px; }
  .chart-bars { min-height: 180px; }
  .chart-bar-pair { height: 140px; }
}
@media (prefers-reduced-motion: reduce) {
  .dash *, .dash *::before, .dash *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
}
`;