import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../src/contexts/AuthContext';
import { authService } from '../../src/services/auth.service';
import { http } from '../../src/services/http';

vi.mock('../../src/services/http', () => ({ http: { get: vi.fn(), post: vi.fn() } }));

function Estado() {
  const { usuario, carregando, autenticado, logout } = useAuth();
  return <><p>{carregando ? 'Carregando' : autenticado ? `Conectado: ${usuario?.nome}` : 'Desconectado'}</p><button onClick={logout}>Sair</button></>;
}

beforeEach(() => vi.resetAllMocks());

describe('autenticação e sessão', () => {
  it('salva token e usuário após login e limpa ambos no logout', async () => {
    vi.mocked(http.post).mockResolvedValue({ data: { token: 'token-teste', usuario: { nome: 'Ana', email: 'ana@example.com' } } });
    await authService.login({ email: 'ana@example.com', senha: 'segredo' });
    expect(http.post).toHaveBeenCalledWith('/api/auth/login', { email: 'ana@example.com', senha: 'segredo' });
    expect(authService.getToken()).toBe('token-teste');
    expect(authService.getUsuario()?.nome).toBe('Ana');
    authService.logout();
    expect(authService.getToken()).toBeNull();
    expect(authService.getUsuario()).toBeNull();
  });
  it('envia a solicitação e a nova senha para as rotas de recuperação', async () => {
    vi.mocked(http.post).mockResolvedValue({ data: { sucesso: true, mensagem: 'ok' } });
    await authService.solicitarRecuperacao('ana@example.com');
    await authService.redefinirSenha('token-de-recuperacao', 'NovaSenha123');
    expect(http.post).toHaveBeenNthCalledWith(1, '/api/auth/forgot-password', { email: 'ana@example.com' });
    expect(http.post).toHaveBeenNthCalledWith(2, '/api/auth/reset-password', { token: 'token-de-recuperacao', senha: 'NovaSenha123' });
  });
  it('inicia sem sessão quando não há token', async () => {
    render(<AuthProvider><Estado /></AuthProvider>);
    expect(await screen.findByText('Desconectado')).toBeInTheDocument();
    expect(http.get).not.toHaveBeenCalled();
  });
  it('atualiza os dados após validar a sessão', async () => {
    localStorage.setItem('token', 'abc');
    vi.mocked(http.get).mockResolvedValue({ data: { nome: 'Ana', email: 'ana@example.com' } });
    render(<AuthProvider><Estado /></AuthProvider>);
    expect(await screen.findByText('Conectado: Ana')).toBeInTheDocument();
    expect(http.get).toHaveBeenCalledWith('/api/auth/me');
    expect(authService.getUsuario()?.nome).toBe('Ana');
  });
  it('remove sessão inválida quando o servidor retorna 401', async () => {
    localStorage.setItem('token', 'inválido');
    localStorage.setItem('usuario', JSON.stringify({ nome: 'Ana', email: 'ana@example.com' }));
    vi.mocked(http.get).mockRejectedValue({ response: { status: 401 } });
    render(<AuthProvider><Estado /></AuthProvider>);
    expect(await screen.findByText('Desconectado')).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBeNull();
  });
  it('mantém a sessão em cache diante de falha de rede', async () => {
    localStorage.setItem('token', 'abc');
    localStorage.setItem('usuario', JSON.stringify({ nome: 'Ana', email: 'ana@example.com' }));
    vi.mocked(http.get).mockRejectedValue(new Error('Sem conexão'));
    render(<AuthProvider><Estado /></AuthProvider>);
    expect(await screen.findByText('Conectado: Ana')).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBe('abc');
  });
});
