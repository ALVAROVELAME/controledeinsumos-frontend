// src/pages/Dashboard/shared.tsx
import {
  useState,
  useCallback,
  useEffect,
  useId,
  useRef,
} from 'react';
import type {
  FocusEvent as ReactFocusEvent,
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
  RefObject,
  WheelEvent as ReactWheelEvent,
} from 'react';
import type { Insumo, Fornecedor, Movimentacao, TipoMov } from '../../types/domain';

/* ============================================================
   TIPOS AUXILIARES
   ============================================================ */

export type Ordem<C extends string> = { campo: C; dir: 'asc' | 'desc' };
export type CampoInsumo = 'nome' | 'categoria' | 'estoque' | 'precoCompra' | 'precoVenda' | 'margem' | 'status';
export type CampoMov = 'data' | 'insumo' | 'tipo' | 'quantidade' | 'total';

export type Aba = 'dashboard' | 'insumos' | 'movimentacoes' | 'fornecedores' | 'config';

export type Comando = {
  id: string;
  rotulo: string;
  grupo: string;
  atalho?: string;
  soBusca?: boolean;
  acao: () => void;
};

export type Confirmacao = {
  tipo: 'insumo' | 'fornecedor' | 'mov' | 'limpar';
  alvo?: Insumo | Fornecedor | Movimentacao;
};

export type EstadoApi = 'carregando' | 'pronto' | 'offline' | 'sem-rotas';

export type RotasApi = {
  insumos: boolean;
  fornecedores: boolean;
  movimentacoes: boolean;
};

/* ============================================================
   CONSTANTES
   ============================================================ */

export const THEME_KEY = 'controle-insumos:tema';
export const ABA_KEY = 'controle-insumos:aba';

export const STATUS_INSUMO = ['OK', 'Baixo', 'Zerado'] as const;
export type StatusInsumo = (typeof STATUS_INSUMO)[number];

export const ABAS: { id: Aba; icon: string; label: string; titulo: string }[] = [
  { id: 'dashboard',     icon: '📊', label: 'Dashboard',     titulo: 'Visão geral' },
  { id: 'insumos',       icon: '📦', label: 'Insumos',       titulo: 'Insumos' },
  { id: 'movimentacoes', icon: '🔁', label: 'Movimentações', titulo: 'Movimentações' },
  { id: 'fornecedores',  icon: '🏢', label: 'Fornecedores',  titulo: 'Fornecedores' },
  { id: 'config',        icon: '⚙️', label: 'Configurações', titulo: 'Configurações' },
];

/* ============================================================
   UTILITÁRIOS
   ============================================================ */

export const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

export const normalizar = (txt: string) =>
  txt.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const collator = new Intl.Collator('pt-BR', { numeric: true, sensitivity: 'base' });
export const compararTexto = (a: string, b: string) => collator.compare(a, b);

export const formatarMoeda = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const formatarNumero = (n: number, casas = 2) =>
  n.toLocaleString('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });

export const formatarQtd = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 2 });

export const dois = (n: number) => String(n).padStart(2, '0');

export const dataLocal = (valor: string) =>
  valor.length === 10 ? new Date(`${valor}T12:00:00`) : new Date(valor);

export const chaveDia = (valor: string) => {
  const d = dataLocal(valor);
  return `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}`;
};

export const hoje = () => {
  const d = new Date();
  return `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}`;
};

export const isoDoDia = (dia: string) => new Date(`${dia}T12:00:00`).toISOString();

export const formatarData = (valor: string) =>
  dataLocal(valor).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

export const formatarDataLonga = () =>
  new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

export const mesChave = (valor: string) => chaveDia(valor).slice(0, 7);

export const mesRotulo = (chave: string) => {
  const [ano, mes] = chave.split('-').map(Number);
  const d = new Date(ano, mes - 1, 1);
  return d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
};

export const ultimosMeses = (n: number): string[] => {
  const out: string[] = [];
  const d = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const x = new Date(d.getFullYear(), d.getMonth() - i, 1);
    out.push(`${x.getFullYear()}-${dois(x.getMonth() + 1)}`);
  }
  return out;
};

export const statusDoInsumo = (i: Insumo): StatusInsumo => {
  if (i.quantidadeAtual <= 0) return 'Zerado';
  if (i.quantidadeAtual < i.quantidadeMinima) return 'Baixo';
  return 'OK';
};

