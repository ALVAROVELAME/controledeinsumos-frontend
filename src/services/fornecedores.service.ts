// src/services/fornecedores.service.ts
import { http } from './http';
import type {
  FornecedorResponse,
  CriarFornecedorRequest,
} from '../types/api';
import type { Fornecedor } from '../types/domain';

const BASE = '/api/fornecedores';

export type FornecedorInput = Omit<Fornecedor, 'id' | 'criadoEm'>;

const paraDominio = (r: FornecedorResponse): Fornecedor => ({
  id: r.id,
  nome: r.nome,
  documento: r.documento ?? undefined,
  telefone: r.telefone ?? undefined,
  email: r.email ?? undefined,
  observacoes: r.observacoes ?? undefined,
  ativo: r.ativo,
  criadoEm: r.criadoEm,
});

const paraApi = (d: FornecedorInput): CriarFornecedorRequest => ({
  nome: d.nome,
  documento: d.documento ?? null,
  telefone: d.telefone ?? null,
  email: d.email ?? null,
  observacoes: d.observacoes ?? null,
});

export const fornecedoresService = {
  /**
   * Busca todos os fornecedores do usuário.
   *
   * ⚠️ IMPORTANTE: NÃO capture o erro aqui.
   * Deixe ele propagar para o `InsumosContext`, que usa `allSettled`
   * pra detectar se a rota ainda não existe (404) ou se o servidor caiu.
   */
  async listar(signal?: AbortSignal): Promise<Fornecedor[]> {
    const { data } = await http.get<FornecedorResponse[]>(BASE, { signal });
    return data.map(paraDominio);
  },

  async criar(dados: FornecedorInput): Promise<Fornecedor> {
    const { data } = await http.post<FornecedorResponse>(BASE, paraApi(dados));
    return paraDominio(data);
  },

  async atualizar(id: string, dados: FornecedorInput): Promise<Fornecedor> {
    const { data } = await http.put<FornecedorResponse>(
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