import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../../src/contexts/AuthContext';
import RotaPublica from '../../src/components/auth/RotaPublica';
import RotaProtegida from '../../src/components/auth/RotaProtegida';
import LogoutButton from '../../src/components/auth/LogoutButton';
import { http } from '../../src/services/http';

const adapterOriginal = http.defaults.adapter;
afterEach(() => {
  http.defaults.adapter = adapterOriginal;
  window.history.replaceState(null, '', '/');
});

function Aplicacao({ inicio = '/' }: { inicio?: string }) {
  return <AuthProvider><MemoryRouter initialEntries={[inicio]}><Routes>
    <Route path="/" element={<RotaPublica><h1>Página institucional</h1></RotaPublica>} />
    <Route path="/login" element={<RotaPublica><h1>Login</h1></RotaPublica>} />
    <Route path="/dashboard" element={<RotaProtegida><h1>Painel</h1><LogoutButton confirmar={false} /></RotaProtegida>} />
  </Routes></MemoryRouter></AuthProvider>;
}

describe('navegação com sessão', () => {
  it('abre a página institucional quando o token salvo expirou', async () => {
    localStorage.setItem('token', 'expirado');
    localStorage.setItem('usuario', JSON.stringify({ nome: 'Ana', email: 'ana@example.com' }));
    http.defaults.adapter = async (config) => { throw { config, response: { status: 401 } }; };
    const locationSpy = vi.spyOn(window.history, 'replaceState');
    render(<Aplicacao />);
    expect(await screen.findByRole('heading', { name: 'Página institucional' })).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBeNull();
    expect(window.location.pathname).toBe('/');
    expect(locationSpy).not.toHaveBeenCalled();
  });

  it('ao sair vai ao login e uma nova visita à raiz abre a página institucional', async () => {
    const user = userEvent.setup();
    localStorage.setItem('token', 'válido');
    localStorage.setItem('usuario', JSON.stringify({ nome: 'Ana', email: 'ana@example.com' }));
    http.defaults.adapter = async (config) => ({ data: { nome: 'Ana', email: 'ana@example.com' }, status: 200, statusText: 'OK', headers: {}, config });
    const { unmount } = render(<Aplicacao inicio="/dashboard" />);
    expect(await screen.findByRole('heading', { name: 'Painel' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Sair' }));
    expect(await screen.findByRole('heading', { name: 'Login' })).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBeNull();
    unmount();
    render(<Aplicacao />);
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Página institucional' })).toBeInTheDocument());
  });
});