export const severidade = (s: StatusInsumo) => (s === 'Zerado' ? 0 : s === 'Baixo' ? 1 : 2);

export const margemDe = (compra: number, venda: number) =>
  venda > 0 ? ((venda - compra) / venda) * 100 : 0;

export const sugerirReposicao = (i: Insumo) => {
  const alvo = Math.max(i.quantidadeMinima * 2, 1);
  return Math.max(1, Math.ceil(alvo - i.quantidadeAtual));
};

export const textoVariacao = (atual: number, anterior: number): string | undefined => {
  if (anterior === 0) return atual === 0 ? undefined : 'sem base no mês anterior';
  const pct = ((atual - anterior) / Math.abs(anterior)) * 100;
  if (Math.abs(pct) < 0.5) return 'igual ao mês anterior';
  return `${pct > 0 ? '▲' : '▼'} ${formatarNumero(Math.abs(pct), 0)}% vs mês anterior`;
};

export const efeitoEstoque = (tipo: TipoMov, quantidade: number) =>
  tipo === 'Venda' ? -quantidade : quantidade;

export function ordenar<T>(lista: T[], valor: (x: T) => string | number, dir: 'asc' | 'desc'): T[] {
  return [...lista].sort((a, b) => {
    const va = valor(a);
    const vb = valor(b);
    const r = typeof va === 'number' && typeof vb === 'number' ? va - vb : compararTexto(String(va), String(vb));
    return dir === 'asc' ? r : -r;
  });
}

export const proximaOrdem = <C extends string>(atual: Ordem<C>, campo: C): Ordem<C> => ({
  campo,
  dir: atual.campo === campo && atual.dir === 'asc' ? 'desc' : 'asc',
});

export const celulaCSV = (v: string | number) => {
  let s: string;
  if (typeof v === 'number') {
    s = String(v).replace('.', ',');
  } else {
    s = v;
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  }
  return `"${s.replace(/"/g, '""')}"`;
};

export const baixarArquivo = (nome: string, conteudo: string, tipo: string) => {
  const blob = new Blob([conteudo], { type: tipo });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nome;
  a.click();
  URL.revokeObjectURL(url);
};

export const focarPrimeiroInvalido = (form: HTMLFormElement) => {
  requestAnimationFrame(() => {
    form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  });
};

/* ============================================================
   CÁLCULOS
   ============================================================ */

export type Totais = {
  compras: number;
  vendas: number;
  lucro: number;
  margem: number;
  qtdCompras: number;
  qtdVendas: number;
};

export const calcularTotais = (movs: Movimentacao[]): Totais => {
  let compras = 0;
  let vendas = 0;
  let qtdCompras = 0;
  let qtdVendas = 0;
  for (const m of movs) {
    if (m.tipo === 'Compra') {
      compras += m.total;
      qtdCompras += m.quantidade;
    } else if (m.tipo === 'Venda') {
      vendas += m.total;
      qtdVendas += m.quantidade;
    }
  }
  const lucro = vendas - compras;
  return {
    compras,
    vendas,
    lucro,
    margem: vendas > 0 ? (lucro / vendas) * 100 : 0,
    qtdCompras,
    qtdVendas,
  };
};

export type PontoMes = {
  mes: string;
  rotulo: string;
  compras: number;
  vendas: number;
  lucro: number;
};

export const serieMensal = (movs: Movimentacao[], n = 6): PontoMes[] =>
  ultimosMeses(n).map((chave) => {
    let compras = 0;
    let vendas = 0;
    for (const m of movs) {
      if (mesChave(m.data) !== chave) continue;
      if (m.tipo === 'Compra') compras += m.total;
      else if (m.tipo === 'Venda') vendas += m.total;
    }
    return { mes: chave, rotulo: mesRotulo(chave), compras, vendas, lucro: vendas - compras };
  });

/* ============================================================
   HOOKS
   ============================================================ */

export type Tema = 'claro' | 'escuro';

export function useTema() {
  const [tema, setTema] = useState<Tema>(() => {
    try {
      const salvo = localStorage.getItem(THEME_KEY);
      if (salvo === 'claro' || salvo === 'escuro') return salvo;
    } catch {
      /* ignore */
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro';
  });
  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, tema);
    } catch {
      /* ignore */
    }
    document.documentElement.setAttribute('data-theme', tema === 'escuro' ? 'dark' : 'light');
  }, [tema]);
  const alternar = useCallback(() => setTema((t) => (t === 'claro' ? 'escuro' : 'claro')), []);
  return { tema, alternar };
}

