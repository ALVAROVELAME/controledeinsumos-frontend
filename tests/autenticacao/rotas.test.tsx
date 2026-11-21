import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import RotaProtegida from '../../src/components/auth/RotaProtegida';
import RotaPublica from '../../src/components/auth/RotaPublica';

const estado = vi.hoisted(() => ({ autenticado: false, carregando: false }));
vi.mock('../../src/contexts/AuthContext', () => ({ useAuth: () => estado }));

function LoginDestino() {
  const local = useLocation();
  return <p>Login: {(local.state as { from?: { pathname: string } })?.from?.pathname}</p>;
}

beforeEach(() => { estado.autenticado = false; estado.carregando = false; });

describe('proteção de rotas', () => {
  it('aguarda a validação antes de exibir a rota protegida', () => {
    estado.carregando = true;
    render(<MemoryRouter><RotaProtegida>Conteúdo protegido</RotaProtegida></MemoryRouter>);
    expect(screen.getByRole('status')).toHaveTextContent('Carregando');
    expect(screen.getByRole('status').querySelector('img')).toHaveAttribute('src', '/logo.svg');
    expect(screen.queryByText('Conteúdo protegido')).not.toBeInTheDocument();
  });
  it('exibe a mesma tela enquanto valida uma rota pública', () => {
    estado.carregando = true;
    render(<MemoryRouter><RotaPublica>Login</RotaPublica></MemoryRouter>);
    expect(screen.getByRole('status')).toHaveTextContent('Controle de Insumos');
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
  });
  it('redireciona visitante ao login preservando a origem', async () => {
    render(<MemoryRouter initialEntries={['/dashboard']}><Routes><Route path="/dashboard" element={<RotaProtegida>Privado</RotaProtegida>} /><Route path="/login" element={<LoginDestino />} /></Routes></MemoryRouter>);
    expect(await screen.findByText('Login: /dashboard')).toBeInTheDocument();
  });
  it('permite acesso autenticado e redireciona página pública ao painel', async () => {
    estado.autenticado = true;
    const { unmount } = render(<MemoryRouter><RotaProtegida>Privado</RotaProtegida></MemoryRouter>);
    expect(screen.getByText('Privado')).toBeInTheDocument();
    unmount();
    render(<MemoryRouter initialEntries={['/login']}><Routes><Route path="/login" element={<RotaPublica>Login</RotaPublica>} /><Route path="/dashboard" element={<p>Dashboard</p>} /></Routes></MemoryRouter>);
    expect(await screen.findByText('Dashboard')).toBeInTheDocument();
  });
});
