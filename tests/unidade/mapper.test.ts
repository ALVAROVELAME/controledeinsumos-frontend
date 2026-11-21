import { describe, expect, it } from 'vitest';
import { sanitizarLista, sanitizarTarefa, paraCriarRequest, paraAtualizarRequest } from '../../src/mappers/tarefa.mapper';

describe('conversão de tarefas', () => {
  it('filtra dados inválidos e normaliza enums e datas recebidos da API', () => {
    const tarefas = sanitizarLista([null, { titulo: '  ' }, { id: 4, titulo: '  Comprar  ', status: 'Em Progresso', prioridade: 'ALTA', prazo: '2026-11-20T12:00:00', pomodoros: 2.9 }]);
    expect(tarefas).toHaveLength(1);
    expect(tarefas[0]).toMatchObject({ id: '4', titulo: 'Comprar', status: 'em_progresso', prioridade: 'alta', prazo: '2026-11-20', pomodoros: 2 });
  });
  it('aplica valores seguros para dados ausentes e limites', () => {
    expect(sanitizarTarefa({ titulo: 'Tarefa', status: 99, prioridade: 99, prazo: 'inválido', pomodorosPlanejados: 50 })).toMatchObject({ status: 'a_fazer', prioridade: 'media', prazo: undefined, pomodorosPlanejados: 20 });
  });
  it('separa o payload de criação do payload de atualização', () => {
    const tarefa = { titulo: 'Teste', prioridade: 'alta' as const, status: 'a_fazer' as const, pomodoros: 3 };
    expect(paraCriarRequest(tarefa)).toMatchObject({ titulo: 'Teste', descricao: null, prazo: null, pomodoros: 3 });
    expect(paraAtualizarRequest(tarefa)).not.toHaveProperty('pomodoros');
  });
});
