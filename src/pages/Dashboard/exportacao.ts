import type { Insumo, Fornecedor, Movimentacao } from '../../types/domain';
import { dataLocal, statusDoInsumo } from './shared';

export function dadosExportacao(movs: Movimentacao[], insumos: Insumo[], fornecedores: Fornecedor[]) {
  const itens = new Map(insumos.map(i => [i.id, i]));
  const parceiros = new Map(fornecedores.map(f => [f.id, f.nome]));
  return movs.map(m => {
    const i = itens.get(m.insumoId);
    return [dataLocal(m.data).toLocaleDateString('pt-BR'), i?.nome ?? 'Insumo não encontrado', i?.categoria ?? '', i?.unidade ?? '', m.tipo, m.quantidade, m.precoUnitario, m.total, m.fornecedorId ? (parceiros.get(m.fornecedorId) ?? 'Fornecedor não encontrado') : '', m.cliente ?? '', m.observacoes ?? '', i?.quantidadeAtual ?? '', i?.quantidadeMinima ?? '', i ? statusDoInsumo(i) : ''];
  });
}

export const colunasExportacao = ['Data', 'Insumo', 'Categoria atual', 'Unidade atual', 'Tipo', 'Quantidade', 'Preço unitário (R$)', 'Total (R$)', 'Fornecedor', 'Cliente', 'Observações', 'Estoque atual', 'Estoque mínimo atual', 'Status atual'];

export async function gerarPlanilha(movs: Movimentacao[], insumos: Insumo[], fornecedores: Fornecedor[], escopo: string) {
  const ExcelJS = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Controle de Insumos';
  workbook.created = new Date();
  const resumo = workbook.addWorksheet('Resumo', { views: [{ showGridLines: false }], properties: { tabColor: { argb: 'FF0F766E' } } });
  resumo.columns = [{ width: 36 }, { width: 58 }];
  resumo.addRow(['RELATÓRIO DE MOVIMENTAÇÕES']);
  resumo.mergeCells('A1:B1');
  resumo.addRow(['Gerado em', new Date().toLocaleString('pt-BR')]);
  resumo.addRow(['Escopo', escopo]);
  resumo.addRow(['Registros', movs.length]);
  resumo.addRow(['Compras (R$)', movs.filter(m => m.tipo === 'Compra').reduce((s, m) => s + m.total, 0)]);
  resumo.addRow(['Vendas (R$)', movs.filter(m => m.tipo === 'Venda').reduce((s, m) => s + m.total, 0)]);
  resumo.addRow(['Saldo de vendas e compras (R$)', Number(resumo.getCell('B6').value) - Number(resumo.getCell('B5').value)]);
  resumo.addRow(['Ajustes', movs.filter(m => m.tipo === 'Ajuste').length]);
  resumo.addRow(['Observação', 'Categoria, unidade e estoque refletem o cadastro atual.']);
  resumo.getRow(1).height = 42;
  resumo.getRow(1).eachCell({ includeEmpty: true }, cell => {
    cell.font = { name: 'Aptos', bold: true, color: { argb: 'FFFFFFFF' }, size: 16 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF123B4A' } };
    cell.alignment = { vertical: 'middle', indent: 1 };
  });
  for (let n = 2; n <= 9; n++) {
    const row = resumo.getRow(n);
    row.height = n === 9 ? 38 : 30;
    row.eachCell({ includeEmpty: true }, (cell, coluna) => {
      cell.font = { name: 'Aptos', size: 11, bold: coluna === 1, color: { argb: coluna === 1 ? 'FF526A75' : 'FF173B48' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: n % 2 === 0 ? 'FFF0F7F7' : 'FFFFFFFF' } };
      cell.alignment = { vertical: 'middle', indent: 1, wrapText: true };
      cell.border = { bottom: { style: 'hair', color: { argb: 'FFD9E8E8' } } };
    });
  }
  for (let n = 5; n <= 7; n++) {
    const cell = resumo.getCell(`B${n}`);
    cell.numFmt = '"R$" #,##0.00;[Red]-"R$" #,##0.00';
    cell.font = { name: 'Aptos', size: 13, bold: true, color: { argb: n === 5 ? 'FFB45309' : 'FF0F766E' } };
  }
  resumo.getCell('B9').font = { name: 'Aptos', size: 10, italic: true, color: { argb: 'FF526A75' } };
  const aba = workbook.addWorksheet('Movimentações', { views: [{ state: 'frozen', ySplit: 1, showGridLines: false }], properties: { tabColor: { argb: 'FF2563EB' } } });
  aba.addTable({
    name: 'TabelaMovimentacoes', ref: 'A1', headerRow: true,
    style: { theme: 'TableStyleMedium2', showRowStripes: true },
    columns: colunasExportacao.map(name => ({ name, filterButton: true })),
    rows: dadosExportacao(movs, insumos, fornecedores),
  });
  aba.columns.forEach((col, index) => { col.width = [16, 28, 22, 16, 14, 16, 20, 18, 25, 25, 40, 18, 22, 16][index]; });
  aba.getRow(1).height = 38;
  aba.getRow(1).eachCell(cell => {
    cell.font = { name: 'Aptos', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF174B5A' } };
    cell.alignment = { vertical: 'middle', wrapText: true, indent: 1 };
  });
  aba.eachRow((row, number) => {
    if (number === 1) return;
    const observacao = String(row.getCell(11).value ?? '');
    row.height = Math.min(90, Math.max(28, Math.ceil(observacao.length / 38) * 15 + 10));
    row.eachCell({ includeEmpty: true }, cell => {
      cell.font = { name: 'Aptos', size: 10, color: { argb: 'FF263E48' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: number % 2 === 0 ? 'FFF1F7F7' : 'FFFFFFFF' } };
      cell.alignment = { vertical: 'middle', indent: 1 };
      cell.border = { bottom: { style: 'hair', color: { argb: 'FFE0EBEB' } } };
    });
    for (const n of [7, 8]) row.getCell(n).numFmt = '"R$" #,##0.00;[Red]-"R$" #,##0.00';
    for (const n of [6, 12, 13]) row.getCell(n).numFmt = '#,##0.##';
    for (const n of [6, 7, 8, 12, 13]) row.getCell(n).alignment = { vertical: 'middle', horizontal: 'right', indent: 1 };
    row.getCell(2).font = { name: 'Aptos', size: 10, bold: true, color: { argb: 'FF173B48' } };
    row.getCell(11).alignment = { wrapText: true, vertical: 'middle', indent: 1 };
    const cores: Record<string, [string, string]> = {
      Compra: ['FFFFF1DA', 'FF995A08'], Venda: ['FFDDF5EB', 'FF08734D'], Ajuste: ['FFE8EEFA', 'FF365E9D'],
      OK: ['FFDDF5EB', 'FF08734D'], Baixo: ['FFFFF1DA', 'FF995A08'], Zerado: ['FFFCE6E6', 'FFB42318'],
    };
    for (const n of [5, 14]) {
      const cell = row.getCell(n);
      const cor = cores[String(cell.value ?? '')];
      if (cor) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: cor[0] } };
        cell.font = { name: 'Aptos', size: 10, bold: true, color: { argb: cor[1] } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      }
    }
  });
  return workbook.xlsx.writeBuffer();
}
