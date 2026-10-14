// src/contexts/InsumosContext.tsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { mensagemDeErro } from '../services/http';
import { insumosService, type InsumoInput } from '../services/insumos.service';
import { fornecedoresService, type FornecedorInput } from '../services/fornecedores.service';
import { movimentacoesService, type MovimentacaoInput } from '../services/movimentacoes.service';
import type { Insumo, Fornecedor, Movimentacao } from '../types/domain';

export type EstadoSync = 'carregando' | 'pronto' | 'offline' | 'sem-rotas';

export type RotasApi = {
  insumos: boolean;
  fornecedores: boolean;
  movimentacoes: boolean;
};

type InsumosCtx = {
  insumos: Insumo[];
  fornecedores: Fornecedor[];
  movimentacoes: Movimentacao[];
  estado: EstadoSync;
  sincronizando: boolean;
  rotas: RotasApi;
  recarregar: () => void;

  salvarInsumo: (dados: InsumoInput, id?: string) => Promise<Insumo | null>;
  excluirInsumo: (alvo: Insumo) => Promise<boolean>;

  salvarFornecedor: (dados: FornecedorInput, id?: string) => Promise<Fornecedor | null>;
  excluirFornecedor: (alvo: Fornecedor) => Promise<boolean>;

  registrarMovimentacao: (dados: MovimentacaoInput) => Promise<Movimentacao | null>;
  editarMovimentacao: (id: string, dados: MovimentacaoInput) => Promise<Movimentacao | null>;
  excluirMovimentacao: (alvo: Movimentacao) => Promise<boolean>;

  limparTudo: () => Promise<boolean>;
};

const Ctx = createContext<InsumosCtx | null>(null);

const ROTAS_INICIAIS: RotasApi = {
  insumos: true,
  fornecedores: true,
  movimentacoes: true,
};

