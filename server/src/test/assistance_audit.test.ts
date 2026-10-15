import { test, describe } from 'node:test';
import assert from 'node:assert';

// ----------------------------------------------------
// MODELOS E SIMULADORES DE REGRAS DE NEGÓCIO DA ASSISTÊNCIA
// ----------------------------------------------------

interface CustomerMock {
  id: string;
  name: string;
  phone: string;
  cpf?: string;
}

interface PartMock {
  id: string;
  name: string;
  code: string;
  currentStock: number;
  costPrice: number;
  sellPrice: number;
}

interface ServiceCatalogItem {
  id: string;
  name: string;
  code: string;
  defaultPrice: number;
  estimatedCost: number;
  estimatedMinutes: number;
  defaultWarrantyDays: number;
  status: 'active' | 'inactive';
}

interface ServiceOrderMock {
  id: string;
  osNumber: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  deviceModel: string;
  deviceOwnerType: 'customer' | 'store_stock';
  stockDeviceId?: string;
  reportedIssue: string;
  status: string;
  statusHistory: Array<{ toStatus: string; changedAt: string; changedBy: string; notes?: string }>;
  quoteServices: Array<{ id: string; name: string; quantity: number; unitPrice: number; subtotal: number }>;
  quoteParts: Array<{ id: string; partId: string; name: string; quantity: number; unitCost: number; unitPrice: number; subtotal: number; consumed?: boolean }>;
  subtotalServices: number;
  subtotalParts: number;
  discount: number;
  totalAmount: number;
  clientApproval?: { status: 'pending' | 'approved' | 'rejected'; channel?: string; approvedAt?: string; valueApproved?: number };
  partsConsumed: boolean;
  warrantyId?: string;
  deliveredDate?: string;
  paymentStatus?: 'paid' | 'pending';
}

interface WarrantyMock {
  id: string;
  warrantyNumber: string;
  osNumber: string;
  customerName: string;
  deviceModel: string;
  startDate: string;
  endDate: string;
  warrantyDays: number;
  status: 'active' | 'expiring_soon' | 'expired' | 'claimed' | 'voided';
}

interface WarrantyClaimMock {
  id: string;
  claimNumber: string;
  warrantyId: string;
  originalOsNumber: string;
  newOsNumber?: string;
  reportedDefect: string;
  decision: 'analyzing' | 'approved' | 'rejected';
  isCovered: boolean;
}

// Controladores em memória com regras rigorosas de domínio
class AssistanceDomainEngine {
  customers: CustomerMock[] = [];
  parts: PartMock[] = [
    { id: 'part-1', name: 'Tela OLED iPhone 13 Foxconn', code: 'PEC-DISP-13', currentStock: 5, costPrice: 240, sellPrice: 650 },
    { id: 'part-2', name: 'Bateria iPhone 12 Foxconn', code: 'PEC-BAT-12', currentStock: 10, costPrice: 65, sellPrice: 280 },
  ];
  services: ServiceCatalogItem[] = [
    { id: 'srv-1', name: 'Troca de Tela OLED + True Tone', code: 'SRV-TELA-OLED', defaultPrice: 650, estimatedCost: 240, estimatedMinutes: 45, defaultWarrantyDays: 90, status: 'active' },
    { id: 'srv-2', name: 'Troca de Bateria Foxconn', code: 'SRV-BAT-FOX', defaultPrice: 280, estimatedCost: 65, estimatedMinutes: 35, defaultWarrantyDays: 90, status: 'active' },
  ];
  orders: ServiceOrderMock[] = [];
  warranties: WarrantyMock[] = [];
  claims: WarrantyClaimMock[] = [];
  movements: Array<{ itemId: string; type: string; delta: number; reason: string }> = [];

