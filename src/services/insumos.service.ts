// src/services/insumos.service.ts
import { http } from './http';
import type {
  InsumoResponse,
  CriarInsumoRequest,
} from '../types/api';
import type { Insumo } from '../types/domain';

const BASE = '/api/insumos';

export type InsumoInput = Omit<Insumo, 'id' | 'criadoEm'>;

const paraDominio = (r: InsumoResponse): Insumo => ({
  id: r.id,
  nome: r.nome,
  categoria: r.categoria,
  unidade: r.unidade,
  quantidadeAtual: r.quantidadeAtual,
  quantidadeMinima: r.quantidadeMinima,
  precoCompra: r.precoCompra,
  precoVenda: r.precoVenda,
  fornecedorId: r.fornecedorId ?? undefined,
  observacoes: r.observacoes ?? undefined,
  ativo: r.ativo,
  criadoEm: r.criadoEm,
});

const paraApi = (d: InsumoInput): CriarInsumoRequest => ({
  nome: d.nome,
  categoria: d.categoria,
  unidade: d.unidade,
  quantidadeAtual: d.quantidadeAtual,
  quantidadeMinima: d.quantidadeMinima,
  precoCompra: d.precoCompra,
  precoVenda: d.precoVenda,
  fornecedorId: d.fornecedorId ?? null,
  observacoes: d.observacoes ?? null,
});

export const insumosService = {
  /**
   * Busca todos os insumos do usuário.
   *
   * ⚠️ IMPORTANTE: NÃO capture o erro aqui.
   * Deixe ele propagar para o `InsumosContext`, que usa `allSettled`
   * pra detectar se a rota ainda não existe (404) ou se o servidor caiu.
   */
  async listar(signal?: AbortSignal): Promise<Insumo[]> {
    const { data } = await http.get<InsumoResponse[]>(BASE, { signal });
    return data.map(paraDominio);
  },

  async criar(dados: InsumoInput): Promise<Insumo> {
    const { data } = await http.post<InsumoResponse>(BASE, paraApi(dados));
    return paraDominio(data);
  },

  async atualizar(id: string, dados: InsumoInput): Promise<Insumo> {
    const { data } = await http.put<InsumoResponse>(
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