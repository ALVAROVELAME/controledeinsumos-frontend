// src/components/auth/RotaProtegida.tsx
import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import CarregamentoInicial from '../CarregamentoInicial';

export default function RotaProtegida({ children }: { children: ReactNode }) {
  const { autenticado, carregando } = useAuth();
  const location = useLocation();

  if (carregando) return <CarregamentoInicial />;

  if (!autenticado) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}