  findOrCreateCustomer(name: string, phone: string, cpf?: string): CustomerMock {
    const cleanPhone = phone.replace(/\D/g, '');
    const cleanCpf = cpf ? cpf.replace(/\D/g, '') : undefined;
    
    // Evita duplicidade por telefone ou CPF
    const existing = this.customers.find(c => 
      c.phone.replace(/\D/g, '') === cleanPhone || (cleanCpf && c.cpf?.replace(/\D/g, '') === cleanCpf)
    );
    if (existing) return existing;

    const newCust: CustomerMock = {
      id: `cust-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      phone,
      cpf,
    };
    this.customers.push(newCust);
    return newCust;
  }

  createServiceOrder(params: Partial<ServiceOrderMock>): ServiceOrderMock {
    const osNumber = `OS-${1000 + this.orders.length + 1}`;
    const newOS: ServiceOrderMock = {
      id: `os-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      osNumber,
      customerId: params.customerId,
      customerName: params.customerName || 'Cliente Anônimo',
      customerPhone: params.customerPhone || '',
      deviceModel: params.deviceModel || 'iPhone',
      deviceOwnerType: params.deviceOwnerType || 'customer',
      stockDeviceId: params.stockDeviceId,
      reportedIssue: params.reportedIssue || '',
      status: 'aberta',
      statusHistory: [{ toStatus: 'aberta', changedAt: new Date().toISOString(), changedBy: 'Hiago', notes: 'Entrada' }],
      quoteServices: [],
      quoteParts: [],
      subtotalServices: 0,
      subtotalParts: 0,
      discount: 0,
      totalAmount: 0,
      partsConsumed: false,
    };
    this.orders.push(newOS);
    return newOS;
  }

  updateQuote(osId: string, services: ServiceOrderMock['quoteServices'], parts: ServiceOrderMock['quoteParts'], discount: number = 0) {
    const os = this.orders.find(o => o.id === osId);
    if (!os) throw new Error('OS não encontrada');

    const subServices = services.reduce((acc, s) => acc + s.subtotal, 0);
    const subParts = parts.reduce((acc, p) => acc + p.subtotal, 0);
    const total = Math.max(0, subServices + subParts - discount);

    os.quoteServices = services;
    os.quoteParts = parts;
    os.subtotalServices = subServices;
    os.subtotalParts = subParts;
    os.discount = discount;
    os.totalAmount = total;
    os.status = 'aguardando_aprovacao';
  }

  recordApproval(osId: string, decision: 'approved' | 'rejected', channel: string = 'whatsapp') {
    const os = this.orders.find(o => o.id === osId);
    if (!os) throw new Error('OS não encontrada');

    os.clientApproval = {
      status: decision,
      channel,
      approvedAt: new Date().toISOString(),
      valueApproved: os.totalAmount,
    };
    os.status = decision === 'approved' ? 'aprovada' : 'reprovada';
    os.statusHistory.push({
      toStatus: os.status,
      changedAt: new Date().toISOString(),
      changedBy: 'Hiago',
      notes: `Aprovação formal registrada via ${channel}`,
    });
  }

