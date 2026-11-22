import { describe, expect, it } from 'vitest';
import ExcelJS from 'exceljs';
import { dadosExportacao, gerarPlanilha } from '../../src/pages/Dashboard/exportacao';
import type { Insumo, Movimentacao } from '../../src/types/domain';

const insumo: Insumo = { id: 'i', nome: 'Papel', categoria: 'Escritório', unidade: 'pct', quantidadeAtual: 2, quantidadeMinima: 5, precoCompra: 10, precoVenda: 15, ativo: true, criadoEm: '2026-01-01T12:00:00Z' };
const mov: Movimentacao = { id: 'm', insumoId: 'i', tipo: 'Compra', quantidade: 2, precoUnitario: 10, total: 20, data: '2026-01-01T12:00:00Z', criadoEm: '2026-01-01T12:00:00Z', observacoes: '=teste' };

describe('exportação de movimentações', () => {
  it('inclui dados atuais do insumo e tolera cadastros ausentes', () => {
    expect(dadosExportacao([mov], [insumo], [])[0]).toEqual(expect.arrayContaining(['Papel', 'Escritório', 'pct', 'Baixo', '=teste']));
    expect(dadosExportacao([mov], [], [])[0][1]).toBe('Insumo não encontrado');
  });
  it('gera um Excel com resumo, filtros e valores numéricos', async () => {
    const buffer = await gerarPlanilha([mov], [insumo], [], 'Filtros aplicados');
    const livro = new ExcelJS.Workbook();
    await livro.xlsx.load(buffer);
    expect(livro.getWorksheet('Resumo')?.getCell('B5').value).toBe(20);
    const aba = livro.getWorksheet('Movimentações');
    expect(aba?.getCell('H2').value).toBe(20);
    expect(aba?.getCell('K2').value).toBe('=teste');
    expect(aba?.getTable('TabelaMovimentacoes')).toBeTruthy();
  });
});
