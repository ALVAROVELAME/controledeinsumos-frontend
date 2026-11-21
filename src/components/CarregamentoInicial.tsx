export default function CarregamentoInicial() {
  return (
    <div className="app-loading" role="status" aria-live="polite">
      <div className="app-loading__content">
        <div className="app-loading__mark" aria-hidden="true">
          <span className="app-loading__ring" />
          <img className="app-loading__logo" src="/logo.svg" alt="" width="64" height="64" />
        </div>
        <p className="app-loading__title">Controle de Insumos</p>
        <p className="app-loading__label">Carregando…</p>
      </div>
    </div>
  );
}
