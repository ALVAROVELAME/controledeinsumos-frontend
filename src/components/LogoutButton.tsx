// src/components/LogoutButton.tsx
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { CSSProperties } from 'react';

interface Props {
  estilo?: CSSProperties;
  confirmar?: boolean;
  /** Pra onde redirecionar após logout. Default: '/login'. */
  redirecionarPara?: string;
}

export default function LogoutButton({
  estilo,
  confirmar = true,
  redirecionarPara = '/login',
}: Props) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (confirmar && !window.confirm('Deseja realmente sair?')) return;

    logout();
    navigate(redirecionarPara, { replace: true });
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      style={{
        padding: '8px 16px',
        background: 'transparent',
        color: '#dc2626',              /* danger (Red 600) */
        border: '1px solid #fecaca',   /* danger-line (Red 200) */
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'background 0.15s, border-color 0.15s, color 0.15s',
        ...estilo,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#fef2f2'; /* danger-soft (Red 50) */
        e.currentTarget.style.borderColor = '#dc2626';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.borderColor = '#fecaca';
      }}
    >
      Sair
    </button>
  );
}
