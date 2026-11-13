import React, { useState, useMemo, useEffect } from 'react';
import {
  CheckCircle2,
  X,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import type { Device, Sale } from '../../types.js';
import { SaleRepository } from '../../repositories/saleRepository.js';

interface CrmCompleteSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerName?: string;
  customerPhone?: string;
  leadId?: string;
  devices?: Device[];
  sellerName?: string;
  onSaleCompleted?: (sale: Sale) => void;
}

export const CrmCompleteSaleModal: React.FC<CrmCompleteSaleModalProps> = ({
  isOpen,
  onClose,
  customerName: initialName = '',
  customerPhone: initialPhone = '',
  devices = [],
  sellerName = 'Lucas Vendedor',
  onSaleCompleted,
}) => {
  const [customerName, setCustomerName] = useState(initialName);
  const [customerPhone, setCustomerPhone] = useState(initialPhone);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  // Sincroniza dados com abertura do modal ou troca de lead
  useEffect(() => {
    if (isOpen) {
      setCustomerName(initialName);
      setCustomerPhone(initialPhone);
      setCompletedSale(null);
      setError(null);
    }
  }, [isOpen, initialName, initialPhone]);

  // Dados do aparelho selecionado
  const [customModel, setCustomModel] = useState('');
  const [customImei, setCustomImei] = useState('');
  const [customPrice, setCustomPrice] = useState<number>(3890);
  const [batteryHealth, setBatteryHealth] = useState<number>(90);

  // Composição financeira
  const [pixDownPayment, setPixDownPayment] = useState<number>(0);
  const [hasTradeIn, setHasTradeIn] = useState<boolean>(false);
  const [tradeInModel, setTradeInModel] = useState<string>('');
  const [tradeInImei, setTradeInImei] = useState<string>('');
  const [tradeInBattery, setTradeInBattery] = useState<number>(82);
  const [tradeInValue, setTradeInValue] = useState<number>(0);

  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card' | 'cash' | 'mixed'>('credit_card');
  const [installments, setInstallments] = useState<number>(12);

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);

  // Aparelhos disponíveis em estoque
  const availableDevices = useMemo(() => {
    return devices.filter(d => ['available', 'showcase'].includes(d.status));
  }, [devices]);

  // Atualiza campos ao selecionar aparelho do estoque
  const handleSelectDevice = (devId: string) => {
    setSelectedDeviceId(devId);
    const found = availableDevices.find(d => d.id === devId);
    if (found) {
      setCustomModel(`${found.model} ${found.storage} ${found.color}`);
      setCustomImei(found.imei || '');
      setCustomPrice(found.sellPrice || 3890);
      setBatteryHealth(found.batteryHealth || 90);
    }
  };

  // Cálculo de saldo e parcelas
  const totalDeduction = pixDownPayment + (hasTradeIn ? tradeInValue : 0);
  const remainingToFinance = Math.max(0, customPrice - totalDeduction);

  const calculatedInstallmentValue = useMemo(() => {
    if (remainingToFinance <= 0) return 0;
    // Taxa média maquininha: 1x = 1.99%, 12x = 11.5%, 18x = 15.5%
    let feePercent = 0.05;
    if (installments === 1) feePercent = 0.0199;
    else if (installments <= 6) feePercent = 0.065;
    else if (installments <= 12) feePercent = 0.115;
    else if (installments <= 18) feePercent = 0.155;
    else feePercent = 0.185;

    const totalWithFee = remainingToFinance * (1 + feePercent);
    return totalWithFee / installments;
  }, [remainingToFinance, installments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customModel || !customImei) {
      setError('Por favor preencha Nome, Modelo do iPhone e IMEI.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const saleNumber = `VD-${Date.now().toString().slice(-6)}`;
      const newSale: Sale = {
        id: `sale-${Date.now()}`,
        saleNumber,
        customerName,
        customerPhone,
        sellerName,
        date: new Date().toLocaleDateString('pt-BR'),
        subtotal: customPrice,
        discount: 0,
        total: customPrice,
        paymentMethod: paymentMethod === 'mixed' ? 'credit_card' : paymentMethod,
        installments: paymentMethod === 'credit_card' || paymentMethod === 'mixed' ? installments : 1,
        status: 'completed',
        items: [
          {
            id: selectedDeviceId || `dev-${Date.now()}`,
            type: 'device',
            name: customModel,
            price: customPrice,
            quantity: 1,
            imei: customImei,
          },
        ],
        tradeIn: hasTradeIn && tradeInModel ? {
          model: tradeInModel,
          imei: tradeInImei,
          batteryHealth: tradeInBattery,
          evaluatedValue: tradeInValue,
        } : undefined,
      };

      // 1. Grava no banco e dá baixa no estoque do IMEI
      const result = await SaleRepository.create(newSale);
      if (!result.success) {
        throw new Error(result.error || 'Falha ao registrar venda');
      }

      // 2. Dispara gatilho da régua D+0 no backend oficial (Termo de Garantia)
      try {
        await fetch('/api/whatsapp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: customerPhone,
            message: `Olá ${customerName.split(' ')[0]}! Parabéns pelo seu novo ${customModel}! 📱✨\n\n` +
              `Segue a confirmação da sua compra (Venda #${saleNumber}).\n` +
              `Seu Termo de Garantia Legal de 90 dias da Hiago iPhones está ativo a partir de hoje.\n` +
              `Aparelho 100% revisado, testado e higienizado antes da entrega.\n\n` +
              `Qualquer dúvida com backup ou uso, conte conosco!`,
            senderName: sellerName,
          }),
        });
      } catch {
        // Ignora fallback se dev
      }

      setCompletedSale(newSale);
      if (onSaleCompleted) {
        onSaleCompleted(newSale);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao concluir venda');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(5, 8, 16, 0.85)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1400,
      padding: 16,
    }}>
      <div style={{
        background: '#1E293B',
        border: '1px solid #334155',
        borderRadius: 14,
        padding: 24,
        maxWidth: 640,
        width: '100%',
        maxHeight: '92vh',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
      }}>
        {/* Topo Modal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              backgroundColor: 'rgba(22, 163, 74, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#22C55E'
            }}>
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#F8FAFC', margin: 0 }}>
                Concluir Venda & Emitir Garantia (Épico 07)
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#94A3B8', margin: '2px 0 0 0' }}>
                Ficha ultrarrápida (&lt; 30s): baixa imediata de IMEI e ativação da régua D+0 no WhatsApp.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 4 }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Sucesso / Venda Concluída */}
        {completedSale ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: 24,
            gap: 16,
            backgroundColor: '#0F172A',
            borderRadius: 10,
            border: '1px solid #10B981',
          }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10B981',
            }}>
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34D399', margin: 0 }}>
                Venda #{completedSale.saleNumber} Concluída com Sucesso!
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#94A3B8', marginTop: 4 }}>
                O IMEI <strong style={{ color: '#F8FAFC' }}>{customImei}</strong> foi baixado do estoque e o Termo de Garantia de 90 dias (D+0) foi emitido.
              </p>
            </div>

            <div style={{
              backgroundColor: '#1E293B',
              padding: 14,
              borderRadius: 8,
              width: '100%',
              textAlign: 'left',
              fontSize: '0.8125rem',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8' }}>
                <span>Cliente:</span>
                <strong style={{ color: '#F8FAFC' }}>{completedSale.customerName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8' }}>
                <span>Aparelho Entregue:</span>
                <span style={{ color: '#F97316', fontWeight: 600 }}>{customModel} (🔋 {batteryHealth}%)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8' }}>
                <span>Valor Total:</span>
                <strong style={{ color: '#34D399' }}>R$ {completedSale.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
              </div>
              {hasTradeIn && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8' }}>
                  <span>Usado na Troca:</span>
                  <span style={{ color: '#38BDF8' }}>{tradeInModel} (- R$ {tradeInValue.toFixed(2)})</span>
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              style={{
                width: '100%',
                padding: '10px 16px',
                borderRadius: 8,
                border: 'none',
                backgroundColor: '#16A34A',
                color: '#FFFFFF',
                fontSize: '0.875rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Concluir & Voltar ao Kanban
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Erro */}
            {error && (
              <div style={{
                padding: '10px 14px',
                borderRadius: 6,
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid #EF4444',
                color: '#F87171',
                fontSize: '0.8125rem',
              }}>
                {error}
              </div>
            )}

            {/* Linha 1: Cliente & Telefone */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', marginBottom: 4 }}>Nome do Cliente *</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do cliente"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    backgroundColor: '#0F172A',
                    border: '1px solid #334155',
                    color: '#F8FAFC',
                    fontSize: '0.875rem',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', marginBottom: 4 }}>WhatsApp / Telefone *</label>
                <input
                  type="text"
                  required
                  placeholder="(77) 9XXXX-XXXX"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    backgroundColor: '#0F172A',
                    border: '1px solid #334155',
                    color: '#F8FAFC',
                    fontSize: '0.875rem',
                  }}
                />
              </div>
            </div>

            {/* Linha 2: Seleção de Aparelho do Estoque */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <label style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Puxar Aparelho do Estoque Físico ({availableDevices.length} disponíveis)</label>
              </div>
              <select
                value={selectedDeviceId}
                onChange={(e) => handleSelectDevice(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 6,
                  backgroundColor: '#0F172A',
                  border: '1px solid #334155',
                  color: '#F8FAFC',
                  fontSize: '0.875rem',
                }}
              >
                <option value="">-- Selecione ou digite manualmente abaixo --</option>
                {availableDevices.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.model} {d.storage} {d.color} • IMEI: {d.imei} • 🔋 {d.batteryHealth ? `${d.batteryHealth}%` : 'Selado'} • R$ {d.sellPrice}
                  </option>
                ))}
              </select>
            </div>

            {/* Linha 3: Modelo, IMEI, Preço e Bateria */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', marginBottom: 4 }}>Modelo do iPhone *</label>
                <input
                  type="text"
                  required
                  placeholder="iPhone 14 128GB Azul"
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    backgroundColor: '#0F172A',
                    border: '1px solid #334155',
                    color: '#F8FAFC',
                    fontSize: '0.875rem',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', marginBottom: 4 }}>IMEI Oficial *</label>
                <input
                  type="text"
                  required
                  placeholder="356984112..."
                  value={customImei}
                  onChange={(e) => setCustomImei(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    backgroundColor: '#0F172A',
                    border: '1px solid #334155',
                    color: '#F8FAFC',
                    fontSize: '0.875rem',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', marginBottom: 4 }}>Preço (R$) *</label>
                <input
                  type="number"
                  required
                  value={customPrice}
                  onChange={(e) => setCustomPrice(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    backgroundColor: '#0F172A',
                    border: '1px solid #334155',
                    color: '#34D399',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', marginBottom: 4 }}>Bateria (%)</label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={batteryHealth}
                  onChange={(e) => setBatteryHealth(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    backgroundColor: '#0F172A',
                    border: '1px solid #334155',
                    color: '#38BDF8',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                  }}
                />
              </div>
            </div>

            {/* Linha 4: Entrada Pix & Checkbox Trade-in */}
            <div style={{
              backgroundColor: '#0F172A',
              padding: 14,
              borderRadius: 8,
              border: '1px solid #334155',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', marginBottom: 4 }}>Entrada em Pix / Dinheiro (R$)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0.00"
                    value={pixDownPayment || ''}
                    onChange={(e) => setPixDownPayment(Number(e.target.value) || 0)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 6,
                      backgroundColor: '#1E293B',
                      border: '1px solid #334155',
                      color: '#F8FAFC',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', paddingTop: 18 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.8125rem', color: '#F8FAFC' }}>
                    <input
                      type="checkbox"
                      checked={hasTradeIn}
                      onChange={(e) => setHasTradeIn(e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: '#F97316' }}
                    />
                    <span>Abater Usado na Troca (Trade-in)?</span>
                  </label>
                </div>
              </div>

              {/* Campos de Trade-in condicional */}
              {hasTradeIn && (
                <div style={{
                  padding: 12,
                  backgroundColor: '#1E293B',
                  borderRadius: 6,
                  border: '1px solid #F97316',
                  display: 'grid',
                  gridTemplateColumns: '2fr 1.2fr 0.8fr 1fr',
                  gap: 10,
                }}>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'block', marginBottom: 4 }}>Modelo do Usado</label>
                    <input
                      type="text"
                      placeholder="Ex: iPhone 11 64GB Preto"
                      value={tradeInModel}
                      onChange={(e) => setTradeInModel(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: 4,
                        backgroundColor: '#0F172A',
                        border: '1px solid #334155',
                        color: '#F8FAFC',
                        fontSize: '0.8125rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'block', marginBottom: 4 }}>IMEI do Usado</label>
                    <input
                      type="text"
                      placeholder="3589..."
                      value={tradeInImei}
                      onChange={(e) => setTradeInImei(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: 4,
                        backgroundColor: '#0F172A',
                        border: '1px solid #334155',
                        color: '#F8FAFC',
                        fontSize: '0.8125rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'block', marginBottom: 4 }}>Bateria (%)</label>
                    <input
                      type="number"
                      min="40"
                      max="100"
                      value={tradeInBattery}
                      onChange={(e) => setTradeInBattery(Number(e.target.value) || 80)}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: 4,
                        backgroundColor: '#0F172A',
                        border: '1px solid #334155',
                        color: '#F8FAFC',
                        fontSize: '0.8125rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'block', marginBottom: 4 }}>Valor Avaliado (R$)</label>
                    <input
                      type="number"
                      placeholder="1200"
                      value={tradeInValue || ''}
                      onChange={(e) => setTradeInValue(Number(e.target.value) || 0)}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: 4,
                        backgroundColor: '#0F172A',
                        border: '1px solid #334155',
                        color: '#F97316',
                        fontWeight: 700,
                        fontSize: '0.8125rem',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Linha 5: Forma de Pagamento & Saldo */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              backgroundColor: '#0F172A',
              padding: 14,
              borderRadius: 8,
              border: '1px solid #334155',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Forma de Liquidação do Saldo:</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {(['credit_card', 'pix', 'cash', 'mixed'] as const).map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 4,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        border: paymentMethod === method ? '1px solid #38BDF8' : '1px solid #334155',
                        backgroundColor: paymentMethod === method ? '#0284C7' : '#1E293B',
                        color: '#FFFFFF',
                        cursor: 'pointer',
                      }}
                    >
                      {method === 'credit_card' ? 'Cartão de Crédito' : method === 'pix' ? 'Pix Total' : method === 'cash' ? 'Dinheiro' : 'Misto'}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: 8,
                borderTop: '1px solid #1E293B',
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Saldo a Parcelar no Cartão:</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#F8FAFC' }}>
                    R$ {remainingToFinance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                {remainingToFinance > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div>
                      <label style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'block', marginBottom: 2 }}>Parcelas</label>
                      <select
                        value={installments}
                        onChange={(e) => setInstallments(Number(e.target.value))}
                        style={{
                          padding: '6px 10px',
                          borderRadius: 6,
                          backgroundColor: '#1E293B',
                          border: '1px solid #334155',
                          color: '#38BDF8',
                          fontWeight: 700,
                          fontSize: '0.8125rem',
                        }}
                      >
                        {[1, 2, 3, 4, 6, 8, 10, 12, 18, 21].map(n => (
                          <option key={n} value={n}>{n}x</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Valor da Parcela:</span>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#34D399' }}>
                        {installments}x de R$ {calculatedInstallmentValue.toFixed(2)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Banner Garantia 90 Dias Ativa */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: 'rgba(52, 211, 153, 0.1)',
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid rgba(52, 211, 153, 0.3)',
              fontSize: '0.8125rem',
              color: '#34D399',
            }}>
              <ShieldCheck size={18} />
              <span>Garantia Legal de 90 dias com Termo D+0 emitido automaticamente via WhatsApp.</span>
            </div>

            {/* Ações */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                style={{
                  padding: '10px 18px',
                  borderRadius: 8,
                  border: '1px solid #475569',
                  backgroundColor: 'transparent',
                  color: '#94A3B8',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 20px',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: isSubmitting ? '#475569' : '#16A34A',
                  color: '#FFFFFF',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Concluindo Venda...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    <span>Confirmar Venda & Emitir Garantia (&lt; 30s)</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
