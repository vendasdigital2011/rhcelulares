import React, { useState, useMemo } from 'react';
import {
  Calculator,
  X,
  Send,
  Copy,
  Check,
  Percent,
  CreditCard,
  Banknote,
  Repeat,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import type { Device, CardMachineConfig } from '../../types.js';

interface CrmTradeInCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerName?: string;
  customerPhone?: string;
  devices?: Device[];
  cardMachines?: CardMachineConfig[];
  onInsertProposalText: (text: string) => void;
}

// Taxas padrão de maquininhas do segmento caso a loja não tenha cadastrado customizadas
const DEFAULT_CARD_RATES: Record<number, number> = {
  1: 2.89,
  2: 3.80,
  3: 4.50,
  4: 5.20,
  5: 5.90,
  6: 6.60,
  10: 9.40,
  12: 10.80,
  18: 14.50,
  21: 17.20,
};

export const CrmTradeInCalculatorModal: React.FC<CrmTradeInCalculatorModalProps> = ({
  isOpen,
  onClose,
  customerName = 'Cliente',
  customerPhone: _customerPhone = '',
  devices = [],
  cardMachines: _cardMachines = [],
  onInsertProposalText,
}) => {
  // 1. Aparelho desejado
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [customModel, setCustomModel] = useState<string>('iPhone 14 128GB');
  const [devicePrice, setDevicePrice] = useState<number>(3890);

  // 2. Usado na troca (Trade-in)
  const [hasTradeIn, setHasTradeIn] = useState<boolean>(true);
  const [tradeInModel, setTradeInModel] = useState<string>('iPhone 11 64GB');
  const [tradeInBattery, setTradeInBattery] = useState<string>('82');
  const [tradeInCondition, setTradeInCondition] = useState<string>('Bom estado');
  const [tradeInValue, setTradeInValue] = useState<number>(1200);

  // 3. Entrada em dinheiro / Pix
  const [pixEntry, setPixEntry] = useState<number>(500);

  // 4. Modalidade de taxas
  const [passFeeToClient, setPassFeeToClient] = useState<boolean>(true);
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);

  // Lista de aparelhos disponíveis em estoque para seleção rápida
  const inStockDevices = useMemo(() => {
    return devices.filter(d => ['available', 'showcase'].includes(d.status));
  }, [devices]);

  // Quando seleciona um aparelho da vitrine, preenche automaticamente o modelo e preço
  const handleSelectDevice = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    const dev = inStockDevices.find(d => d.id === deviceId);
    if (dev) {
      setCustomModel(`${dev.model} ${dev.storage || ''} ${dev.color || ''}`.trim());
      setDevicePrice(dev.sellPrice || 0);
    }
  };

  // Saldo restante para parcelar
  const balanceToFinance = useMemo(() => {
    const tradeIn = hasTradeIn ? (Number(tradeInValue) || 0) : 0;
    const pix = Number(pixEntry) || 0;
    const price = Number(devicePrice) || 0;
    const balance = price - tradeIn - pix;
    return Math.max(0, balance);
  }, [devicePrice, hasTradeIn, tradeInValue, pixEntry]);

  // Cálculo das parcelas
  const installmentOptions = useMemo(() => {
    const installments = [1, 2, 3, 4, 6, 10, 12, 18, 21];
    const principal = balanceToFinance;

    return installments.map(n => {
      const feeRate = DEFAULT_CARD_RATES[n] || (2.5 + n * 0.7);

      let totalWithFee = principal;
      let installmentValue = 0;

      if (passFeeToClient && principal > 0) {
        // Fórmula de repasse de taxa de maquininha (Stone/InfinitePay)
        // Valor Final = Saldo / (1 - Taxa)
        totalWithFee = principal / (1 - (feeRate / 100));
        installmentValue = totalWithFee / n;
      } else if (principal > 0) {
        totalWithFee = principal;
        installmentValue = principal / n;
      }

      return {
        installments: n,
        feeRate,
        installmentValue,
        totalWithFee,
      };
    });
  }, [balanceToFinance, passFeeToClient]);

  // Gera a mensagem comercial formatada para o WhatsApp
  const proposalMessage = useMemo(() => {
    const lines: string[] = [];
    lines.push(`📱 *PROPOSTA EXCLUSIVA - HIAGO IPHONES* 📱`);
    lines.push(`Olá ${customerName}! Segue a simulação detalhada que preparamos para você:`);
    lines.push(``);
    lines.push(`✨ *Aparelho Desejado:* ${customModel}`);
    lines.push(`💰 *Valor à Vista (Pix):* R$ ${devicePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);

    if (hasTradeIn && tradeInValue > 0) {
      lines.push(`🔄 *Avaliação do seu Usado:* - R$ ${tradeInValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${tradeInModel}${tradeInBattery ? ` • Bateria ${tradeInBattery}%` : ''}${tradeInCondition ? ` • ${tradeInCondition}` : ''})`);
    }

    if (pixEntry > 0) {
      lines.push(`💵 *Entrada em Pix:* - R$ ${pixEntry.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    }

    lines.push(`👉 *Saldo Restante no Cartão:* R$ ${balanceToFinance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    lines.push(``);
    lines.push(`💳 *OPÇÕES DE PARCELAMENTO NO CARTÃO DE CRÉDITO:*`);

    // Destaques de parcelas (1x, 6x, 10x, 12x, 18x)
    const highlightInstallments = [1, 6, 10, 12, 18].map(n => installmentOptions.find(opt => opt.installments === n)).filter(Boolean);

    for (const opt of highlightInstallments) {
      if (!opt) continue;
      lines.push(`▪️ *${opt.installments}x de R$ ${opt.installmentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}* (Total: R$ ${opt.totalWithFee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})`);
    }

    lines.push(``);
    lines.push(`🛡️ *Garantia:* 90 dias de garantia total com nota e suporte.`);
    lines.push(`📦 Aparelho testado em bancada, 100% original e pronto para retirada na loja!`);
    lines.push(``);
    lines.push(`Posso deixar ele reservado para você retirar hoje?`);

    return lines.join('\n');
  }, [customerName, customModel, devicePrice, hasTradeIn, tradeInModel, tradeInBattery, tradeInValue, pixEntry, balanceToFinance, installmentOptions]);

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(proposalMessage);
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 2000);
    } catch (err) {
      console.warn('Erro ao copiar:', err);
    }
  };

  const handleSendToChat = () => {
    onInsertProposalText(proposalMessage);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 120,
        padding: 16,
        backdropFilter: 'blur(2px)',
      }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          width: '100%',
          maxWidth: 860,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
        }}
      >
        {/* CABEÇALHO */}
        <div
          style={{
            padding: '16px 22px',
            borderBottom: '1px solid #E5E7EB',
            backgroundColor: '#F9FAFB',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ backgroundColor: '#DCFCE7', borderRadius: 8, padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calculator size={20} color="#16A34A" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                Calculadora Comercial 1-Click & Trade-in (Épico 06)
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: '2px 0 0 0' }}>
                Simulação de parcelamento de 1x a 21x com abatimento de usado e taxas de máquina de cartão.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#6B7280',
              padding: 4,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* CORPO EM 2 COLUNAS: INPUTS NA ESQUERDA, TABELA E PROPOSTA NA DIREITA */}
        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', overflowY: 'auto', flex: 1 }}>
          {/* COLUNA ESQUERDA: PARÂMETROS */}
          <div style={{ padding: '18px 20px', borderRight: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* SEÇÃO 1: APARELHO DA VITRINE */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#374151', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <ShoppingBag size={14} color="#16A34A" />
                <span>Aparelho Desejado (Vitrine)</span>
              </label>

              {inStockDevices.length > 0 && (
                <select
                  value={selectedDeviceId}
                  onChange={(e) => handleSelectDevice(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 6,
                    border: '1px solid #D1D5DB',
                    fontSize: '0.8125rem',
                    marginBottom: 8,
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <option value="">-- Selecionar do Estoque Real --</option>
                  {inStockDevices.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.model} {d.storage} ({d.color}) - R$ {(d.sellPrice || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </option>
                  ))}
                </select>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px', gap: 8 }}>
                <input
                  type="text"
                  placeholder="Modelo do Aparelho"
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 6,
                    border: '1px solid #D1D5DB',
                    fontSize: '0.8125rem',
                  }}
                />
                <input
                  type="number"
                  placeholder="Preço R$"
                  value={devicePrice}
                  onChange={(e) => setDevicePrice(Number(e.target.value))}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 6,
                    border: '1px solid #D1D5DB',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                  }}
                />
              </div>
            </div>

            {/* SEÇÃO 2: TRADE-IN (ENTRADA DO USADO) */}
            <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#374151', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Repeat size={14} color="#2563EB" />
                  <span>Usado na Troca (Trade-in)</span>
                </label>
                <input
                  type="checkbox"
                  checked={hasTradeIn}
                  onChange={(e) => setHasTradeIn(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
              </div>

              {hasTradeIn && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input
                    type="text"
                    placeholder="Modelo do Usado (ex: iPhone 11 64GB)"
                    value={tradeInModel}
                    onChange={(e) => setTradeInModel(e.target.value)}
                    style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #D1D5DB', fontSize: '0.75rem' }}
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 100px', gap: 6 }}>
                    <div>
                      <span style={{ fontSize: '0.625rem', color: '#6B7280' }}>Bateria:</span>
                      <input
                        type="text"
                        placeholder="82%"
                        value={tradeInBattery}
                        onChange={(e) => setTradeInBattery(e.target.value)}
                        style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #D1D5DB', fontSize: '0.75rem' }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.625rem', color: '#6B7280' }}>Condição:</span>
                      <select
                        value={tradeInCondition}
                        onChange={(e) => setTradeInCondition(e.target.value)}
                        style={{ width: '100%', padding: '6px 6px', borderRadius: 6, border: '1px solid #D1D5DB', fontSize: '0.75rem', backgroundColor: '#FFFFFF' }}
                      >
                        <option value="Impecável">Impecável</option>
                        <option value="Bom estado">Bom estado</option>
                        <option value="Marcas leves">Marcas leves</option>
                        <option value="Tela trocada">Tela trocada</option>
                        <option value="Vidro trincado">Vidro trincado</option>
                      </select>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.625rem', color: '#6B7280' }}>Avaliação R$:</span>
                      <input
                        type="number"
                        placeholder="1200"
                        value={tradeInValue}
                        onChange={(e) => setTradeInValue(Number(e.target.value))}
                        style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #D1D5DB', fontSize: '0.75rem', fontWeight: 700, color: '#15803D' }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SEÇÃO 3: ENTRADA PIX */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#374151', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Banknote size={14} color="#16A34A" />
                <span>Entrada no Pix / Dinheiro (R$)</span>
              </label>
              <input
                type="number"
                placeholder="Ex: 500"
                value={pixEntry}
                onChange={(e) => setPixEntry(Number(e.target.value))}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #D1D5DB', fontSize: '0.8125rem', fontWeight: 700 }}
              />
            </div>

            {/* SEÇÃO 4: REPASSE DE TAXA */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', backgroundColor: '#EFF6FF', borderRadius: 6, border: '1px solid #BFDBFE' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Percent size={14} color="#1D4ED8" />
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1E40AF' }}>Repassar taxas da máquina</span>
              </div>
              <input
                type="checkbox"
                checked={passFeeToClient}
                onChange={(e) => setPassFeeToClient(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
            </div>

            {/* RESUMO DO SALDO */}
            <div style={{ marginTop: 'auto', backgroundColor: '#111827', color: '#FFFFFF', borderRadius: 8, padding: 14 }}>
              <span style={{ fontSize: '0.6875rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Saldo a Financiar no Cartão
              </span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#4ADE80', marginTop: 2 }}>
                R$ {balanceToFinance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA: TABELA DE PARCELAMENTO & TEXTO PROPOSTA */}
          <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14, backgroundColor: '#FAF5FF' }}>
            {/* TABELA DE PARCELAS */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#6B21A8', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CreditCard size={15} color="#7C3AED" />
                  Simulação de Parcelamento (1x a 21x)
                </span>
                <span style={{ fontSize: '0.6875rem', color: '#7C3AED', fontWeight: 600 }}>
                  Taxas Stone / InfinitePay
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8 }}>
                {installmentOptions.slice(0, 8).map(opt => (
                  <div
                    key={opt.installments}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E9D5FF',
                      borderRadius: 6,
                      padding: '8px 10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                    }}
                  >
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#6B21A8' }}>
                      {opt.installments}x de
                    </span>
                    <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#111827' }}>
                      R$ {opt.installmentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span style={{ fontSize: '0.625rem', color: '#6B7280' }}>
                      Total: R$ {opt.totalWithFee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* PREVIEW DA PROPOSTA FORMATADA COM EMOJIS */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#374151', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={13} color="#16A34A" />
                  Texto Formatado para o WhatsApp
                </span>
                <button
                  type="button"
                  onClick={handleCopyToClipboard}
                  style={{
                    border: '1px solid #D1D5DB',
                    backgroundColor: '#FFFFFF',
                    borderRadius: 4,
                    padding: '3px 8px',
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    color: copiedSuccess ? '#15803D' : '#374151',
                  }}
                >
                  {copiedSuccess ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedSuccess ? 'Copiado!' : 'Copiar Texto'}</span>
                </button>
              </div>

              <textarea
                readOnly
                value={proposalMessage}
                rows={9}
                style={{
                  width: '100%',
                  borderRadius: 6,
                  border: '1px solid #D1D5DB',
                  padding: '10px',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  color: '#1F2937',
                  backgroundColor: '#FFFFFF',
                  resize: 'none',
                  lineHeight: 1.4,
                }}
              />
            </div>
          </div>
        </div>

        {/* RODAPÉ DE AÇÕES */}
        <div
          style={{
            padding: '12px 22px',
            borderTop: '1px solid #E5E7EB',
            backgroundColor: '#F9FAFB',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
            Simulando para <strong>{customerName}</strong>
          </span>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: 6,
                border: '1px solid #D1D5DB',
                backgroundColor: '#FFFFFF',
                color: '#374151',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSendToChat}
              style={{
                padding: '8px 20px',
                borderRadius: 6,
                border: 'none',
                backgroundColor: '#16A34A',
                color: '#FFFFFF',
                fontSize: '0.8125rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 2px 4px rgba(22, 163, 74, 0.2)',
              }}
            >
              <Send size={14} />
              <span>Inserir Proposta no WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

