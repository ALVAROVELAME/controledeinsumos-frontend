import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ResetPassword from '../src/pages/ResetPassword';
import { authService } from '../src/services/auth.service';
vi.mock('../src/services/auth.service', () => ({ authService: { redefinirSenha: vi.fn() } }));
beforeEach(() => vi.clearAllMocks());
function pagina(path: string) { return render(<MemoryRouter initialEntries={[path]}><ResetPassword /></MemoryRouter>); }
describe('redefinição de senha', () => {
 it('avisa quando o link está incompleto', () => { pagina('/reset-password'); expect(screen.getByRole('alert')).toHaveTextContent(/link incompleto/i); });
 it('valida confirmação e redefine a senha', async () => {
  const user = userEvent.setup(); vi.mocked(authService.redefinirSenha).mockResolvedValue({ sucesso: true, mensagem: 'ok' }); pagina('/reset-password?token=abc');
  await user.type(screen.getByLabelText('Nova senha'), 'Senha123!');
  expect(screen.getByText('Forte')).toBeInTheDocument();
  await user.type(screen.getByLabelText('Confirmar senha'), 'diferente');
  await user.click(screen.getByRole('button', { name: /redefinir senha/i }));
  expect(screen.getByRole('alert')).toHaveTextContent(/não coincidem/i); expect(authService.redefinirSenha).not.toHaveBeenCalled();
  await user.clear(screen.getByLabelText('Confirmar senha')); await user.type(screen.getByLabelText('Confirmar senha'), 'Senha123!');
  await user.click(screen.getByRole('button', { name: /redefinir senha/i }));
  expect(authService.redefinirSenha).toHaveBeenCalledWith('abc', 'Senha123!'); expect(await screen.findByText(/sua senha foi redefinida/i)).toBeInTheDocument();
 });
 it('informa falha do link', async () => { const user = userEvent.setup(); vi.mocked(authService.redefinirSenha).mockRejectedValue(new Error()); pagina('/reset-password?token=abc'); await user.type(screen.getByLabelText('Nova senha'), 'senha123'); await user.type(screen.getByLabelText('Confirmar senha'), 'senha123'); await user.click(screen.getByRole('button', { name: /redefinir senha/i })); expect(await screen.findByRole('alert')).toHaveTextContent(/inválido ou ter expirado/i); });
});
