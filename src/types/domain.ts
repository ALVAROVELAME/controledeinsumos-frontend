// src/types/domain.ts
// Modelos usados pela UI. NÃO são os DTOs da API.

// ============================================================
// TAREFAS (legado — Kanban)
// ============================================================

export type Prioridade = 'baixa' | 'media' | 'alta';
export type StatusColuna = 'a_fazer' | 'em_progresso' | 'revisao' | 'concluido';

export type Tarefa = {
  id: string;
  titulo: string;
  descricao?: string;
  prioridade: Prioridade;
  status: StatusColuna;
  criadoEm: string;      // ISO 8601 (com Z)
  prazo?: string;        // YYYY-MM-DD
  pomodoros?: number;
  pomodorosPlanejados?: number;
};

// ============================================================
// TOAST
// ============================================================

export type ToastTipo = 'sucesso' | 'erro' | 'info';
export type Toast = {
  id: string;
  texto: string;
  tipo: ToastTipo;
  acao?: { rotulo: string; fn: () => void };
};

// ============================================================
// INSUMOS / FORNECEDORES / MOVIMENTAÇÕES (Controle de Insumos)
// ============================================================

export type TipoMov = 'Compra' | 'Venda' | 'Ajuste';

export type Insumo = {
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
  criadoEm: string;      // ISO 8601 (com Z)
};

export type Fornecedor = {
  id: string;
  nome: string;
  documento?: string;
  telefone?: string;
  email?: string;
  observacoes?: string;
  ativo: boolean;
  criadoEm: string;      // ISO 8601 (com Z)
};

export type Movimentacao = {
  id: string;
  insumoId: string;
  tipo: TipoMov;
  quantidade: number;
  precoUnitario: number;
  total: number;
  data: string;          // ISO 8601 (com Z)
  fornecedorId?: string;
  cliente?: string;
  observacoes?: string;
  criadoEm: string;      // ISO 8601 (com Z)
};

// ============================================================
// CONSTANTES — TAREFAS (Kanban)
// ============================================================

export const LIMITES = { titulo: 200, descricao: 5000, pomodorosPlanejados: 20 } as const;

export const COLUNAS: { id: StatusColuna; titulo: string; icon: string }[] = [
  { id: 'a_fazer', titulo: 'A fazer', icon: '📋' },
  { id: 'em_progresso', titulo: 'Em progresso', icon: '⚡' },
  { id: 'revisao', titulo: 'Revisão', icon: '🔍' },
  { id: 'concluido', titulo: 'Concluído', icon: '✅' },
];

// ORDEM = contrato com enums numéricos do C# (0,1,2,3)
export const PRIORIDADES: Prioridade[] = ['baixa', 'media', 'alta'];
export const STATUS_IDS: StatusColuna[] = COLUNAS.map((c) => c.id);

export const TITULO_COLUNA = Object.fromEntries(COLUNAS.map((c) => [c.id, c.titulo])) as Record<StatusColuna, string>;

export const PRIORIDADE_LABEL: Record<Prioridade, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
};

// ============================================================
// CONSTANTES — INSUMOS
// ============================================================

export const TIPOS_MOV: TipoMov[] = ['Compra', 'Venda', 'Ajuste'];

export const CATEGORIAS_SUGERIDAS = [
  'Matéria-prima',
  'Embalagem',
  'Limpeza',
  'Escritório',
  'Manutenção',
  'Outros',
] as const;

export const UNIDADES_SUGERIDAS = ['un', 'kg', 'g', 'L', 'mL', 'm', 'm²', 'cx', 'pct'] as const;

export const LIMITES_INSUMO = {
  nome: 120,
  categoria: 60,
  unidade: 20,
  documento: 24,
  telefone: 24,
  email: 120,
  cliente: 120,
  observacoes: 500,
} as const;

// ============================================================
// UTILITÁRIOS
// ============================================================

export const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);