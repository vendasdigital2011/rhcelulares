import { describe, it } from 'node:test';
import assert from 'node:assert';
import { WhatsAppLifecycleRulesService } from '../modules/whatsapp/whatsapp-rules.service.js';
import { WhatsAppReferralService } from '../modules/whatsapp/whatsapp-referral.service.js';

describe('Épico 09: Motor de Réguas Automáticas Plug & Play', () => {
  it('deve listar as 4 réguas canônicas (D+0, D+15, D+180, D+360)', () => {
    const rules = WhatsAppLifecycleRulesService.getRules();
    assert.strictEqual(rules.length, 4, 'Deveria conter exatamente 4 réguas de ciclo de vida');

    const codes = rules.map(r => r.code);
    assert.ok(codes.includes('d0_warranty'), 'Deve ter régua D+0');
    assert.ok(codes.includes('d15_accessories'), 'Deve ter régua D+15');
    assert.ok(codes.includes('d180_battery_checkup'), 'Deve ter régua D+180');
    assert.ok(codes.includes('d360_upgrade'), 'Deve ter régua D+360');
  });

  it('deve alternar status da régua entre ativa e pausada', () => {
    const initialRule = WhatsAppLifecycleRulesService.getRules()[0];
    const initialActive = initialRule.active;

    const toggled = WhatsAppLifecycleRulesService.toggleRule(initialRule.id);
    assert.strictEqual(toggled?.active, !initialActive, 'Status deve ter sido invertido');

    // Reverte
    WhatsAppLifecycleRulesService.toggleRule(initialRule.id);
  });

  it('deve disparar régua em lote para os clientes elegíveis com substituição de tags', async () => {
    const rule = WhatsAppLifecycleRulesService.getRules().find(r => r.code === 'd0_warranty');
    assert.ok(rule);

    const initialExecuted = rule.executedCount;
    const result = await WhatsAppLifecycleRulesService.triggerBatch(rule.id, 'Hiago Teste');

    assert.strictEqual(result.success, true);
    assert.ok(result.dispatchedCount > 0, 'Deve ter disparado para clientes elegíveis');
    assert.ok(rule.executedCount >= initialExecuted + result.dispatchedCount);
    assert.ok(result.details.length === rule.eligibleClients.length);
  });
});

describe('Épico 10: Indicação Lite no WhatsApp (Member-Get-Member) & Dashboard ROI', () => {
  it('deve gerar código e link de indicação exclusivos para o cliente', () => {
    const amb = WhatsAppReferralService.generateReferral(
      'Guilherme Silveira',
      '(77) 99888-1122',
      'iPhone 15 Pro Max 256GB Titânio Natural'
    );

    assert.ok(amb.referralCode.startsWith('HIAGO-GUILHERME'));
    assert.ok(amb.referralLink.includes(amb.referralCode));
    assert.strictEqual(amb.friendsConverted, 0);
  });

  it('deve enviar convite de embaixador via WhatsApp Cloud com formatação de recompensa', async () => {
    const ambassadors = WhatsAppReferralService.getAmbassadors();
    const first = ambassadors[0];

    const result = await WhatsAppReferralService.sendReferralInvite(first.id, 'Rodrigo Hiago');
    assert.strictEqual(result.success, true);
    assert.ok(result.messageId, 'Deve conter messageId da Meta');
  });

  it('deve calcular métricas executivas de ROI com multiplicador positivo', () => {
    const roi = WhatsAppReferralService.getExecutiveRoiMetrics();

    assert.ok(roi.totalRevenueRecovered > 0, 'Faturamento recuperado deve ser positivo');
    assert.ok(roi.softwareCostMonthly > 0, 'Custo do software deve ser fixado');
    assert.ok(roi.roiMultiplier > 10, 'Multiplicador de ROI do sistema deve ser expressivo (>10x)');
    assert.ok(roi.salesFromAutomationsCount > 0);
    assert.ok(roi.salesFromReferralsCount > 0);
  });
});