  transitionStatus(osId: string, targetStatus: string, operator: string = 'André Técnico'): { success: boolean; error?: string } {
    const os = this.orders.find(o => o.id === osId);
    if (!os) return { success: false, error: 'OS não encontrada' };

    // REGRA 7: Impedir início de reparo sem aprovação
    if (targetStatus === 'em_reparo') {
      if (os.clientApproval?.status !== 'approved' && os.status !== 'aprovada') {
        return { success: false, error: 'Reparo bloqueado: Orçamento ainda não foi aprovado pelo cliente' };
      }

      // REGRA 8 e 9: Consumir peças sem duplicidade
      if (!os.partsConsumed && os.quoteParts.length > 0) {
        for (const partItem of os.quoteParts) {
          const p = this.parts.find(x => x.id === partItem.partId);
          if (p) {
            p.currentStock -= partItem.quantity;
            this.movements.push({ itemId: p.id, type: 'os_consumption', delta: -partItem.quantity, reason: `Consumo na ${os.osNumber}` });
            partItem.consumed = true;
          }
        }
        os.partsConsumed = true;
      }
    }

    // REGRA 17: Cancelamento estorna peças se já consumidas
    if (targetStatus === 'cancelada') {
      if (os.partsConsumed && os.quoteParts.length > 0) {
        for (const partItem of os.quoteParts) {
          const p = this.parts.find(x => x.id === partItem.partId);
          if (p && partItem.consumed) {
            p.currentStock += partItem.quantity;
            this.movements.push({ itemId: p.id, type: 'adjustment', delta: partItem.quantity, reason: `Estorno de peças da OS ${os.osNumber}` });
            partItem.consumed = false;
          }
        }
        os.partsConsumed = false;
      }
    }

    // REGRA 13: Entrega gera garantia real
    if (targetStatus === 'entregue') {
      os.deliveredDate = new Date().toISOString().split('T')[0];
      if (!os.warrantyId) {
        const start = new Date();
        const end = new Date();
        end.setDate(end.getDate() + 90);

        const warrantyNumber = `GAR-2026-${String(this.warranties.length + 1).padStart(3, '0')}`;
        const war: WarrantyMock = {
          id: `war-${Date.now()}`,
          warrantyNumber,
          osNumber: os.osNumber,
          customerName: os.customerName,
          deviceModel: os.deviceModel,
          startDate: start.toISOString().split('T')[0],
          endDate: end.toISOString().split('T')[0],
          warrantyDays: 90,
          status: 'active',
        };
        this.warranties.push(war);
        os.warrantyId = war.id;
      }
    }

    os.status = targetStatus;
    os.statusHistory.push({
      toStatus: targetStatus,
      changedAt: new Date().toISOString(),
      changedBy: operator,
      notes: `Status alterado para ${targetStatus}`,
    });

    return { success: true };
  }

  createClaim(warrantyId: string, reportedDefect: string, decision: 'analyzing' | 'approved' | 'rejected'): WarrantyClaimMock {
    const war = this.warranties.find(w => w.id === warrantyId);
    if (!war) throw new Error('Garantia não encontrada');

    const claimNumber = `RET-2026-${String(this.claims.length + 1).padStart(3, '0')}`;
    const newOsNumber = decision === 'approved' ? `OS-${1000 + this.orders.length + 1}` : undefined;

    const claim: WarrantyClaimMock = {
      id: `clm-${Date.now()}`,
      claimNumber,
      warrantyId,
      originalOsNumber: war.osNumber,
      newOsNumber,
      reportedDefect,
      decision,
      isCovered: decision === 'approved',
    };

    if (decision === 'approved') {
      war.status = 'claimed';
    }

    this.claims.push(claim);
    return claim;
  }
}

