import React, { useState } from 'react';
import { Printer, Send, FileText, AlertTriangle } from 'lucide-react';
import type { Sale, Device } from '../types.js';

interface WarrantyViewProps {
  sales: Sale[];
  devices: Device[];
}

export const WarrantyView: React.FC<WarrantyViewProps> = ({ sales, devices }) => {
  const [selectedSaleId, setSelectedSaleId] = useState<string>(sales[0]?.id || '');
  const [warrantyDays, setWarrantyDays] = useState<number>(90);
  const [customerCpf, setCustomerCpf] = useState<string>('000.000.000-00');
  const [customObservations, setCustomObservations] = useState<string>('Aparelho entregue com película protetora aplicada e testado 100% na bancada.');

  const selectedSale = sales.find(s => s.id === selectedSaleId) || sales[0];

  // Identifica o aparelho da venda
  const soldDeviceItem = selectedSale?.items.find(i => i.type === 'device');
  const matchedDevice = devices.find(d => d.imei === soldDeviceItem?.imei);

  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsApp = () => {
    if (!selectedSale?.customerPhone) return;
    const cleanPhone = selectedSale.customerPhone.replace(/\D/g, '');
    const message = encodeURIComponent(
      `*🛡️ HIAGO iPHONES - TERMO DE GARANTIA E COMPROVANTE*\n\n` +
      `Olá *${selectedSale.customerName}*!\n` +
      `Aqui está o comprovante e os dados da garantia da sua compra realizada na *Hiago iPhones*:\n\n` +
      `📱 *Aparelho:* ${soldDeviceItem?.name || 'iPhone'}\n` +
      `🔢 *IMEI:* ${soldDeviceItem?.imei || 'Registrado em Balcão'}\n` +
      (matchedDevice?.batteryHealth ? `🔋 *Saúde da Bateria na Entrega:* ${matchedDevice.batteryHealth}%\n` : '') +
      `📅 *Data da Compra:* ${selectedSale.date}\n` +
      `⏳ *Prazo de Garantia:* ${warrantyDays} dias\n` +
      `💰 *Valor Total:* R$ ${selectedSale.total.toLocaleString('pt-BR')}\n` +
      `💳 *Forma:* ${selectedSale.paymentMethod}\n\n` +
      `*⚠️ Condições da Garantia:*\n` +
      `- Cobertura para defeitos funcionais de hardware.\n` +
      `- Não cobre: quebra de tela/vidro traseiro, contato com líquidos/umidade ou violação do selo de garantia da loja.\n\n` +
      `Agradecemos pela preferência! Guarde esta mensagem como comprovante oficial.`
    );
    window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank');
  };

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Jurídico & Pós-Venda
            </span>
            <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 12 }}>
              Resguardo Legal CDC
            </span>
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#f8fafc', marginTop: 4 }}>
            Emissão de Termo de Garantia & Comprovante
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
            Emita o termo jurídico completo com cláusulas de resguardo contra alegações indevidas e danos por mau uso.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handleSendWhatsApp}
            style={{
              background: '#25d366',
              color: '#fff',
              border: 'none',
              padding: '10px 16px',
              borderRadius: 8,
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)',
            }}
          >
            <Send size={16} />
            Enviar no WhatsApp
          </button>

          <button
            onClick={handlePrint}
            style={{
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              color: '#fff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: 8,
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 15px rgba(249, 115, 22, 0.4)',
            }}
          >
            <Printer size={16} />
            Imprimir Termo em PDF
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 24, alignItems: 'start' }}>
        {/* COLUNA ESQUERDA: PARÂMETROS DO TERMO */}
        <div className="glass-panel" style={{ padding: 22, borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={16} color="#f97316" />
            Dados da Venda Selecionada
          </h3>

          <div>
            <label style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>Selecione a Venda</label>
            <select
              value={selectedSaleId}
              onChange={(e) => setSelectedSaleId(e.target.value)}
              style={{
                width: '100%',
                background: '#0d121f',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 8,
                padding: '9px 12px',
                color: '#fff',
                fontSize: '0.82rem',
                marginTop: 4,
                outline: 'none',
              }}
            >
              {sales.map((sale) => (
                <option key={sale.id} value={sale.id}>
                  {sale.saleNumber} - {sale.customerName} ({sale.date}) - R$ {sale.total.toLocaleString('pt-BR')}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>Prazo de Garantia</label>
              <select
                value={warrantyDays}
                onChange={(e) => setWarrantyDays(Number(e.target.value))}
                style={{
                  width: '100%',
                  background: '#0d121f',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 8,
                  padding: '9px 12px',
                  color: '#fff',
                  fontSize: '0.82rem',
                  marginTop: 4,
                  outline: 'none',
                }}
              >
                <option value={90}>90 Dias (Legal CDC - Seminovos)</option>
                <option value={180}>180 Dias (6 Meses Balcão)</option>
                <option value={365}>365 Dias (1 Ano - Novo Lacrado)</option>
                <option value={30}>30 Dias (Condicional)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>CPF do Cliente (Opcional)</label>
              <input
                type="text"
                value={customerCpf}
                onChange={(e) => setCustomerCpf(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 8,
                  padding: '8px 12px',
                  color: '#fff',
                  fontSize: '0.82rem',
                  marginTop: 4,
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>Observações do Laudo de Entrega</label>
            <textarea
              rows={3}
              value={customObservations}
              onChange={(e) => setCustomObservations(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 8,
                padding: '8px 12px',
                color: '#fff',
                fontSize: '0.82rem',
                marginTop: 4,
                outline: 'none',
              }}
            />
          </div>

          <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 10, padding: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#ef4444', fontSize: '0.75rem', fontWeight: 700 }}>
              <AlertTriangle size={14} />
              Proteção Jurídica Balcão Phones
            </div>
            <div style={{ fontSize: '0.7rem', color: '#cbd5e1', marginTop: 4, lineHeight: 1.4 }}>
              Este documento estipula formalmente que a loja não se responsabiliza por aparelhos molhados (oxidação), quedas com trincos de display ou carcaça, ou rompimento do selo interno de segurança.
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: DOCUMENTO REAL PARA IMPRESSÃO */}
        <div
          id="print-warranty-target"
          style={{
            background: '#ffffff',
            color: '#111827',
            padding: 30,
            borderRadius: 12,
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.45)',
            border: '1px solid #e5e7eb',
            fontFamily: "'Segoe UI', Roboto, sans-serif",
            fontSize: '0.8rem',
            lineHeight: 1.5,
          }}
        >
          {/* Topo do Documento */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #111827', paddingBottom: 14 }}>
            <div>
              <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#000', letterSpacing: '-0.5px' }}>
                HIAGO iPHONES
              </div>
              <div style={{ fontSize: '0.72rem', color: '#4b5563', fontWeight: 600 }}>
                Comércio e Assistência Especializada Apple • Balcão Phones Pro
              </div>
              <div style={{ fontSize: '0.68rem', color: '#6b7280' }}>
                WhatsApp: (77) 98844-7719 • Loja Física Centro
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#f97316' }}>
                TERMO DE GARANTIA
              </div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#111827' }}>
                Nº {selectedSale?.saleNumber || 'VD-2091'}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#6b7280' }}>
                Emissão: {selectedSale?.date || '12/10/2026'}
              </div>
            </div>
          </div>

          {/* Dados do Cliente e Produto */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, padding: '14px 0', borderBottom: '1px solid #e5e7eb' }}>
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#6b7280', textTransform: 'uppercase' }}>DADOS DO CLIENTE</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#000' }}>{selectedSale?.customerName || 'Consumidor Final'}</div>
              <div style={{ fontSize: '0.75rem', color: '#374151' }}>WhatsApp: {selectedSale?.customerPhone || 'Não informado'}</div>
              <div style={{ fontSize: '0.75rem', color: '#374151' }}>CPF: {customerCpf}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#6b7280', textTransform: 'uppercase' }}>DADOS DO PRODUTO & GARANTIA</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#000' }}>{soldDeviceItem?.name || 'iPhone 11 128GB'}</div>
              <div style={{ fontSize: '0.75rem', color: '#374151' }}>IMEI: <strong>{soldDeviceItem?.imei || '351982739182374'}</strong></div>
              <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 700 }}>
                Prazo de Cobertura: {warrantyDays} dias a contar desta data
              </div>
            </div>
          </div>

          {/* Cláusulas Contratuais */}
          <div style={{ padding: '12px 0', fontSize: '0.72rem', color: '#374151', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontWeight: 800, color: '#000' }}>CLÁUSULAS E CONDIÇÕES DA GARANTIA:</div>
            <div>
              <strong>1. COBERTURA:</strong> A presente garantia cobre exclusivamente defeitos de funcionamento interno de hardware que se manifestem durante o prazo acordado ({warrantyDays} dias).
            </div>
            <div>
              <strong>2. EXCLUSÕES EXPRESSAS (NÃO COBERTOS):</strong> Estão expressamente excluídos da garantia os seguintes casos:
              <br />a) Danos causados por contato com água, suor excessivo, vapor ou qualquer espécie de líquido ou umidade;
              <br />b) Quedas, impactos físicos, trincas na tela touch/display OLED ou vidro traseiro, deformações na carcaça;
              <br />c) Violação, raspagem ou rompimento do selo de segurança interno da loja ou abertura por técnicos de terceiros;
              <br />d) Bloqueios decorrentes de senha pessoal, esquecimento de credenciais Apple ID / iCloud;
              <br />e) Desgaste químico natural de bateria proporcional ao uso comum do consumidor.
            </div>
            <div>
              <strong>3. LAUDO TÉCNICO DE CONFERÊNCIA:</strong> {customObservations}
            </div>
          </div>

          {/* Assinaturas */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30, marginTop: 24, paddingTop: 14, borderTop: '1px solid #e5e7eb' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderBottom: '1px solid #000', marginBottom: 4, height: 26 }}></div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#000' }}>{selectedSale?.customerName || 'Cliente'}</div>
              <div style={{ fontSize: '0.62rem', color: '#6b7280' }}>Assinatura do Comprador</div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ borderBottom: '1px solid #000', marginBottom: 4, height: 26 }}></div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#000' }}>Hiago iPhones</div>
              <div style={{ fontSize: '0.62rem', color: '#6b7280' }}>Visto do Responsável da Loja</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
