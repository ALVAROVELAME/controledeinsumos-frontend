// src/pages/Dashboard.tsx
/**
 * Controle de Insumos — Dashboard principal.
 * Persistência via API (contexto InsumosContext).
 * UI modularizada em: styles.ts, shared.tsx, tabs.tsx
 */

import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useDeferredValue,
  useRef,
} from 'react';

import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useInsumos } from '../contexts/InsumosContext';

import { STYLES } from './Dashboard/styles';
import {
  ABAS,
  ABA_KEY,
  useTema,
  useBodyLock,
  useFocusTrap,
  calcularTotais,
  serieMensal,
  compararTexto,
  mesChave,
  dataLocal,
  ultimosMeses,
  statusDoInsumo,
  severidade,
  margemDe,
  ordenar,
  proximaOrdem,
  normalizar,
  baixarArquivo,
  celulaCSV,
  hoje,
  Paleta,
  Modal,
  InsumoModal,
  MovimentacaoModal,
  FornecedorModal,
  StatusApiBanner,
} from './Dashboard/shared';
import type {
  Aba,
  CampoInsumo,
  CampoMov,
  Comando,
  Confirmacao,
  Ordem,
  StatusInsumo,
} from './Dashboard/shared';
import {
  DashboardHeader,
  DashboardSidebar,
  AbaDashboard,
  AbaInsumos,
  AbaMovimentacoes,
  AbaFornecedores,
  AbaConfig,
} from './Dashboard/tabs';
import type { Insumo, Fornecedor, Movimentacao, TipoMov } from '../types/domain';

/* ============================================================
   CONTEÚDO
   ============================================================ */

