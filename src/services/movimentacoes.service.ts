// src/services/movimentacoes.service.ts
import { http } from './http';
import type {
  MovimentacaoResponse,
  CriarMovimentacaoRequest,
  TipoMovimentacaoApi,
} from '../types/api';
import type { Movimentacao } from '../types/domain';

const BASE = '/api/movimentacoes';

export type MovimentacaoInput = Omit<Movimentacao, 'id' | 'criadoEm' | 'total'>;

const paraDominio = (r: MovimentacaoResponse): Movimentacao => ({
  id: r.id,
  insumoId: r.insumoId,
  tipo: r.tipo as Movimentacao['tipo'],
  quantidade: r.quantidade,
  precoUnitario: r.precoUnitario,
  total: r.total,
  data: r.data,
  fornecedorId: r.fornecedorId ?? undefined,
  cliente: r.cliente ?? undefined,
  observacoes: r.observacoes ?? undefined,
  criadoEm: r.criadoEm,
});

const paraApi = (d: MovimentacaoInput): CriarMovimentacaoRequest => ({
  insumoId: d.insumoId,
  tipo: d.tipo as TipoMovimentacaoApi,
  quantidade: d.quantidade,
  precoUnitario: d.precoUnitario,
  data: d.data,
  fornecedorId: d.fornecedorId ?? null,
  cliente: d.cliente ?? null,
  observacoes: d.observacoes ?? null,
});

export const movimentacoesService = {
  /**
   * Busca todas as movimentações do usuário.
   *
   * ⚠️ IMPORTANTE: NÃO capture o erro aqui.
   * Deixe ele propagar para o `InsumosContext`, que usa `allSettled`
   * pra detectar se a rota ainda não existe (404) ou se o servidor caiu.
   */
  async listar(signal?: AbortSignal): Promise<Movimentacao[]> {
    const { data } = await http.get<MovimentacaoResponse[]>(BASE, { signal });
    return data.map(paraDominio);
  },

  async criar(dados: MovimentacaoInput): Promise<Movimentacao> {
    const { data } = await http.post<MovimentacaoResponse>(BASE, paraApi(dados));
    return paraDominio(data);
  },

  async atualizar(id: string, dados: MovimentacaoInput): Promise<Movimentacao> {
    const { data } = await http.put<MovimentacaoResponse>(
      `${BASE}/${encodeURIComponent(id)}`,
      paraApi(dados),
    );
    return paraDominio(data);
  },

  async excluir(id: string): Promise<void> {
    await http.delete(`${BASE}/${encodeURIComponent(id)}`);
  },

  async zerar(): Promise<void> {
    await http.delete(BASE);
  },
};