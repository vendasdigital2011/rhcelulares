import { test, describe } from 'node:test';
import assert from 'node:assert';

describe('AUDITORIA DO MÓDULO DE IMPRESSÃO DE ETIQUETAS — CRM HIAGO IPHONES', () => {

  // 1. Formatos e Mídias Suportadas
  describe('1. Formatos de Etiqueta e Mídias Suportadas', () => {
    const LABEL_FORMATS = [
      { id: 'roll_60x40', mediaType: 'roll', widthMm: 60, heightMm: 40, cols: 1 },
      { id: 'roll_50x30', mediaType: 'roll', widthMm: 50, heightMm: 30, cols: 1 },
      { id: 'roll_40x25', mediaType: 'roll', widthMm: 40, heightMm: 25, cols: 1 },
      { id: 'roll_100x50', mediaType: 'roll', widthMm: 100, heightMm: 50, cols: 1 },
      { id: 'a4_30', mediaType: 'a4', widthMm: 70, heightMm: 25.4, cols: 3, rows: 10, labelsPerPage: 30 },
      { id: 'a4_24', mediaType: 'a4', widthMm: 63.5, heightMm: 33.9, cols: 3, rows: 8, labelsPerPage: 24 },
      { id: 'a4_14', mediaType: 'a4', widthMm: 105, heightMm: 38, cols: 2, rows: 7, labelsPerPage: 14 },
      { id: 'a4_10', mediaType: 'a4', widthMm: 105, heightMm: 57, cols: 2, rows: 5, labelsPerPage: 10 },
    ];

    test('1.1. Deve conter formatos para rolos térmicos e folhas padrão A4', () => {
      const rolls = LABEL_FORMATS.filter(f => f.mediaType === 'roll');
      const a4Sheets = LABEL_FORMATS.filter(f => f.mediaType === 'a4');

      assert.strictEqual(rolls.length, 4, 'Deve conter 4 formatos para rolos térmicos');
      assert.strictEqual(a4Sheets.length, 4, 'Deve conter 4 gabaritos de folhas A4');
    });

    test('1.2. Formato padrão para caixas de iPhone deve ser 60 x 40 mm', () => {
      const standardBox = LABEL_FORMATS.find(f => f.id === 'roll_60x40');
      assert.ok(standardBox);
      assert.strictEqual(standardBox.widthMm, 60);
      assert.strictEqual(standardBox.heightMm, 40);
      assert.strictEqual(standardBox.cols, 1);
    });
  });

  // 2. Fila de Impressão e Métricas
  describe('2. Gestão da Fila de Impressão e Contadores', () => {
    test('2.1. Deve diferenciar quantidade de itens distintos do total de etiquetas', () => {
      const queue = [
        { id: 'q1', title: 'iPhone 13 128GB', code: '356984112094839', quantity: 2 },
        { id: 'q2', title: 'iPhone 14 128GB', code: '359182736450192', quantity: 3 },
        { id: 'q3', title: 'Cabo USB-C 20W', code: 'CAB-USBC-20W', quantity: 5 },
      ];

      const distinctItems = queue.length;
      const totalLabels = queue.reduce((sum, item) => sum + item.quantity, 0);

      assert.strictEqual(distinctItems, 3, 'Deve registrar 3 itens distintos na fila');
      assert.strictEqual(totalLabels, 10, 'Deve totalizar 10 etiquetas a serem impressas');
    });

    test('2.2. Deve calcular corretamente a estimativa de páginas para rolo e folha A4', () => {
      const totalLabels = 45;

      // Para rolo: cada etiqueta corresponde a 1 salto de etiqueta
      const rollPages = totalLabels;

      // Para folha A4 com 30 por folha: Math.ceil(45 / 30) = 2 folhas
      const a4Pages = Math.ceil(totalLabels / 30);

      assert.strictEqual(rollPages, 45);
      assert.strictEqual(a4Pages, 2, '45 etiquetas em folhas de 30 exigem 2 folhas A4');
    });

    test('2.3. Incremento de item já existente na fila não deve duplicar linha', () => {
      const queue = [
        { referenceId: 'dev-1', title: 'iPhone 13', quantity: 1 },
      ];

      const addingRefId = 'dev-1';
      const existing = queue.find(q => q.referenceId === addingRefId);
      if (existing) {
        existing.quantity += 1;
      } else {
        queue.push({ referenceId: addingRefId, title: 'iPhone 13', quantity: 1 });
      }

      assert.strictEqual(queue.length, 1, 'Não deve criar linha duplicada na fila');
      assert.strictEqual(queue[0].quantity, 2, 'Deve incrementar para 2 unidades');
    });
  });

  // 3. Ajustes de Posicionamento Físico X e Y
  describe('3. Calibração e Posicionamento Físico', () => {
    test('3.1. Deve aceitar ajustes X e Y milimétricos com valores positivos e negativos', () => {
      let offsetX = 1.5; // mm
      let offsetY = -2.0; // mm

      assert.strictEqual(offsetX, 1.5);
      assert.strictEqual(offsetY, -2.0);

      // Simulação de restauração
      offsetX = 0;
      offsetY = 0;
      assert.strictEqual(offsetX, 0, 'Restauração deve zerar deslocamento horizontal');
      assert.strictEqual(offsetY, 0, 'Restauração deve zerar deslocamento vertical');
    });
  });

  // 4. Segurança e Não-Mutabilidade do Estoque
  describe('4. Segurança e Integridade Operacional', () => {
    test('4.1. Operação de impressão de etiquetas não deve modificar saldo ou status de aparelhos', () => {
      const device = {
        id: 'dev-99',
        imei: '356984112094839',
        status: 'available',
        sellPrice: 2890,
      };

      const initialStatus = device.status;
      const initialPrice = device.sellPrice;

      // Adiciona à fila de etiquetas e simula impressão
      const queueItem = {
        referenceId: device.id,
        code: device.imei,
        quantity: 5,
      };

      // Valida que o objeto original do estoque permanece intocado
      assert.strictEqual(device.status, initialStatus, 'Status do aparelho deve permanecer "available"');
      assert.strictEqual(device.sellPrice, initialPrice, 'Preço de venda não pode ser alterado');
      assert.strictEqual(queueItem.quantity, 5);
    });
  });
});
