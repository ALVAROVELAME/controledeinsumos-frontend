export default function CarregamentoInicial() {
  return (
    <div className="app-loading grid min-h-screen min-h-dvh place-items-center box-border p-6!" role="status" aria-live="polite">
      <div className="app-loading__content flex flex-col items-center text-center">
        <div className="app-loading__mark relative grid h-[104px] w-[104px] place-items-center" aria-hidden="true">
          <span className="app-loading__ring absolute inset-0 rounded-full" />
          <img className="app-loading__logo h-16 w-16" src="/logo.svg" alt="" width="64" height="64" />
        </div>
        <p className="app-loading__title">Controle de Insumos</p>
        <p className="app-loading__label">Carregando…</p>
      </div>
    </div>
  );
}
