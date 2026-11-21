import type { ReactNode } from 'react';
import LogoutButton from '../../components/auth/LogoutButton';
import type { Aba, EstadoApi, Tema } from './shared';
import { ABAS, formatarDataLonga } from './shared';

/* ============================================================
   SIDEBAR
   ============================================================ */

export function DashboardSidebar({
  abaAtual,
  alertas,
  totalInsumos,
  tema,
  onNavegar,
  onAlternarTema,
  atalhosDica,
}: {
  abaAtual: Aba;
  alertas: number;
  totalInsumos: number;
  tema: Tema;
  onNavegar: (id: Aba) => void;
  onAlternarTema: () => void;
  atalhosDica: ReactNode;
}) {
  return (
    <aside className="dash-sidebar" aria-label="Navegação principal">
      <div className="dash-brand">
        <span className="dash-brand-mark" aria-hidden="true">📦</span>
        <div className="dash-brand-text flex flex-col leading-[1.25]">
          <span className="dash-brand-name text-[15px] font-extrabold">Controle de Insumos</span>
          <span className="dash-brand-sub text-[11.5px] text-[color:var(--muted)]">Compras · Vendas · Lucro</span>
        </div>
      </div>

      <nav className="dash-nav flex flex-col gap-[2px]" aria-label="Seções">
        {ABAS.map((a) => (
          <button
            key={a.id}
            type="button"
            className={`dash-nav-btn${abaAtual === a.id ? ' is-active' : ''}`}
            onClick={() => onNavegar(a.id)}
            aria-current={abaAtual === a.id ? 'page' : undefined}
          >
            <span className="dash-nav-icon w-5 shrink-0 text-center text-[16px]" aria-hidden="true">{a.icon}</span>
            <span>{a.label}</span>
            {a.id === 'insumos' && totalInsumos > 0 && (
              alertas > 0 ? (
                <span className="dash-nav-badge is-alert">
                  <span aria-hidden="true">⚠ {alertas}</span>
                  <span className="sr-only">{alertas} para repor</span>
                </span>
              ) : (
                <span className="dash-nav-badge">
                  {totalInsumos}
                  <span className="sr-only"> cadastrados</span>
                </span>
              )
            )}
          </button>
        ))}
      </nav>

      <div className="dash-sidebar-footer">
        <button type="button" className="dash-nav-btn" onClick={onAlternarTema}>
          <span className="dash-nav-icon w-5 shrink-0 text-center text-[16px]" aria-hidden="true">{tema === 'claro' ? '🌙' : '☀️'}</span>
          <span>{tema === 'claro' ? 'Modo escuro' : 'Modo claro'}</span>
        </button>
        {atalhosDica}
      </div>
    </aside>
  );
}

/* ============================================================
   HEADER (TOPBAR)
   ============================================================ */

function iniciais(nome?: string) {
  if (!nome) return '?';
  return nome.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('');
}

export function DashboardHeader({
  titulo,
  usuario,
  tema,
  estado,
  sincronizando,
  menuAberto,
  onAbrirDrawer,
  onRecarregar,
  onAlternarTema,
  onAbrirPaleta,
  onToggleMenu,
  onIrParaConfig,
  userBtnRef,
}: {
  titulo: string;
  usuario: { nome?: string; email?: string } | null;
  tema: Tema;
  estado: EstadoApi;
  sincronizando: boolean;
  menuAberto: boolean;
  onAbrirDrawer: () => void;
  onRecarregar: () => void;
  onAlternarTema: () => void;
  onAbrirPaleta: () => void;
  onToggleMenu: () => void;
  onIrParaConfig: () => void;
  userBtnRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const ehMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent);
  const atalhoK = ehMac ? '⌘ K' : 'Ctrl K';

  return (
    <header className="dash-topbar">
      <div className="dash-topbar-left flex min-w-0 items-center gap-3">
        <button type="button" className="dash-burger" onClick={onAbrirDrawer} aria-label="Abrir menu">
          <span aria-hidden="true">☰</span>
        </button>
        <div style={{ minWidth: 0 }}>
          <h1 className="dash-title">{titulo}</h1>
          <p className="dash-subtitle">
            {formatarDataLonga()}
            {sincronizando && <> · sincronizando…</>}
          </p>
        </div>
      </div>

      <div className="dash-topbar-right flex items-center gap-2">
        {estado === 'offline' && (
          <button
            type="button"
            className="dash-btn dash-btn-ghost dash-btn-sm"
            onClick={onRecarregar}
            title="Sem conexão — clique para tentar de novo"
          >
            ⚠ Offline · Recarregar
          </button>
        )}

        <button
          type="button"
          className="dash-cmdk"
          onClick={onAbrirPaleta}
          aria-label="Buscar ou executar um comando"
          aria-keyshortcuts="Control+K Meta+K"
        >
          <span aria-hidden="true">🔍</span>
          <span className="dash-cmdk-text">Buscar ou executar…</span>
          <kbd className="dash-kbd" aria-hidden="true">{atalhoK}</kbd>
        </button>

        <button
          type="button"
          className="dash-icon-btn"
          onClick={onAlternarTema}
          aria-label={tema === 'claro' ? 'Ativar modo escuro' : 'Ativar modo claro'}
        >
          <span aria-hidden="true">{tema === 'claro' ? '🌙' : '☀️'}</span>
        </button>

        <div className="dash-user relative" onClick={(e) => e.stopPropagation()}>
          <button
            ref={userBtnRef}
            type="button"
            className="dash-user-btn"
            onClick={onToggleMenu}
            aria-expanded={menuAberto}
            aria-controls="menu-usuario"
            aria-label="Conta do usuário"
          >
            <span className="dash-avatar" aria-hidden="true">{iniciais(usuario?.nome)}</span>
            <span className="dash-user-name">{usuario?.nome ?? 'Usuário'}</span>
            <span className="chevron" aria-hidden="true" style={{ fontSize: 10, color: 'var(--muted)' }}>▾</span>
          </button>

          {menuAberto && (
            <div id="menu-usuario" role="group" aria-label="Conta" className="dash-menu">
              <div className="dash-menu-header">
                <div className="dash-menu-name text-[13.5px] font-bold">{usuario?.nome ?? 'Usuário'}</div>
                <div className="dash-menu-email">{usuario?.email ?? ''}</div>
              </div>
              <button type="button" className="dash-menu-item" onClick={onIrParaConfig}>
                <span aria-hidden="true">⚙️</span> Configurações
              </button>
              <div style={{ padding: 4 }}>
                <LogoutButton estilo={{ width: '100%', padding: '9px 12px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, borderRadius: 8 }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

