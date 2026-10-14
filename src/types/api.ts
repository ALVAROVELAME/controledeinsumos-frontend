// src/types/api.ts
// Contrato EXATO com o backend C#.

// ============================================================
// AUTH
// ============================================================

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  sucesso?: boolean;
  mensagem?: string;
  token: string;
  tipo?: string;
  usuario?: UsuarioResponse;
}

export interface UsuarioResponse {
  id?: string | number;
  nome: string;
  email: string;
  ativo?: boolean;
  confirmado?: boolean;
}

export interface CadastroRequest {
  nome: string;
  email: string;
  senha: string;
}

export interface ExcluirContaRequest {
  senha: string;
}

export interface MensagemResponse {
  sucesso?: boolean;
  mensagem: string;
}

// ============================================================
// TAREFAS (legado — Kanban)
// ============================================================

export type PrioridadeApi = 'baixa' | 'media' | 'alta';
export type StatusColunaApi = 'a_fazer' | 'em_progresso' | 'revisao' | 'concluido';

export interface CriarTarefaRequest {
  titulo: string;
  descricao: string | null;
  prioridade: PrioridadeApi;
  status: StatusColunaApi;
  prazo: string | null;
  pomodorosPlanejados: number | null;
  pomodoros: number;
}

export interface AtualizarTarefaRequest {
  titulo: string;
  descricao: string | null;
  prioridade: PrioridadeApi;
  status: StatusColunaApi;
  prazo: string | null;
  pomodorosPlanejados: number | null;
}

export interface MudarStatusRequest {
  status: StatusColunaApi;
}

export interface TarefaResponse {
  id: string;
  titulo: string;
  descricao?: string | null;
  prioridade: PrioridadeApi | number;
  status: StatusColunaApi | number;
  criadoEm: string;
  prazo?: string | null;
  pomodoros?: number | null;
  pomodorosPlanejados?: number | null;
}

// ============================================================
// POMODORO
// ============================================================

export type ModoPomodoro = 'foco' | 'pausa_curta' | 'pausa_longa';

export type TipoEventoPomodoro =
  | 'foco_iniciado'    | 'foco_pausado'    | 'foco_retomado'
  | 'foco_completado'  | 'foco_interrompido'
  | 'pausa_iniciada'   | 'pausa_pausada'   | 'pausa_retomada'
  | 'pausa_completada' | 'pausa_interrompida'
  | 'modo_alterado';

export interface EventoPomodoroRequest {
  tipo: TipoEventoPomodoro;
  modo: ModoPomodoro;
  ciclo: number;
  minutosPlanejados: number;
  minutosReais: number;
  segundosReais: number;
  ocorridoEm: string;
  tarefaId: string | null;
  tarefaTitulo: string | null;
  statusTarefa: StatusColunaApi | null;
}

// ============================================================
// INSUMOS
// ============================================================

export interface InsumoResponse {
  id: string;
  nome: string;
  categoria: string;
  unidade: string;
  quantidadeAtual: number;
  quantidadeMinima: number;
  precoCompra: number;
  precoVenda: number;
  fornecedorId?: string | null;
  observacoes?: string | null;
  ativo: boolean;
  criadoEm: string;
}

export interface CriarInsumoRequest {
  nome: string;
  categoria: string;
  unidade: string;
  quantidadeAtual: number;
  quantidadeMinima: number;
  precoCompra: number;
  precoVenda: number;
  fornecedorId?: string | null;
  observacoes?: string | null;
}

export type AtualizarInsumoRequest = CriarInsumoRequest;

// ============================================================
// FORNECEDORES
// ============================================================

export interface FornecedorResponse {
  id: string;
  nome: string;
  documento?: string | null;
  telefone?: string | null;
  email?: string | null;
  observacoes?: string | null;
  ativo: boolean;
  criadoEm: string;
}

export interface CriarFornecedorRequest {
  nome: string;
  documento?: string | null;
  telefone?: string | null;
  email?: string | null;
  observacoes?: string | null;
}

export type AtualizarFornecedorRequest = CriarFornecedorRequest;

// ============================================================
// MOVIMENTAÇÕES
// ============================================================

export type TipoMovimentacaoApi = 'Compra' | 'Venda' | 'Ajuste';

export interface MovimentacaoResponse {
  id: string;
  insumoId: string;
  tipo: TipoMovimentacaoApi;
  quantidade: number;
  precoUnitario: number;
  total: number;
  data: string;
  fornecedorId?: string | null;
  cliente?: string | null;
  observacoes?: string | null;
  criadoEm: string;
}

export interface CriarMovimentacaoRequest {
  insumoId: string;
  tipo: TipoMovimentacaoApi;
  quantidade: number;
  precoUnitario: number;
  data: string;
  fornecedorId?: string | null;
  cliente?: string | null;
  observacoes?: string | null;
}

export type AtualizarMovimentacaoRequest = CriarMovimentacaoRequest;