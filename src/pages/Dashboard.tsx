// src/pages/Dashboard.tsx
/**
 * ⚠️ FASE 1 — MOCK
 * Este Dashboard funciona sozinho com dados em memória + localStorage
 * (chave `controle-insumos:mock:v1`).
 *
 * Quando os services (`insumos.service.ts`, `fornecedores.service.ts`,
 * `movimentacoes.service.ts`) e seus contexts existirem, troque os
 * `useState` locais pelos hooks correspondentes e remova o bloco MOCK
 * + a persistência em localStorage.
 */

import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useDeferredValue,
  useRef,
  useId,
} from 'react';
import type {
  FormEvent,
  ReactNode,
  RefObject,
} from 'react';
import LogoutButton from '../components/LogoutButton';
import { useAuth } from '../contexts/AuthContext';

/* ============================================================
   TIPOS
   ============================================================ */

type TipoMov = 'Compra' | 'Venda' | 'Ajuste';

type Insumo = {
  id: string;
  nome: string;
  categoria: string;
  unidade: string;
  quantidadeAtual: number;
  quantidadeMinima: number;
  precoCompra: number;
  precoVenda: number;
  fornecedorId?: string;
  observacoes?: string;
  ativo: boolean;
  criadoEm: string;
};

type Fornecedor = {
  id: string;
  nome: string;
  documento?: string;
  telefone?: string;
  email?: string;
  observacoes?: string;
  ativo: boolean;
  criadoEm: string;
};

type Movimentacao = {
  id: string;
  insumoId: string;
  tipo: TipoMov;
  quantidade: number;
  precoUnitario: number;
  total: number;
  data: string;
  fornecedorId?: string;
  cliente?: string;
  observacoes?: string;
  criadoEm: string;
};

type ToastTipo = 'sucesso' | 'erro' | 'info';
type Toast = {
  id: string;
  texto: string;
  tipo: ToastTipo;
  acao?: { rotulo: string; fn: () => void };
};

/* ============================================================
   CONSTANTES
   ============================================================ */

const STORAGE_KEY = 'controle-insumos:mock:v1';
const THEME_KEY = 'controle-insumos:tema';

const CATEGORIAS_SUGERIDAS = [
  'Matéria-prima',
  'Embalagem',
  'Limpeza',
  'Escritório',
  'Manutenção',
  'Outros',
];

const UNIDADES_SUGERIDAS = ['un', 'kg', 'g', 'L', 'mL', 'm', 'm²', 'cx', 'pct'];

const STATUS_INSUMO = ['OK', 'Baixo', 'Zerado'] as const;
type StatusInsumo = (typeof STATUS_INSUMO)[number];

const LIMITES = {
  nome: 120,
  categoria: 60,
  unidade: 20,
  documento: 24,
  telefone: 24,
  email: 120,
  cliente: 120,
  observacoes: 500,
} as const;

/* ============================================================
   UTILITÁRIOS
   ============================================================ */

const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

const normalizar = (txt: string) =>
  txt.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const formatarMoeda = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatarNumero = (n: number, casas = 2) =>
  n.toLocaleString('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });

const formatarData = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatarDataLonga = () =>
  new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

const hojeISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const mesChave = (iso: string) => iso.slice(0, 7);

const mesRotulo = (chave: string) => {
  const [ano, mes] = chave.split('-').map(Number);
  const d = new Date(ano, mes - 1, 1);
  return d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
};

const ultimosMeses = (n: number): string[] => {
  const out: string[] = [];
  const d = new Date();
  d.setDate(1);
  for (let i = n - 1; i >= 0; i--) {
    const x = new Date(d.getFullYear(), d.getMonth() - i, 1);
    out.push(`${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}`);
  }
  return out;
};

const statusDoInsumo = (i: Insumo): StatusInsumo => {
  if (i.quantidadeAtual <= 0) return 'Zerado';
  if (i.quantidadeAtual < i.quantidadeMinima) return 'Baixo';
  return 'OK';
};

const margemDe = (compra: number, venda: number) =>
  venda > 0 ? ((venda - compra) / venda) * 100 : 0;

/* ============================================================
   CÁLCULOS
   ============================================================ */

type Totais = {
  compras: number;
  vendas: number;
  lucro: number;
  margem: number;
  qtdCompras: number;
  qtdVendas: number;
};

const calcularTotais = (movs: Movimentacao[]): Totais => {
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

type PontoMes = {
  mes: string;
  rotulo: string;
  compras: number;
  vendas: number;
  lucro: number;
};

const serieMensal = (movs: Movimentacao[], n = 6): PontoMes[] =>
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
   MOCK (Fase 1)
   ============================================================ */

let seed = 1337;
const rnd = () => {
  seed = (seed * 16807) % 2147483647;
  return seed / 2147483647;
};
const escolher = <T,>(arr: T[]): T => arr[Math.floor(rnd() * arr.length)];
const entre = (min: number, max: number) => min + rnd() * (max - min);
const isoDiasAtras = (dias: number) => {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  d.setHours(9 + Math.floor(rnd() * 8), Math.floor(rnd() * 60), 0, 0);
  return d.toISOString();
};

function gerarFornecedores(): Fornecedor[] {
  const base: Omit<Fornecedor, 'id' | 'criadoEm'>[] = [
    { nome: 'Distribuidora Alfa', documento: '12.345.678/0001-90', telefone: '(11) 98765-4321', email: 'contato@alfadistrib.com.br', ativo: true },
    { nome: 'Comercial Beta', documento: '98.765.432/0001-10', telefone: '(11) 91234-5678', email: 'vendas@betacomercial.com', ativo: true },
    { nome: 'Atacadão Gama', documento: '45.678.901/0001-23', telefone: '(11) 99999-8888', email: 'pedidos@atacadaogama.com', ativo: true },
  ];
  return base.map((f) => ({ ...f, id: uid(), criadoEm: isoDiasAtras(200) }));
}

function gerarInsumos(fornecedores: Fornecedor[]): Insumo[] {
  const base: Omit<Insumo, 'id' | 'criadoEm' | 'fornecedorId'>[] = [
    { nome: 'Parafuso sextavado 8mm', categoria: 'Matéria-prima', unidade: 'un',  quantidadeAtual: 480, quantidadeMinima: 200, precoCompra: 0.45, precoVenda: 0.90, ativo: true },
    { nome: 'Tinta acrílica branca 18L', categoria: 'Matéria-prima', unidade: 'L', quantidadeAtual: 42,  quantidadeMinima: 20,  precoCompra: 18.50, precoVenda: 32.90, ativo: true },
    { nome: 'Caixa de papelão 30×20', categoria: 'Embalagem',     unidade: 'un', quantidadeAtual: 120, quantidadeMinima: 150, precoCompra: 1.20,  precoVenda: 2.50,  ativo: true },
    { nome: 'Detergente neutro 5L',   categoria: 'Limpeza',       unidade: 'L',  quantidadeAtual: 0,   quantidadeMinima: 10,  precoCompra: 9.90,  precoVenda: 17.90, ativo: true },
    { nome: 'Papel A4 (resma 500fl)', categoria: 'Escritório',    unidade: 'pct',quantidadeAtual: 34,  quantidadeMinima: 15,  precoCompra: 22.00, precoVenda: 34.00, ativo: true },
    { nome: 'Fita adesiva transparente', categoria: 'Embalagem',  unidade: 'un', quantidadeAtual: 88,  quantidadeMinima: 40,  precoCompra: 3.10,  precoVenda: 6.50,  ativo: true },
  ];
  return base.map((i, idx) => ({
    ...i,
    id: uid(),
    fornecedorId: fornecedores[idx % fornecedores.length].id,
    criadoEm: isoDiasAtras(180 - idx * 5),
  }));
}

function gerarMovimentacoes(insumos: Insumo[], fornecedores: Fornecedor[]): Movimentacao[] {
  const movs: Movimentacao[] = [];
  const clientes = ['Mercadinho Bom Preço', 'Construtora XYZ', 'Oficina do Zé', 'Padaria Pão Quente', 'Cliente avulso'];

  for (let dia = 170; dia >= 0; dia -= 3) {
    const qtdOps = 1 + Math.floor(rnd() * 2);
    for (let k = 0; k < qtdOps; k++) {
      const insumo = escolher(insumos);
      const ehCompra = rnd() > 0.45;
      const qtd = ehCompra
        ? Math.max(5, Math.round(entre(10, 120)))
        : Math.max(1, Math.round(entre(3, 40)));

      if (ehCompra) {
        const preco = +(insumo.precoCompra * entre(0.92, 1.08)).toFixed(2);
        movs.push({
          id: uid(),
          insumoId: insumo.id,
          tipo: 'Compra',
          quantidade: qtd,
          precoUnitario: preco,
          total: +(qtd * preco).toFixed(2),
          data: isoDiasAtras(dia),
          fornecedorId: escolher(fornecedores).id,
          criadoEm: isoDiasAtras(dia),
        });
      } else {
        const preco = +(insumo.precoVenda * entre(0.95, 1.05)).toFixed(2);
        movs.push({
          id: uid(),
          insumoId: insumo.id,
          tipo: 'Venda',
          quantidade: qtd,
          precoUnitario: preco,
          total: +(qtd * preco).toFixed(2),
          data: isoDiasAtras(dia),
          cliente: escolher(clientes),
          criadoEm: isoDiasAtras(dia),
        });
      }
    }
  }
  return movs.sort((a, b) => b.data.localeCompare(a.data));
}

type EstadoMock = {
  insumos: Insumo[];
  fornecedores: Fornecedor[];
  movimentacoes: Movimentacao[];
};

function gerarMockInicial(): EstadoMock {
  const fornecedores = gerarFornecedores();
  const insumos = gerarInsumos(fornecedores);
  const movimentacoes = gerarMovimentacoes(insumos, fornecedores);
  return { insumos, fornecedores, movimentacoes };
}

function carregarMock(): EstadoMock {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<EstadoMock>;
      if (Array.isArray(p.insumos) && Array.isArray(p.fornecedores) && Array.isArray(p.movimentacoes)) {
        return { insumos: p.insumos, fornecedores: p.fornecedores, movimentacoes: p.movimentacoes };
      }
    }
  } catch {
    /* ignore */
  }
  const dados = gerarMockInicial();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
  } catch {
    /* ignore */
  }
  return dados;
}