function DashboardConteudo() {
  const { usuario } = useAuth();
  const { tema, alternar } = useTema();
  const { push, toasts, remover: removerToast } = useToast();

  const {
    insumos,
    fornecedores,
    movimentacoes,
    estado,
    sincronizando,
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
  } = useInsumos();

  /* ---------- Estados de UI ---------- */

  const [aba, setAba] = useState<Aba>(() => {
    try {
      const s = localStorage.getItem(ABA_KEY);
      if (ABAS.some((a) => a.id === s)) return s as Aba;
    } catch {
      /* ignore */
    }
    return 'dashboard';
  });

  const [buscaInsumo, setBuscaInsumo] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');
  const [statusFiltro, setStatusFiltro] = useState<'Todos' | StatusInsumo>('Todos');
  const [ordemInsumos, setOrdemInsumos] = useState<Ordem<CampoInsumo>>({ campo: 'nome', dir: 'asc' });

  const [tipoMovFiltro, setTipoMovFiltro] = useState<'Todos' | TipoMov>('Todos');
  const [insumoMovFiltro, setInsumoMovFiltro] = useState<string>('Todos');
  const [periodoMovFiltro, setPeriodoMovFiltro] = useState<'30' | '90' | '180' | 'todos'>('90');
  const [ordemMovs, setOrdemMovs] = useState<Ordem<CampoMov>>({ campo: 'data', dir: 'desc' });

  const buscaDeferred = useDeferredValue(buscaInsumo);

  const [insumoEditando, setInsumoEditando] = useState<Insumo | null>(null);
  const [insumoModalAberto, setInsumoModalAberto] = useState(false);
  const [movEditando, setMovEditando] = useState<Movimentacao | null>(null);
  const [movModalAberto, setMovModalAberto] = useState(false);
  const [movInsumoPreSelecionado, setMovInsumoPreSelecionado] = useState<string | null>(null);
  const [movInicial, setMovInicial] = useState<{ tipo?: TipoMov; quantidade?: number } | null>(null);
  const [fornecedorEditando, setFornecedorEditando] = useState<Fornecedor | null>(null);
  const [fornecedorModalAberto, setFornecedorModalAberto] = useState(false);
  const [confirmar, setConfirmar] = useState<Confirmacao | null>(null);

  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [senhaExcluir, setSenhaExcluir] = useState('');
  const [erroExcluir, setErroExcluir] = useState<string | null>(null);

  const [menuUsuarioAberto, setMenuUsuarioAberto] = useState(false);
  const [drawerMobileAberto, setDrawerMobileAberto] = useState(false);
  const [paletaAberta, setPaletaAberta] = useState(false);

  const drawerRef = useRef<HTMLElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const userBtnRef = useRef<HTMLButtonElement>(null);

  useBodyLock(drawerMobileAberto);
  useFocusTrap(drawerRef, drawerMobileAberto);

  /* ---------- Persistência da aba ---------- */

  useEffect(() => {
    try {
      localStorage.setItem(ABA_KEY, aba);
    } catch {
      /* ignore */
    }
  }, [aba]);

  useEffect(() => {
    const titulo = ABAS.find((a) => a.id === aba)?.titulo ?? '';
    document.title = `${titulo} · Controle de Insumos`;
  }, [aba]);

  /* ---------- Helpers ---------- */

  const nomeInsumo = useCallback(
    (id: string) => insumos.find((i) => i.id === id)?.nome ?? '—',
    [insumos],
  );
  const nomeFornecedor = useCallback(
    (id: string) => fornecedores.find((f) => f.id === id)?.nome ?? '—',
    [fornecedores],
  );

  /* ---------- Derivados ---------- */

  const { kpisMes, kpisAnt } = useMemo(() => {
    const [ant, atual] = ultimosMeses(2);
    const por = (c: string) => calcularTotais(movimentacoes.filter((m) => mesChave(m.data) === c));
    return { kpisMes: por(atual), kpisAnt: por(ant) };
  }, [movimentacoes]);

  const serie = useMemo(() => serieMensal(movimentacoes, 6), [movimentacoes]);

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
  const alertas = insumosStatusCount.baixo + insumosStatusCount.zerado;

  const atencao = useMemo(
    () =>
      insumos
        .map((i) => ({ i, s: statusDoInsumo(i) }))
        .filter((x) => x.s !== 'OK')
        .sort((a, b) => severidade(a.s) - severidade(b.s) || compararTexto(a.i.nome, b.i.nome))
        .slice(0, 6),
    [insumos],
  );

  const insumosFiltrados = useMemo(() => {
    const termo = normalizar(buscaDeferred.trim());
    const filtrados = insumos.filter((i) => {
      if (categoriaFiltro !== 'Todas' && i.categoria !== categoriaFiltro) return false;
      if (statusFiltro !== 'Todos' && statusDoInsumo(i) !== statusFiltro) return false;
      if (!termo) return true;
      return normalizar(i.nome).includes(termo) || normalizar(i.categoria).includes(termo);
    });
    const valor = (i: Insumo): string | number => {
      switch (ordemInsumos.campo) {
        case 'nome': return i.nome;
        case 'categoria': return i.categoria;
        case 'estoque': return i.quantidadeAtual;
        case 'precoCompra': return i.precoCompra;
        case 'precoVenda': return i.precoVenda;
        case 'margem': return margemDe(i.precoCompra, i.precoVenda);
        case 'status': return severidade(statusDoInsumo(i));
      }
    };
    return ordenar(filtrados, valor, ordemInsumos.dir);
  }, [insumos, buscaDeferred, categoriaFiltro, statusFiltro, ordemInsumos]);

  const movsFiltradas = useMemo(() => {
    const limiteDias = periodoMovFiltro === 'todos' ? Infinity : Number(periodoMovFiltro);
    const limite = Date.now() - limiteDias * 24 * 60 * 60 * 1000;
    const filtradas = movimentacoes.filter((m) => {
      if (tipoMovFiltro !== 'Todos' && m.tipo !== tipoMovFiltro) return false;
      if (insumoMovFiltro !== 'Todos' && m.insumoId !== insumoMovFiltro) return false;
      if (dataLocal(m.data).getTime() < limite) return false;
      return true;
    });
    const valor = (m: Movimentacao): string | number => {
      switch (ordemMovs.campo) {
        case 'data': return dataLocal(m.data).getTime();
        case 'insumo': return nomeInsumo(m.insumoId);
        case 'tipo': return m.tipo;
        case 'quantidade': return m.quantidade;
        case 'total': return m.total;
      }
    };
    return ordenar(filtradas, valor, ordemMovs.dir);
  }, [movimentacoes, tipoMovFiltro, insumoMovFiltro, periodoMovFiltro, ordemMovs, nomeInsumo]);

  const totaisFiltro = useMemo(() => calcularTotais(movsFiltradas), [movsFiltradas]);

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
    return ['Todas', ...Array.from(set).sort(compararTexto)];
  }, [insumos]);

  const temFiltroInsumo = buscaInsumo.trim() !== '' || categoriaFiltro !== 'Todas' || statusFiltro !== 'Todos';
  const temFiltroMov = tipoMovFiltro !== 'Todos' || insumoMovFiltro !== 'Todos' || periodoMovFiltro !== '90';
  const tituloAba = ABAS.find((a) => a.id === aba)?.titulo ?? '';
  const onboardingCompleto = insumos.length > 0 && movimentacoes.length > 0;

  /* ---------- Modais / navegação ---------- */

  const abrirNovoInsumo = () => {
    setInsumoEditando(null);
    setInsumoModalAberto(true);
  };
  const abrirEditarInsumo = (i: Insumo) => {
    setInsumoEditando(i);
    setInsumoModalAberto(true);
  };
  const abrirNovaMov = (insumoId?: string, inicial?: { tipo?: TipoMov; quantidade?: number }) => {
    setMovEditando(null);
    setMovInsumoPreSelecionado(insumoId ?? null);
    setMovInicial(inicial ?? null);
    setMovModalAberto(true);
  };
  const abrirEditarMov = (m: Movimentacao) => {
    setMovEditando(m);
    setMovInsumoPreSelecionado(null);
    setMovInicial(null);
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

  const irPara = (id: Aba) => {
    setAba(id);
    setDrawerMobileAberto(false);
    window.scrollTo({ top: 0 });
    requestAnimationFrame(() => mainRef.current?.focus({ preventScroll: true }));
  };

  const irParaBusca = () => {
    setAba('insumos');
    setDrawerMobileAberto(false);
    requestAnimationFrame(() => document.getElementById('filtro-busca-insumo')?.focus());
  };

  const irParaInsumo = (nome: string) => {
    setBuscaInsumo(nome);
    setCategoriaFiltro('Todas');
    setStatusFiltro('Todos');
    irPara('insumos');
  };

  const verInsumosUrgentes = () => {
    setBuscaInsumo('');
    setCategoriaFiltro('Todas');
    setStatusFiltro('Todos');
    setOrdemInsumos({ campo: 'status', dir: 'asc' });
    irPara('insumos');
  };

  const novoDaAbaAtual = () => {
    if (aba === 'movimentacoes' && insumos.length > 0) abrirNovaMov();
    else if (aba === 'fornecedores') abrirNovoFornecedor();
    else abrirNovoInsumo();
  };

  const limparFiltrosInsumo = () => {
    setBuscaInsumo('');
    setCategoriaFiltro('Todas');
    setStatusFiltro('Todos');
  };
  const limparFiltrosMov = () => {
    setTipoMovFiltro('Todos');
    setInsumoMovFiltro('Todos');
    setPeriodoMovFiltro('90');
  };

  /* ---------- Exportar / Backup ---------- */

  const exportarCSV = (todas = false) => {
    const lista = todas
      ? [...movimentacoes].sort((a, b) => dataLocal(b.data).getTime() - dataLocal(a.data).getTime())
      : movsFiltradas;
    const linhas: (string | number)[][] = [
      ['Data', 'Insumo', 'Tipo', 'Quantidade', 'Preço Unit.', 'Total', 'Fornecedor/Cliente', 'Observações'],
      ...lista.map((m) => [
        new Date(m.data).toLocaleDateString('pt-BR'),
        nomeInsumo(m.insumoId),
        m.tipo,
        m.quantidade,
        m.precoUnitario,
        m.total,
        m.fornecedorId ? nomeFornecedor(m.fornecedorId) : (m.cliente ?? ''),
        m.observacoes ?? '',
      ]),
    ];
    const csv = linhas.map((l) => l.map(celulaCSV).join(';')).join('\n');
    baixarArquivo(`movimentacoes-${hoje()}.csv`, '\uFEFF' + csv, 'text/csv;charset=utf-8');
    push(`CSV exportado (${lista.length} registro${lista.length === 1 ? '' : 's'})`, 'sucesso');
  };

  const baixarBackup = () => {
    const envelope = {
      versao: 1,
      exportadoEm: new Date().toISOString(),
      dados: { insumos, fornecedores, movimentacoes },
    };
    baixarArquivo(`backup-insumos-${hoje()}.json`, JSON.stringify(envelope, null, 2), 'application/json');
    push('Backup baixado. Guarde o arquivo em um lugar seguro.', 'sucesso');
  };

  /* ---------- Confirmações ---------- */

  const confirmarExclusao = async () => {
    if (!confirmar) return;
    const alvo = confirmar.alvo;
    const tipo = confirmar.tipo;
    setConfirmar(null);
    if (tipo === 'insumo' && alvo) await excluirInsumo(alvo as Insumo);
    else if (tipo === 'fornecedor' && alvo) await excluirFornecedor(alvo as Fornecedor);
    else if (tipo === 'mov' && alvo) await excluirMovimentacao(alvo as Movimentacao);
    else if (tipo === 'limpar') await limparTudo();
  };

  const textosConfirmacao = (() => {
    if (!confirmar) return { titulo: '', desc: '', botao: '' };
    if (confirmar.tipo === 'limpar') {
      return {
        titulo: 'Limpar todos os dados?',
        desc: 'Todos os insumos, fornecedores e movimentações serão apagados da sua conta. Esta ação não pode ser desfeita.',
        botao: 'Sim, limpar tudo',
      };
    }
    if (confirmar.tipo === 'insumo') {
      const i = confirmar.alvo as Insumo;
      const n = movimentacoes.filter((m) => m.insumoId === i.id).length;
      return {
        titulo: `Excluir "${i.nome}"?`,
        desc: n > 0
          ? `As ${n} movimentações deste insumo também serão removidas. Esta ação não pode ser desfeita.`
          : 'Este insumo não tem movimentações. Esta ação não pode ser desfeita.',
        botao: 'Sim, excluir',
      };
    }
    if (confirmar.tipo === 'fornecedor') {
      const f = confirmar.alvo as Fornecedor;
      const n = insumos.filter((i) => i.fornecedorId === f.id).length;
      return {
        titulo: `Excluir "${f.nome}"?`,
        desc: n > 0
          ? `${n} insumo${n === 1 ? '' : 's'} ficará${n === 1 ? '' : 'ão'} sem fornecedor principal. As compras antigas continuam registradas. Esta ação não pode ser desfeita.`
          : 'Nenhum insumo usa este fornecedor. Esta ação não pode ser desfeita.',
        botao: 'Sim, excluir',
      };
    }
    const m = confirmar.alvo as Movimentacao;
    return {
      titulo: 'Excluir esta movimentação?',
      desc: `${m.tipo} de ${m.quantidade.toLocaleString('pt-BR')} × ${nomeInsumo(m.insumoId)}. O estoque será ajustado de volta. Esta ação não pode ser desfeita.`,
      botao: 'Sim, excluir',
    };
  })();

  const handleExcluirConta = () => {
    if (!senhaExcluir.trim()) {
      setErroExcluir('Digite sua senha para continuar.');
      return;
    }
    setErroExcluir('Exclusão de conta ainda não implementada. Use a API /api/usuarios/me/excluir.');
  };

  /* ---------- Efeitos de interface ---------- */

  useEffect(() => {
    if (!menuUsuarioAberto) return;
    const fechar = () => setMenuUsuarioAberto(false);
    window.addEventListener('click', fechar);
    return () => window.removeEventListener('click', fechar);
  }, [menuUsuarioAberto]);

  const modalAberto =
    insumoModalAberto || movModalAberto || fornecedorModalAberto || !!confirmar ||
    modalExcluirAberto || drawerMobileAberto;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        if (modalAberto) return;
        e.preventDefault();
        setPaletaAberta((v) => !v);
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey || modalAberto || paletaAberta) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
      if (e.key === '/') {
        e.preventDefault();
        irParaBusca();
      } else if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        novoDaAbaAtual();
      } else if (/^[1-5]$/.test(e.key)) {
        irPara(ABAS[Number(e.key) - 1].id);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  /* ---------- Comandos da paleta ---------- */

  const comandos: Comando[] = [
    ...ABAS.map((a, idx) => ({
      id: `ir-${a.id}`,
      rotulo: `Ir para ${a.label}`,
      grupo: 'Navegar',
      atalho: String(idx + 1),
      acao: () => irPara(a.id),
    })),
    { id: 'buscar', rotulo: 'Buscar insumos', grupo: 'Navegar', atalho: '/', acao: irParaBusca },
    { id: 'novo-insumo', rotulo: 'Novo insumo', grupo: 'Criar', acao: abrirNovoInsumo },
    ...(insumos.length > 0
      ? [{ id: 'nova-mov', rotulo: 'Registrar movimentação', grupo: 'Criar', acao: () => abrirNovaMov() }]
      : []),
    { id: 'novo-forn', rotulo: 'Novo fornecedor', grupo: 'Criar', acao: abrirNovoFornecedor },
    ...(alertas > 0
      ? [{ id: 'urgentes', rotulo: `Ver ${alertas} insumo${alertas === 1 ? '' : 's'} para repor`, grupo: 'Estoque', acao: verInsumosUrgentes }]
      : []),
    { id: 'tema', rotulo: tema === 'claro' ? 'Ativar modo escuro' : 'Ativar modo claro', grupo: 'Preferências', acao: alternar },
    { id: 'csv', rotulo: 'Exportar movimentações (CSV)', grupo: 'Dados', acao: () => exportarCSV(true) },
    { id: 'backup', rotulo: 'Baixar backup (JSON)', grupo: 'Dados', acao: baixarBackup },
    ...(estado !== 'pronto'
      ? [{ id: 'recarregar', rotulo: 'Recarregar dados da API', grupo: 'Sincronização', acao: recarregar }]
      : []),
    ...insumos.map((i) => ({
      id: `ins-${i.id}`,
      rotulo: i.nome,
      grupo: 'Insumo',
      soBusca: true,
      acao: () => irParaInsumo(i.nome),
    })),
  ];

  /* ---------- Passos do onboarding ---------- */

  const passos = [
    {
      feito: fornecedores.length > 0,
      titulo: 'Cadastre um fornecedor',
      desc: 'Opcional, mas liga cada compra a quem vendeu.',
      cta: 'Novo fornecedor',
      acao: abrirNovoFornecedor,
      desabilitado: false,
    },
    {
      feito: insumos.length > 0,
      titulo: 'Cadastre um insumo',
      desc: 'Defina o estoque mínimo para ser avisado na hora de repor.',
      cta: 'Novo insumo',
      acao: abrirNovoInsumo,
      desabilitado: false,
    },
    {
      feito: movimentacoes.length > 0,
      titulo: 'Registre uma compra ou venda',
      desc: 'O lucro e os gráficos aparecem a partir daqui.',
      cta: 'Registrar',
      acao: () => abrirNovaMov(),
      desabilitado: insumos.length === 0,
    },
  ];

  /* ---------- Helpers de ordenação ---------- */

  const th = <C extends string>(ordem: Ordem<C>, set: (o: Ordem<C>) => void) => (campo: C) =>
    set(proximaOrdem(ordem, campo));
  const ordenarInsumos = th(ordemInsumos, setOrdemInsumos);
  const ordenarMovs = th(ordemMovs, setOrdemMovs);

  /* ---------- Atalhos (dica visual) ---------- */

  const ehMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent);
  const atalhoK = ehMac ? '⌘ K' : 'Ctrl K';

  const atalhosDica = (
    <p className="dash-shortcuts">
      <span><kbd className="dash-kbd">/</kbd> buscar</span>
      <span><kbd className="dash-kbd">N</kbd> novo</span>
      <span><kbd className="dash-kbd">{atalhoK}</kbd> comandos</span>
    </p>
  );

  /* ---------- Render ---------- */

  return (
    <>
      <style>{STYLES}</style>
      <div className="dash" data-theme={tema}>
        <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>

        <DashboardSidebar
          abaAtual={aba}
          alertas={alertas}
          totalInsumos={insumos.length}
          tema={tema}
          onNavegar={irPara}
          onAlternarTema={alternar}
          atalhosDica={atalhosDica}
        />

        <div className="dash-main">
          <DashboardHeader
            titulo={tituloAba}
            usuario={usuario}
            tema={tema}
            estado={estado}
            sincronizando={sincronizando}
            menuAberto={menuUsuarioAberto}
            onAbrirDrawer={() => setDrawerMobileAberto(true)}
            onRecarregar={recarregar}
            onAlternarTema={alternar}
            onAbrirPaleta={() => setPaletaAberta(true)}
            onToggleMenu={() => setMenuUsuarioAberto((v) => !v)}
            onIrParaConfig={() => {
              setMenuUsuarioAberto(false);
              irPara('config');
            }}
            userBtnRef={userBtnRef}
          />

          <main id="conteudo" ref={mainRef} className="dash-content" tabIndex={-1}>
            <StatusApiBanner estado={estado} rotas={rotas} onRecarregar={recarregar} />

            {aba === 'dashboard' && (
              <AbaDashboard
                insumos={insumos}
                movimentacoes={movimentacoes}
                kpisMes={kpisMes}
                kpisAnt={kpisAnt}
                serie={serie}
                atencao={atencao}
                alertas={alertas}
                passos={passos}
                onboardingCompleto={onboardingCompleto}
                nomeInsumo={nomeInsumo}
                nomeFornecedor={nomeFornecedor}
                onRepor={(i) => abrirNovaMov(i.id, { tipo: 'Compra', quantidade: Math.max(1, Math.ceil(Math.max(i.quantidadeMinima * 2, 1) - i.quantidadeAtual)) })}
                onVerUrgentes={verInsumosUrgentes}
                onIrParaMovimentacoes={() => irPara('movimentacoes')}
              />
            )}

            {aba === 'insumos' && (
              <AbaInsumos
                insumos={insumos}
                insumosFiltrados={insumosFiltrados}
                statusCount={insumosStatusCount}
                busca={buscaInsumo}
                setBusca={setBuscaInsumo}
                categoriaFiltro={categoriaFiltro}
                setCategoriaFiltro={setCategoriaFiltro}
                categorias={categorias}
                statusFiltro={statusFiltro}
                setStatusFiltro={setStatusFiltro}
                temFiltro={temFiltroInsumo}
                limparFiltros={limparFiltrosInsumo}
                ordem={ordemInsumos}
                onOrdenar={ordenarInsumos}
                onNovo={abrirNovoInsumo}
                onEditar={abrirEditarInsumo}
                onExcluir={(i) => setConfirmar({ tipo: 'insumo', alvo: i })}
                onRepor={(i) => abrirNovaMov(i.id, { tipo: 'Compra', quantidade: Math.max(1, Math.ceil(Math.max(i.quantidadeMinima * 2, 1) - i.quantidadeAtual)) })}
                onNovaMov={(id) => abrirNovaMov(id)}
              />
            )}

            {aba === 'movimentacoes' && (
              <AbaMovimentacoes
                insumos={insumos}
                movimentacoes={movimentacoes}
                movsFiltradas={movsFiltradas}
                totais={totaisFiltro}
                tipoFiltro={tipoMovFiltro}
                setTipoFiltro={setTipoMovFiltro}
                insumoFiltro={insumoMovFiltro}
                setInsumoFiltro={setInsumoMovFiltro}
                periodoFiltro={periodoMovFiltro}
                setPeriodoFiltro={setPeriodoMovFiltro}
                temFiltro={temFiltroMov}
                limparFiltros={limparFiltrosMov}
                ordem={ordemMovs}
                onOrdenar={ordenarMovs}
                nomeInsumo={nomeInsumo}
                nomeFornecedor={nomeFornecedor}
                onNova={() => abrirNovaMov()}
                onEditar={abrirEditarMov}
                onExcluir={(m) => setConfirmar({ tipo: 'mov', alvo: m })}
                onExportarCSV={() => exportarCSV(false)}
              />
            )}

            {aba === 'fornecedores' && (
              <AbaFornecedores
                fornecedores={fornecedoresComTotais}
                onNovo={abrirNovoFornecedor}
                onEditar={abrirEditarFornecedor}
                onExcluir={(f) => setConfirmar({ tipo: 'fornecedor', alvo: f })}
              />
            )}

            {aba === 'config' && (
              <AbaConfig
                tema={tema}
                onAlternarTema={alternar}
                usuario={usuario}
                estado={estado}
                onRecarregar={recarregar}
                onExportarCSV={() => exportarCSV(true)}
                onBaixarBackup={baixarBackup}
                onLimparTudo={() => setConfirmar({ tipo: 'limpar' })}
                onExcluirConta={() => {
                  setSenhaExcluir('');
                  setErroExcluir(null);
                  setModalExcluirAberto(true);
                }}
                temMovimentacoes={movimentacoes.length > 0}
              />
            )}
          </main>
        </div>

        {drawerMobileAberto && (
          <>
            <div className="dash-mobile-backdrop" onClick={() => setDrawerMobileAberto(false)} aria-hidden="true" />
            <aside
              ref={drawerRef}
              className="dash-mobile-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Navegação"
              tabIndex={-1}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setDrawerMobileAberto(false);
              }}
            >
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
                    className={`dash-nav-btn${aba === a.id ? ' is-active' : ''}`}
                    onClick={() => irPara(a.id)}
                  >
                    <span className="dash-nav-icon" aria-hidden="true">{a.icon}</span>
                    <span>{a.label}</span>
                  </button>
                ))}
              </nav>
              <div className="dash-sidebar-footer">
                <button
                  type="button"
                  className="dash-nav-btn"
                  onClick={() => { setDrawerMobileAberto(false); alternar(); }}
                >
                  <span className="dash-nav-icon" aria-hidden="true">{tema === 'claro' ? '🌙' : '☀️'}</span>
                  <span>{tema === 'claro' ? 'Modo escuro' : 'Modo claro'}</span>
                </button>
              </div>
            </aside>
          </>
        )}

        {paletaAberta && <Paleta comandos={comandos} onFechar={() => setPaletaAberta(false)} />}

        {insumoModalAberto && (
          <InsumoModal
            insumo={insumoEditando}
            insumos={insumos}
            fornecedores={fornecedores}
            onFechar={() => setInsumoModalAberto(false)}
            onSalvar={async (dados) => {
              await salvarInsumo(dados, insumoEditando?.id);
              setInsumoModalAberto(false);
            }}
          />
        )}

        {movModalAberto && (
          <MovimentacaoModal
            movimentacao={movEditando}
            insumos={insumos}
            fornecedores={fornecedores}
            insumoPreSelecionado={movInsumoPreSelecionado}
            inicial={movInicial}
            onFechar={() => setMovModalAberto(false)}
            onSalvar={async (dados) => {
              if (movEditando) await editarMovimentacao(movEditando.id, dados);
              else await registrarMovimentacao(dados);
              setMovModalAberto(false);
            }}
          />
        )}

        {fornecedorModalAberto && (
          <FornecedorModal
            fornecedor={fornecedorEditando}
            onFechar={() => setFornecedorModalAberto(false)}
            onSalvar={async (dados) => {
              await salvarFornecedor(dados, fornecedorEditando?.id);
              setFornecedorModalAberto(false);
            }}
          />
        )}

        {confirmar && (
          <Modal rotulo="Confirmar exclusão" onFechar={() => setConfirmar(null)}>
            <div className="dash-modal-icon" aria-hidden="true">🗑️</div>
            <h2 className="dash-modal-title is-danger">{textosConfirmacao.titulo}</h2>
            <p className="dash-modal-desc">{textosConfirmacao.desc}</p>
            <div className="dash-modal-actions">
              <button type="button" className="dash-btn dash-btn-ghost" onClick={() => setConfirmar(null)}>Cancelar</button>
              <button type="button" className="dash-btn dash-btn-danger" onClick={confirmarExclusao}>{textosConfirmacao.botao}</button>
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
            />
            {erroExcluir && (
              <p className="dash-error-inline" role="alert">{erroExcluir}</p>
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