export function useBodyLock(ativo: boolean) {
  useEffect(() => {
    if (!ativo) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [ativo]);
}

export const FOCAVEIS =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function useFocusTrap(ref: RefObject<HTMLElement | null>, ativo: boolean) {
  useEffect(() => {
    const el = ref.current;
    if (!ativo || !el) return;
    const anterior = document.activeElement as HTMLElement | null;
    if (!el.contains(document.activeElement)) {
      (el.querySelector<HTMLElement>(FOCAVEIS) ?? el).focus();
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const itens = Array.from(el.querySelectorAll<HTMLElement>(FOCAVEIS));
      if (itens.length === 0) {
        e.preventDefault();
        return;
      }
      const primeiro = itens[0];
      const ultimo = itens[itens.length - 1];
      if (e.shiftKey && document.activeElement === primeiro) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primeiro.focus();
      }
    };
    el.addEventListener('keydown', onKey);
    return () => {
      el.removeEventListener('keydown', onKey);
      anterior?.focus?.();
    };
  }, [ref, ativo]);
}

export function useFecharComConfirmacao(onFechar: () => void) {
  const [sujo, setSujo] = useState(false);
  const fechar = useCallback(() => {
    if (sujo && !window.confirm('Descartar as alterações que ainda não foram salvas?')) return;
    onFechar();
  }, [sujo, onFechar]);
  const marcarSujo = useCallback(() => setSujo(true), []);
  return { fechar, marcarSujo };
}

/* ============================================================
   ÍCONES
   ============================================================ */

export const IconEdit = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

export const IconTrash = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
  </svg>
);

/* ============================================================
   COMPONENTES UI BÁSICOS
   ============================================================ */

export function Modal({
  rotulo,
  onFechar,
  children,
  className = 'dash-modal',
  bloquear = false,
  fecharNoFundo = true,
}: {
  rotulo: string;
  onFechar: () => void;
  children: ReactNode;
  className?: string;
  bloquear?: boolean;
  fecharNoFundo?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, true);
  useBodyLock(true);
  return (
    <div
      className="dash-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !bloquear && fecharNoFundo) onFechar();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && !bloquear) {
          e.stopPropagation();
          onFechar();
        }
      }}
    >
      <div ref={ref} role="dialog" aria-modal="true" aria-label={rotulo} tabIndex={-1} className={className}>
        {children}
      </div>
    </div>
  );
}

export type PropsControle = {
  id: string;
  'aria-invalid'?: true;
  'aria-describedby'?: string;
  'aria-required'?: true;
};

export function Campo({
  label,
  erro,
  dica,
  obrigatorio,
  children,
}: {
  label: string;
  erro?: string;
  dica?: string;
  obrigatorio?: boolean;
  children: (p: PropsControle) => ReactNode;
}) {
  const id = useId();
  const ids = [erro ? `${id}-erro` : '', dica ? `${id}-dica` : ''].filter(Boolean).join(' ');
  return (
    <div className="field">
      <label className="form-label" htmlFor={id}>
        {label}
        {obrigatorio && <span aria-hidden="true"> *</span>}
      </label>
      {children({
        id,
        'aria-invalid': erro ? true : undefined,
        'aria-describedby': ids || undefined,
        'aria-required': obrigatorio ? true : undefined,
      })}
      {dica && <p id={`${id}-dica`} className="field-hint">{dica}</p>}
      {erro && (
        <p id={`${id}-erro`} className="field-error" role="alert">
          <span aria-hidden="true">⚠</span> {erro}
        </p>
      )}
    </div>
  );
}