/* ============================================================
   HOOKS
   ============================================================ */

type Tema = 'claro' | 'escuro';

function useTema() {
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

function useBodyLock(ativo: boolean) {
  useEffect(() => {
    if (!ativo) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [ativo]);
}

const FOCAVEIS =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

function useFocusTrap(ref: RefObject<HTMLElement | null>, ativo: boolean) {
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

/* ============================================================
   ESTILOS
   ============================================================ */

const STYLES = `
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
  background: var(--surface); border: 1px solid var(--border); color: var(--ink-soft);
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
.dash-kpi-icon {
  width: 40px; height: 40px; border-radius: 11px; display: grid; place-items: center; font-size: 18px;
  background: var(--brand-soft); flex-shrink: 0;
}
.dash-kpi.is-danger .dash-kpi-icon { background: var(--danger-soft); }
.dash-kpi.is-ok .dash-kpi-icon { background: var(--ok-soft); }
.dash-kpi-label { font-size: 12.5px; color: var(--muted); font-weight: 600; }
.dash-kpi-value { font-size: 22px; font-weight: 800; letter-spacing: -.03em; font-variant-numeric: tabular-nums; line-height: 1.2; }
.dash-kpi-hint { font-size: 12px; font-weight: 600; color: var(--muted); margin-left: 6px; letter-spacing: 0; }
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
.dash-select { flex: 0 0 auto; min-width: 150px; cursor: pointer; }
.dash-input::placeholder { color: var(--muted); opacity: 1; }
.dash-input:hover, .dash-select:hover { border-color: var(--border-strong); }
.dash-input:focus, .dash-select:focus {
  outline: none; border-color: var(--brand); box-shadow: 0 0 0 4px color-mix(in srgb, var(--brand-2) 25%, transparent);
}
textarea.dash-input { min-height: 84px; resize: vertical; line-height: 1.55; }

.dash-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 42px; padding: 9px 16px;
  border-radius: var(--radius-sm); font-size: 13.5px; font-weight: 600; cursor: pointer; white-space: nowrap;
  border: 1.5px solid transparent; transition: background .15s, border-color .15s, color .15s, filter .15s;
}
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

.dash-table-wrap { border: 1px solid var(--border); border-radius: var(--radius-sm); overflow-x: auto; background: var(--surface); }
.dash-table { width: 100%; border-collapse: collapse; font-size: 13.5px; min-width: 900px; }
.dash-table thead th { text-align: left; padding: 12px 16px; font-size: 12px; font-weight: 700; color: var(--muted); background: var(--surface-2); border-bottom: 1px solid var(--border); white-space: nowrap; }
.dash-table tbody td { padding: 12px 16px; border-bottom: 1px solid var(--border); vertical-align: middle; }
.dash-table tbody tr:last-child td { border-bottom: none; }
.dash-table tbody tr:hover td { background: var(--surface-2); }
.dash-table .actions-cell { width: 96px; text-align: right; white-space: nowrap; }
.dash-table .num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
.dash-table .num-strong { font-weight: 700; }
.dash-table .nome-cell { font-weight: 650; color: var(--ink); }
.dash-table .cell-muted { color: var(--muted); font-size: 12.5px; }

.dash-empty { text-align: center; padding: 48px 24px; border: 1.5px dashed var(--border-strong); border-radius: var(--radius); background: var(--surface-2); }
.dash-empty-icon { font-size: 40px; line-height: 1; margin-bottom: 12px; display: block; }
.dash-empty-title { font-size: 16px; font-weight: 700; margin-bottom: 6px; }
.dash-empty-desc { font-size: 13.5px; color: var(--muted); max-width: 420px; margin: 0 auto 18px; }

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
.chart-line-axis { font-size: 10px; fill: var(--muted); }
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
@keyframes dashRise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
.dash-modal-title { font-size: 19px; font-weight: 800; margin-bottom: 18px; }
.dash-modal-title.is-danger { color: var(--danger); text-align: center; }
.dash-modal-desc { font-size: 13.5px; color: var(--ink-soft); text-align: center; margin-bottom: 20px; }
.dash-modal-label, .form-label { font-size: 13px; font-weight: 600; display: block; }
.dash-modal-label { margin-bottom: 6px; }
.dash-modal-icon { width: 56px; height: 56px; border-radius: 50%; display: grid; place-items: center; font-size: 26px; margin: 0 auto 14px; background: var(--danger-soft); border: 1px solid var(--danger-line); }
.dash-modal-actions { display: flex; justify-content: flex-end; align-items: center; gap: 10px; margin-top: 22px; flex-wrap: wrap; }
.dash-modal-actions .spacer { margin-right: auto; }
.field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
.field-head { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 14px; }
.form-grid .field { margin-bottom: 0; }
.form-grid .dash-input, .form-grid .dash-select { width: 100%; }
.form-meta { margin-top: 14px; font-size: 12px; color: var(--muted); }
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

.dash-toasts { position: fixed; bottom: 24px; right: 24px; display: flex; flex-direction: column; gap: 10px; z-index: 2000; max-width: calc(100vw - 32px); pointer-events: none; }
.dash-toast { pointer-events: auto; display: flex; align-items: center; gap: 12px; min-width: 260px; max-width: 420px; padding: 12px 14px; border-radius: 12px; background: var(--surface); border: 1px solid var(--border); box-shadow: var(--shadow-lg); animation: dashSlideIn .2s ease-out; }
@keyframes dashSlideIn { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: none; } }
.dash-toast-icon { width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; font-size: 13px; font-weight: 800; flex-shrink: 0; }
.dash-toast--sucesso .dash-toast-icon { background: var(--ok-soft); color: var(--ok); }
.dash-toast--erro .dash-toast-icon { background: var(--danger-soft); color: var(--danger); }
.dash-toast--info .dash-toast-icon { background: var(--brand-soft); color: var(--brand); }
.dash-toast-text { flex: 1; font-size: 13.5px; line-height: 1.4; }
.dash-toast-action { background: transparent; border: none; color: var(--brand); font-weight: 700; font-size: 13px; cursor: pointer; padding: 6px 8px; border-radius: 6px; }
.dash-toast-action:hover { background: var(--brand-soft); }
.dash-toast-close { background: transparent; border: none; cursor: pointer; color: var(--muted); font-size: 15px; width: 30px; height: 30px; border-radius: 6px; }
.dash-toast-close:hover { background: var(--surface-2); color: var(--ink); }

.dash-mobile-backdrop { position: fixed; inset: 0; background: rgba(15,23,42,.55); z-index: 40; animation: dashFade .15s ease; }
.dash-mobile-drawer { position: fixed; top: 0; left: 0; bottom: 0; width: min(300px, 85vw); background: var(--sidebar); border-right: 1px solid var(--border); padding: 18px 12px; display: flex; flex-direction: column; z-index: 41; overflow-y: auto; animation: dashSlideRight .2s ease-out; }
@keyframes dashSlideRight { from { transform: translateX(-100%); } to { transform: none; } }

.dash-config-row { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 16px 0; border-bottom: 1px solid var(--border); flex-wrap: wrap; }
.dash-config-row:last-child { border-bottom: none; }
.dash-config-label { font-weight: 600; font-size: 14px; }
.dash-config-desc { font-size: 12.5px; color: var(--muted); margin-top: 2px; }
.dash-danger-zone { border: 1px solid var(--danger-line); background: var(--danger-soft); border-radius: var(--radius); padding: 18px 20px; }
.dash-danger-title { display: flex; align-items: center; gap: 8px; color: var(--danger); font-size: 14px; font-weight: 800; margin-bottom: 4px; }
.dash-danger-desc { font-size: 12.5px; color: var(--ink-soft); margin-bottom: 14px; }
.dash-danger-row { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding-top: 14px; border-top: 1px solid color-mix(in srgb, var(--danger) 25%, transparent); flex-wrap: wrap; }

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
  .dash-user-name, .dash-user-btn .chevron { display: none; }
  .dash-user-btn { padding: 3px; }
  .dash-panel { padding: 14px; }
  .dash-modal, .dash-modal.is-wide { padding: 20px 16px; border-radius: 14px; }
  .dash-modal-actions > * { flex: 1 1 100%; }
  .dash-toasts { left: 12px; right: 12px; bottom: 12px; }
  .dash-toast { min-width: 0; max-width: none; }
  .dash-filters-spacer { margin-left: 0; width: 100%; }
  .dash-filters-spacer > * { flex: 1 1 auto; }
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

/* ============================================================
   ÍCONES
   ============================================================ */

const IconEdit = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const IconTrash = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
  </svg>
);

/* ============================================================
   SUBCOMPONENTES
   ============================================================ */

function Modal({
  rotulo,
  onFechar,
  children,
  className = 'dash-modal',
  bloquear = false,
}: {
  rotulo: string;
  onFechar: () => void;
  children: ReactNode;
  className?: string;
  bloquear?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, true);
  useBodyLock(true);
  return (
    <div
      className="dash-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !bloquear) onFechar();
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

function KpiCard({
  icon,
  label,
  value,
  hint,
  variante = 'default',
}: {
  icon: string;
  label: string;
  value: string | number;
  hint?: string;
  variante?: 'default' | 'ok' | 'danger';
}) {
  const cls = `dash-kpi${variante === 'danger' ? ' is-danger' : variante === 'ok' ? ' is-ok' : ''}`;
  return (
    <div className={cls}>
      <span className="dash-kpi-icon" aria-hidden="true">{icon}</span>
      <div>
        <div className="dash-kpi-label">{label}</div>
        <div className="dash-kpi-value">
          {value}
          {hint && <span className="dash-kpi-hint">{hint}</span>}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: StatusInsumo }) {
  if (status === 'OK') return <span className="badge is-ok">OK</span>;
  if (status === 'Baixo') return <span className="badge is-warn">Baixo</span>;
  return <span className="badge is-danger">Zerado</span>;
}

function TipoBadge({ tipo }: { tipo: TipoMov }) {
  return <span className={`badge tipo-${tipo}`}>{tipo}</span>;
}

function GraficoBarras({ serie }: { serie: PontoMes[] }) {
  const max = Math.max(1, ...serie.map((p) => Math.max(p.compras, p.vendas)));
  return (
    <>
      <div className="chart-bars" role="img" aria-label="Compras e vendas nos últimos 6 meses">
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
        <span className="chart-legend-item">
          <span className="chart-legend-swatch chart-legend-swatch--compra" /> Compras
        </span>
        <span className="chart-legend-item">
          <span className="chart-legend-swatch chart-legend-swatch--venda" /> Vendas
        </span>
      </div>
    </>
  );
}

function GraficoLinha({ serie }: { serie: PontoMes[] }) {
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

  return (
    <svg className="chart-line-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Evolução do lucro mensal">
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
   MODAL: Insumo
   ============================================================ */

type InsumoModalProps = {
  insumo: Insumo | null;
  fornecedores: Fornecedor[];
  onFechar: () => void;
  onSalvar: (dados: Omit<Insumo, 'id' | 'criadoEm'>) => void;
};

function InsumoModal({ insumo, fornecedores, onFechar, onSalvar }: InsumoModalProps) {
  const id = useId();
  const [nome, setNome] = useState(insumo?.nome ?? '');
  const [categoria, setCategoria] = useState(insumo?.categoria ?? 'Matéria-prima');
  const [unidade, setUnidade] = useState(insumo?.unidade ?? 'un');
  const [quantidadeAtual, setQuantidadeAtual] = useState(String(insumo?.quantidadeAtual ?? 0));
  const [quantidadeMinima, setQuantidadeMinima] = useState(String(insumo?.quantidadeMinima ?? 0));
  const [precoCompra, setPrecoCompra] = useState(String(insumo?.precoCompra ?? 0));
  const [precoVenda, setPrecoVenda] = useState(String(insumo?.precoVenda ?? 0));
  const [fornecedorId, setFornecedorId] = useState(insumo?.fornecedorId ?? '');
  const [observacoes, setObservacoes] = useState(insumo?.observacoes ?? '');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;
    onSalvar({
      nome: nome.trim(),
      categoria: categoria.trim() || 'Outros',
      unidade: unidade.trim() || 'un',
      quantidadeAtual: Math.max(0, Number(quantidadeAtual) || 0),
      quantidadeMinima: Math.max(0, Number(quantidadeMinima) || 0),
      precoCompra: Math.max(0, Number(precoCompra) || 0),
      precoVenda: Math.max(0, Number(precoVenda) || 0),
      fornecedorId: fornecedorId || undefined,
      observacoes: observacoes.trim() || undefined,
      ativo: true,
    });
  };

  return (
    <Modal
      rotulo={insumo ? 'Editar insumo' : 'Novo insumo'}
      onFechar={onFechar}
      className="dash-modal is-wide"
    >
      <h2 className="dash-modal-title">{insumo ? 'Editar insumo' : 'Novo insumo'}</h2>
      <form onSubmit={submit} noValidate>
        <div className="field">
          <label className="form-label" htmlFor={`${id}-nome`}>Nome *</label>
          <input
            id={`${id}-nome`}
            className="dash-input"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            autoFocus
            required
            maxLength={LIMITES.nome}
          />
        </div>

        <div className="form-grid">
          <div className="field">
            <label className="form-label" htmlFor={`${id}-cat`}>Categoria</label>
            <input
              id={`${id}-cat`}
              className="dash-input"
              list={`${id}-cats`}
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              maxLength={LIMITES.categoria}
            />
            <datalist id={`${id}-cats`}>
              {CATEGORIAS_SUGERIDAS.map((c) => <option key={c} value={c} />)}
            </datalist>
          </div>

          <div className="field">
            <label className="form-label" htmlFor={`${id}-un`}>Unidade</label>
            <input
              id={`${id}-un`}
              className="dash-input"
              list={`${id}-uns`}
              value={unidade}
              onChange={(e) => setUnidade(e.target.value)}
              maxLength={LIMITES.unidade}
            />
            <datalist id={`${id}-uns`}>
              {UNIDADES_SUGERIDAS.map((u) => <option key={u} value={u} />)}
            </datalist>
          </div>

          <div className="field">
            <label className="form-label" htmlFor={`${id}-qa`}>Qtd. atual</label>
            <input
              id={`${id}-qa`}
              type="number"
              step="0.01"
              min="0"
              className="dash-input"
              value={quantidadeAtual}
              onChange={(e) => setQuantidadeAtual(e.target.value)}
            />
          </div>

          <div className="field">
            <label className="form-label" htmlFor={`${id}-qm`}>Qtd. mínima</label>
            <input
              id={`${id}-qm`}
              type="number"
              step="0.01"
              min="0"
              className="dash-input"
              value={quantidadeMinima}
              onChange={(e) => setQuantidadeMinima(e.target.value)}
            />
          </div>

          <div className="field">
            <label className="form-label" htmlFor={`${id}-pc`}>Preço de compra (R$)</label>
            <input
              id={`${id}-pc`}
              type="number"
              step="0.01"
              min="0"
              className="dash-input"
              value={precoCompra}
              onChange={(e) => setPrecoCompra(e.target.value)}
            />
          </div>

          <div className="field">
            <label className="form-label" htmlFor={`${id}-pv`}>Preço de venda (R$)</label>
            <input
              id={`${id}-pv`}
              type="number"
              step="0.01"
              min="0"
              className="dash-input"
              value={precoVenda}
              onChange={(e) => setPrecoVenda(e.target.value)}
            />
          </div>
        </div>

        <div className="field" style={{ marginTop: 14 }}>
          <label className="form-label" htmlFor={`${id}-forn`}>Fornecedor principal</label>
          <select
            id={`${id}-forn`}
            className="dash-select"
            style={{ width: '100%' }}
            value={fornecedorId}
            onChange={(e) => setFornecedorId(e.target.value)}
          >
            <option value="">— Nenhum —</option>
            {fornecedores.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
          </select>
        </div>

        <div className="field" style={{ marginTop: 14 }}>
          <label className="form-label" htmlFor={`${id}-obs`}>Observações</label>
          <textarea
            id={`${id}-obs`}
            className="dash-input"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            maxLength={LIMITES.observacoes}
          />
        </div>

        <div className="dash-modal-actions">
          <button type="button" className="dash-btn dash-btn-ghost" onClick={onFechar}>
            Cancelar
          </button>
          <button type="submit" className="dash-btn dash-btn-primary">
            {insumo ? 'Salvar alterações' : 'Criar insumo'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ============================================================
   MODAL: Movimentação
   ============================================================ */

type MovimentacaoModalProps = {
  insumos: Insumo[];
  fornecedores: Fornecedor[];
  insumoPreSelecionado: string | null;
  onFechar: () => void;
  onSalvar: (dados: Omit<Movimentacao, 'id' | 'criadoEm' | 'total'>) => void;
};

function MovimentacaoModal({
  insumos,
  fornecedores,
  insumoPreSelecionado,
  onFechar,
  onSalvar,
}: MovimentacaoModalProps) {
  const id = useId();
  const [tipo, setTipo] = useState<TipoMov>('Compra');
  const [insumoId, setInsumoId] = useState(
    insumoPreSelecionado ?? (insumos[0]?.id ?? '')
  );
  const [quantidade, setQuantidade] = useState('1');
  const [precoUnitario, setPrecoUnitario] = useState('');
  const [data, setData] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [fornecedorId, setFornecedorId] = useState('');
  const [cliente, setCliente] = useState('');
  const [observacoes, setObservacoes] = useState('');

  useEffect(() => {
    const insumo = insumos.find((i) => i.id === insumoId);
    if (!insumo) return;
    if (tipo === 'Compra') setPrecoUnitario(String(insumo.precoCompra));
    else if (tipo === 'Venda') setPrecoUnitario(String(insumo.precoVenda));
  }, [insumoId, tipo, insumos]);

  const qtdNum = Number(quantidade);
  const precoNum = Number(precoUnitario);
  const total = (qtdNum || 0) * (precoNum || 0);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!insumoId) return;
    if (tipo === 'Ajuste' && !Number.isFinite(qtdNum)) return;
    if (tipo !== 'Ajuste' && qtdNum <= 0) return;
    if (precoNum < 0) return;

    const iso = new Date(`${data}T${new Date().toISOString().slice(11, 19)}`).toISOString();

    onSalvar({
      insumoId,
      tipo,
      quantidade: tipo === 'Ajuste' ? qtdNum : Math.abs(qtdNum),
      precoUnitario: precoNum,
      data: iso,
      fornecedorId: tipo === 'Compra' && fornecedorId ? fornecedorId : undefined,
      cliente: tipo === 'Venda' && cliente.trim() ? cliente.trim() : undefined,
      observacoes: observacoes.trim() || undefined,
    });
  };

  return (
    <Modal
      rotulo={tipo === 'Compra' ? 'Nova compra' : tipo === 'Venda' ? 'Nova venda' : 'Novo ajuste'}
      onFechar={onFechar}
      className="dash-modal is-wide"
    >
      <h2 className="dash-modal-title">Registrar movimentação</h2>

      <div className="field" style={{ marginBottom: 18 }}>
        <span className="form-label" id={`${id}-tipo`}>Tipo</span>
        <div className="tipo-picker" role="group" aria-labelledby={`${id}-tipo`}>
          {(['Compra', 'Venda', 'Ajuste'] as TipoMov[]).map((t) => (
            <button
              key={t}
              type="button"
              data-tipo={t}
              className={`tipo-picker-btn${tipo === t ? ' is-on' : ''}`}
              aria-pressed={tipo === t}
              onClick={() => setTipo(t)}
            >
              <span aria-hidden="true">
                {t === 'Compra' ? '💰' : t === 'Venda' ? '💵' : '⚙️'}
              </span>{' '}
              {t}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={submit} noValidate>
        <div className="field">
          <label className="form-label" htmlFor={`${id}-ins`}>Insumo *</label>
          <select
            id={`${id}-ins`}
            className="dash-select"
            style={{ width: '100%' }}
            value={insumoId}
            onChange={(e) => setInsumoId(e.target.value)}
            required
          >
            {insumos.length === 0 && <option value="">— Nenhum insumo cadastrado —</option>}
            {insumos.map((i) => <option key={i.id} value={i.id}>{i.nome}</option>)}
          </select>
        </div>

        <div className="form-grid" style={{ marginTop: 14 }}>
          <div className="field">
            <label className="form-label" htmlFor={`${id}-qtd`}>
              Quantidade {tipo === 'Ajuste' ? '(use − para subtrair)' : '*'}
            </label>
            <input
              id={`${id}-qtd`}
              type="number"
              step="0.01"
              className="dash-input"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              autoFocus
            />
          </div>

          <div className="field">
            <label className="form-label" htmlFor={`${id}-preco`}>Preço unitário (R$)</label>
            <input
              id={`${id}-preco`}
              type="number"
              step="0.01"
              min="0"
              className="dash-input"
              value={precoUnitario}
              onChange={(e) => setPrecoUnitario(e.target.value)}
            />
          </div>

          <div className="field">
            <label className="form-label" htmlFor={`${id}-data`}>Data</label>
            <input
              id={`${id}-data`}
              type="date"
              className="dash-input"
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
          </div>

          <div className="field">
            <span className="form-label">Total</span>
            <div
              className="dash-input"
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'var(--surface-2)',
                fontWeight: 700,
              }}
            >
              {formatarMoeda(total || 0)}
            </div>
          </div>
        </div>

        {tipo === 'Compra' && (
          <div className="field" style={{ marginTop: 14 }}>
            <label className="form-label" htmlFor={`${id}-forn`}>Fornecedor</label>
            <select
              id={`${id}-forn`}
              className="dash-select"
              style={{ width: '100%' }}
              value={fornecedorId}
              onChange={(e) => setFornecedorId(e.target.value)}
            >
              <option value="">— Nenhum —</option>
              {fornecedores.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
            </select>
          </div>
        )}

        {tipo === 'Venda' && (
          <div className="field" style={{ marginTop: 14 }}>
            <label className="form-label" htmlFor={`${id}-cli`}>Cliente</label>
            <input
              id={`${id}-cli`}
              className="dash-input"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              maxLength={LIMITES.cliente}
            />
          </div>
        )}

        <div className="field" style={{ marginTop: 14 }}>
          <label className="form-label" htmlFor={`${id}-obs`}>Observações</label>
          <textarea
            id={`${id}-obs`}
            className="dash-input"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            maxLength={LIMITES.observacoes}
          />
        </div>

        <div className="dash-modal-actions">
          <button type="button" className="dash-btn dash-btn-ghost" onClick={onFechar}>
            Cancelar
          </button>
          <button type="submit" className="dash-btn dash-btn-primary" disabled={insumos.length === 0}>
            Registrar
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ============================================================
   MODAL: Fornecedor
   ============================================================ */

type FornecedorModalProps = {
  fornecedor: Fornecedor | null;
  onFechar: () => void;
  onSalvar: (dados: Omit<Fornecedor, 'id' | 'criadoEm'>) => void;
};

function FornecedorModal({ fornecedor, onFechar, onSalvar }: FornecedorModalProps) {
  const id = useId();
  const [nome, setNome] = useState(fornecedor?.nome ?? '');
  const [documento, setDocumento] = useState(fornecedor?.documento ?? '');
  const [telefone, setTelefone] = useState(fornecedor?.telefone ?? '');
  const [email, setEmail] = useState(fornecedor?.email ?? '');
  const [observacoes, setObservacoes] = useState(fornecedor?.observacoes ?? '');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;
    onSalvar({
      nome: nome.trim(),
      documento: documento.trim() || undefined,
      telefone: telefone.trim() || undefined,
      email: email.trim() || undefined,
      observacoes: observacoes.trim() || undefined,
      ativo: true,
    });
  };

  return (
    <Modal
      rotulo={fornecedor ? 'Editar fornecedor' : 'Novo fornecedor'}
      onFechar={onFechar}
    >
      <h2 className="dash-modal-title">{fornecedor ? 'Editar fornecedor' : 'Novo fornecedor'}</h2>
      <form onSubmit={submit} noValidate>
        <div className="field">
          <label className="form-label" htmlFor={`${id}-nome`}>Nome *</label>
          <input
            id={`${id}-nome`}
            className="dash-input"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            autoFocus
            required
            maxLength={LIMITES.nome}
          />
        </div>

        <div className="form-grid" style={{ marginTop: 14 }}>
          <div className="field">
            <label className="form-label" htmlFor={`${id}-doc`}>Documento (CNPJ/CPF)</label>
            <input
              id={`${id}-doc`}
              className="dash-input"
              value={documento}
              onChange={(e) => setDocumento(e.target.value)}
              maxLength={LIMITES.documento}
            />
          </div>

          <div className="field">
            <label className="form-label" htmlFor={`${id}-tel`}>Telefone</label>
            <input
              id={`${id}-tel`}
              className="dash-input"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              maxLength={LIMITES.telefone}
            />
          </div>
        </div>

        <div className="field" style={{ marginTop: 14 }}>
          <label className="form-label" htmlFor={`${id}-mail`}>E-mail</label>
          <input
            id={`${id}-mail`}
            type="email"
            className="dash-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={LIMITES.email}
          />
        </div>

        <div className="field" style={{ marginTop: 14 }}>
          <label className="form-label" htmlFor={`${id}-obs`}>Observações</label>
          <textarea
            id={`${id}-obs`}
            className="dash-input"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            maxLength={LIMITES.observacoes}
          />
        </div>

        <div className="dash-modal-actions">
          <button type="button" className="dash-btn dash-btn-ghost" onClick={onFechar}>
            Cancelar
          </button>
          <button type="submit" className="dash-btn dash-btn-primary">
            {fornecedor ? 'Salvar alterações' : 'Criar fornecedor'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ============================================================
   DASHBOARD — CONTEÚDO
   ============================================================ */

type Aba = 'dashboard' | 'insumos' | 'movimentacoes' | 'fornecedores' | 'config';

const ABAS: { id: Aba; icon: string; label: string; titulo: string }[] = [
  { id: 'dashboard',      icon: '📊', label: 'Dashboard',      titulo: 'Visão geral' },
  { id: 'insumos',        icon: '📦', label: 'Insumos',        titulo: 'Insumos' },
  { id: 'movimentacoes',  icon: '🔁', label: 'Movimentações',  titulo: 'Movimentações' },
  { id: 'fornecedores',   icon: '🏢', label: 'Fornecedores',   titulo: 'Fornecedores' },
  { id: 'config',         icon: '⚙️', label: 'Configurações',  titulo: 'Configurações' },
];

function DashboardConteudo() {
  const { usuario } = useAuth();
  const { tema, alternar } = useTema();

  const [estado, setEstado] = useState<EstadoMock>(() => carregarMock());
  const { insumos, fornecedores, movimentacoes } = estado;

  const [aba, setAba] = useState<Aba>('dashboard');

  const [buscaInsumo, setBuscaInsumo] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('Todas');
  const [statusFiltro, setStatusFiltro] = useState<'Todos' | StatusInsumo>('Todos');

  const [tipoMovFiltro, setTipoMovFiltro] = useState<'Todos' | TipoMov>('Todos');
  const [insumoMovFiltro, setInsumoMovFiltro] = useState<string>('Todos');
  const [periodoMovFiltro, setPeriodoMovFiltro] = useState<'30' | '90' | '180' | 'todos'>('90');

  const buscaDeferred = useDeferredValue(buscaInsumo);

  const [insumoEditando, setInsumoEditando] = useState<Insumo | null>(null);
  const [insumoModalAberto, setInsumoModalAberto] = useState(false);
  const [movModalAberto, setMovModalAberto] = useState(false);
  const [movInsumoPreSelecionado, setMovInsumoPreSelecionado] = useState<string | null>(null);
  const [fornecedorEditando, setFornecedorEditando] = useState<Fornecedor | null>(null);
  const [fornecedorModalAberto, setFornecedorModalAberto] = useState(false);
  const [confirmar, setConfirmar] = useState<{ tipo: 'insumo' | 'fornecedor' | 'mov' | 'zerar'; alvo?: Insumo | Fornecedor | Movimentacao } | null>(null);

  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [senhaExcluir, setSenhaExcluir] = useState('');
  const [erroExcluir, setErroExcluir] = useState<string | null>(null);

  const [menuUsuarioAberto, setMenuUsuarioAberto] = useState(false);
  const [drawerMobileAberto, setDrawerMobileAberto] = useState(false);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((texto: string, tipo: ToastTipo = 'info', acao?: Toast['acao']) => {
    const id = uid();
    setToasts((t) => [...t.slice(-3), { id, texto, tipo, acao }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), acao ? 7000 : 3600);
  }, []);
  const removerToast = (id: string) => setToasts((t) => t.filter((x) => x.id !== id));

  const drawerRef = useRef<HTMLElement>(null);
  useBodyLock(drawerMobileAberto);
  useFocusTrap(drawerRef, drawerMobileAberto);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
    } catch {
      /* ignore */
    }
  }, [estado]);

  const salvarInsumo = useCallback(
    (dados: Omit<Insumo, 'id' | 'criadoEm'>, id?: string) => {
      setEstado((e) => {
        if (id) {
          return { ...e, insumos: e.insumos.map((i) => (i.id === id ? { ...i, ...dados } : i)) };
        }
        const novo: Insumo = { ...dados, id: uid(), criadoEm: new Date().toISOString() };
        return { ...e, insumos: [novo, ...e.insumos] };
      });
      push(id ? 'Insumo atualizado' : 'Insumo criado', 'sucesso');
    },
    [push]
  );

  const excluirInsumo = useCallback(
    (id: string) => {
      setEstado((e) => ({ ...e, insumos: e.insumos.filter((i) => i.id !== id) }));
      push('Insumo excluído', 'info');
    },
    [push]
  );

  const salvarFornecedor = useCallback(
    (dados: Omit<Fornecedor, 'id' | 'criadoEm'>, id?: string) => {
      setEstado((e) => {
        if (id) {
          return { ...e, fornecedores: e.fornecedores.map((f) => (f.id === id ? { ...f, ...dados } : f)) };
        }
        const novo: Fornecedor = { ...dados, id: uid(), criadoEm: new Date().toISOString() };
        return { ...e, fornecedores: [novo, ...e.fornecedores] };
      });
      push(id ? 'Fornecedor atualizado' : 'Fornecedor criado', 'sucesso');
    },
    [push]
  );

  const excluirFornecedor = useCallback(
    (id: string) => {
      setEstado((e) => ({ ...e, fornecedores: e.fornecedores.filter((f) => f.id !== id) }));
      push('Fornecedor excluído', 'info');
    },
    [push]
  );

  const registrarMovimentacao = useCallback(
    (dados: Omit<Movimentacao, 'id' | 'criadoEm' | 'total'>) => {
      const total = +(dados.quantidade * dados.precoUnitario).toFixed(2);
      const nova: Movimentacao = { ...dados, total, id: uid(), criadoEm: new Date().toISOString() };

      setEstado((e) => {
        const insumosNovos = e.insumos.map((i) => {
          if (i.id !== dados.insumoId) return i;
          const delta =
            dados.tipo === 'Compra' ? dados.quantidade :
            dados.tipo === 'Venda' ? -dados.quantidade :
            dados.quantidade;
          const qtd = Math.max(0, +(i.quantidadeAtual + delta).toFixed(4));
          const precoCompra = dados.tipo === 'Compra' ? dados.precoUnitario : i.precoCompra;
          const precoVenda  = dados.tipo === 'Venda'  ? dados.precoUnitario : i.precoVenda;
          return { ...i, quantidadeAtual: qtd, precoCompra, precoVenda };
        });
        return { ...e, insumos: insumosNovos, movimentacoes: [nova, ...e.movimentacoes] };
      });
      push('Movimentação registrada', 'sucesso');
    },
    [push]
  );

  const excluirMovimentacao = useCallback(
    (id: string) => {
      setEstado((e) => {
        const alvo = e.movimentacoes.find((m) => m.id === id);
        if (!alvo) return e;
        const insumosNovos = e.insumos.map((i) => {
          if (i.id !== alvo.insumoId) return i;
          const delta =
            alvo.tipo === 'Compra' ? -alvo.quantidade :
            alvo.tipo === 'Venda' ? alvo.quantidade :
            -alvo.quantidade;
          return { ...i, quantidadeAtual: Math.max(0, +(i.quantidadeAtual + delta).toFixed(4)) };
        });
        return { ...e, insumos: insumosNovos, movimentacoes: e.movimentacoes.filter((m) => m.id !== id) };
      });
      push('Movimentação excluída', 'info');
    },
    [push]
  );

  const zerarTudo = useCallback(() => {
    const novo = gerarMockInicial();
    setEstado(novo);
    push('Dados recriados (mock)', 'info');
  }, [push]);

  const nomeInsumo = useCallback(
    (id: string) => insumos.find((i) => i.id === id)?.nome ?? '—',
    [insumos]
  );
  const nomeFornecedor = useCallback(
    (id: string) => fornecedores.find((f) => f.id === id)?.nome ?? '—',
    [fornecedores]
  );

  const kpisMes = useMemo(() => {
    const chaveMesAtual = hojeISO().slice(0, 7);
    const movsMes = movimentacoes.filter((m) => mesChave(m.data) === chaveMesAtual);
    return calcularTotais(movsMes);
  }, [movimentacoes]);

  const serie = useMemo(() => serieMensal(movimentacoes, 6), [movimentacoes]);

  const ultimasMovs = useMemo(
    () => [...movimentacoes].sort((a, b) => b.data.localeCompare(a.data)).slice(0, 5),
    [movimentacoes]
  );

  const insumosFiltrados = useMemo(() => {
    const termo = normalizar(buscaDeferred.trim());
    return insumos.filter((i) => {
      if (categoriaFiltro !== 'Todas' && i.categoria !== categoriaFiltro) return false;
      if (statusFiltro !== 'Todos' && statusDoInsumo(i) !== statusFiltro) return false;
      if (!termo) return true;
      return normalizar(i.nome).includes(termo) || normalizar(i.categoria).includes(termo);
    });
  }, [insumos, buscaDeferred, categoriaFiltro, statusFiltro]);

  const movsFiltradas = useMemo(() => {
    const limiteDias = periodoMovFiltro === 'todos' ? Infinity : Number(periodoMovFiltro);
    const limite = Date.now() - limiteDias * 24 * 60 * 60 * 1000;
    return movimentacoes.filter((m) => {
      if (tipoMovFiltro !== 'Todos' && m.tipo !== tipoMovFiltro) return false;
      if (insumoMovFiltro !== 'Todos' && m.insumoId !== insumoMovFiltro) return false;
      if (new Date(m.data).getTime() < limite) return false;
      return true;
    });
  }, [movimentacoes, tipoMovFiltro, insumoMovFiltro, periodoMovFiltro]);

  const totaisFiltro = useMemo(() => calcularTotais(movsFiltradas), [movsFiltradas]);

  const insumosStatusCount = useMemo(() => {
    let ok = 0, baixo = 0, zerado = 0;
    for (const i of insumos) {
      const s = statusDoInsumo(i);
      if (s === 'OK') ok++;
      else if (s === 'Baixo') baixo++;
      else zerado++;
    }
    return { ok, baixo, zerado };
  }, [insumos]);

  const fornecedoresComTotais = useMemo(() => {
    const totalPorFornecedor = new Map<string, { total: number; qtd: number }>();
    for (const m of movimentacoes) {
      if (m.tipo !== 'Compra' || !m.fornecedorId) continue;
      const atual = totalPorFornecedor.get(m.fornecedorId) ?? { total: 0, qtd: 0 };
      atual.total += m.total;
      atual.qtd += 1;
      totalPorFornecedor.set(m.fornecedorId, atual);
    }
    return fornecedores.map((f) => ({
      ...f,
      totalComprado: totalPorFornecedor.get(f.id)?.total ?? 0,
      qtdCompras: totalPorFornecedor.get(f.id)?.qtd ?? 0,
    }));
  }, [fornecedores, movimentacoes]);

  const categorias = useMemo(() => {
    const set = new Set<string>();
    for (const i of insumos) set.add(i.categoria);
    return ['Todas', ...Array.from(set).sort()];
  }, [insumos]);

  const abrirNovoInsumo = () => {
    setInsumoEditando(null);
    setInsumoModalAberto(true);
  };
  const abrirEditarInsumo = (i: Insumo) => {
    setInsumoEditando(i);
    setInsumoModalAberto(true);
  };
  const abrirNovaMov = (insumoId?: string) => {
    setMovInsumoPreSelecionado(insumoId ?? null);
    setMovModalAberto(true);
  };
  const abrirNovoFornecedor = () => {
    setFornecedorEditando(null);
    setFornecedorModalAberto(true);
  };
  const abrirEditarFornecedor = (f: Fornecedor) => {
    setFornecedorEditando(f);
    setFornecedorModalAberto(true);
  };

  const exportarCSV = () => {
    const linhas = [
      ['Data', 'Insumo', 'Tipo', 'Quantidade', 'Preço Unit.', 'Total', 'Fornecedor/Cliente', 'Observações'],
      ...movsFiltradas.map((m) => [
        formatarData(m.data),
        nomeInsumo(m.insumoId),
        m.tipo,
        String(m.quantidade),
        String(m.precoUnitario),
        String(m.total),
        m.fornecedorId ? nomeFornecedor(m.fornecedorId) : (m.cliente ?? ''),
        m.observacoes ?? '',
      ]),
    ];
    const csv = linhas.map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `movimentacoes-${hojeISO()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    push('CSV exportado', 'sucesso');
  };

  const confirmarExclusao = () => {
    if (!confirmar) return;
    if (confirmar.tipo === 'insumo' && confirmar.alvo) excluirInsumo((confirmar.alvo as Insumo).id);
    if (confirmar.tipo === 'fornecedor' && confirmar.alvo) excluirFornecedor((confirmar.alvo as Fornecedor).id);
    if (confirmar.tipo === 'mov' && confirmar.alvo) excluirMovimentacao((confirmar.alvo as Movimentacao).id);
    if (confirmar.tipo === 'zerar') zerarTudo();
    setConfirmar(null);
  };

  const handleExcluirConta = () => {
    if (!senhaExcluir.trim()) {
      setErroExcluir('Digite sua senha para continuar.');
      return;
    }
    setErroExcluir('Exclusão de conta ainda não implementada no mock. Remova o mock e reconecte a API.');
  };

  useEffect(() => {
    if (!menuUsuarioAberto) return;
    const fechar = () => setMenuUsuarioAberto(false);
    window.addEventListener('click', fechar);
    return () => window.removeEventListener('click', fechar);
  }, [menuUsuarioAberto]);

  const tituloAba = ABAS.find((a) => a.id === aba)?.titulo ?? '';

  const navItens = (aoClicar: (id: Aba) => void) => (
    <nav className="dash-nav" aria-label="Seções">
      {ABAS.map((a) => (
        <button
          key={a.id}
          type="button"
          className={`dash-nav-btn${aba === a.id ? ' is-active' : ''}`}
          onClick={() => aoClicar(a.id)}
          aria-current={aba === a.id ? 'page' : undefined}
        >
          <span className="dash-nav-icon" aria-hidden="true">{a.icon}</span>
          <span>{a.label}</span>
          {a.id === 'insumos' && insumos.length > 0 && (
            <span className={`dash-nav-badge${insumosStatusCount.zerado > 0 ? ' is-alert' : ''}`}>
              {insumos.length}
            </span>
          )}
        </button>
      ))}
    </nav>
  );

  const marca = (
    <div className="dash-brand">
      <span className="dash-brand-mark" aria-hidden="true">📦</span>
      <div className="dash-brand-text">
        <span className="dash-brand-name">Controle de Insumos</span>
        <span className="dash-brand-sub">Compras · Vendas · Lucro</span>
      </div>
    </div>
  );

  const navegarPara = (id: Aba) => {
    setAba(id);
    setDrawerMobileAberto(false);
  };

  const iniciais = (nome?: string) => {
    if (!nome) return '?';
    return nome.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('');
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="dash" data-theme={tema}>
        <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>

        <aside className="dash-sidebar" aria-label="Navegação principal">
          {marca}
          {navItens(setAba)}
          <div className="dash-sidebar-footer">
            <button type="button" className="dash-nav-btn" onClick={alternar}>
              <span className="dash-nav-icon" aria-hidden="true">{tema === 'claro' ? '🌙' : '☀️'}</span>
              <span>{tema === 'claro' ? 'Modo escuro' : 'Modo claro'}</span>
            </button>
          </div>
        </aside>

        <div className="dash-main">
          <header className="dash-topbar">
            <div className="dash-topbar-left">
              <button type="button" className="dash-burger" onClick={() => setDrawerMobileAberto(true)} aria-label="Abrir menu" aria-expanded={drawerMobileAberto}>
                <span aria-hidden="true">☰</span>
              </button>
              <div style={{ minWidth: 0 }}>
                <h1 className="dash-title">{tituloAba}</h1>
                <p className="dash-subtitle">
                  {formatarDataLonga()} · {insumos.length} insumos · {movimentacoes.length} movimentações
                </p>
              </div>
            </div>
            <div className="dash-topbar-right">
              <button type="button" className="dash-icon-btn" onClick={alternar} aria-label={tema === 'claro' ? 'Ativar modo escuro' : 'Ativar modo claro'}>
                <span aria-hidden="true">{tema === 'claro' ? '🌙' : '☀️'}</span>
              </button>
              <div className="dash-user" onClick={(e) => e.stopPropagation()}>
                <button type="button" className="dash-user-btn" onClick={() => setMenuUsuarioAberto((v) => !v)} aria-haspopup="menu" aria-expanded={menuUsuarioAberto} aria-label="Menu do usuário">
                  <span className="dash-avatar" aria-hidden="true">{iniciais(usuario?.nome)}</span>
                  <span className="dash-user-name">{usuario?.nome ?? 'Usuário'}</span>
                  <span className="chevron" aria-hidden="true" style={{ fontSize: 10, color: 'var(--muted)' }}>▾</span>
                </button>
                {menuUsuarioAberto && (
                  <div role="menu" className="dash-menu">
                    <div className="dash-menu-header">
                      <div className="dash-menu-name">{usuario?.nome ?? 'Usuário'}</div>
                      <div className="dash-menu-email">{usuario?.email ?? ''}</div>
                    </div>
                    <button type="button" role="menuitem" className="dash-menu-item" onClick={() => { setMenuUsuarioAberto(false); setAba('config'); }}>
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

          <main id="conteudo" className="dash-content" tabIndex={-1}>
            {aba === 'dashboard' && (
              <>
                <section className="dash-kpis" aria-label="Indicadores do mês">
                  <KpiCard icon="💰" label="Investido no mês" value={formatarMoeda(kpisMes.compras)} hint={kpisMes.qtdCompras ? `${formatarNumero(kpisMes.qtdCompras, 0)} un` : undefined} />
                  <KpiCard icon="💵" label="Recebido no mês"  value={formatarMoeda(kpisMes.vendas)}  hint={kpisMes.qtdVendas  ? `${formatarNumero(kpisMes.qtdVendas, 0)} un`  : undefined} />
                  <KpiCard
                    icon="📈"
                    label="Lucro do mês"
                    value={formatarMoeda(kpisMes.lucro)}
                    variante={kpisMes.lucro >= 0 ? 'ok' : 'danger'}
                  />
                  <KpiCard
                    icon="🎯"
                    label="Margem"
                    value={`${formatarNumero(kpisMes.margem, 1)}%`}
                    variante={kpisMes.margem >= 0 ? 'default' : 'danger'}
                  />
                </section>

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
                    <button type="button" className="dash-btn dash-btn-ghost" onClick={() => setAba('movimentacoes')}>
                      Ver todas
                    </button>
                  </div>
                  {ultimasMovs.length === 0 ? (
                    <p className="dash-panel-meta">Nenhuma movimentação ainda.</p>
                  ) : (
                    <div className="dash-table-wrap">
                      <table className="dash-table">
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
                              <td>{formatarData(m.data)}</td>
                              <td className="nome-cell">{nomeInsumo(m.insumoId)}</td>
                              <td><TipoBadge tipo={m.tipo} /></td>
                              <td className="num">{formatarNumero(m.quantidade, 0)}</td>
                              <td className="num">{formatarMoeda(m.precoUnitario)}</td>
                              <td className="num num-strong">{formatarMoeda(m.total)}</td>
                              <td className="cell-muted">
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

            {aba === 'insumos' && (
              <>
                <section className="dash-kpis" aria-label="Status dos insumos">
                  <KpiCard icon="✅" label="Estoque OK"     value={insumosStatusCount.ok} />
                  <KpiCard icon="⚠️" label="Estoque baixo"  value={insumosStatusCount.baixo} variante={insumosStatusCount.baixo > 0 ? 'danger' : 'default'} />
                  <KpiCard icon="🚨" label="Zerados"        value={insumosStatusCount.zerado} variante={insumosStatusCount.zerado > 0 ? 'danger' : 'default'} />
                  <KpiCard icon="📦" label="Total"          value={insumos.length} />
                </section>

                <div className="dash-toolbar">
                  <div className="dash-filters" role="search" aria-label="Filtrar insumos">
                    <label className="sr-only" htmlFor="filtro-busca-insumo">Buscar insumos</label>
                    <input
                      id="filtro-busca-insumo"
                      type="search"
                      className="dash-input"
                      placeholder="Buscar por nome ou categoria…"
                      value={buscaInsumo}
                      onChange={(e) => setBuscaInsumo(e.target.value)}
                    />
                    <label className="sr-only" htmlFor="filtro-categoria">Filtrar por categoria</label>
                    <select id="filtro-categoria" className="dash-select" value={categoriaFiltro} onChange={(e) => setCategoriaFiltro(e.target.value)}>
                      {categorias.map((c) => <option key={c} value={c}>{c === 'Todas' ? 'Todas as categorias' : c}</option>)}
                    </select>
                    <label className="sr-only" htmlFor="filtro-status-insumo">Filtrar por status</label>
                    <select id="filtro-status-insumo" className="dash-select" value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value as typeof statusFiltro)}>
                      <option value="Todos">Todos os status</option>
                      {STATUS_INSUMO.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <div className="dash-filters-spacer">
                      <button type="button" className="dash-btn dash-btn-primary" onClick={abrirNovoInsumo}>
                        <span aria-hidden="true">➕</span> Novo insumo
                      </button>
                    </div>
                  </div>
                </div>

                <section className="dash-panel" aria-labelledby="lista-insumos">
                  <div className="dash-panel-head">
                    <h2 className="dash-panel-title" id="lista-insumos">Todos os insumos</h2>
                    <span className="dash-panel-meta">{insumosFiltrados.length} de {insumos.length}</span>
                  </div>

                  {insumosFiltrados.length === 0 ? (
                    <div className="dash-empty">
                      <span className="dash-empty-icon" aria-hidden="true">📦</span>
                      <h3 className="dash-empty-title">Nenhum insumo encontrado</h3>
                      <p className="dash-empty-desc">Ajuste os filtros ou cadastre um novo insumo.</p>
                      <button type="button" className="dash-btn dash-btn-primary" onClick={abrirNovoInsumo}>➕ Novo insumo</button>
                    </div>
                  ) : (
                    <div className="dash-table-wrap">
                      <table className="dash-table">
                        <thead>
                          <tr>
                            <th scope="col">Nome</th>
                            <th scope="col">Categoria</th>
                            <th scope="col" className="num">Estoque</th>
                            <th scope="col" className="num">Preço Compra</th>
                            <th scope="col" className="num">Preço Venda</th>
                            <th scope="col" className="num">Margem</th>
                            <th scope="col">Status</th>
                            <th scope="col"><span className="sr-only">Ações</span></th>
                          </tr>
                        </thead>
                        <tbody>
                          {insumosFiltrados.map((i) => {
                            const margem = margemDe(i.precoCompra, i.precoVenda);
                            const status = statusDoInsumo(i);
                            return (
                              <tr key={i.id}>
                                <td className="nome-cell">
                                  {i.nome}
                                  <div className="cell-muted">{i.unidade}</div>
                                </td>
                                <td><span className="badge is-neutral">{i.categoria}</span></td>
                                <td className="num">
                                  {formatarNumero(i.quantidadeAtual, 0)}
                                  <div className="cell-muted">mín. {formatarNumero(i.quantidadeMinima, 0)}</div>
                                </td>
                                <td className="num">{formatarMoeda(i.precoCompra)}</td>
                                <td className="num">{formatarMoeda(i.precoVenda)}</td>
                                <td className="num num-strong">
                                  <span className={`badge ${margem >= 20 ? 'is-ok' : margem >= 0 ? 'is-warn' : 'is-danger'}`}>
                                    {formatarNumero(margem, 1)}%
                                  </span>
                                </td>
                                <td><StatusBadge status={status} /></td>
                                <td className="actions-cell">
                                  <div style={{ display: 'inline-flex', gap: 6 }}>
                                    <button type="button" className="dash-btn dash-btn-ghost" style={{ minHeight: 32, padding: '0 10px', fontSize: 12 }} onClick={() => abrirNovaMov(i.id)} title="Registrar movimentação">
                                      🔁
                                    </button>
                                    <button type="button" className="dash-row-btn" onClick={() => abrirEditarInsumo(i)} aria-label={`Editar ${i.nome}`} title="Editar">
                                      <IconEdit />
                                    </button>
                                    <button type="button" className="dash-row-btn is-danger" onClick={() => setConfirmar({ tipo: 'insumo', alvo: i })} aria-label={`Excluir ${i.nome}`} title="Excluir">
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
            )}

            {aba === 'movimentacoes' && (
              <>
                <section className="dash-kpis" aria-label="Totais do período">
                  <KpiCard icon="💰" label="Total investido"  value={formatarMoeda(totaisFiltro.compras)} hint={`${formatarNumero(totaisFiltro.qtdCompras, 0)} un`} />
                  <KpiCard icon="💵" label="Total recebido"   value={formatarMoeda(totaisFiltro.vendas)}  hint={`${formatarNumero(totaisFiltro.qtdVendas, 0)} un`} />
                  <KpiCard icon="📈" label="Lucro do período" value={formatarMoeda(totaisFiltro.lucro)}   variante={totaisFiltro.lucro >= 0 ? 'ok' : 'danger'} />
                  <KpiCard icon="🎯" label="Margem"           value={`${formatarNumero(totaisFiltro.margem, 1)}%`} variante={totaisFiltro.margem >= 0 ? 'default' : 'danger'} />
                </section>

                <div className="dash-toolbar">
                  <div className="dash-filters" role="search" aria-label="Filtrar movimentações">
                    <label className="sr-only" htmlFor="filtro-tipo-mov">Filtrar por tipo</label>
                    <select id="filtro-tipo-mov" className="dash-select" value={tipoMovFiltro} onChange={(e) => setTipoMovFiltro(e.target.value as typeof tipoMovFiltro)}>
                      <option value="Todos">Todos os tipos</option>
                      <option value="Compra">Compras</option>
                      <option value="Venda">Vendas</option>
                      <option value="Ajuste">Ajustes</option>
                    </select>

                    <label className="sr-only" htmlFor="filtro-insumo-mov">Filtrar por insumo</label>
                    <select id="filtro-insumo-mov" className="dash-select" value={insumoMovFiltro} onChange={(e) => setInsumoMovFiltro(e.target.value)}>
                      <option value="Todos">Todos os insumos</option>
                      {insumos.map((i) => <option key={i.id} value={i.id}>{i.nome}</option>)}
                    </select>

                    <label className="sr-only" htmlFor="filtro-periodo">Período</label>
                    <select id="filtro-periodo" className="dash-select" value={periodoMovFiltro} onChange={(e) => setPeriodoMovFiltro(e.target.value as typeof periodoMovFiltro)}>
                      <option value="30">Últimos 30 dias</option>
                      <option value="90">Últimos 90 dias</option>
                      <option value="180">Últimos 6 meses</option>
                      <option value="todos">Todo o período</option>
                    </select>

                    <div className="dash-filters-spacer">
                      <button type="button" className="dash-btn dash-btn-ghost" onClick={exportarCSV}>⬇️ Exportar CSV</button>
                      <button type="button" className="dash-btn dash-btn-primary" onClick={() => abrirNovaMov()}>
                        <span aria-hidden="true">➕</span> Nova movimentação
                      </button>
                    </div>
                  </div>
                </div>

                <section className="dash-panel" aria-labelledby="lista-movs">
                  <div className="dash-panel-head">
                    <h2 className="dash-panel-title" id="lista-movs">Movimentações</h2>
                    <span className="dash-panel-meta">{movsFiltradas.length} registro{movsFiltradas.length === 1 ? '' : 's'}</span>
                  </div>

                  {movsFiltradas.length === 0 ? (
                    <div className="dash-empty">
                      <span className="dash-empty-icon" aria-hidden="true">🔁</span>
                      <h3 className="dash-empty-title">Nenhuma movimentação no período</h3>
                      <p className="dash-empty-desc">Ajuste os filtros ou registre uma nova movimentação.</p>
                    </div>
                  ) : (
                    <div className="dash-table-wrap">
                      <table className="dash-table">
                        <thead>
                          <tr>
                            <th scope="col">Data</th>
                            <th scope="col">Insumo</th>
                            <th scope="col">Tipo</th>
                            <th scope="col" className="num">Qtd.</th>
                            <th scope="col" className="num">Preço Unit.</th>
                            <th scope="col" className="num">Total</th>
                            <th scope="col">Fornecedor / Cliente</th>
                            <th scope="col"><span className="sr-only">Ações</span></th>
                          </tr>
                        </thead>
                        <tbody>
                          {movsFiltradas.map((m) => (
                            <tr key={m.id}>
                              <td>{formatarData(m.data)}</td>
                              <td className="nome-cell">{nomeInsumo(m.insumoId)}</td>
                              <td><TipoBadge tipo={m.tipo} /></td>
                              <td className="num">{formatarNumero(m.quantidade, 0)}</td>
                              <td className="num">{formatarMoeda(m.precoUnitario)}</td>
                              <td className="num num-strong">{formatarMoeda(m.total)}</td>
                              <td className="cell-muted">
                                {m.fornecedorId ? nomeFornecedor(m.fornecedorId) : (m.cliente ?? '—')}
                              </td>
                              <td className="actions-cell">
                                <button
                                  type="button"
                                  className="dash-row-btn is-danger"
                                  onClick={() => setConfirmar({ tipo: 'mov', alvo: m })}
                                  aria-label="Excluir movimentação"
                                  title="Excluir"
                                >
                                  <IconTrash />
                                </button>
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

            {aba === 'fornecedores' && (
              <>
                <div className="dash-toolbar">
                  <div className="dash-filters">
                    <div className="dash-filters-spacer">
                      <button type="button" className="dash-btn dash-btn-primary" onClick={abrirNovoFornecedor}>
                        <span aria-hidden="true">➕</span> Novo fornecedor
                      </button>
                    </div>
                  </div>
                </div>

                <section className="dash-panel" aria-labelledby="lista-fornecedores">
                  <div className="dash-panel-head">
                    <h2 className="dash-panel-title" id="lista-fornecedores">Fornecedores</h2>
                    <span className="dash-panel-meta">{fornecedoresComTotais.length} cadastrados</span>
                  </div>

                  {fornecedoresComTotais.length === 0 ? (
                    <div className="dash-empty">
                      <span className="dash-empty-icon" aria-hidden="true">🏢</span>
                      <h3 className="dash-empty-title">Nenhum fornecedor cadastrado</h3>
                      <p className="dash-empty-desc">Cadastre fornecedores para vincular às compras.</p>
                      <button type="button" className="dash-btn dash-btn-primary" onClick={abrirNovoFornecedor}>➕ Novo fornecedor</button>
                    </div>
                  ) : (
                    <div className="dash-table-wrap">
                      <table className="dash-table">
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
                          {fornecedoresComTotais.map((f) => (
                            <tr key={f.id}>
                              <td className="nome-cell">{f.nome}</td>
                              <td className="cell-muted">{f.documento ?? '—'}</td>
                              <td className="cell-muted">{f.telefone ?? '—'}</td>
                              <td className="cell-muted">{f.email ?? '—'}</td>
                              <td className="num num-strong">{formatarMoeda(f.totalComprado)}</td>
                              <td className="num">{f.qtdCompras}</td>
                              <td className="actions-cell">
                                <div style={{ display: 'inline-flex', gap: 6 }}>
                                  <button type="button" className="dash-row-btn" onClick={() => abrirEditarFornecedor(f)} aria-label={`Editar ${f.nome}`} title="Editar">
                                    <IconEdit />
                                  </button>
                                  <button type="button" className="dash-row-btn is-danger" onClick={() => setConfirmar({ tipo: 'fornecedor', alvo: f })} aria-label={`Excluir ${f.nome}`} title="Excluir">
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
            )}

            {aba === 'config' && (
              <>
                <section className="dash-panel" aria-labelledby="cfg-pref">
                  <div className="dash-panel-head"><h2 className="dash-panel-title" id="cfg-pref">Preferências</h2></div>
                  <div className="dash-config-row">
                    <div>
                      <div className="dash-config-label">Tema</div>
                      <div className="dash-config-desc">Claro ou escuro</div>
                    </div>
                    <button type="button" className="dash-btn dash-btn-ghost" onClick={alternar}>
                      {tema === 'claro' ? '🌙 Ativar escuro' : '☀️ Ativar claro'}
                    </button>
                  </div>
                  <div className="dash-config-row">
                    <div>
                      <div className="dash-config-label">Exportar CSV</div>
                      <div className="dash-config-desc">Baixe todas as movimentações no formato CSV</div>
                    </div>
                    <button type="button" className="dash-btn dash-btn-ghost" onClick={exportarCSV}>⬇️ Exportar</button>
                  </div>
                  <div className="dash-config-row">
                    <div>
                      <div className="dash-config-label">Conta</div>
                      <div className="dash-config-desc">{usuario?.email ?? 'Sessão ativa'}</div>
                    </div>
                    <LogoutButton />
                  </div>
                  <div className="dash-config-row">
                    <div>
                      <div className="dash-config-label">Recriar dados de exemplo</div>
                      <div className="dash-config-desc">Gera novamente os dados do mock (apaga alterações locais)</div>
                    </div>
                    <button type="button" className="dash-btn dash-btn-danger" onClick={() => setConfirmar({ tipo: 'zerar' })}>Recriar dados</button>
                  </div>
                </section>

                <section className="dash-danger-zone" aria-labelledby="zona-perigo">
                  <h2 className="dash-danger-title" id="zona-perigo"><span aria-hidden="true">⚠️</span> Zona de Perigo</h2>
                  <p className="dash-danger-desc">Ações irreversíveis.</p>
                  <div className="dash-danger-row">
                    <div>
                      <div className="dash-config-label">Excluir minha conta</div>
                      <div className="dash-config-desc">Apaga permanentemente a conta e os dados.</div>
                    </div>
                    <button type="button" className="dash-btn dash-btn-danger" onClick={() => { setSenhaExcluir(''); setErroExcluir(null); setModalExcluirAberto(true); }}>Excluir conta</button>
                  </div>
                </section>
              </>
            )}
          </main>
        </div>

        {drawerMobileAberto && (
          <>
            <div className="dash-mobile-backdrop" onClick={() => setDrawerMobileAberto(false)} aria-hidden="true" />
            <aside ref={drawerRef} className="dash-mobile-drawer" role="dialog" aria-modal="true" aria-label="Navegação" tabIndex={-1}>
              {marca}
              {navItens(navegarPara)}
              <div className="dash-sidebar-footer">
                <button type="button" className="dash-nav-btn" onClick={() => { setDrawerMobileAberto(false); alternar(); }}>
                  <span className="dash-nav-icon" aria-hidden="true">{tema === 'claro' ? '🌙' : '☀️'}</span>
                  <span>{tema === 'claro' ? 'Modo escuro' : 'Modo claro'}</span>
                </button>
              </div>
            </aside>
          </>
        )}

        {insumoModalAberto && (
          <InsumoModal
            insumo={insumoEditando}
            fornecedores={fornecedores}
            onFechar={() => setInsumoModalAberto(false)}
            onSalvar={(dados) => {
              salvarInsumo(dados, insumoEditando?.id);
              setInsumoModalAberto(false);
            }}
          />
        )}

        {movModalAberto && (
          <MovimentacaoModal
            insumos={insumos}
            fornecedores={fornecedores}
            insumoPreSelecionado={movInsumoPreSelecionado}
            onFechar={() => setMovModalAberto(false)}
            onSalvar={(dados) => {
              registrarMovimentacao(dados);
              setMovModalAberto(false);
            }}
          />
        )}

        {fornecedorModalAberto && (
          <FornecedorModal
            fornecedor={fornecedorEditando}
            onFechar={() => setFornecedorModalAberto(false)}
            onSalvar={(dados) => {
              salvarFornecedor(dados, fornecedorEditando?.id);
              setFornecedorModalAberto(false);
            }}
          />
        )}

        {confirmar && (
          <Modal rotulo="Confirmar exclusão" onFechar={() => setConfirmar(null)}>
            <div className="dash-modal-icon" aria-hidden="true">🗑️</div>
            <h2 className="dash-modal-title is-danger">
              {confirmar.tipo === 'zerar' ? 'Recriar dados de exemplo?' : 'Confirmar exclusão?'}
            </h2>
            <p className="dash-modal-desc">
              {confirmar.tipo === 'zerar'
                ? 'Todos os dados atuais serão substituídos por um novo conjunto de exemplo.'
                : 'Esta ação não pode ser desfeita.'}
            </p>
            <div className="dash-modal-actions">
              <button type="button" className="dash-btn dash-btn-ghost" onClick={() => setConfirmar(null)}>Cancelar</button>
              <button type="button" className="dash-btn dash-btn-danger" onClick={confirmarExclusao}>
                {confirmar.tipo === 'zerar' ? 'Sim, recriar' : 'Sim, excluir'}
              </button>
            </div>
          </Modal>
        )}

        {modalExcluirAberto && (
          <Modal rotulo="Excluir conta" onFechar={() => setModalExcluirAberto(false)}>
            <div className="dash-modal-icon" aria-hidden="true">⚠️</div>
            <h2 className="dash-modal-title is-danger">Excluir conta permanentemente?</h2>
            <p className="dash-modal-desc">
              Esta ação é <strong>irreversível</strong>. Digite sua senha para confirmar.
            </p>
            <label htmlFor="senha-excluir" className="dash-modal-label">Senha atual</label>
            <input
              id="senha-excluir"
              type="password"
              className="dash-input"
              style={{ width: '100%' }}
              placeholder="Digite sua senha"
              value={senhaExcluir}
              onChange={(e) => setSenhaExcluir(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleExcluirConta(); }}
              autoFocus
              autoComplete="current-password"
              aria-invalid={!!erroExcluir}
              aria-describedby={erroExcluir ? 'erro-excluir' : undefined}
            />
            {erroExcluir && (
              <p id="erro-excluir" className="dash-error-inline" role="alert">{erroExcluir}</p>
            )}
            <div className="dash-modal-actions">
              <button type="button" className="dash-btn dash-btn-ghost" onClick={() => setModalExcluirAberto(false)}>
                Cancelar
              </button>
              <button
                type="button"
                className="dash-btn dash-btn-danger"
                onClick={handleExcluirConta}
                disabled={!senhaExcluir.trim()}
              >
                Sim, excluir conta
              </button>
            </div>
          </Modal>
        )}

        <div className="dash-toasts" role="region" aria-label="Notificações" aria-live="polite">
          {toasts.map((tst) => (
            <div key={tst.id} className={`dash-toast dash-toast--${tst.tipo}`}>
              <span className="dash-toast-icon" aria-hidden="true">
                {tst.tipo === 'sucesso' ? '✓' : tst.tipo === 'erro' ? '!' : 'i'}
              </span>
              <span className="dash-toast-text">{tst.texto}</span>
              {tst.acao && (
                <button
                  type="button"
                  className="dash-toast-action"
                  onClick={() => { tst.acao?.fn(); removerToast(tst.id); }}
                >
                  {tst.acao.rotulo}
                </button>
              )}
              <button
                type="button"
                className="dash-toast-close"
                onClick={() => removerToast(tst.id)}
                aria-label="Fechar notificação"
              >
                <span aria-hidden="true">✕</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default function Dashboard() {
  return <DashboardConteudo />;
}