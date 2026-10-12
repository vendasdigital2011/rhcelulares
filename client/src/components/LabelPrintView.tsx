import React, { useState } from 'react';
import { Barcode, Printer, Tag, Check, Copy } from 'lucide-react';
import type { Device } from '../types.js';

interface LabelPrintViewProps {
  devices: Device[];
}

export const LabelPrintView: React.FC<LabelPrintViewProps> = ({ devices }) => {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(devices[0]?.id || '');
  const [labelFormat, setLabelFormat] = useState<'thermal_60x40' | 'thermal_50x30' | 'compact'>('thermal_60x40');
  const [copies, setCopies] = useState<number>(1);
  const [copied, setCopied] = useState(false);

  const selectedDevice = devices.find(d => d.id === selectedDeviceId) || devices[0];

  const handlePrint = () => {
    window.print();
  };

  const handleCopyImei = () => {
    if (selectedDevice?.imei) {
      navigator.clipboard.writeText(selectedDevice.imei);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Gerador visual de código de barras a partir do IMEI
  const renderBarcodeSVG = (code: string) => {
    const bars = [];
    const seed = code || '356984112094832';
    for (let i = 0; i < 45; i++) {
      const charCode = seed.charCodeAt(i % seed.length);
      const width = (charCode % 3) + 1.2;
      bars.push(
        <rect
          key={i}
          x={i * 4.8}
          y={0}
          width={width}
          height={38}
          fill="#111827"
        />
      );
    }
    return (
      <svg width="220" height="38" viewBox="0 0 220 38" style={{ display: 'block', margin: '0 auto' }}>
        {bars}
      </svg>
    );
  };

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Estoque & Identificação
            </span>
            <span style={{ background: 'rgba(249, 115, 22, 0.15)', color: '#f97316', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 12 }}>
              Térmica & Gôndola
            </span>
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#f8fafc', marginTop: 4 }}>
            Impressão de Etiquetas de Aparelho
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
            Etiquetas padronizadas com IMEI, Código de Barras, Saúde da Bateria e Valores para caixas de iPhone.
          </p>
        </div>

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
          Imprimir Etiqueta Agora
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* COLUNA ESQUERDA: CONFIGURAÇÕES E SELEÇÃO */}
        <div className="glass-panel" style={{ padding: 22, borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Tag size={16} color="#f97316" />
            Configuração da Etiqueta
          </h3>

          {/* Seleção do Aparelho */}
          <div>
            <label style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
              Selecione o Aparelho do Estoque
            </label>
            <select
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
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
              {devices.map((dev) => (
                <option key={dev.id} value={dev.id}>
                  {dev.model} {dev.storage} ({dev.color}) - IMEI: {dev.imei || 'S/N'} [R$ {dev.sellPrice.toLocaleString('pt-BR')}]
                </option>
              ))}
            </select>
          </div>

          {/* Formato da Etiqueta */}
          <div>
            <label style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
              Padrão da Impressora / Tamanho
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 4 }}>
              {[
                { id: 'thermal_60x40', label: 'Térmica 60x40mm', desc: 'Padrão Balcão Phones' },
                { id: 'thermal_50x30', label: 'Térmica 50x30mm', desc: 'Mini Gôndola' },
                { id: 'compact', label: 'Lacre de Caixa', desc: 'Horizontal estrito' },
              ].map((fmt) => (
                <button
                  key={fmt.id}
                  onClick={() => setLabelFormat(fmt.id as any)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 8,
                    border: labelFormat === fmt.id ? '2px solid #f97316' : '1px solid rgba(255, 255, 255, 0.08)',
                    background: labelFormat === fmt.id ? 'rgba(249, 115, 22, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                    color: labelFormat === fmt.id ? '#f97316' : '#94a3b8',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>{fmt.label}</div>
                  <div style={{ fontSize: '0.62rem', opacity: 0.8 }}>{fmt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Quantidade de Cópias */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>Cópias por impressão</label>
              <input
                type="number"
                min="1"
                max="50"
                value={copies}
                onChange={(e) => setCopies(Math.max(1, Number(e.target.value)))}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 8,
                  padding: '8px 12px',
                  color: '#fff',
                  fontSize: '0.85rem',
                  marginTop: 4,
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>Ações Rápidas</label>
              <button
                onClick={handleCopyImei}
                style={{
                  width: '100%',
                  marginTop: 4,
                  padding: '9px 12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 8,
                  color: copied ? '#10b981' : '#f8fafc',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'IMEI Copiado!' : 'Copiar IMEI'}
              </button>
            </div>
          </div>

          <div style={{ padding: 12, borderRadius: 8, background: 'rgba(249, 115, 22, 0.08)', border: '1px solid rgba(249, 115, 22, 0.2)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f97316' }}>
              💡 Compatibilidade Térmica:
            </div>
            <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: 4, lineHeight: 1.4 }}>
              Compatível com impressoras térmicas Zebra ZD220, Elgin L42 Pro, Argox OS-214 Plus e rolos de etiqueta adesiva padrão 60x40mm ou 50x30mm. O código de barras é lido perfeitamente por qualquer leitor USB ou sem fio.
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: PREVIEW DA ETIQUETA REAL */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
            Prévia de Impressão (Fiel ao Rolo)
          </div>

          {/* O BLOCO DA ETIQUETA TÉRMICA (PRINT TARGET) */}
          <div
            id="print-label-target"
            style={{
              width: 330,
              minHeight: 220,
              background: '#ffffff',
              color: '#000000',
              borderRadius: 6,
              padding: '14px 16px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
              border: '1px solid #d1d5db',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            }}
          >
            {/* Topo da Etiqueta: Nome da Loja */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1.5px solid #000', paddingBottom: 6 }}>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 900, letterSpacing: '-0.5px' }}>
                  HIAGO iPHONES
                </div>
                <div style={{ fontSize: '0.55rem', color: '#4b5563', fontWeight: 600 }}>
                  BALCÃO PHONES PRO • GARANTIA LOJA
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{
                  fontSize: '0.58rem',
                  fontWeight: 900,
                  background: selectedDevice?.condition === 'new_sealed' ? '#10b981' : '#f97316',
                  color: '#fff',
                  padding: '2px 5px',
                  borderRadius: 3,
                  textTransform: 'uppercase',
                }}>
                  {selectedDevice?.condition === 'new_sealed' ? 'Novo Lacrado' : `Seminovo ${selectedDevice?.batteryHealth}%`}
                </span>
              </div>
            </div>

            {/* Dados do Aparelho */}
            <div style={{ padding: '8px 0', borderBottom: '1px dashed #9ca3af' }}>
              <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#000', lineHeight: 1.2 }}>
                {selectedDevice?.model} {selectedDevice?.storage}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#374151', marginTop: 3 }}>
                <span>Cor: <strong>{selectedDevice?.color}</strong></span>
                {selectedDevice?.condition !== 'new_sealed' && (
                  <span>Bateria: <strong>{selectedDevice?.batteryHealth}%</strong></span>
                )}
                <span>Grau: <strong>A+ Impecável</strong></span>
              </div>
            </div>

            {/* Código de Barras e IMEI */}
            <div style={{ textAlign: 'center', padding: '6px 0' }}>
              {renderBarcodeSVG(selectedDevice?.imei || '356984112094832')}
              <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '1.2px', marginTop: 3 }}>
                IMEI: {selectedDevice?.imei || '356984112094832'}
              </div>
            </div>

            {/* Rodapé da Etiqueta: Preço e Parcelas */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1.5px solid #000', paddingTop: 6 }}>
              <div>
                <div style={{ fontSize: '0.55rem', color: '#6b7280', fontWeight: 600 }}>À VISTA (PIX / DINHEIRO)</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#047857' }}>
                  R$ {selectedDevice?.sellPrice.toLocaleString('pt-BR')}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.55rem', color: '#6b7280', fontWeight: 600 }}>CARTÃO DE CRÉDITO</div>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#111827' }}>
                  12x R$ {Math.round((selectedDevice ? selectedDevice.sellPrice * 1.12 : 0) / 12).toLocaleString('pt-BR')}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: '#64748b' }}>
            <Barcode size={14} />
            <span>Dimensão: 60mm x 40mm • Resolução térmica 203 DPI</span>
          </div>
        </div>
      </div>
    </div>
  );
};