export function KpiCard({
  icon,
  label,
  value,
  hint,
  detalhe,
  variante = 'default',
  onClick,
  ativo,
}: {
  icon: string;
  label: string;
  value: string | number;
  hint?: string;
  detalhe?: string;
  variante?: 'default' | 'ok' | 'danger';
  onClick?: () => void;
  ativo?: boolean;
}) {
  const cls = `dash-kpi${variante === 'danger' ? ' is-danger' : variante === 'ok' ? ' is-ok' : ''}`;
  const corpo = (
    <>
      <span className="dash-kpi-icon" aria-hidden="true">{icon}</span>
      <span className="dash-kpi-body block min-w-0">
        <span className="dash-kpi-label block text-[12.5px] font-semibold text-[color:var(--muted)]">{label}</span>
        <span className="dash-kpi-value block text-[22px] font-extrabold leading-[1.2] tracking-[-.03em] tabular-nums">
          {value}
          {hint && <span className="dash-kpi-hint">{hint}</span>}
        </span>
        {detalhe && <span className="dash-kpi-detail block mt-[2px]! text-[12px] text-[color:var(--muted)]">{detalhe}</span>}
      </span>
    </>
  );
  if (onClick) {
    return (
      <button type="button" className={`${cls}${ativo ? ' is-active' : ''}`} aria-pressed={!!ativo} onClick={onClick}>
        {corpo}
      </button>
    );
  }
  return <div className={cls}>{corpo}</div>;
}

export function StatusBadge({ status }: { status: StatusInsumo }) {
  if (status === 'OK') return <span className="badge is-ok">✓ OK</span>;
  if (status === 'Baixo') return <span className="badge is-warn">▼ Baixo</span>;
  return <span className="badge is-danger">⚠ Zerado</span>;
}

export function TipoBadge({ tipo }: { tipo: TipoMov }) {
  return <span className={`badge tipo-${tipo}`}>{tipo}</span>;
}

