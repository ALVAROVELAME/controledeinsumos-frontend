import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Landing from '../src/pages/Landing';
import Login from '../src/pages/Login';
import Signup from '../src/pages/Signup';
import Termos from '../src/pages/Termos';
import Privacidade from '../src/pages/Privacidade';
import ForgotPassword from '../src/pages/ForgotPassword';
import Status from '../src/pages/Status';
import ConfirmarEmail from '../src/pages/ConfirmarEmail';
import { authService } from '../src/services/auth.service';

vi.mock('../src/services/auth.service', () => ({ authService: { login: vi.fn(), cadastrar: vi.fn(), confirmarEmail: vi.fn() } }));
vi.mock('../src/contexts/AuthContext', () => ({ useAuth: () => ({ login: vi.fn() }) }));

function pagina(element: React.ReactNode, path = '/') {
  return render(<MemoryRouter initialEntries={[path]}>{element}</MemoryRouter>);
}

beforeEach(() => vi.clearAllMocks());

describe('páginas públicas', () => {
  it('exibe a landing e abre uma resposta do FAQ', async () => {
    const user = userEvent.setup();
    pagina(<Landing />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /preciso instalar algo/i }));
    expect(screen.getByText(/100% web/i)).toBeInTheDocument();
  });

  it.each([[Termos, 'Termos de Uso'], [Privacidade, 'Política de Privacidade']] as const)('mostra o documento legal %s', (Page, titulo) => {
    pagina(<Page />);
    expect(screen.getByRole('heading', { level: 1, name: titulo })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: /documentos legais/i })).toBeInTheDocument();
  });

  it('informa que a recuperação de senha ainda não está disponível', () => {
    pagina(<ForgotPassword />);
    expect(screen.getByText(/ainda não está disponível/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /voltar ao login/i })).toHaveAttribute('href', '/login');
  });

  it('apresenta a central de status', () => {
    pagina(<Status />);
    expect(screen.getByRole('heading', { name: /central de status/i })).toBeInTheDocument();
  });

  it('informa quando o link de confirmação não possui token', async () => {
    pagina(<ConfirmarEmail />, '/confirmar');
    expect(await screen.findByRole('heading', { name: /link incompleto/i })).toBeInTheDocument();
    expect(authService.confirmarEmail).not.toHaveBeenCalled();
  });

  it('confirma o e-mail com o token recebido', async () => {
    vi.mocked(authService.confirmarEmail).mockResolvedValue({ mensagem: 'OK' });
    pagina(<ConfirmarEmail />, '/confirmar?token=abc');
    expect(await screen.findByRole('heading', { name: /e-mail confirmado/i })).toBeInTheDocument();
    expect(authService.confirmarEmail).toHaveBeenCalledWith('abc', expect.any(AbortSignal));
  });

  it('envia credenciais válidas e navega ao dashboard', async () => {
    const user = userEvent.setup();
    vi.mocked(authService.login).mockResolvedValue({ token: 'abc', usuario: { nome: 'Ana', email: 'ana@example.com' } });
    render(<MemoryRouter initialEntries={['/login']}><Routes><Route path="/login" element={<Login />} /><Route path="/dashboard" element={<h1>Painel autenticado</h1>} /></Routes></MemoryRouter>);
    await user.type(screen.getByLabelText('E-mail'), 'ana@example.com');
    await user.type(screen.getByLabelText('Senha'), 'senha123');
    await user.click(screen.getByRole('button', { name: /^entrar$/i }));
    expect(await screen.findByRole('heading', { name: /painel autenticado/i })).toBeInTheDocument();
    expect(authService.login).toHaveBeenCalledWith({ email: 'ana@example.com', senha: 'senha123' });
  });

  it('mostra erro de autenticação e permite revelar a senha', async () => {
    const user = userEvent.setup();
    vi.mocked(authService.login).mockRejectedValue({ response: { data: { mensagem: 'Acesso negado' } } });
    pagina(<Login />);
    await user.type(screen.getByLabelText('Senha'), 'teste123');
    await user.click(screen.getByRole('button', { name: /mostrar senha/i }));
    expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'text');
    await user.click(screen.getByRole('button', { name: /^entrar$/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Acesso negado');
  });

  it('impede cadastro enquanto os dados obrigatórios não são válidos', () => {
    pagina(<Signup />);
    expect(screen.getByRole('heading', { name: /^criar conta$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /criar conta/i })).toBeDisabled();
    expect(authService.cadastrar).not.toHaveBeenCalled();
  });

  it('cadastra uma conta após preencher os dados e aceitar os termos', async () => {
    const user = userEvent.setup();
    vi.mocked(authService.cadastrar).mockResolvedValue({ mensagem: 'Criado' });
    pagina(<Signup />);
    await user.type(screen.getByLabelText('Nome completo'), 'Ana Silva');
    await user.type(screen.getByLabelText('E-mail'), 'ana@example.com');
    await user.type(screen.getByLabelText('Senha', { exact: true }), 'Senha123!');
    await user.type(screen.getByLabelText('Confirmar senha'), 'Senha123!');
    await user.click(screen.getByText(/concordo com os/i));
    await user.click(screen.getByRole('button', { name: /criar conta/i }));
    expect(await screen.findByRole('heading', { name: /cadastro realizado/i })).toBeInTheDocument();
    expect(authService.cadastrar).toHaveBeenCalledWith({ nome: 'Ana Silva', email: 'ana@example.com', senha: 'Senha123!' });
  });
});
