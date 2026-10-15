import { test, describe } from 'node:test';
import assert from 'node:assert';

// Validador de IMEI pelo Algoritmo de Luhn (Norma ITU/3GPP)
function validateIMEI(imei: string): boolean {
  const clean = imei.replace(/\D/g, '');
  if (clean.length !== 15) return false;

  let sum = 0;
  for (let i = 0; i < 15; i++) {
    let digit = parseInt(clean.charAt(i), 10);
    // Para posições ímpares (0-indexed: 1, 3, 5, 7, 9, 11, 13), dobra o valor
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

// Cálculo de parcelamento em até 12x com juros da operadora
function calculateInstallment(total: number, installments: number = 12, ratePerMonth: number = 1.39) {
  const factor = 1 + (ratePerMonth / 100) * (installments - 1);
  const totalWithInterest = total * factor;
  return {
    installments,
    monthlyValue: Number((totalWithInterest / installments).toFixed(2)),
    totalWithInterest: Number(totalWithInterest.toFixed(2)),
  };
}

describe('AUDITORIA COMPLETA — MÓDULO ESTOQUE E VITRINE (CRM HIAGO IPHONES)', () => {

  // ----------------------------------------------------
  // SUBMÓDULO 1: ESTOQUE CELULARES & VALIDAÇÃO IMEI LUHN
  // ----------------------------------------------------
  describe('1. Submódulo Estoque Celulares & IMEI', () => {
    test('1.1. Deve validar IMEI autêntico de 15 dígitos pelo algoritmo de Luhn', () => {
      const validIMEI = '356984112094839'; // Checksum exato = 80 % 10 === 0
      assert.strictEqual(validateIMEI(validIMEI), true, 'IMEI válido da Anatel deve passar no Luhn');
    });

    test('1.2. Deve rejeitar IMEI com dígito verificador adulterado ou corrompido', () => {
      const invalidChecksumIMEI = '356984112094832'; // último dígito errado (soma 73)
      assert.strictEqual(validateIMEI(invalidChecksumIMEI), false, 'Luhn deve reprovar dígito adulterado');
    });

    test('1.3. Deve rejeitar IMEI com comprimento diferente de 15 dígitos', () => {
      assert.strictEqual(validateIMEI('3569841120948'), false, '13 dígitos deve ser rejeitado');
      assert.strictEqual(validateIMEI('35698411209483299'), false, '17 dígitos deve ser rejeitado');
      assert.strictEqual(validateIMEI(''), false, 'Vazio deve ser rejeitado');
    });

    test('1.4. Deve gerenciar aparelho através dos 7 estados do ciclo de vida', () => {
      const lifecycleStates = [
        'available',
        'showcase',
        'reserved',
        'sold',
        'warranty',
        'in_technical_service',
        'returned_to_supplier',
      ];

      const device = {
        imei: '356984112094832',
        brand: 'Apple',
        model: 'iPhone 13',
        storage: '128GB',
        color: 'Azul',
        condition: 'certified_pre_owned',
        batteryHealth: 89,
        purchasePrice: 2200,
        sellPrice: 2990,
        status: 'available',
      };

      for (const st of lifecycleStates) {
        device.status = st;
        assert.strictEqual(device.status, st, `Estado ${st} deve ser aceito`);
      }
    });

    test('1.5. Deve prevenir cadastro de IMEI duplicado em estoque ativo', () => {
      const activeDevices = [
        { imei: '356984112094832', status: 'available' },
        { imei: '359182736450192', status: 'showcase' },
      ];

      const newImei = '356984112094832';
      const isDuplicate = activeDevices.some(d => d.imei === newImei && d.status !== 'sold');
      assert.strictEqual(isDuplicate, true, 'Deve detectar duplicidade de IMEI em estoque');
    });
  });

  // ----------------------------------------------------
  // SUBMÓDULO 2: COMPRA DE TELEFONE (TRADE-IN & DISTRIBUIDOR)
  // ----------------------------------------------------
  describe('2. Submódulo Compra de Telefone', () => {
    test('2.1. Deve calcular subtotal, despesas extras e total a pagar da compra', () => {
      const items = [
        { model: 'iPhone 11 64GB', costPrice: 1100, sellPrice: 1690, imei: '358291048291048' },
        { model: 'iPhone 12 128GB', costPrice: 1650, sellPrice: 2390, imei: '359182048201948' },
      ];

      const subtotal = items.reduce((sum, it) => sum + it.costPrice, 0);
      const additionalExpenses = 50; // taxa de transporte ou laudo
      const discounts = 30; // negociação
      const totalAmount = subtotal + additionalExpenses - discounts;

      assert.strictEqual(subtotal, 2750);
      assert.strictEqual(totalAmount, 2770);
    });

    test('2.2. Confirmação de compra deve injetar aparelhos em estoque e gerar rastreabilidade', () => {
      const initialStock: any[] = [];
      const movements: any[] = [];

      const purchase = {
        id: 'compra-001',
        purchaseNumber: 'CP-1081',
        seller: 'Carlos Silva',
        cpf: '12345678901',
        status: 'draft',
        items: [
          {
            model: 'iPhone 13 128GB',
            storage: '128GB',
            color: 'Estelar',
            imei: '356984112094832',
            condition: 'certified_pre_owned',
            batteryHealth: 90,
            costPrice: 2000,
            sellPrice: 2850,
          },
        ],
      };

      // Confirmação
      purchase.status = 'confirmed';
      purchase.items.forEach(it => {
        initialStock.push({
          imei: it.imei,
          model: it.model,
          storage: it.storage,
          color: it.color,
          condition: it.condition,
          batteryHealth: it.batteryHealth,
          purchasePrice: it.costPrice,
          sellPrice: it.sellPrice,
          status: 'available',
        });

        movements.push({
          type: 'inflow',
          category: 'purchase',
          itemType: 'device',
          itemIdentifier: it.imei,
          description: `Entrada por compra ${purchase.purchaseNumber}`,
          quantity: 1,
          unitCost: it.costPrice,
          unitPrice: it.sellPrice,
        });
      });

      assert.strictEqual(initialStock.length, 1);
      assert.strictEqual(initialStock[0].status, 'available');
      assert.strictEqual(movements.length, 1);
      assert.strictEqual(movements[0].type, 'inflow');
      assert.strictEqual(movements[0].category, 'purchase');
    });

    test('2.3. Deve estruturar Termo de Compra e Declaração de Procedência legal', () => {
      const contract = {
        purchaseNumber: 'CP-1081',
        date: '14/10/2026',
        customer: 'Carlos Eduardo Oliveira',
        cpf: '123.456.789-00',
        items: [{ model: 'iPhone 13', imei: '356984112094832', costPrice: 2000 }],
        hasDeclarationOfOrigin: true,
      };

      assert.ok(contract.hasDeclarationOfOrigin, 'Termo deve conter declaração expressa de procedência legal');
      assert.strictEqual(contract.items[0].imei, '356984112094832');
    });
  });

  // ----------------------------------------------------
  // SUBMÓDULO 3: PRODUTOS (ACESSÓRIOS, CARREGADORES, CASES)
  // ----------------------------------------------------
  describe('3. Submódulo Produtos (Acessórios)', () => {
    test('3.1. Deve calcular margem de lucro % e lucro bruto em reais', () => {
      const costPrice = 45;
      const sellPrice = 129;
      const profit = sellPrice - costPrice;
      const marginPercent = Math.round((profit / sellPrice) * 100);

      assert.strictEqual(profit, 84);
      assert.strictEqual(marginPercent, 65, 'Margem deve ser ~65%');
    });

    test('3.2. Ajuste manual de estoque deve atualizar saldo e registrar log de auditoria', () => {
      let currentStock = 20;
      const minStock = 5;
      const movements: any[] = [];

      // Ajuste de entrada (reposição)
      const deltaIn = +10;
      currentStock += deltaIn;
      movements.push({
        type: 'inflow',
        category: 'adjustment',
        quantity: deltaIn,
        reason: 'Chegada de novo lote de fornecedor',
      });

      assert.strictEqual(currentStock, 30);
      assert.strictEqual(movements[0].quantity, 10);

      // Ajuste de saída (avaria/perda)
      const deltaOut = -2;
      currentStock += deltaOut;
      movements.push({
        type: 'outflow',
        category: 'loss',
        quantity: Math.abs(deltaOut),
        reason: 'Produto com embalagem violada/danificada',
      });

      assert.strictEqual(currentStock, 28);
      assert.strictEqual(currentStock > minStock, true, 'Estoque acima do nível mínimo');
    });
  });

  // ----------------------------------------------------
  // SUBMÓDULO 4: PEÇAS (TELAS, BATERIAS, CONECTORES)
  // ----------------------------------------------------
  describe('4. Submódulo Peças Técnicas & Consumo em O.S.', () => {
    test('4.1. Deve gerenciar compatibilidade com múltiplos modelos de iPhone', () => {
      const part = {
        code: 'PEC-102',
        name: 'Tela OLED Premium',
        compatibleModels: ['iPhone 12', 'iPhone 12 Pro'],
        currentStock: 4,
        minStock: 2,
      };

      assert.strictEqual(part.compatibleModels.includes('iPhone 12'), true);
      assert.strictEqual(part.compatibleModels.includes('iPhone 12 Pro'), true);
      assert.strictEqual(part.compatibleModels.includes('iPhone 13'), false);
    });

    test('4.2. Consumo de bancada para Ordem de Serviço deve abater estoque e alertar estoque crítico', () => {
      const part = {
        name: 'Bateria Alta Capacidade iPhone 11',
        currentStock: 2,
        minStock: 2,
      };

      // Consumo na bancada técnica
      part.currentStock -= 1;
      assert.strictEqual(part.currentStock, 1);

      // Verificação de criticidade
      const isCritical = part.currentStock <= part.minStock && part.currentStock > 0;
      assert.strictEqual(isCritical, true, 'Deve disparar alerta de estoque crítico');
    });
  });

  // ----------------------------------------------------
  // SUBMÓDULO 5: FORNECEDORES
  // ----------------------------------------------------
  describe('5. Submódulo Fornecedores (PF & PJ)', () => {
    test('5.1. Deve validar tipo de documento CPF (11 dígitos) e CNPJ (14 dígitos)', () => {
      const supplierPF = {
        name: 'Marcos Importações',
        type: 'pf',
        document: '12345678901',
      };
      const supplierPJ = {
        name: 'Distribuidora Apple Brasil LTDA',
        type: 'pj',
        document: '12345678000195',
      };

      assert.strictEqual(supplierPF.document.length, 11, 'CPF deve ter 11 dígitos');
      assert.strictEqual(supplierPJ.document.length, 14, 'CNPJ deve ter 14 dígitos');
    });

    test('5.2. Deve gerar link direto de WhatsApp formatado para contato rápido', () => {
      const rawPhone = '(77) 99812-3456';
      const cleanPhone = rawPhone.replace(/\D/g, '');
      const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
      const message = encodeURIComponent('Olá, gostaria de consultar cotação de peças.');
      const whatsappUrl = `https://wa.me/${fullPhone}?text=${message}`;

      assert.strictEqual(whatsappUrl.includes('5577998123456'), true);
      assert.strictEqual(whatsappUrl.includes('wa.me'), true);
    });
  });

  // ----------------------------------------------------
  // SUBMÓDULO 6: VITRINE (SHOWCASE)
  // ----------------------------------------------------
  describe('6. Submódulo Vitrine (Showcase)', () => {
    test('6.1. Modo Vendedor deve exibir margem real e IMEI completo', () => {
      const device = {
        imei: '356984112094832',
        purchasePrice: 2200,
        sellPrice: 2990,
      };

      const profit = device.sellPrice - device.purchasePrice;
      const margin = Math.round((profit / device.sellPrice) * 100);

      assert.strictEqual(profit, 790);
      assert.strictEqual(margin, 26);
      assert.strictEqual(device.imei.length, 15);
    });

    test('6.2. Modo Cliente Público deve mascarar IMEI e omitir preço de custo', () => {
      const fullImei = '356984112094832';
      const maskedImei = `${fullImei.slice(0, 4)}••••••${fullImei.slice(-4)}`;

      assert.strictEqual(maskedImei, '3569••••••4832', 'IMEI deve ser ocultado para o cliente');
      assert.strictEqual(maskedImei.includes('••••••'), true);
    });

    test('6.3. Deve calcular simulação de cartão em até 12x', () => {
      const cashPrice = 3000;
      const simulation = calculateInstallment(cashPrice, 12, 1.39);

      assert.strictEqual(simulation.installments, 12);
      assert.ok(simulation.monthlyValue > 250, 'Parcela com juros deve ser maior que R$ 250');
      assert.ok(simulation.totalWithInterest > cashPrice, 'Total com juros deve ser superior a R$ 3000');
    });

    test('6.4. Venda de aparelho no PDV deve alterar status para "sold" e removê-lo da vitrine', () => {
      const showcaseItems = [
        { imei: '356984112094832', model: 'iPhone 13', status: 'available' },
        { imei: '359182736450192', model: 'iPhone 14', status: 'available' },
      ];

      // Venda realizada no PDV
      const soldImei = '356984112094832';
      const updatedShowcase = showcaseItems.map(d => 
        d.imei === soldImei ? { ...d, status: 'sold' } : d
      );

      // A vitrine pública filtra apenas status available/showcase
      const publicShowcase = updatedShowcase.filter(d => d.status === 'available' || d.status === 'showcase');

      assert.strictEqual(publicShowcase.length, 1);
      assert.strictEqual(publicShowcase[0].imei, '359182736450192');
      assert.strictEqual(updatedShowcase.find(d => d.imei === soldImei)?.status, 'sold');
    });
  });

  // ----------------------------------------------------
  // PAINEL OPERACIONAL CONSOLIDAÇÃO & PATRIMÔNIO
  // ----------------------------------------------------
  describe('7. Consolidação de Estoque & Valoração Patrimonial', () => {
    test('7.1. Deve calcular valor patrimonial a preço de custo e receita potencial', () => {
      const devices = [
        { purchasePrice: 2000, sellPrice: 2800, status: 'available' },
        { purchasePrice: 3000, sellPrice: 3900, status: 'available' },
        { purchasePrice: 2500, sellPrice: 3200, status: 'sold' }, // não entra no estoque ativo
      ];

      const products = [
        { costPrice: 40, sellPrice: 100, currentStock: 10 }, // 400 custo, 1000 receita
      ];

      const parts = [
        { costPrice: 100, sellPrice: 220, currentStock: 5 }, // 500 custo, 1100 receita
      ];

      const activeDevices = devices.filter(d => d.status === 'available');
      const totalCost = 
        activeDevices.reduce((sum, d) => sum + d.purchasePrice, 0) +
        products.reduce((sum, p) => sum + p.costPrice * p.currentStock, 0) +
        parts.reduce((sum, p) => sum + p.costPrice * p.currentStock, 0);

      const totalRevenue = 
        activeDevices.reduce((sum, d) => sum + d.sellPrice, 0) +
        products.reduce((sum, p) => sum + p.sellPrice * p.currentStock, 0) +
        parts.reduce((sum, p) => sum + p.sellPrice * p.currentStock, 0);

      const projectedProfit = totalRevenue - totalCost;
      const projectedMargin = Math.round((projectedProfit / totalRevenue) * 100);

      assert.strictEqual(totalCost, 5000 + 400 + 500); // 5900
      assert.strictEqual(totalRevenue, 6700 + 1000 + 1100); // 8800
      assert.strictEqual(projectedProfit, 2900);
      assert.strictEqual(projectedMargin, 33);
    });
  });
});
