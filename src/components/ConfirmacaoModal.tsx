import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import './ConfirmacaoModal.css';

type Props = {
  titulo: string;
  descricao: string;
  textoConfirmar: string;
  onConfirmar: () => void;
  onCancelar: () => void;
};

export default function ConfirmacaoModal({ titulo, descricao, textoConfirmar, onConfirmar, onCancelar }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const tituloId = useId();
  const descricaoId = useId();

  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => { dialog?.close(); };
  }, []);

  return createPortal(
    <dialog ref={ref} className="confirmacao-modal" aria-labelledby={tituloId} aria-describedby={descricaoId}
      onCancel={(event) => { event.preventDefault(); event.stopPropagation(); onCancelar(); }}
      onKeyDown={(event) => event.stopPropagation()}>
      <div className="confirmacao-icone" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 9v4" /><path d="M12 17h.01" /><path d="M10.3 4.9 3.4 17a2 2 0 0 0 1.7 3h13.8a2 2 0 0 0 1.7-3L13.7 4.9a2 2 0 0 0-3.4 0Z" />
        </svg>
      </div>
      <h2 id={tituloId}>{titulo}</h2>
      <p id={descricaoId}>{descricao}</p>
      <div className="confirmacao-acoes">
        <button type="button" className="confirmacao-cancelar" onClick={onCancelar} autoFocus>Cancelar</button>
        <button type="button" className="confirmacao-confirmar" onClick={onConfirmar}>{textoConfirmar}</button>
      </div>
    </dialog>,
    document.querySelector('.dash') ?? document.body,
  );
}
