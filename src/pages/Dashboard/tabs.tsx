// src/pages/Dashboard/tabs.tsx
import type { ReactNode } from 'react';
import LogoutButton from '../../components/LogoutButton';
import type { Fornecedor, Insumo, Movimentacao, TipoMov } from '../../types/domain';
import type {
  Aba,
  CampoInsumo,
  CampoMov,
  EstadoApi,
  Ordem,
  PontoMes,
  StatusInsumo,
  Tema,
  Totais,
} from './shared';
import {
  ABAS,
  GraficoBarras,
  GraficoLinha,
  IconEdit,
  IconTrash,
  KpiCard,
  StatusBadge,
  ThOrdenavel,
  TipoBadge,
  formatarData,
  formatarDataLonga,
  formatarMoeda,
  formatarNumero,
  formatarQtd,
  margemDe,
  statusDoInsumo,
  sugerirReposicao,
  textoVariacao,
} from './shared';

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
        <div className="dash-brand-text">
          <span className="dash-brand-name">Controle de Insumos</span>
          <span className="dash-brand-sub">Compras · Vendas · Lucro</span>
        </div>
      </div>

      <nav className="dash-nav" aria-label="Seções">
        {ABAS.map((a) => (
          <button
            key={a.id}
            type="button"
            className={`dash-nav-btn${abaAtual === a.id ? ' is-active' : ''}`}
            onClick={() => onNavegar(a.id)}
            aria-current={abaAtual === a.id ? 'page' : undefined}
          >
            <span className="dash-nav-icon" aria-hidden="true">{a.icon}</span>
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
          <span className="dash-nav-icon" aria-hidden="true">{tema === 'claro' ? '🌙' : '☀️'}</span>
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
      <div className="dash-topbar-left">
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

      <div className="dash-topbar-right">
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

        <div className="dash-user" onClick={(e) => e.stopPropagation()}>
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
                <div className="dash-menu-name">{usuario?.nome ?? 'Usuário'}</div>
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

/* ============================================================
   ABA: DASHBOARD
   ============================================================ */

export function AbaDashboard({
  insumos,
  movimentacoes,
  kpisMes,
  kpisAnt,
  serie,
  atencao,
  alertas,
  passos,
  onboardingCompleto,
  nomeInsumo,
  nomeFornecedor,
  onRepor,
  onVerUrgentes,
  onIrParaMovimentacoes,
}: {
  insumos: Insumo[];
  movimentacoes: Movimentacao[];
  kpisMes: Totais;
  kpisAnt: Totais;
  serie: PontoMes[];
  atencao: { i: Insumo; s: StatusInsumo }[];
  alertas: number;
  passos: {
    feito: boolean;
    titulo: string;
    desc: string;
    cta: string;
    acao: () => void;
    desabilitado: boolean;
  }[];
  onboardingCompleto: boolean;
  nomeInsumo: (id: string) => string;
  nomeFornecedor: (id: string) => string;
  onRepor: (i: Insumo) => void;
  onVerUrgentes: () => void;
  onIrParaMovimentacoes: () => void;
}) {
  const ultimasMovs = [...movimentacoes]
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    .slice(0, 5);

  return (
    <>
      {!onboardingCompleto && (
        <section className="dash-panel" aria-labelledby="onboarding-title">
          <div className="dash-panel-head">
            <h2 className="dash-panel-title" id="onboarding-title">
              {insumos.length === 0 && movimentacoes.length === 0
                ? 'Bem-vindo! Comece por aqui'
                : 'Falta pouco para ver seu lucro'}
            </h2>
            <span className="dash-panel-meta">
              {passos.filter((p) => p.feito).length} de {passos.length} passos
            </span>
          </div>
          <ol className="dash-steps">
            {passos.map((p, i) => (
              <li key={p.titulo} className={`dash-step${p.feito ? ' is-done' : ''}`}>
                <span className="dash-step-mark" aria-hidden="true">{p.feito ? '✓' : i + 1}</span>
                <div className="dash-step-text">
                  <div className="dash-step-title">
                    {p.titulo}
                    {p.feito && <span className="sr-only"> (concluído)</span>}
                  </div>
                  <div className="dash-step-desc">{p.desc}</div>
                </div>
                {!p.feito && (
                  <button
                    type="button"
                    className={`dash-btn dash-btn-sm ${i === 1 ? 'dash-btn-primary' : 'dash-btn-ghost'}`}
                    onClick={p.acao}
                    disabled={p.desabilitado}
                    title={p.desabilitado ? 'Cadastre um insumo primeiro' : undefined}
                  >
                    {p.cta}
                  </button>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}

      {(insumos.length > 0 || movimentacoes.length > 0) && (
        <>
          <section className="dash-kpis" aria-label="Indicadores do mês">
            <KpiCard icon="💰" label="Investido no mês" value={formatarMoeda(kpisMes.compras)} hint={kpisMes.qtdCompras ? `${formatarQtd(kpisMes.qtdCompras)} un` : undefined} detalhe={textoVariacao(kpisMes.compras, kpisAnt.compras)} />
            <KpiCard icon="💵" label="Recebido no mês" value={formatarMoeda(kpisMes.vendas)} hint={kpisMes.qtdVendas ? `${formatarQtd(kpisMes.qtdVendas)} un` : undefined} detalhe={textoVariacao(kpisMes.vendas, kpisAnt.vendas)} />
            <KpiCard icon="📈" label="Lucro do mês" value={formatarMoeda(kpisMes.lucro)} variante={kpisMes.lucro >= 0 ? 'ok' : 'danger'} detalhe={textoVariacao(kpisMes.lucro, kpisAnt.lucro)} />
            <KpiCard icon="🎯" label="Margem" value={`${formatarNumero(kpisMes.margem, 1)}%`} variante={kpisMes.margem >= 0 ? 'default' : 'danger'} />
          </section>

          {atencao.length > 0 && (
            <section className="dash-panel" aria-labelledby="atencao-title">
              <div className="dash-panel-head">
                <h2 className="dash-panel-title" id="atencao-title">Precisa de reposição</h2>
                <button type="button" className="dash-btn dash-btn-ghost dash-btn-sm" onClick={onVerUrgentes}>
                  Ver {alertas} na lista
                </button>
              </div>
              <ul className="dash-attention">
                {atencao.map(({ i, s }) => {
                  const sugestao = sugerirReposicao(i);
                  return (
                    <li key={i.id} className="dash-attention-item">
                      <div className="dash-attention-main">
                        <span className="dash-attention-name">{i.nome}</span>
                        <span className="cell-muted">
                          {formatarQtd(i.quantidadeAtual)} de {formatarQtd(i.quantidadeMinima)} {i.unidade} (mínimo)
                        </span>
                      </div>
                      <StatusBadge status={s} />
                      <span className="dash-attention-tip">
                        Sugestão: comprar {formatarQtd(sugestao)} {i.unidade}
                        {i.precoCompra > 0 && <> (≈ {formatarMoeda(sugestao * i.precoCompra)})</>}
                      </span>
                      <button type="button" className="dash-btn dash-btn-primary dash-btn-sm" onClick={() => onRepor(i)} aria-label={`Repor ${i.nome}`}>
                        Repor
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          <section className="chart-section">
            <div className="dash-panel" aria-labelledby="chart-barras-title">
              <div className="dash-panel-head">
                <h2 className="dash-panel-title" id="chart-barras-title">Compras vs Vendas</h2>
                <span className="dash-panel-meta">Últimos 6 meses</span>
              </div>
              <GraficoBarras serie={serie} />
            </div>

            <div className="dash-panel" aria-labelledby="chart-linha-title">
              <div className="dash-panel-head">
                <h2 className="dash-panel-title" id="chart-linha-title">Evolução do lucro</h2>
                <span className="dash-panel-meta">Últimos 6 meses</span>
              </div>
              <GraficoLinha serie={serie} />
            </div>
          </section>

          <section className="dash-panel" aria-labelledby="ultimas-movs">
            <div className="dash-panel-head">
              <h2 className="dash-panel-title" id="ultimas-movs">Últimas movimentações</h2>
              <button type="button" className="dash-btn dash-btn-ghost dash-btn-sm" onClick={onIrParaMovimentacoes}>
                Ver todas
              </button>
            </div>
            {ultimasMovs.length === 0 ? (
              <p className="dash-panel-meta">Nenhuma movimentação ainda.</p>
            ) : (
              <div className="dash-table-wrap">
                <table className="dash-table">
                  <caption className="sr-only">Cinco movimentações mais recentes</caption>
                  <thead>
                    <tr>
                      <th scope="col">Data</th>
                      <th scope="col">Insumo</th>
                      <th scope="col">Tipo</th>
                      <th scope="col" className="num">Qtd.</th>
                      <th scope="col" className="num">Preço Unit.</th>
                      <th scope="col" className="num">Total</th>
                      <th scope="col">Origem / Destino</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ultimasMovs.map((m) => (
                      <tr key={m.id}>
                        <td data-label="Data">{formatarData(m.data)}</td>
                        <td data-label="Insumo" className="nome-cell">{nomeInsumo(m.insumoId)}</td>
                        <td data-label="Tipo"><TipoBadge tipo={m.tipo} /></td>
                        <td data-label="Qtd." className="num">{formatarQtd(m.quantidade)}</td>
                        <td data-label="Preço unit." className="num">{formatarMoeda(m.precoUnitario)}</td>
                        <td data-label="Total" className="num num-strong">{formatarMoeda(m.total)}</td>
                        <td data-label="Origem / Destino" className="cell-muted">
                          {m.fornecedorId ? nomeFornecedor(m.fornecedorId) : (m.cliente ?? '—')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}

/* ============================================================
   ABA: INSUMOS
   ============================================================ */

export function AbaInsumos({
  insumos,
  insumosFiltrados,
  statusCount,
  busca,
  setBusca,
  categoriaFiltro,
  setCategoriaFiltro,
  categorias,
  statusFiltro,
  setStatusFiltro,
  temFiltro,
  limparFiltros,
  ordem,
  onOrdenar,
  onNovo,
  onEditar,
  onExcluir,
  onRepor,
  onNovaMov,
}: {
  insumos: Insumo[];
  insumosFiltrados: Insumo[];
  statusCount: { ok: number; baixo: number; zerado: number };
  busca: string;
  setBusca: (v: string) => void;
  categoriaFiltro: string;
  setCategoriaFiltro: (v: string) => void;
  categorias: string[];
  statusFiltro: 'Todos' | StatusInsumo;
  setStatusFiltro: (v: 'Todos' | StatusInsumo) => void;
  temFiltro: boolean;
  limparFiltros: () => void;
  ordem: Ordem<CampoInsumo>;
  onOrdenar: (c: CampoInsumo) => void;
  onNovo: () => void;
  onEditar: (i: Insumo) => void;
  onExcluir: (i: Insumo) => void;
  onRepor: (i: Insumo) => void;
  onNovaMov: (id: string) => void;
}) {
  return (
    <>
      <section className="dash-kpis" aria-label="Filtrar por status do estoque">
        <KpiCard icon="✅" label="Estoque OK" value={statusCount.ok} onClick={() => setStatusFiltro(statusFiltro === 'OK' ? 'Todos' : 'OK')} ativo={statusFiltro === 'OK'} />
        <KpiCard icon="⚠️" label="Estoque baixo" value={statusCount.baixo} variante={statusCount.baixo > 0 ? 'danger' : 'default'} onClick={() => setStatusFiltro(statusFiltro === 'Baixo' ? 'Todos' : 'Baixo')} ativo={statusFiltro === 'Baixo'} />
        <KpiCard icon="🚨" label="Zerados" value={statusCount.zerado} variante={statusCount.zerado > 0 ? 'danger' : 'default'} onClick={() => setStatusFiltro(statusFiltro === 'Zerado' ? 'Todos' : 'Zerado')} ativo={statusFiltro === 'Zerado'} />
        <KpiCard icon="📦" label="Total" value={insumos.length} onClick={() => setStatusFiltro('Todos')} ativo={statusFiltro === 'Todos'} />
      </section>

      <div className="dash-toolbar">
        <div className="dash-filters" role="search" aria-label="Filtrar insumos">
          <label className="sr-only" htmlFor="filtro-busca-insumo">Buscar insumos</label>
          <input
            id="filtro-busca-insumo"
            type="search"
            className="dash-input"
            placeholder="Buscar por nome ou categoria…  ( / )"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <label className="sr-only" htmlFor="filtro-categoria">Filtrar por categoria</label>
          <select id="filtro-categoria" className="dash-select" value={categoriaFiltro} onChange={(e) => setCategoriaFiltro(e.target.value)}>
            {categorias.map((c) => <option key={c} value={c}>{c === 'Todas' ? 'Todas as categorias' : c}</option>)}
          </select>
          <label className="sr-only" htmlFor="filtro-status-insumo">Filtrar por status</label>
          <select id="filtro-status-insumo" className="dash-select" value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value as 'Todos' | StatusInsumo)}>
            <option value="Todos">Todos os status</option>
            {(['OK', 'Baixo', 'Zerado'] as const).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {temFiltro && (
            <button type="button" className="dash-btn dash-btn-ghost" onClick={limparFiltros}>Limpar filtros</button>
          )}
          <div className="dash-filters-spacer">
            <button type="button" className="dash-btn dash-btn-primary" onClick={onNovo}>
              <span aria-hidden="true">➕</span> Novo insumo
            </button>
          </div>
        </div>
      </div>

      <section className="dash-panel" aria-labelledby="lista-insumos">
        <div className="dash-panel-head">
          <h2 className="dash-panel-title" id="lista-insumos">Todos os insumos</h2>
          <span className="dash-panel-meta" role="status">{insumosFiltrados.length} de {insumos.length}</span>
        </div>

        {insumosFiltrados.length === 0 ? (
          <div className="dash-empty">
            <span className="dash-empty-icon" aria-hidden="true">📦</span>
            <h3 className="dash-empty-title">
              {insumos.length === 0 ? 'Nenhum insumo cadastrado' : 'Nenhum insumo encontrado'}
            </h3>
            <p className="dash-empty-desc">
              {insumos.length === 0
                ? 'Cadastre seu primeiro insumo para acompanhar estoque e margem.'
                : 'Nada combina com os filtros atuais.'}
            </p>
            {insumos.length === 0 ? (
              <button type="button" className="dash-btn dash-btn-primary" onClick={onNovo}>➕ Novo insumo</button>
            ) : (
              <button type="button" className="dash-btn dash-btn-primary" onClick={limparFiltros}>Limpar filtros</button>
            )}
          </div>
        ) : (
          <div className="dash-table-wrap">
            <table className="dash-table">
              <caption className="sr-only">Lista de insumos. Use os botões do cabeçalho para ordenar.</caption>
              <thead>
                <tr>
                  <ThOrdenavel campo="nome" ordem={ordem} onOrdenar={onOrdenar}>Nome</ThOrdenavel>
                  <ThOrdenavel campo="categoria" ordem={ordem} onOrdenar={onOrdenar}>Categoria</ThOrdenavel>
                  <ThOrdenavel campo="estoque" ordem={ordem} onOrdenar={onOrdenar} num>Estoque</ThOrdenavel>
                  <ThOrdenavel campo="precoCompra" ordem={ordem} onOrdenar={onOrdenar} num>Preço compra</ThOrdenavel>
                  <ThOrdenavel campo="precoVenda" ordem={ordem} onOrdenar={onOrdenar} num>Preço venda</ThOrdenavel>
                  <ThOrdenavel campo="margem" ordem={ordem} onOrdenar={onOrdenar} num>Margem</ThOrdenavel>
                  <ThOrdenavel campo="status" ordem={ordem} onOrdenar={onOrdenar}>Status</ThOrdenavel>
                  <th scope="col"><span className="sr-only">Ações</span></th>
                </tr>
              </thead>
              <tbody>
                {insumosFiltrados.map((i) => {
                  const margem = margemDe(i.precoCompra, i.precoVenda);
                  const status = statusDoInsumo(i);
                  return (
                    <tr key={i.id}>
                      <td className="nome-cell">{i.nome}</td>
                      <td data-label="Categoria"><span className="badge is-neutral">{i.categoria}</span></td>
                      <td data-label="Estoque" className="num">
                        {formatarQtd(i.quantidadeAtual)} {i.unidade}
                        <div className="cell-muted">mín. {formatarQtd(i.quantidadeMinima)}</div>
                      </td>
                      <td data-label="Preço compra" className="num">{formatarMoeda(i.precoCompra)}</td>
                      <td data-label="Preço venda" className="num">{formatarMoeda(i.precoVenda)}</td>
                      <td data-label="Margem" className="num num-strong">
                        <span className={`badge ${margem >= 20 ? 'is-ok' : margem >= 0 ? 'is-warn' : 'is-danger'}`}>
                          {formatarNumero(margem, 1)}%
                        </span>
                      </td>
                      <td data-label="Status"><StatusBadge status={status} /></td>
                      <td className="actions-cell">
                        <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                          {status !== 'OK' ? (
                            <button type="button" className="dash-btn dash-btn-primary dash-btn-sm" onClick={() => onRepor(i)} aria-label={`Repor ${i.nome}`}>
                              Repor
                            </button>
                          ) : (
                            <button type="button" className="dash-btn dash-btn-ghost dash-btn-sm" onClick={() => onNovaMov(i.id)} aria-label={`Registrar movimentação de ${i.nome}`}>
                              Movimentar
                            </button>
                          )}
                          <button type="button" className="dash-row-btn" onClick={() => onEditar(i)} aria-label={`Editar ${i.nome}`} title="Editar">
                            <IconEdit />
                          </button>
                          <button type="button" className="dash-row-btn is-danger" onClick={() => onExcluir(i)} aria-label={`Excluir ${i.nome}`} title="Excluir">
                            <IconTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

/* ============================================================
   ABA: MOVIMENTAÇÕES
   ============================================================ */

export function AbaMovimentacoes({
  insumos,
  movimentacoes,
  movsFiltradas,
  totais,
  tipoFiltro,
  setTipoFiltro,
  insumoFiltro,
  setInsumoFiltro,
  periodoFiltro,
  setPeriodoFiltro,
  temFiltro,
  limparFiltros,
  ordem,
  onOrdenar,
  nomeInsumo,
  nomeFornecedor,
  onNova,
  onEditar,
  onExcluir,
  onExportarCSV,
}: {
  insumos: Insumo[];
  movimentacoes: Movimentacao[];
  movsFiltradas: Movimentacao[];
  totais: Totais;
  tipoFiltro: 'Todos' | TipoMov;
  setTipoFiltro: (v: 'Todos' | TipoMov) => void;
  insumoFiltro: string;
  setInsumoFiltro: (v: string) => void;
  periodoFiltro: '30' | '90' | '180' | 'todos';
  setPeriodoFiltro: (v: '30' | '90' | '180' | 'todos') => void;
  temFiltro: boolean;
  limparFiltros: () => void;
  ordem: Ordem<CampoMov>;
  onOrdenar: (c: CampoMov) => void;
  nomeInsumo: (id: string) => string;
  nomeFornecedor: (id: string) => string;
  onNova: () => void;
  onEditar: (m: Movimentacao) => void;
  onExcluir: (m: Movimentacao) => void;
  onExportarCSV: () => void;
}) {
  return (
    <>
      <section className="dash-kpis" aria-label="Totais do período">
        <KpiCard icon="💰" label="Total investido" value={formatarMoeda(totais.compras)} hint={`${formatarQtd(totais.qtdCompras)} un`} />
        <KpiCard icon="💵" label="Total recebido" value={formatarMoeda(totais.vendas)} hint={`${formatarQtd(totais.qtdVendas)} un`} />
        <KpiCard icon="📈" label="Lucro do período" value={formatarMoeda(totais.lucro)} variante={totais.lucro >= 0 ? 'ok' : 'danger'} />
        <KpiCard icon="🎯" label="Margem" value={`${formatarNumero(totais.margem, 1)}%`} variante={totais.margem >= 0 ? 'default' : 'danger'} />
      </section>

      <div className="dash-toolbar">
        <div className="dash-filters" role="search" aria-label="Filtrar movimentações">
          <label className="sr-only" htmlFor="filtro-tipo-mov">Filtrar por tipo</label>
          <select id="filtro-tipo-mov" className="dash-select" value={tipoFiltro} onChange={(e) => setTipoFiltro(e.target.value as 'Todos' | TipoMov)}>
            <option value="Todos">Todos os tipos</option>
            <option value="Compra">Compras</option>
            <option value="Venda">Vendas</option>
            <option value="Ajuste">Ajustes</option>
          </select>

          <label className="sr-only" htmlFor="filtro-insumo-mov">Filtrar por insumo</label>
          <select id="filtro-insumo-mov" className="dash-select" value={insumoFiltro} onChange={(e) => setInsumoFiltro(e.target.value)}>
            <option value="Todos">Todos os insumos</option>
            {insumos.map((i) => <option key={i.id} value={i.id}>{i.nome}</option>)}
          </select>

          <label className="sr-only" htmlFor="filtro-periodo">Período</label>
          <select id="filtro-periodo" className="dash-select" value={periodoFiltro} onChange={(e) => setPeriodoFiltro(e.target.value as '30' | '90' | '180' | 'todos')}>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
            <option value="180">Últimos 6 meses</option>
            <option value="todos">Todo o período</option>
          </select>

          {temFiltro && (
            <button type="button" className="dash-btn dash-btn-ghost" onClick={limparFiltros}>Limpar filtros</button>
          )}

          <div className="dash-filters-spacer">
            <button type="button" className="dash-btn dash-btn-ghost" onClick={onExportarCSV} disabled={movsFiltradas.length === 0}>
              ⬇️ Exportar CSV
            </button>
            <button
              type="button"
              className="dash-btn dash-btn-primary"
              onClick={onNova}
              disabled={insumos.length === 0}
              title={insumos.length === 0 ? 'Cadastre um insumo primeiro' : undefined}
            >
              <span aria-hidden="true">➕</span> Nova movimentação
            </button>
          </div>
        </div>
      </div>

      <section className="dash-panel" aria-labelledby="lista-movs">
        <div className="dash-panel-head">
          <h2 className="dash-panel-title" id="lista-movs">Movimentações</h2>
          <span className="dash-panel-meta" role="status">
            {movsFiltradas.length} registro{movsFiltradas.length === 1 ? '' : 's'}
          </span>
        </div>

        {movsFiltradas.length === 0 ? (
          <div className="dash-empty">
            <span className="dash-empty-icon" aria-hidden="true">🔁</span>
            <h3 className="dash-empty-title">
              {movimentacoes.length === 0 ? 'Nenhuma movimentação registrada' : 'Nenhuma movimentação neste filtro'}
            </h3>
            <p className="dash-empty-desc">
              {insumos.length === 0
                ? 'Cadastre um insumo primeiro para poder registrar compras e vendas.'
                : movimentacoes.length === 0
                  ? 'Registre sua primeira compra ou venda para acompanhar o lucro.'
                  : 'Tente ampliar o período ou limpar os filtros.'}
            </p>
            {insumos.length > 0 && movimentacoes.length === 0 && (
              <button type="button" className="dash-btn dash-btn-primary" onClick={onNova}>➕ Nova movimentação</button>
            )}
            {insumos.length > 0 && movimentacoes.length > 0 && (
              <button type="button" className="dash-btn dash-btn-primary" onClick={limparFiltros}>Limpar filtros</button>
            )}
          </div>
        ) : (
          <div className="dash-table-wrap">
            <table className="dash-table">
              <caption className="sr-only">Lista de movimentações. Use os botões do cabeçalho para ordenar.</caption>
              <thead>
                <tr>
                  <ThOrdenavel campo="data" ordem={ordem} onOrdenar={onOrdenar}>Data</ThOrdenavel>
                  <ThOrdenavel campo="insumo" ordem={ordem} onOrdenar={onOrdenar}>Insumo</ThOrdenavel>
                  <ThOrdenavel campo="tipo" ordem={ordem} onOrdenar={onOrdenar}>Tipo</ThOrdenavel>
                  <ThOrdenavel campo="quantidade" ordem={ordem} onOrdenar={onOrdenar} num>Qtd.</ThOrdenavel>
                  <th scope="col" className="num">Preço unit.</th>
                  <ThOrdenavel campo="total" ordem={ordem} onOrdenar={onOrdenar} num>Total</ThOrdenavel>
                  <th scope="col">Fornecedor / Cliente</th>
                  <th scope="col"><span className="sr-only">Ações</span></th>
                </tr>
              </thead>
              <tbody>
                {movsFiltradas.map((m) => (
                  <tr key={m.id}>
                    <td data-label="Data">{formatarData(m.data)}</td>
                    <td data-label="Insumo" className="nome-cell">{nomeInsumo(m.insumoId)}</td>
                    <td data-label="Tipo"><TipoBadge tipo={m.tipo} /></td>
                    <td data-label="Qtd." className="num">{formatarQtd(m.quantidade)}</td>
                    <td data-label="Preço unit." className="num">{m.tipo === 'Ajuste' ? '—' : formatarMoeda(m.precoUnitario)}</td>
                    <td data-label="Total" className="num num-strong">{m.tipo === 'Ajuste' ? '—' : formatarMoeda(m.total)}</td>
                    <td data-label="Fornecedor / Cliente" className="cell-muted">
                      {m.fornecedorId ? nomeFornecedor(m.fornecedorId) : (m.cliente ?? '—')}
                    </td>
                    <td className="actions-cell">
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button type="button" className="dash-row-btn" onClick={() => onEditar(m)} aria-label={`Editar ${m.tipo.toLowerCase()} de ${nomeInsumo(m.insumoId)}`} title="Editar">
                          <IconEdit />
                        </button>
                        <button type="button" className="dash-row-btn is-danger" onClick={() => onExcluir(m)} aria-label={`Excluir ${m.tipo.toLowerCase()} de ${nomeInsumo(m.insumoId)}`} title="Excluir">
                          <IconTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

/* ============================================================
   ABA: FORNECEDORES
   ============================================================ */

export function AbaFornecedores({
  fornecedores,
  onNovo,
  onEditar,
  onExcluir,
}: {
  fornecedores: (Fornecedor & { totalComprado: number; qtdCompras: number })[];
  onNovo: () => void;
  onEditar: (f: Fornecedor) => void;
  onExcluir: (f: Fornecedor) => void;
}) {
  return (
    <>
      <div className="dash-toolbar">
        <div className="dash-filters">
          <div className="dash-filters-spacer">
            <button type="button" className="dash-btn dash-btn-primary" onClick={onNovo}>
              <span aria-hidden="true">➕</span> Novo fornecedor
            </button>
          </div>
        </div>
      </div>

      <section className="dash-panel" aria-labelledby="lista-fornecedores">
        <div className="dash-panel-head">
          <h2 className="dash-panel-title" id="lista-fornecedores">Fornecedores</h2>
          <span className="dash-panel-meta">
            {fornecedores.length} cadastrado{fornecedores.length === 1 ? '' : 's'}
          </span>
        </div>

        {fornecedores.length === 0 ? (
          <div className="dash-empty">
            <span className="dash-empty-icon" aria-hidden="true">🏢</span>
            <h3 className="dash-empty-title">Nenhum fornecedor cadastrado</h3>
            <p className="dash-empty-desc">Cadastre fornecedores para ver quanto você compra de cada um.</p>
            <button type="button" className="dash-btn dash-btn-primary" onClick={onNovo}>➕ Novo fornecedor</button>
          </div>
        ) : (
          <div className="dash-table-wrap">
            <table className="dash-table">
              <caption className="sr-only">Lista de fornecedores</caption>
              <thead>
                <tr>
                  <th scope="col">Nome</th>
                  <th scope="col">Documento</th>
                  <th scope="col">Telefone</th>
                  <th scope="col">E-mail</th>
                  <th scope="col" className="num">Total comprado</th>
                  <th scope="col" className="num">Compras</th>
                  <th scope="col"><span className="sr-only">Ações</span></th>
                </tr>
              </thead>
              <tbody>
                {fornecedores.map((f) => (
                  <tr key={f.id}>
                    <td className="nome-cell">{f.nome}</td>
                    <td data-label="Documento" className="cell-muted">{f.documento ?? '—'}</td>
                    <td data-label="Telefone" className="cell-muted">{f.telefone ?? '—'}</td>
                    <td data-label="E-mail" className="cell-muted">{f.email ?? '—'}</td>
                    <td data-label="Total comprado" className="num num-strong">{formatarMoeda(f.totalComprado)}</td>
                    <td data-label="Compras" className="num">{f.qtdCompras}</td>
                    <td className="actions-cell">
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button type="button" className="dash-row-btn" onClick={() => onEditar(f)} aria-label={`Editar ${f.nome}`} title="Editar">
                          <IconEdit />
                        </button>
                        <button type="button" className="dash-row-btn is-danger" onClick={() => onExcluir(f)} aria-label={`Excluir ${f.nome}`} title="Excluir">
                          <IconTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

/* ============================================================
   ABA: CONFIGURAÇÕES
   ============================================================ */

export function AbaConfig({
  tema,
  onAlternarTema,
  usuario,
  estado,
  onRecarregar,
  onExportarCSV,
  onBaixarBackup,
  onLimparTudo,
  onExcluirConta,
  temMovimentacoes,
}: {
  tema: Tema;
  onAlternarTema: () => void;
  usuario: { email?: string } | null;
  estado: EstadoApi;
  onRecarregar: () => void;
  onExportarCSV: () => void;
  onBaixarBackup: () => void;
  onLimparTudo: () => void;
  onExcluirConta: () => void;
  temMovimentacoes: boolean;
}) {
  return (
    <>
      <section className="dash-panel" aria-labelledby="cfg-pref">
        <div className="dash-panel-head">
          <h2 className="dash-panel-title" id="cfg-pref">Preferências</h2>
        </div>
        <div className="dash-config-row">
          <div>
            <div className="dash-config-label">Tema</div>
            <div className="dash-config-desc">Claro ou escuro</div>
          </div>
          <button type="button" className="dash-btn dash-btn-ghost" onClick={onAlternarTema}>
            {tema === 'claro' ? '🌙 Ativar escuro' : '☀️ Ativar claro'}
          </button>
        </div>
        <div className="dash-config-row">
          <div>
            <div className="dash-config-label">Conta</div>
            <div className="dash-config-desc">{usuario?.email ?? 'Sessão ativa'}</div>
          </div>
          <LogoutButton />
        </div>
      </section>

      <section className="dash-panel" aria-labelledby="cfg-dados">
        <div className="dash-panel-head">
          <h2 className="dash-panel-title" id="cfg-dados">Seus dados</h2>
        </div>
        <div className="dash-config-row">
          <div>
            <div className="dash-config-label">Sincronização</div>
            <div className="dash-config-desc">
              {estado === 'offline'
                ? 'Sem conexão com o servidor. Verifique a rede e recarregue.'
                : estado === 'sem-rotas'
                  ? 'API respondeu, mas as rotas do sistema ainda não existem no backend.'
                  : 'Seus dados ficam salvos na nuvem e sincronizam entre dispositivos.'}
            </div>
          </div>
          <button
            type="button"
            className="dash-btn dash-btn-ghost"
            onClick={onRecarregar}
            disabled={estado === 'carregando'}
          >
            {estado === 'carregando' ? '⏳ Carregando…' : '🔄 Recarregar'}
          </button>
        </div>
        <div className="dash-config-row">
          <div>
            <div className="dash-config-label">Backup</div>
            <div className="dash-config-desc">Baixe um JSON com todos os seus dados. Guarde em local seguro.</div>
          </div>
          <button type="button" className="dash-btn dash-btn-ghost" onClick={onBaixarBackup}>⬇️ Baixar backup</button>
        </div>
        <div className="dash-config-row">
          <div>
            <div className="dash-config-label">Exportar CSV</div>
            <div className="dash-config-desc">Todas as movimentações, prontas para abrir no Excel</div>
          </div>
          <button type="button" className="dash-btn dash-btn-ghost" onClick={onExportarCSV} disabled={!temMovimentacoes}>
            ⬇️ Exportar
          </button>
        </div>
        <div className="dash-config-row">
          <div>
            <div className="dash-config-label">Limpar meus dados</div>
            <div className="dash-config-desc">Apaga todos os insumos, fornecedores e movimentações da sua conta na nuvem</div>
          </div>
          <button type="button" className="dash-btn dash-btn-danger" onClick={onLimparTudo}>Limpar tudo</button>
        </div>
      </section>

      <section className="dash-danger-zone" aria-labelledby="zona-perigo">
        <h2 className="dash-danger-title" id="zona-perigo">
          <span aria-hidden="true">⚠️</span> Zona de perigo
        </h2>
        <p className="dash-danger-desc">Ações irreversíveis.</p>
        <div className="dash-danger-row">
          <div>
            <div className="dash-config-label">Excluir minha conta</div>
            <div className="dash-config-desc">Apaga permanentemente a conta e os dados.</div>
          </div>
          <button type="button" className="dash-btn dash-btn-danger" onClick={onExcluirConta}>Excluir conta</button>
        </div>
      </section>
    </>
  );
}