export function InsumosProvider({ children }: { children: ReactNode }) {
  const { autenticado } = useAuth();
  const { push } = useToast();

  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [estado, setEstado] = useState<EstadoSync>('carregando');
  const [rotas, setRotas] = useState<RotasApi>(ROTAS_INICIAIS);
  const [pendentes, setPendentes] = useState(0);
  const [tentativa, setTentativa] = useState(0);

  const executar = useCallback(async <T,>(fn: () => Promise<T>): Promise<T> => {
    setPendentes((n) => n + 1);
    try {
      return await fn();
    } finally {
      setPendentes((n) => n - 1);
    }
  }, []);

  /* ------------------------------ carga inicial ------------------------------ */

  useEffect(() => {
    if (!autenticado) {
      setInsumos([]);
      setFornecedores([]);
      setMovimentacoes([]);
      setEstado('pronto');
      setRotas(ROTAS_INICIAIS);
      return;
    }

    const ctrl = new AbortController();
    setEstado('carregando');

    // allSettled permite que cada rota falhe individualmente sem derrubar as outras
    Promise.allSettled([
      insumosService.listar(ctrl.signal),
      fornecedoresService.listar(ctrl.signal),
      movimentacoesService.listar(ctrl.signal),
    ])
      .then(([rIns, rForn, rMovs]) => {
        if (ctrl.signal.aborted) return;

        const novasRotas: RotasApi = {
          insumos: rIns.status === 'fulfilled',
          fornecedores: rForn.status === 'fulfilled',
          movimentacoes: rMovs.status === 'fulfilled',
        };

        if (rIns.status === 'fulfilled') setInsumos(rIns.value);
        if (rForn.status === 'fulfilled') setFornecedores(rForn.value);
        if (rMovs.status === 'fulfilled') setMovimentacoes(rMovs.value);

        setRotas(novasRotas);

        const todasOk = Object.values(novasRotas).every(Boolean);
        const nenhumaOk = Object.values(novasRotas).every((ok) => !ok);

        if (todasOk) {
          setEstado('pronto');
        } else if (nenhumaOk) {
          // API respondeu mas nenhuma rota do sistema existe → backend incompleto
          setEstado('sem-rotas');
        } else {
          setEstado('pronto');
        }
      })
      .catch((err) => {
        if (ctrl.signal.aborted) return;
        setEstado('offline');
        push(mensagemDeErro(err, 'Não foi possível carregar seus dados.'), 'erro');
      });

    return () => ctrl.abort();
  }, [tentativa, autenticado, push]);

  const recarregar = useCallback(() => setTentativa((n) => n + 1), []);

  /* ---------------------- refetch pontuais (após mutação) ---------------------- */

  const refetchInsumos = useCallback(async () => {
    try {
      setInsumos(await insumosService.listar());
    } catch {
      /* silencioso — o usuário já recebeu o toast do erro principal */
    }
  }, []);

  const refetchMovimentacoes = useCallback(async () => {
    try {
      setMovimentacoes(await movimentacoesService.listar());
    } catch {
      /* silencioso */
    }
  }, []);

  /* --------------------------------- INSUMOS --------------------------------- */

  const salvarInsumo = useCallback(
    async (dados: InsumoInput, id?: string): Promise<Insumo | null> => {
      try {
        const salvo = await executar(() =>
          id ? insumosService.atualizar(id, dados) : insumosService.criar(dados),
        );
        setInsumos((prev) =>
          prev.some((i) => i.id === salvo.id)
            ? prev.map((i) => (i.id === salvo.id ? salvo : i))
            : [salvo, ...prev],
        );
        push(id ? `"${dados.nome}" atualizado` : `"${dados.nome}" criado`, 'sucesso');
        return salvo;
      } catch (err) {
        push(mensagemDeErro(err, 'Não foi possível salvar o insumo.'), 'erro');
        return null;
      }
    },
    [executar, push],
  );

  const excluirInsumo = useCallback(
    async (alvo: Insumo): Promise<boolean> => {
      try {
        await executar(() => insumosService.excluir(alvo.id));
        // O backend remove em cascata as movimentações vinculadas
        setInsumos((prev) => prev.filter((i) => i.id !== alvo.id));
        setMovimentacoes((prev) => prev.filter((m) => m.insumoId !== alvo.id));
        push(`"${alvo.nome}" excluído`, 'info');
        return true;
      } catch (err) {
        push(mensagemDeErro(err, 'Não foi possível excluir o insumo.'), 'erro');
        return false;
      }
    },
    [executar, push],
  );

  /* ------------------------------- FORNECEDORES ------------------------------- */

  const salvarFornecedor = useCallback(
    async (dados: FornecedorInput, id?: string): Promise<Fornecedor | null> => {
      try {
        const salvo = await executar(() =>
          id ? fornecedoresService.atualizar(id, dados) : fornecedoresService.criar(dados),
        );
        setFornecedores((prev) =>
          prev.some((f) => f.id === salvo.id)
            ? prev.map((f) => (f.id === salvo.id ? salvo : f))
            : [salvo, ...prev],
        );
        push(id ? `"${dados.nome}" atualizado` : `"${dados.nome}" criado`, 'sucesso');
        return salvo;
      } catch (err) {
        push(mensagemDeErro(err, 'Não foi possível salvar o fornecedor.'), 'erro');
        return null;
      }
    },
    [executar, push],
  );

  const excluirFornecedor = useCallback(
    async (alvo: Fornecedor): Promise<boolean> => {
      try {
        await executar(() => fornecedoresService.excluir(alvo.id));
        // O backend nullifica as referências; espelhamos localmente
        setFornecedores((prev) => prev.filter((f) => f.id !== alvo.id));
        setInsumos((prev) =>
          prev.map((i) => (i.fornecedorId === alvo.id ? { ...i, fornecedorId: undefined } : i)),
        );
        setMovimentacoes((prev) =>
          prev.map((m) => (m.fornecedorId === alvo.id ? { ...m, fornecedorId: undefined } : m)),
        );
        push(`"${alvo.nome}" excluído`, 'info');
        return true;
      } catch (err) {
        push(mensagemDeErro(err, 'Não foi possível excluir o fornecedor.'), 'erro');
        return false;
      }
    },
    [executar, push],
  );

  /* ------------------------------ MOVIMENTAÇÕES ------------------------------ */

  const registrarMovimentacao = useCallback(
    async (dados: MovimentacaoInput): Promise<Movimentacao | null> => {
      try {
        const nova = await executar(() => movimentacoesService.criar(dados));
        setMovimentacoes((prev) => [nova, ...prev]);
        // Estoque mudou no backend → refetch de insumos
        void refetchInsumos();
        push('Movimentação registrada', 'sucesso');
        return nova;
      } catch (err) {
        push(mensagemDeErro(err, 'Não foi possível registrar a movimentação.'), 'erro');
        return null;
      }
    },
    [executar, push, refetchInsumos],
  );

  const editarMovimentacao = useCallback(
    async (id: string, dados: MovimentacaoInput): Promise<Movimentacao | null> => {
      try {
        const atualizada = await executar(() => movimentacoesService.atualizar(id, dados));
        setMovimentacoes((prev) => prev.map((m) => (m.id === id ? atualizada : m)));
        // Reverteu + reaplicou no backend → refetch insumos
        void refetchInsumos();
        push('Movimentação atualizada', 'sucesso');
        return atualizada;
      } catch (err) {
        push(mensagemDeErro(err, 'Não foi possível atualizar a movimentação.'), 'erro');
        return null;
      }
    },
    [executar, push, refetchInsumos],
  );

  const excluirMovimentacao = useCallback(
    async (alvo: Movimentacao): Promise<boolean> => {
      try {
        await executar(() => movimentacoesService.excluir(alvo.id));
        setMovimentacoes((prev) => prev.filter((m) => m.id !== alvo.id));
        void refetchInsumos();
        push('Movimentação excluída e estoque ajustado', 'info');
        return true;
      } catch (err) {
        push(mensagemDeErro(err, 'Não foi possível excluir a movimentação.'), 'erro');
        return false;
      }
    },
    [executar, push, refetchInsumos],
  );

  /* --------------------------------- LIMPAR --------------------------------- */

  const limparTudo = useCallback(async (): Promise<boolean> => {
    try {
      // Ordem importa: movimentações → insumos → fornecedores
      await executar(() => movimentacoesService.zerar());
      await executar(() => insumosService.zerar());
      await executar(() => fornecedoresService.zerar());
      setMovimentacoes([]);
      setInsumos([]);
      setFornecedores([]);
      push('Todos os dados foram removidos', 'info');
      return true;
    } catch (err) {
      push(mensagemDeErro(err, 'Não foi possível limpar os dados.'), 'erro');
      // Em caso de erro, força recarga para não ficar dessincronizado
      void refetchMovimentacoes();
      void refetchInsumos();
      return false;
    }
  }, [executar, push, refetchMovimentacoes, refetchInsumos]);

  /* --------------------------------- CONTEXT -------------------------------- */

  const value = useMemo<InsumosCtx>(
    () => ({
      insumos,
      fornecedores,
      movimentacoes,
      estado,
      sincronizando: estado === 'carregando' || pendentes > 0,
      rotas,
      recarregar,
      salvarInsumo,
      excluirInsumo,
      salvarFornecedor,
      excluirFornecedor,
      registrarMovimentacao,
      editarMovimentacao,
      excluirMovimentacao,
      limparTudo,
    }),
    [
      insumos, fornecedores, movimentacoes, estado, pendentes, rotas, recarregar,
      salvarInsumo, excluirInsumo, salvarFornecedor, excluirFornecedor,
      registrarMovimentacao, editarMovimentacao, excluirMovimentacao, limparTudo,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useInsumos() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useInsumos precisa estar dentro de <InsumosProvider>');
  return ctx;
}