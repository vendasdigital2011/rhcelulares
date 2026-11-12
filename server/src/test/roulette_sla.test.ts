import test from 'node:test';
import assert from 'node:assert/strict';

interface Attendant {
  name: string;
  department: string;
  available: boolean;
  lastAssignedAt: number;
  assignedCount: number;
}

function selectRoundRobinAttendant(attendants: Attendant[], department: string): Attendant {
  const available = attendants.filter(a => a.department === department && a.available);
  if (available.length === 0) {
    throw new Error('Nenhum atendente disponível');
  }

  // Ordena por quem recebeu lead há mais tempo (menor lastAssignedAt)
  available.sort((a, b) => a.lastAssignedAt - b.lastAssignedAt);
  const chosen = available[0];

  chosen.lastAssignedAt = Date.now();
  chosen.assignedCount += 1;
  return chosen;
}

function evaluateSLA(minutesWaiting: number, isResolved: boolean): {
  level: 'ok' | 'warning' | 'danger';
  label: string;
} {
  if (isResolved) {
    return { level: 'ok', label: 'Concluído' };
  }
  if (minutesWaiting < 2) {
    return { level: 'ok', label: 'SLA < 2m' };
  }
  if (minutesWaiting <= 5) {
    return { level: 'warning', label: 'SLA ~3m' };
  }
  return { level: 'danger', label: 'SLA > 5m' };
}

test('1. Roleta Round-Robin deve alternar leads entre vendedores de forma equilibrada', () => {
  const team: Attendant[] = [
    { name: 'Lucas Rodrigues', department: 'vendas', available: true, lastAssignedAt: 10, assignedCount: 0 },
    { name: 'Hiago Vendas', department: 'vendas', available: true, lastAssignedAt: 20, assignedCount: 0 },
    { name: 'Camila Fernandes', department: 'vendas', available: true, lastAssignedAt: 30, assignedCount: 0 },
  ];

  // 1º lead deve ir para Lucas (menor lastAssignedAt = 10)
  const lead1 = selectRoundRobinAttendant(team, 'vendas');
  assert.equal(lead1.name, 'Lucas Rodrigues');

  // 2º lead deve ir para Hiago (menor lastAssignedAt = 20)
  const lead2 = selectRoundRobinAttendant(team, 'vendas');
  assert.equal(lead2.name, 'Hiago Vendas');

  // 3º lead deve ir para Camila (menor lastAssignedAt = 30)
  const lead3 = selectRoundRobinAttendant(team, 'vendas');
  assert.equal(lead3.name, 'Camila Fernandes');

  // 4º lead deve voltar para Lucas
  const lead4 = selectRoundRobinAttendant(team, 'vendas');
  assert.equal(lead4.name, 'Lucas Rodrigues');
  assert.equal(team.find(t => t.name === 'Lucas Rodrigues')?.assignedCount, 2);
});

test('2. Roleta deve respeitar operadores pausados / indisponíveis', () => {
  const team: Attendant[] = [
    { name: 'Lucas Rodrigues', department: 'vendas', available: false, lastAssignedAt: 0, assignedCount: 0 }, // Em pausa
    { name: 'Hiago Vendas', department: 'vendas', available: true, lastAssignedAt: 10, assignedCount: 0 },
  ];

  const lead = selectRoundRobinAttendant(team, 'vendas');
  assert.equal(lead.name, 'Hiago Vendas', 'Não deve atribuir para vendedor indisponível');
});

test('3. Classificação de faixas de SLA visual (Verde < 2m, Amarelo 2-5m, Vermelho > 5m)', () => {
  assert.equal(evaluateSLA(1, false).level, 'ok');
  assert.equal(evaluateSLA(3.5, false).level, 'warning');
  assert.equal(evaluateSLA(7, false).level, 'danger');
  assert.equal(evaluateSLA(15, true).level, 'ok', 'Resolvido deve ter status ok');
});

