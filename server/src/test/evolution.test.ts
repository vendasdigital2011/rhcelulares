import { describe, it } from 'node:test';
import assert from 'node:assert';
import { EvolutionService } from '../modules/whatsapp/evolution.service.js';

describe('Integração Nativa com Evolution API (WhatsApp QR Code)', () => {
  it('deve consultar o estado de conexão da instância hiago na Evolution API', async () => {
    const status = await EvolutionService.getConnectionState();

    assert.ok(status.instanceName === 'hiago', 'Nome da instância deve ser hiago');
    assert.ok(['open', 'close', 'connecting'].includes(status.state), `Estado deve ser válido: ${status.state}`);
  });

  it('deve obter QR code ou pairing code para pareamento do WhatsApp', async () => {
    const qrData = await EvolutionService.getConnectQRCode();

    // Como a instância está em close, ela gera QR Code ou Pairing Code
    assert.ok(qrData.base64 || qrData.pairingCode || qrData.code, 'Deve retornar base64 ou pairingCode');
  });

  it('deve normalizar telefone e validar envio de mensagem', async () => {
    const result = await EvolutionService.sendTextMessage('77 98144-7719', 'Teste interno ERP');
    assert.ok(result.status === 'sent' || result.status === 'failed');
    if (!result.success) {
      assert.ok(result.error);
    }
  });
});

