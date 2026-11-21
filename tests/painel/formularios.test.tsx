import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FornecedorModal } from '../../src/pages/Dashboard/forms';

describe('formulário de fornecedor', () => {
  it('valida os campos antes de salvar os dados preenchidos', async () => {
    const user = userEvent.setup();
    const salvar = vi.fn();
    render(<FornecedorModal fornecedor={null} onFechar={vi.fn()} onSalvar={salvar} />);
    const dialogo = screen.getByRole('dialog');
    await user.click(within(dialogo).getByRole('button', { name: 'Criar fornecedor' }));
    expect(within(dialogo).getByText('Informe o nome do fornecedor.')).toBeInTheDocument();
    expect(salvar).not.toHaveBeenCalled();
    await user.type(within(dialogo).getByLabelText(/nome/i), 'Distribuidora Silva');
    await user.type(within(dialogo).getByLabelText(/e-mail/i), 'contato@exemplo.com');
    await user.click(within(dialogo).getByRole('button', { name: 'Criar fornecedor' }));
    expect(salvar).toHaveBeenCalledWith(expect.objectContaining({ nome: 'Distribuidora Silva', email: 'contato@exemplo.com', ativo: true }));
  });
});