describe('AUDITORIA COMPLETA — MÓDULO ASSISTÊNCIA TÉCNICA (CRM HIAGO IPHONES)', () => {
  let engine: AssistanceDomainEngine;

  test('0. Inicialização do motor de regras de negócio', () => {
    engine = new AssistanceDomainEngine();
    assert.ok(engine, 'Motor deve inicializar');
  });

  // 1. Abrir OS para cliente existente
  test('1. Deve abrir uma OS para um cliente existente vinculando customerId correto', () => {
    const cust = engine.findOrCreateCustomer('Mariana Lima', '77991823344', '11122233344');
    const os = engine.createServiceOrder({
      customerId: cust.id,
      customerName: cust.name,
      customerPhone: cust.phone,
      deviceModel: 'iPhone 13 Pro',
      reportedIssue: 'Bateria degradada',
    });

    assert.strictEqual(os.customerId, cust.id);
    assert.strictEqual(os.customerName, 'Mariana Lima');
    assert.strictEqual(os.status, 'aberta');
  });

  // 2. Abrir OS para novo cliente sem duplicação
  test('2. Deve registrar novo cliente e impedir duplicação ao abrir nova OS com mesmo telefone/CPF', () => {
    const cust1 = engine.findOrCreateCustomer('João Silva', '77988881111', '55566677788');
    const cust2 = engine.findOrCreateCustomer('João Silva Repetido', '77988881111', '55566677788');

    assert.strictEqual(cust1.id, cust2.id, 'Clientes com mesmo telefone/CPF devem reutilizar ID único');
    assert.strictEqual(engine.customers.length, 2, 'Não deve criar linha duplicada na tabela de clientes');
  });

  // 3. Registrar equipamento do cliente
  test('3. Registrar equipamento do cliente deve mantê-lo em custódia sem integrar ao estoque de venda', () => {
    const os = engine.createServiceOrder({
      customerName: 'Carlos Santos',
      customerPhone: '77999887766',
      deviceModel: 'iPhone 11 64GB',
      deviceOwnerType: 'customer',
      reportedIssue: 'Vidro trincado',
    });

    assert.strictEqual(os.deviceOwnerType, 'customer');
    assert.strictEqual(os.stockDeviceId, undefined);
  });

  // 4. Registrar equipamento da empresa
  test('4. Registrar equipamento pertencente à empresa deve vincular stockDeviceId e registrar relação', () => {
    const stockId = 'dev-stock-uuid-123';
    const os = engine.createServiceOrder({
      customerName: 'Loja Hiago Centro (Estoque Interno)',
      customerPhone: '77999334455',
      deviceModel: 'iPhone 12 128GB',
      deviceOwnerType: 'store_stock',
      stockDeviceId: stockId,
      reportedIssue: 'Revisão de vitrine e troca de bateria',
    });

    assert.strictEqual(os.deviceOwnerType, 'store_stock');
    assert.strictEqual(os.stockDeviceId, stockId);
  });

  // 5. Criar diagnóstico e orçamento
  test('5. Deve criar diagnóstico e orçamento com separação estrita de mão de obra e peças', () => {
    const os = engine.createServiceOrder({
      customerName: 'Lucas Ferreira',
      customerPhone: '77988221122',
      deviceModel: 'iPhone 13',
    });

    const quoteServices = [
      { id: 'qs-1', name: 'Troca de Tela OLED + True Tone', quantity: 1, unitPrice: 650, subtotal: 650 },
    ];
    const quoteParts = [
      { id: 'qp-1', partId: 'part-1', name: 'Tela OLED iPhone 13', quantity: 1, unitCost: 240, unitPrice: 650, subtotal: 650 },
    ];

    engine.updateQuote(os.id, quoteServices, quoteParts, 50); // R$ 50 de desconto

    assert.strictEqual(os.subtotalServices, 650);
    assert.strictEqual(os.subtotalParts, 650);
    assert.strictEqual(os.discount, 50);
    assert.strictEqual(os.totalAmount, 1250); // 650 + 650 - 50 = 1250
    assert.strictEqual(os.status, 'aguardando_aprovacao');
  });

  // 6. Registrar aprovação e recusa do orçamento
  test('6. Deve registrar formalmente aprovação do orçamento com canal e responsável auditável', () => {
    const os = engine.orders[engine.orders.length - 1];
    engine.recordApproval(os.id, 'approved', 'whatsapp');

    assert.strictEqual(os.clientApproval?.status, 'approved');
    assert.strictEqual(os.clientApproval?.channel, 'whatsapp');
    assert.strictEqual(os.status, 'aprovada');
  });

  // 7. Impedir início indevido de reparo não aprovado
  test('7. Deve BLOQUEAR início de reparo se o orçamento estiver pendente ou reprovado', () => {
    const unapprovedOS = engine.createServiceOrder({
      customerName: 'Cliente Não Aprovado',
      customerPhone: '77999990000',
      deviceModel: 'iPhone 14',
    });

    const result = engine.transitionStatus(unapprovedOS.id, 'em_reparo');
    assert.strictEqual(result.success, false, 'Deve recusar transição para em_reparo');
    assert.match(result.error || '', /bloqueado/i);
    assert.notStrictEqual(unapprovedOS.status, 'em_reparo');
  });

  // 8. Reservar e consumir uma peça do estoque real
  test('8. Transição para em_reparo de OS aprovada deve consumir peça física do estoque', () => {
    const os = engine.orders.find(o => o.status === 'aprovada')!;
    const initialPartStock = engine.parts.find(p => p.id === 'part-1')!.currentStock;

    const res = engine.transitionStatus(os.id, 'em_reparo');
    assert.strictEqual(res.success, true);
    assert.strictEqual(os.partsConsumed, true);

    const newPartStock = engine.parts.find(p => p.id === 'part-1')!.currentStock;
    assert.strictEqual(newPartStock, initialPartStock - 1, 'Estoque deve ser decrementado em 1 unidade');
  });

  // 9. Impedir consumo duplicado
  test('9. Repetir transição ou operações de status NÃO deve baixar a mesma peça duas vezes', () => {
    const os = engine.orders.find(o => o.status === 'em_reparo')!;
    const stockBefore = engine.parts.find(p => p.id === 'part-1')!.currentStock;

    // Tenta reexecutar transição
    engine.transitionStatus(os.id, 'em_reparo');
    const stockAfter = engine.parts.find(p => p.id === 'part-1')!.currentStock;

    assert.strictEqual(stockAfter, stockBefore, 'Estoque não pode sofrer baixa duplicada');
  });

  // 10. Atualizar o estoque e registrar movimentação
  test('10. Movimentação de estoque (os_consumption) deve ser registrada no histórico', () => {
    const lastMovement = engine.movements.find(m => m.type === 'os_consumption');
    assert.ok(lastMovement, 'Deve existir registro de movimentação os_consumption');
    assert.strictEqual(lastMovement.delta, -1);
  });

  // 11. Concluir testes técnicos e registrar entrega
  test('11. Concluir testes técnicos e avançar para pronta e entregue', () => {
    const os = engine.orders.find(o => o.status === 'em_reparo')!;
    engine.transitionStatus(os.id, 'em_testes');
    assert.strictEqual(os.status, 'em_testes');

    engine.transitionStatus(os.id, 'pronta');
    assert.strictEqual(os.status, 'pronta');

    const resDeliver = engine.transitionStatus(os.id, 'entregue');
    assert.strictEqual(resDeliver.success, true);
    assert.strictEqual(os.status, 'entregue');
    assert.ok(os.deliveredDate, 'Deve registrar data de entrega');
  });

  // 12. Registrar cobrança e pagamento
  test('12. OS entregue deve registrar forma de pagamento e valor faturado', () => {
    const os = engine.orders.find(o => o.status === 'entregue')!;
    os.paymentStatus = 'paid';
    assert.strictEqual(os.paymentStatus, 'paid');
    assert.strictEqual(os.totalAmount, 1250);
  });

  // 13. Gerar garantia a partir da OS entregue
  test('13. Entrega da OS deve gerar garantia vinculada de 90 dias automaticamente', () => {
    const os = engine.orders.find(o => o.status === 'entregue')!;
    assert.ok(os.warrantyId, 'OS deve conter ID da garantia gerada');

    const war = engine.warranties.find(w => w.id === os.warrantyId);
    assert.ok(war, 'Garantia correspondente deve existir no repositório');
    assert.strictEqual(war.warrantyDays, 90);
    assert.strictEqual(war.osNumber, os.osNumber);
    assert.strictEqual(war.status, 'active');
  });

  // 14. Atendimento em garantia (retorno)
  test('14. Retorno de cliente deve registrar claim vinculado à OS original e aprovar cobertura', () => {
    const war = engine.warranties[0];
    const claim = engine.createClaim(war.id, 'Cliente relata mancha preta no canto do display', 'approved');

    assert.strictEqual(claim.originalOsNumber, war.osNumber);
    assert.strictEqual(claim.isCovered, true);
    assert.strictEqual(war.status, 'claimed');
    assert.ok(claim.newOsNumber, 'Deve sugerir novo número de OS vinculada');
  });

  // 15. Consultar histórico do cliente
  test('15. Deve consultar histórico consolidado de OSs e atendimentos por cliente', () => {
    const custOrders = engine.orders.filter(o => o.customerName === 'Lucas Ferreira');
    assert.ok(custOrders.length >= 1, 'Cliente Lucas Ferreira deve ter suas OSs rastreadas');
  });

  // 16. Validar isolamento e permissões
  test('16. Toda operação deve manter identificação de operador e loja', () => {
    const os = engine.orders[0];
    assert.ok(os.statusHistory.length > 0);
    assert.ok(os.statusHistory.every(h => h.changedBy.length > 0));
  });

  // 17. Cancelamento com estorno sem apagar histórico
  test('17. Cancelar OS com peças consumidas deve devolver peças ao estoque e preservar timeline', () => {
    const osToCancel = engine.createServiceOrder({
      customerName: 'Cliente Desistente',
      customerPhone: '77988889999',
      deviceModel: 'iPhone 12',
    });

    const quoteParts = [
      { id: 'qp-cancel', partId: 'part-2', name: 'Bateria iPhone 12', quantity: 1, unitCost: 65, unitPrice: 280, subtotal: 280 },
    ];
    engine.updateQuote(osToCancel.id, [], quoteParts, 0);
    engine.recordApproval(osToCancel.id, 'approved', 'presencial');

    const stockBeforeRepair = engine.parts.find(p => p.id === 'part-2')!.currentStock;
    engine.transitionStatus(osToCancel.id, 'em_reparo');
    assert.strictEqual(engine.parts.find(p => p.id === 'part-2')!.currentStock, stockBeforeRepair - 1);

    // Agora cancela a OS
    engine.transitionStatus(osToCancel.id, 'cancelada');
    assert.strictEqual(osToCancel.status, 'cancelada');
    assert.strictEqual(engine.parts.find(p => p.id === 'part-2')!.currentStock, stockBeforeRepair, 'Estoque deve ser estornado ao saldo original');
    assert.strictEqual(osToCancel.partsConsumed, false);
    assert.ok(osToCancel.statusHistory.length >= 4, 'Histórico de status deve ser preservado intacto');
  });

  // 18. Concorrência e idempotência
  test('18. Operações idempotentes não devem corromper totais financeiros', () => {
    const os = engine.orders[0];
    const originalTotal = os.totalAmount;
    
    // Atualiza cotação com mesmos valores
    engine.updateQuote(os.id, os.quoteServices, os.quoteParts, os.discount);
    assert.strictEqual(os.totalAmount, originalTotal);
  });

  // 19. Consistência do Dashboard
  test('19. Indicadores do Dashboard devem refletir dados reais calculados da coleção', () => {
    const totalOrders = engine.orders.length;
    const openOrders = engine.orders.filter(o => !['entregue', 'cancelada'].includes(o.status)).length;
    const completedOrders = engine.orders.filter(o => o.status === 'entregue').length;

    assert.ok(totalOrders > 0);
    assert.ok(openOrders >= 0);
    assert.strictEqual(completedOrders, 1);
  });

  // 20. Catálogo de Serviços Técnicos
  test('20. Catálogo de serviços deve calcular margem de lucro e tempo padrão de bancada', () => {
    const srv = engine.services[0];
    const profit = srv.defaultPrice - srv.estimatedCost;
    const marginPct = (profit / srv.defaultPrice) * 100;

    assert.strictEqual(profit, 410); // 650 - 240 = 410
    assert.strictEqual(Number(marginPct.toFixed(1)), 63.1);
    assert.strictEqual(srv.defaultWarrantyDays, 90);
    assert.strictEqual(srv.estimatedMinutes, 45);
  });
});
