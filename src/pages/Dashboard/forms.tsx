import { useEffect, useId, useState } from 'react';
import type { FormEvent } from 'react';
import type { Insumo, Fornecedor, Movimentacao, TipoMov } from '../../types/domain';
import { CATEGORIAS_SUGERIDAS, LIMITES_INSUMO as LIMITES, UNIDADES_SUGERIDAS } from '../../types/domain';
import { normalizar, formatarNumero, margemDe, useFecharComConfirmacao, Modal, FormHead, Campo, Grupo, ComAfixo, numProps, focarPrimeiroInvalido, chaveDia, hoje, isoDoDia, formatarMoeda, formatarQtd, efeitoEstoque } from './shared';

/* ============================================================
   MODAIS DE NEGÓCIO
   ============================================================ */

export type InsumoModalProps = {
  insumo: Insumo | null;
  insumos: Insumo[];
  fornecedores: Fornecedor[];
  onFechar: () => void;
  onSalvar: (dados: Omit<Insumo, 'id' | 'criadoEm'>) => void;
};

export function InsumoModal({ insumo, insumos, fornecedores, onFechar, onSalvar }: InsumoModalProps) {
  const { fechar, marcarSujo } = useFecharComConfirmacao(onFechar);
  const [nome, setNome] = useState(insumo?.nome ?? '');
  const [categoria, setCategoria] = useState(insumo?.categoria ?? 'Matéria-prima');
  const [unidade, setUnidade] = useState(insumo?.unidade ?? 'un');
  const [quantidadeAtual, setQuantidadeAtual] = useState(String(insumo?.quantidadeAtual ?? 0));
  const [quantidadeMinima, setQuantidadeMinima] = useState(String(insumo?.quantidadeMinima ?? 0));
  const [precoCompra, setPrecoCompra] = useState(String(insumo?.precoCompra ?? 0));
  const [precoVenda, setPrecoVenda] = useState(String(insumo?.precoVenda ?? 0));
  const [fornecedorId, setFornecedorId] = useState(insumo?.fornecedorId ?? '');
  const [observacoes, setObservacoes] = useState(insumo?.observacoes ?? '');
  const [tentou, setTentou] = useState(false);

  const numErro = (v: string) => {
    const n = Number(v);
    return v.trim() === '' || !Number.isFinite(n) || n < 0 ? 'Use um número igual ou maior que zero.' : undefined;
  };

  const validar = () => {
    const nomeNorm = normalizar(nome.trim());
    const duplicado =
      nomeNorm !== '' && insumos.some((i) => i.id !== insumo?.id && normalizar(i.nome.trim()) === nomeNorm);
    return {
      nome: !nome.trim() ? 'Informe o nome do insumo.' : duplicado ? 'Já existe um insumo com este nome.' : undefined,
      quantidadeAtual: numErro(quantidadeAtual),
      quantidadeMinima: numErro(quantidadeMinima),
      precoCompra: numErro(precoCompra),
      precoVenda: numErro(precoVenda),
    };
  };
  const erros = tentou ? validar() : ({} as ReturnType<typeof validar>);

  const pc = Number(precoCompra) || 0;
  const pv = Number(precoVenda) || 0;
  const dicaMargem =
    pc > 0 || pv > 0
      ? pv < pc
        ? 'Atenção: o preço de venda está abaixo do custo (margem negativa).'
        : `Margem de ${formatarNumero(margemDe(pc, pv), 1)}%`
      : undefined;
  const un = unidade.trim() || 'un';

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setTentou(true);
    if (Object.values(validar()).some(Boolean)) {
      focarPrimeiroInvalido(form);
      return;
    }
    onSalvar({
      nome: nome.trim(),
      categoria: categoria.trim() || 'Outros',
      unidade: un,
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
      onFechar={fechar}
      fecharNoFundo={false}
      className="dash-modal is-form is-wide"
    >
      <FormHead titulo={insumo ? 'Editar insumo' : 'Novo insumo'} onFechar={fechar} />
      <form onSubmit={submit} onChange={marcarSujo} noValidate>
        <div className="dash-form-body min-h-0 flex-auto overflow-y-auto overscroll-contain">
          <Grupo titulo="Identificação">
            <Campo label="Nome" obrigatorio erro={erros.nome}>
              {(p) => (
                <input {...p} className="dash-input" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Farinha de trigo" autoComplete="off" autoFocus maxLength={LIMITES.nome} />
              )}
            </Campo>
            <div className="form-grid">
              <Campo label="Categoria">
                {(p) => (
                  <>
                    <input {...p} className="dash-input" list={`${p.id}-l`} value={categoria} onChange={(e) => setCategoria(e.target.value)} autoComplete="off" maxLength={LIMITES.categoria} />
                    <datalist id={`${p.id}-l`}>{CATEGORIAS_SUGERIDAS.map((c) => <option key={c} value={c} />)}</datalist>
                  </>
                )}
              </Campo>
              <Campo label="Fornecedor principal">
                {(p) => (
                  <select {...p} className="dash-select" value={fornecedorId} onChange={(e) => setFornecedorId(e.target.value)}>
                    <option value="">— Nenhum —</option>
                    {fornecedores.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
                  </select>
                )}
              </Campo>
            </div>
          </Grupo>

          <Grupo titulo="Estoque">
            <div className="form-grid form-grid--3">
              <Campo label="Unidade">
                {(p) => (
                  <>
                    <input {...p} className="dash-input" list={`${p.id}-l`} value={unidade} onChange={(e) => setUnidade(e.target.value)} autoComplete="off" maxLength={LIMITES.unidade} />
                    <datalist id={`${p.id}-l`}>{UNIDADES_SUGERIDAS.map((u) => <option key={u} value={u} />)}</datalist>
                  </>
                )}
              </Campo>
              <Campo label="Quantidade atual" erro={erros.quantidadeAtual}>
                {(p) => (
                  <ComAfixo sufixo={un}>
                    <input {...p} {...numProps} type="number" step="0.01" min="0" className="dash-input" value={quantidadeAtual} onChange={(e) => setQuantidadeAtual(e.target.value)} />
                  </ComAfixo>
                )}
              </Campo>
              <Campo label="Quantidade mínima" erro={erros.quantidadeMinima}>
                {(p) => (
                  <ComAfixo sufixo={un}>
                    <input {...p} {...numProps} type="number" step="0.01" min="0" className="dash-input" value={quantidadeMinima} onChange={(e) => setQuantidadeMinima(e.target.value)} />
                  </ComAfixo>
                )}
              </Campo>
            </div>
            <p className="field-hint">Abaixo da quantidade mínima, o insumo aparece em "Precisa de reposição".</p>
          </Grupo>

          <Grupo titulo="Preços">
            <div className="form-grid">
              <Campo label="Preço de compra" erro={erros.precoCompra}>
                {(p) => (
                  <ComAfixo prefixo="R$">
                    <input {...p} {...numProps} type="number" step="0.01" min="0" className="dash-input" value={precoCompra} onChange={(e) => setPrecoCompra(e.target.value)} />
                  </ComAfixo>
                )}
              </Campo>
              <Campo label="Preço de venda" erro={erros.precoVenda} dica={dicaMargem}>
                {(p) => (
                  <ComAfixo prefixo="R$">
                    <input {...p} {...numProps} type="number" step="0.01" min="0" className="dash-input" value={precoVenda} onChange={(e) => setPrecoVenda(e.target.value)} />
                  </ComAfixo>
                )}
              </Campo>
            </div>
          </Grupo>

          <Grupo titulo="Anotações">
            <Campo label="Observações (opcional)">
              {(p) => (
                <textarea {...p} rows={3} className="dash-input" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} maxLength={LIMITES.observacoes} />
              )}
            </Campo>
          </Grupo>
        </div>

        <div className="dash-form-foot flex shrink-0 items-center justify-end gap-[10px]">
          <button type="button" className="dash-btn dash-btn-ghost" onClick={fechar}>Cancelar</button>
          <button type="submit" className="dash-btn dash-btn-primary">
            {insumo ? 'Salvar alterações' : 'Criar insumo'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export type MovimentacaoModalProps = {
  movimentacao: Movimentacao | null;
  insumos: Insumo[];
  fornecedores: Fornecedor[];
  insumoPreSelecionado: string | null;
  inicial?: { tipo?: TipoMov; quantidade?: number } | null;
  onFechar: () => void;
  onSalvar: (dados: Omit<Movimentacao, 'id' | 'criadoEm' | 'total'>) => void;
};

export function MovimentacaoModal({
  movimentacao,
  insumos,
  fornecedores,
  insumoPreSelecionado,
  inicial,
  onFechar,
  onSalvar,
}: MovimentacaoModalProps) {
  const id = useId();
  const { fechar, marcarSujo } = useFecharComConfirmacao(onFechar);
  const editando = !!movimentacao;

  const [tipo, setTipo] = useState<TipoMov>(movimentacao?.tipo ?? inicial?.tipo ?? 'Compra');
  const [insumoId, setInsumoId] = useState(
    movimentacao?.insumoId ?? insumoPreSelecionado ?? (insumos[0]?.id ?? '')
  );
  const [quantidade, setQuantidade] = useState(String(movimentacao?.quantidade ?? inicial?.quantidade ?? 1));
  const [precoUnitario, setPrecoUnitario] = useState(movimentacao ? String(movimentacao.precoUnitario) : '');
  const [data, setData] = useState(() => (movimentacao ? chaveDia(movimentacao.data) : hoje()));
  const [fornecedorId, setFornecedorId] = useState(movimentacao?.fornecedorId ?? '');
  const [cliente, setCliente] = useState(movimentacao?.cliente ?? '');
  const [observacoes, setObservacoes] = useState(movimentacao?.observacoes ?? '');
  const [tentou, setTentou] = useState(false);

  const insumo = insumos.find((i) => i.id === insumoId);

  useEffect(() => {
    if (editando) return;
    const ins = insumos.find((i) => i.id === insumoId);
    if (!ins) return;
    if (tipo === 'Compra') {
      setPrecoUnitario(String(ins.precoCompra));
      setFornecedorId(ins.fornecedorId ?? '');
    } else if (tipo === 'Venda') {
      setPrecoUnitario(String(ins.precoVenda));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [insumoId, tipo, editando]);

  const qtdNum = Number(quantidade);
  const precoNum = Number(precoUnitario);
  const total = tipo === 'Ajuste' ? 0 : (Number.isFinite(qtdNum) ? qtdNum : 0) * (Number.isFinite(precoNum) ? precoNum : 0);

  const disponivel = insumo
    ? insumo.quantidadeAtual -
      (movimentacao && movimentacao.insumoId === insumo.id
        ? efeitoEstoque(movimentacao.tipo, movimentacao.quantidade)
        : 0)
    : 0;
  const estoqueDepois = disponivel + efeitoEstoque(tipo, Number.isFinite(qtdNum) ? qtdNum : 0);

  const validar = () => {
    const e: Partial<Record<'insumo' | 'quantidade' | 'preco' | 'data', string>> = {};
    if (!insumoId) e.insumo = 'Escolha um insumo.';
    if (quantidade.trim() === '' || !Number.isFinite(qtdNum)) e.quantidade = 'Informe a quantidade.';
    else if (tipo === 'Ajuste' && qtdNum === 0) e.quantidade = 'Use um valor diferente de zero (negativo para tirar do estoque).';
    else if (tipo !== 'Ajuste' && qtdNum <= 0) e.quantidade = 'A quantidade deve ser maior que zero.';
    else if (insumo && estoqueDepois < 0) {
      e.quantidade =
        tipo === 'Venda'
          ? `Estoque insuficiente: há ${formatarQtd(disponivel)} ${insumo.unidade} disponíveis.`
          : 'Este ajuste deixaria o estoque negativo.';
    }
    if (tipo !== 'Ajuste' && (precoUnitario.trim() === '' || !(precoNum >= 0))) {
      e.preco = 'Informe um preço igual ou maior que zero.';
    }
    if (!data) e.data = 'Informe a data.';
    return e;
  };
  const erros = tentou ? validar() : ({} as ReturnType<typeof validar>);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setTentou(true);
    if (Object.keys(validar()).length > 0) {
      focarPrimeiroInvalido(form);
      return;
    }
    onSalvar({
      insumoId,
      tipo,
      quantidade: tipo === 'Ajuste' ? qtdNum : Math.abs(qtdNum),
      precoUnitario: tipo === 'Ajuste' ? 0 : precoNum,
      data: isoDoDia(data),
      fornecedorId: tipo === 'Compra' && fornecedorId ? fornecedorId : undefined,
      cliente: tipo === 'Venda' && cliente.trim() ? cliente.trim() : undefined,
      observacoes: observacoes.trim() || undefined,
    });
  };

  const dicaQtd =
    insumo && Number.isFinite(qtdNum)
      ? `Estoque: ${formatarQtd(disponivel)} → ${formatarQtd(Math.max(0, estoqueDepois))} ${insumo.unidade}`
      : undefined;

  return (
    <Modal
      rotulo={editando ? 'Editar movimentação' : 'Nova movimentação'}
      onFechar={fechar}
      fecharNoFundo={false}
      className="dash-modal is-form is-wide"
    >
      <FormHead titulo={editando ? 'Editar movimentação' : 'Registrar movimentação'} onFechar={fechar} />
      <form onSubmit={submit} onChange={marcarSujo} noValidate>
        <div className="dash-form-body min-h-0 flex-auto overflow-y-auto overscroll-contain">
          <Grupo titulo="Tipo">
            <div className="tipo-picker">
              {(['Compra', 'Venda', 'Ajuste'] as TipoMov[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  data-tipo={t}
                  className={`tipo-picker-btn${tipo === t ? ' is-on' : ''}`}
                  aria-pressed={tipo === t}
                  onClick={() => {
                    setTipo(t);
                    marcarSujo();
                  }}
                >
                  <span aria-hidden="true">{t === 'Compra' ? '💰' : t === 'Venda' ? '💵' : '⚙️'}</span> {t}
                </button>
              ))}
            </div>
            <p className="field-hint" id={`${id}-tipo-dica`} style={{ marginTop: 8 }}>
              {tipo === 'Compra' && 'Entrada de estoque: você comprou de um fornecedor.'}
              {tipo === 'Venda' && 'Saída de estoque: você vendeu para um cliente.'}
              {tipo === 'Ajuste' && 'Correção de estoque (perda, contagem, sobra). Não entra no lucro.'}
            </p>
          </Grupo>

          <Grupo titulo="Detalhes">
            <Campo label="Insumo" obrigatorio erro={erros.insumo}>
              {(p) => (
                <select {...p} className="dash-select" value={insumoId} onChange={(e) => setInsumoId(e.target.value)}>
                  {insumos.length === 0 && <option value="">— Nenhum insumo cadastrado —</option>}
                  {insumos.map((i) => <option key={i.id} value={i.id}>{i.nome}</option>)}
                </select>
              )}
            </Campo>

            <div className="form-grid">
              <Campo
                label={tipo === 'Ajuste' ? 'Quantidade (negativa para retirar)' : 'Quantidade'}
                obrigatorio
                erro={erros.quantidade}
                dica={dicaQtd}
              >
                {(p) => (
                  <ComAfixo sufixo={insumo?.unidade}>
                    <input {...p} {...numProps} type="number" step="0.01" className="dash-input" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} autoFocus />
                  </ComAfixo>
                )}
              </Campo>

              {tipo !== 'Ajuste' && (
                <Campo label="Preço unitário" erro={erros.preco}>
                  {(p) => (
                    <ComAfixo prefixo="R$">
                      <input {...p} {...numProps} type="number" step="0.01" min="0" className="dash-input" value={precoUnitario} onChange={(e) => setPrecoUnitario(e.target.value)} />
                    </ComAfixo>
                  )}
                </Campo>
              )}

              <Campo label="Data" erro={erros.data}>
                {(p) => <input {...p} type="date" className="dash-input" value={data} onChange={(e) => setData(e.target.value)} />}
              </Campo>

              {tipo !== 'Ajuste' && (
                <div className="field">
                  <span className="form-label" id={`${id}-total`}>Total</span>
                  <output className="dash-input dash-readonly" aria-labelledby={`${id}-total`}>
                    {formatarMoeda(total)}
                  </output>
                </div>
              )}
            </div>

            {tipo === 'Compra' && (
              <Campo label="Fornecedor (opcional)">
                {(p) => (
                  <select {...p} className="dash-select" value={fornecedorId} onChange={(e) => setFornecedorId(e.target.value)}>
                    <option value="">— Nenhum —</option>
                    {fornecedores.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
                  </select>
                )}
              </Campo>
            )}

            {tipo === 'Venda' && (
              <Campo label="Cliente (opcional)">
                {(p) => <input {...p} className="dash-input" value={cliente} onChange={(e) => setCliente(e.target.value)} autoComplete="off" maxLength={LIMITES.cliente} />}
              </Campo>
            )}
          </Grupo>

          <Grupo titulo="Anotações">
            <Campo label="Observações (opcional)">
              {(p) => (
                <textarea {...p} rows={3} className="dash-input" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} maxLength={LIMITES.observacoes} />
              )}
            </Campo>
          </Grupo>
        </div>

        <div className="dash-form-foot flex shrink-0 items-center justify-end gap-[10px]">
          <button type="button" className="dash-btn dash-btn-ghost" onClick={fechar}>Cancelar</button>
          <button type="submit" className="dash-btn dash-btn-primary" disabled={insumos.length === 0}>
            {editando ? 'Salvar alterações' : 'Registrar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export type FornecedorModalProps = {
  fornecedor: Fornecedor | null;
  onFechar: () => void;
  onSalvar: (dados: Omit<Fornecedor, 'id' | 'criadoEm'>) => void;
};

export function FornecedorModal({ fornecedor, onFechar, onSalvar }: FornecedorModalProps) {
  const { fechar, marcarSujo } = useFecharComConfirmacao(onFechar);
  const [nome, setNome] = useState(fornecedor?.nome ?? '');
  const [documento, setDocumento] = useState(fornecedor?.documento ?? '');
  const [telefone, setTelefone] = useState(fornecedor?.telefone ?? '');
  const [email, setEmail] = useState(fornecedor?.email ?? '');
  const [observacoes, setObservacoes] = useState(fornecedor?.observacoes ?? '');
  const [tentou, setTentou] = useState(false);

  const validar = () => ({
    nome: !nome.trim() ? 'Informe o nome do fornecedor.' : undefined,
    email: email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim()) ? 'Digite um e-mail válido, como nome@empresa.com.' : undefined,
  });
  const erros = tentou ? validar() : ({} as ReturnType<typeof validar>);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setTentou(true);
    if (Object.values(validar()).some(Boolean)) {
      focarPrimeiroInvalido(form);
      return;
    }
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
      onFechar={fechar}
      fecharNoFundo={false}
      className="dash-modal is-form"
    >
      <FormHead titulo={fornecedor ? 'Editar fornecedor' : 'Novo fornecedor'} onFechar={fechar} />
      <form onSubmit={submit} onChange={marcarSujo} noValidate>
        <div className="dash-form-body min-h-0 flex-auto overflow-y-auto overscroll-contain">
          <Grupo titulo="Identificação">
            <Campo label="Nome" obrigatorio erro={erros.nome}>
              {(p) => <input {...p} className="dash-input" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Distribuidora Silva" autoComplete="off" autoFocus maxLength={LIMITES.nome} />}
            </Campo>
            <Campo label="Documento (CNPJ/CPF, opcional)">
              {(p) => <input {...p} className="dash-input" inputMode="numeric" value={documento} onChange={(e) => setDocumento(e.target.value)} autoComplete="off" maxLength={LIMITES.documento} />}
            </Campo>
          </Grupo>

          <Grupo titulo="Contato">
            <div className="form-grid">
              <Campo label="Telefone">
                {(p) => <input {...p} type="tel" className="dash-input" value={telefone} onChange={(e) => setTelefone(e.target.value)} autoComplete="off" maxLength={LIMITES.telefone} />}
              </Campo>
              <Campo label="E-mail" erro={erros.email}>
                {(p) => <input {...p} type="email" className="dash-input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" maxLength={LIMITES.email} />}
              </Campo>
            </div>
          </Grupo>

          <Grupo titulo="Anotações">
            <Campo label="Observações (opcional)">
              {(p) => <textarea {...p} rows={3} className="dash-input" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} maxLength={LIMITES.observacoes} />}
            </Campo>
          </Grupo>
        </div>

        <div className="dash-form-foot flex shrink-0 items-center justify-end gap-[10px]">
          <button type="button" className="dash-btn dash-btn-ghost" onClick={fechar}>Cancelar</button>
          <button type="submit" className="dash-btn dash-btn-primary">
            {fornecedor ? 'Salvar alterações' : 'Criar fornecedor'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

