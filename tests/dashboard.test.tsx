import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../src/pages/Dashboard';

vi.mock('../src/contexts/AuthContext', () => ({ useAuth: () => ({ usuario: { nome: 'Ana', email: 'ana@example.com' }, logout: vi.fn() }) }));
vi.mock('../src/contexts/ToastContext', () => ({ useToast: () => ({ push: vi.fn(), toasts: [], remover: vi.fn() }) }));
vi.mock('../src/contexts/InsumosContext', () => ({ useInsumos: () => ({
  insumos: [], fornecedores: [], movimentacoes: [], estado: 'pronto', sincronizando: false,
  rotas: { insumos: true, fornecedores: true, movimentacoes: true }, recarregar: vi.fn(),
  salvarInsumo: vi.fn(), excluirInsumo: vi.fn(), salvarFornecedor: vi.fn(), excluirFornecedor: vi.fn(),
  registrarMovimentacao: vi.fn(), editarMovimentacao: vi.fn(), excluirMovimentacao: vi.fn(), limparTudo: vi.fn(),
}) }));

describe('aplicativo autenticado', () => {
  it('navega por todas as seções do painel', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    const nav = within(screen.getByRole('navigation', { name: 'Seções' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Visão geral' })).toBeInTheDocument();
    for (const nome of ['Insumos', 'Movimentações', 'Fornecedores', 'Configurações']) {
      await user.click(nav.getByRole('button', { name: nome }));
      expect(screen.getByRole('heading', { level: 1, name: nome })).toBeInTheDocument();
    }
  });

  it.each([
    ['Insumos', 'Novo insumo'],
    ['Fornecedores', 'Novo fornecedor'],
  ])('abre e fecha o formulário de %s', async (secao, nome) => {
    const user = userEvent.setup();
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    await user.click(within(screen.getByRole('navigation', { name: 'Seções' })).getByRole('button', { name: secao }));
    await user.click(screen.getAllByRole('button', { name: new RegExp(nome, 'i') })[0]);
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: new RegExp(nome, 'i') })).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Fechar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('impede movimentação quando não existe insumo cadastrado', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    await user.click(within(screen.getByRole('navigation', { name: 'Seções' })).getByRole('button', { name: 'Movimentações' }));
    expect(screen.getByRole('button', { name: /nova movimentação/i })).toBeDisabled();
  });
});