export function ThOrdenavel<C extends string>({
  campo,
  ordem,
  onOrdenar,
  num,
  children,
}: {
  campo: C;
  ordem: Ordem<C>;
  onOrdenar: (c: C) => void;
  num?: boolean;
  children: ReactNode;
}) {
  const ativo = ordem.campo === campo;
  return (
    <th
      scope="col"
      className={num ? 'num' : undefined}
      aria-sort={ativo ? (ordem.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <button type="button" className="dash-th-btn" onClick={() => onOrdenar(campo)}>
        {children}
        <span className="dash-th-arrow" aria-hidden="true">{ativo ? (ordem.dir === 'asc' ? '▲' : '▼') : '↕'}</span>
      </button>
    </th>
  );
}

export function FormHead({ titulo, onFechar }: { titulo: string; onFechar: () => void }) {
  return (
    <div className="dash-form-head flex shrink-0 items-center justify-between gap-3">
      <h2 className="dash-modal-title">{titulo}</h2>
      <button type="button" className="dash-icon-btn" onClick={onFechar} aria-label="Fechar">
        <span aria-hidden="true">✕</span>
      </button>
    </div>
  );
}

export function Grupo({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <fieldset className="dash-fieldset">
      <legend>{titulo}</legend>
      {children}
    </fieldset>
  );
}

export function ComAfixo({ prefixo, sufixo, children }: { prefixo?: string; sufixo?: string; children: ReactNode }) {
  return (
    <div className="dash-input-group">
      {prefixo && <span className="dash-affix dash-affix--pre" aria-hidden="true">{prefixo}</span>}
      {children}
      {sufixo && <span className="dash-affix dash-affix--suf" aria-hidden="true">{sufixo}</span>}
    </div>
  );
}

export const numProps = {
  inputMode: 'decimal' as const,
  onFocus: (e: ReactFocusEvent<HTMLInputElement>) => e.currentTarget.select(),
  onWheel: (e: ReactWheelEvent<HTMLInputElement>) => e.currentTarget.blur(),
};

/* ============================================================
   GRÁFICOS
   ============================================================ */

export function TabelaSerie({ serie, legenda }: { serie: PontoMes[]; legenda: string }) {
  return (
    <table className="sr-only">
      <caption>{legenda}</caption>
      <thead>
        <tr>
          <th scope="col">Mês</th>
          <th scope="col">Compras</th>
          <th scope="col">Vendas</th>
          <th scope="col">Lucro</th>
        </tr>
      </thead>
      <tbody>
        {serie.map((p) => (
          <tr key={p.mes}>
            <th scope="row">{p.rotulo}</th>
            <td>{formatarMoeda(p.compras)}</td>
            <td>{formatarMoeda(p.vendas)}</td>
            <td>{formatarMoeda(p.lucro)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function GraficoBarras({ serie }: { serie: PontoMes[] }) {
  const max = Math.max(1, ...serie.map((p) => Math.max(p.compras, p.vendas)));
  return (
    <>
      <TabelaSerie serie={serie} legenda="Compras, vendas e lucro nos últimos 6 meses" />
      <div className="chart-bars" aria-hidden="true">
        {serie.map((p) => (
          <div key={p.mes} className="chart-bar-month">
            <div className="chart-bar-pair">
              <div
                className="chart-bar chart-bar--compra"
                style={{ height: `${(p.compras / max) * 100}%` }}
                title={`Compras em ${p.rotulo}: ${formatarMoeda(p.compras)}`}
              />
              <div
                className="chart-bar chart-bar--venda"
                style={{ height: `${(p.vendas / max) * 100}%` }}
                title={`Vendas em ${p.rotulo}: ${formatarMoeda(p.vendas)}`}
              />
            </div>
            <span className="chart-bar-label">{p.rotulo}</span>
          </div>
        ))}
      </div>
      <div className="chart-legend" aria-hidden="true">
        <span className="chart-legend-item inline-flex items-center gap-2">
          <span className="chart-legend-swatch h-3 w-3 rounded-[4px] chart-legend-swatch--compra" /> Compras
        </span>
        <span className="chart-legend-item inline-flex items-center gap-2">
          <span className="chart-legend-swatch h-3 w-3 rounded-[4px] chart-legend-swatch--venda" /> Vendas
        </span>
      </div>
    </>
  );
}

export function GraficoLinha({ serie }: { serie: PontoMes[] }) {
  const W = 560;
  const H = 200;
  const PAD_X = 28;
  const PAD_Y = 24;

  const lucros = serie.map((p) => p.lucro);
  const min = Math.min(0, ...lucros);
  const max = Math.max(0, ...lucros);
  const span = max - min || 1;

  const pontos = serie.map((p, i) => {
    const x = PAD_X + (i / Math.max(1, serie.length - 1)) * (W - PAD_X * 2);
    const y = H - PAD_Y - ((p.lucro - min) / span) * (H - PAD_Y * 2);
    return { x, y, ...p };
  });

  const path = pontos.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${path} L ${pontos[pontos.length - 1].x.toFixed(1)} ${H - PAD_Y} L ${pontos[0].x.toFixed(1)} ${H - PAD_Y} Z`;
  const zeroY = H - PAD_Y - ((0 - min) / span) * (H - PAD_Y * 2);
  const resumo = `Evolução do lucro mensal: ${serie.map((p) => `${p.rotulo} ${formatarMoeda(p.lucro)}`).join(', ')}`;

  return (
    <svg className="chart-line-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={resumo}>
      {[0, 0.5, 1].map((p) => {
        const y = PAD_Y + p * (H - PAD_Y * 2);
        return <line key={p} x1={PAD_X} x2={W - PAD_X} y1={y} y2={y} className="chart-line-grid" />;
      })}
      {min < 0 && <line x1={PAD_X} x2={W - PAD_X} y1={zeroY} y2={zeroY} className="chart-line-zero" />}
      <path d={areaPath} className="chart-line-area" />
      <path d={path} className="chart-line-path" />
      {pontos.map((p) => (
        <g key={p.mes}>
          <circle cx={p.x} cy={p.y} r={4} className="chart-line-dot">
            <title>{`${p.rotulo}: ${formatarMoeda(p.lucro)}`}</title>
          </circle>
          <text x={p.x} y={H - 6} className="chart-line-label">{p.rotulo}</text>
        </g>
      ))}
    </svg>
  );
}

/* ============================================================
   PALETA DE COMANDOS
   ============================================================ */

export function Paleta({ comandos, onFechar }: { comandos: Comando[]; onFechar: () => void }) {
  const id = useId();
  const [q, setQ] = useState('');
  const [ativo, setAtivo] = useState(0);

  const lista = (() => {
    const t = normalizar(q.trim());
    const base = t
      ? comandos.filter((c) => normalizar(`${c.rotulo} ${c.grupo}`).includes(t))
      : comandos.filter((c) => !c.soBusca);
    return base.slice(0, 30);
  })();

  const idx = Math.min(ativo, Math.max(0, lista.length - 1));

  useEffect(() => {
    document.getElementById(`${id}-op-${idx}`)?.scrollIntoView({ block: 'nearest' });
  }, [id, idx]);

  const executar = (c?: Comando) => {
    if (!c) return;
    onFechar();
    c.acao();
  };

  const onKey = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setAtivo((idx + 1) % Math.max(1, lista.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setAtivo((idx - 1 + lista.length) % Math.max(1, lista.length));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setAtivo(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setAtivo(Math.max(0, lista.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      executar(lista[idx]);
    }
  };

  return (
    <Modal rotulo="Buscar ou executar um comando" onFechar={onFechar} className="dash-modal dash-palette">
      <label className="sr-only" htmlFor={`${id}-q`}>Buscar insumo ou comando</label>
      <input
        id={`${id}-q`}
        className="dash-input"
        style={{ width: '100%' }}
        placeholder="Digite um comando ou o nome de um insumo…"
        role="combobox"
        aria-expanded="true"
        aria-controls={`${id}-lista`}
        aria-autocomplete="list"
        aria-activedescendant={lista.length ? `${id}-op-${idx}` : undefined}
        autoComplete="off"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setAtivo(0);
        }}
        onKeyDown={onKey}
        autoFocus
      />
      <ul id={`${id}-lista`} role="listbox" aria-label="Resultados" className="dash-palette-list">
        {lista.map((c, i) => (
          <li
            key={c.id}
            id={`${id}-op-${i}`}
            role="option"
            aria-selected={i === idx}
            className="dash-palette-item"
            onMouseMove={() => setAtivo(i)}
            onClick={() => executar(c)}
          >
            <span>{c.rotulo}</span>
            <span className="dash-palette-meta inline-flex items-center gap-2">
              {c.grupo}
              {c.atalho && <kbd className="dash-kbd">{c.atalho}</kbd>}
            </span>
          </li>
        ))}
      </ul>
      {lista.length === 0 && <p className="dash-palette-empty">Nada encontrado para "{q}".</p>}
      <p className="sr-only" role="status">{lista.length} resultado{lista.length === 1 ? '' : 's'}</p>
    </Modal>
  );
}

/* ============================================================
   BANNER DE STATUS DA API
   ============================================================ */

export function StatusApiBanner({
  estado,
  rotas,
  onRecarregar,
}: {
  estado: EstadoApi;
  rotas: RotasApi;
  onRecarregar: () => void;
}) {
  const faltando = (Object.entries(rotas) as [keyof RotasApi, boolean][])
    .filter(([, ok]) => !ok)
    .map(([nome]) => {
      if (nome === 'movimentacoes') return 'movimentações';
      return nome;
    });

  const mostrar = estado === 'offline' || estado === 'sem-rotas' || faltando.length > 0;
  if (!mostrar) return null;

  type Nivel = 'erro' | 'aviso' | 'info';
  let nivel: Nivel = 'info';
  let titulo = '';
  let descricao: ReactNode = null;

  if (estado === 'offline') {
    nivel = 'erro';
    titulo = 'Servidor offline';
    descricao = (
      <>
        Não foi possível alcançar a API. Verifique a conexão com a internet ou se o
        container está de pé.
      </>
    );
  } else if (estado === 'sem-rotas') {
    nivel = 'aviso';
    titulo = 'Backend ainda não tem as rotas do sistema';
    descricao = (
      <>
        A API respondeu, mas os endpoints de <strong>insumos</strong>,{' '}
        <strong>fornecedores</strong> e <strong>movimentações</strong> ainda não existem.
        Por enquanto o app vai mostrar listas vazias até o backend ser implementado.
      </>
    );
  } else if (faltando.length > 0) {
    nivel = 'aviso';
    titulo = 'Algumas rotas da API ainda não existem';
    descricao = (
      <>
        Faltando no backend: <strong>{faltando.join(', ')}</strong>. Os recursos que
        dependem dessas rotas vão aparecer vazios até serem implementados.
      </>
    );
  }

  const Icone = nivel === 'erro' ? '❌' : nivel === 'aviso' ? '⚠️' : 'ℹ️';

  return (
    <div className={`api-banner api-banner--${nivel}`} role="status">
      <span className="api-banner-icon" aria-hidden="true">{Icone}</span>
      <div className="api-banner-content min-w-0 flex-1">
        <strong className="api-banner-title">{titulo}</strong>
        <p className="api-banner-desc">{descricao}</p>
      </div>
      <button
        type="button"
        className="dash-btn dash-btn-sm api-banner-btn"
        onClick={onRecarregar}
      >
        🔄 Recarregar
      </button>
    </div>
  );
}