import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw
} from 'lucide-react';
import { createLeadApi } from '../../api/erpApi.js';

interface CrmCsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete?: (count: number) => void;
}

interface ParsedCustomer {
  name: string;
  phone: string;
  deviceModel: string;
  purchaseDate: string;
  batteryHealth?: number;
  value?: number;
  lifecycleTag: 'd15' | 'd180' | 'd360' | 'recent';
}

export const CrmCsvImportModal: React.FC<CrmCsvImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedCustomer[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  if (!isOpen) return null;

  // 1. Download do modelo CSV
  const handleDownloadTemplate = () => {
    const csvContent =
      'Nome,Telefone,Modelo_iPhone,Data_Compra,Saude_Bateria,Valor_Compra\n' +
      'Felipe Santana,(77) 99112-8877,iPhone 14 128GB Azul,2026-10-28,98,4290.00\n' +
      'Renata Meireles,(77) 99881-2233,iPhone 13 128GB Estelar,2026-05-15,89,3190.00\n' +
      'Diego Silveira,(77) 98114-5566,iPhone 12 64GB Preto,2025-11-10,82,2190.00\n' +
      'Juliana Pires,(77) 99122-3344,iPhone 14 Pro 128GB,2026-10-25,95,5490.00\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'modelo_importacao_clientes_hiago.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 2. Normalização de Telefone
  const normalizePhone = (rawPhone: string): string => {
    const digits = rawPhone.replace(/\D/g, '');
    if (!digits) return '';
    if (digits.length === 11) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }
    if (digits.length === 10) {
      return `(${digits.slice(0, 2)}) 9${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    if (digits.startsWith('55') && digits.length >= 12) {
      const ddd = digits.slice(2, 4);
      const rest = digits.slice(4);
      return `(${ddd}) ${rest.length === 9 ? rest.slice(0, 5) + '-' + rest.slice(5) : rest}`;
    }
    return rawPhone;
  };

  // 3. Classificação de Ciclo de Vida
  const classifyLifecycle = (dateStr: string): 'd15' | 'd180' | 'd360' | 'recent' => {
    try {
      const parts = dateStr.includes('/') ? dateStr.split('/') : dateStr.split('-');
      let date: Date;
      if (dateStr.includes('/')) {
        // DD/MM/YYYY
        date = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      } else {
        // YYYY-MM-DD
        date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      }

      const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 300) return 'd360'; // ~1 ano: Troca / Upgrade
      if (diffDays >= 140) return 'd180'; // ~6 meses: Saúde Bateria / Revisão
      if (diffDays >= 10 && diffDays <= 45) return 'd15'; // ~15 dias: Acessórios
      return 'recent';
    } catch {
      return 'd15';
    }
  };

  // 4. Leitura do arquivo CSV
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setError(null);
    setSuccessCount(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) throw new Error('Arquivo vazio');

        const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
        if (lines.length < 2) throw new Error('O CSV deve conter cabeçalho e pelo menos 1 linha de cliente');

        // Detecta separador (, ou ;)
        const separator = lines[0].includes(';') ? ';' : ',';
        const headers = lines[0].split(separator).map(h => h.trim().toLowerCase());

        const nameIdx = headers.findIndex(h => h.includes('nome') || h.includes('cliente'));
        const phoneIdx = headers.findIndex(h => h.includes('fone') || h.includes('tel') || h.includes('whats'));
        const modelIdx = headers.findIndex(h => h.includes('modelo') || h.includes('aparelho') || h.includes('iphone'));
        const dateIdx = headers.findIndex(h => h.includes('data') || h.includes('compra'));
        const batteryIdx = headers.findIndex(h => h.includes('saude') || h.includes('bateria'));
        const valIdx = headers.findIndex(h => h.includes('valor') || h.includes('preco'));

        if (nameIdx === -1 || phoneIdx === -1) {
          throw new Error('As colunas "Nome" e "Telefone" são obrigatórias na planilha.');
        }

        const parsed: ParsedCustomer[] = [];

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(separator).map(c => c.trim().replace(/^["']|["']$/g, ''));
          if (cols.length <= Math.max(nameIdx, phoneIdx)) continue;

          const name = cols[nameIdx];
          const rawPhone = cols[phoneIdx];
          if (!name || !rawPhone) continue;

          const phone = normalizePhone(rawPhone);
          const deviceModel = modelIdx !== -1 && cols[modelIdx] ? cols[modelIdx] : 'iPhone';
          const purchaseDate = dateIdx !== -1 && cols[dateIdx] ? cols[dateIdx] : '2026-10-01';
          const battery = batteryIdx !== -1 && cols[batteryIdx] ? parseInt(cols[batteryIdx].replace(/\D/g, ''), 10) : undefined;
          const val = valIdx !== -1 && cols[valIdx] ? parseFloat(cols[valIdx].replace(/[^\d.,]/g, '').replace(',', '.')) : 3500;

          parsed.push({
            name,
            phone,
            deviceModel,
            purchaseDate,
            batteryHealth: battery && !isNaN(battery) ? battery : undefined,
            value: isNaN(val) ? 3500 : val,
            lifecycleTag: classifyLifecycle(purchaseDate),
          });
        }

        if (parsed.length === 0) {
          throw new Error('Nenhum registro válido de cliente foi identificado');
        }

        setParsedRows(parsed);
      } catch (err: any) {
        setError(err.message || 'Erro ao processar arquivo CSV');
        setParsedRows([]);
      }
    };

    reader.readAsText(selected, 'UTF-8');
  };

  // 5. Confirmação e Ingestão
  const handleConfirmImport = async () => {
    if (parsedRows.length === 0) return;
    setIsProcessing(true);
    setError(null);

    try {
      let imported = 0;
      for (const row of parsedRows) {
        let stage: any = 'pos_venda';
        if (row.lifecycleTag === 'd360') stage = 'pos_venda';
        else if (row.lifecycleTag === 'recent') stage = 'fechado_ganho';

        await createLeadApi({
          contactName: row.name,
          phone: row.phone,
          commercialInterest: row.deviceModel,
          potentialValue: row.value || 3500,
          origin: 'importacao_planilha',
          priority: row.lifecycleTag === 'd360' ? 'alta' : 'media',
          notes: `Importado via Base Histórica CSV. iPhone: ${row.deviceModel} (Comprado em: ${row.purchaseDate})${row.batteryHealth ? ` | Saúde Bateria: ${row.batteryHealth}%` : ''}`,
          stage,
          tags: ['Base Legada', `Regua ${row.lifecycleTag.toUpperCase()}`],
        });
        imported++;
      }

      setSuccessCount(imported);
      if (onImportComplete) {
        onImportComplete(imported);
      }
      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar clientes');
    } finally {
      setIsProcessing(false);
    }
  };

  const countD15 = parsedRows.filter(r => r.lifecycleTag === 'd15').length;
  const countD180 = parsedRows.filter(r => r.lifecycleTag === 'd180').length;
  const countD360 = parsedRows.filter(r => r.lifecycleTag === 'd360').length;

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
      zIndex: 1300,
      padding: 16,
    }}>
      <div style={{
        background: '#1E293B',
        border: '1px solid #334155',
        borderRadius: 14,
        padding: 24,
        maxWidth: 620,
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 8,
              backgroundColor: 'rgba(249, 115, 22, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#F97316'
            }}>
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#F8FAFC', margin: 0 }}>
                Importador Guiado de Base Histórica (Épico 08)
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#94A3B8', margin: '2px 0 0 0' }}>
                Higieniza números para WhatsApp e popula automaticamente as réguas D+15, D+180 e D+360.
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

        {/* Feedback Sucesso */}
        {successCount !== null ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: 24,
            gap: 12,
            backgroundColor: '#0F172A',
            borderRadius: 10,
            border: '1px solid #10B981',
          }}>
            <CheckCircle2 size={42} color="#34D399" />
            <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#34D399', margin: 0 }}>
              {successCount} Clientes Importados com Sucesso!
            </h4>
            <p style={{ fontSize: '0.875rem', color: '#94A3B8', margin: 0 }}>
              Os telefones foram higienizados e os clientes já foram distribuídos nas réguas de pós-venda e reativação.
            </p>
          </div>
        ) : (
          <>
            {/* Download Template Banner */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              backgroundColor: '#0F172A',
              borderRadius: 8,
              border: '1px solid #334155',
            }}>
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#F8FAFC' }}>
                  Ainda não tem a planilha no formato certo?
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                  Baixe nosso modelo CSV pronto com colunas de Nome, Telefone e iPhone.
                </div>
              </div>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: '1px solid #475569',
                  backgroundColor: '#1E293B',
                  color: '#38BDF8',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Download size={14} />
                <span>Baixar Modelo CSV</span>
              </button>
            </div>

            {/* Box Upload CSV */}
            <div style={{
              padding: 24,
              border: '2px dashed #475569',
              borderRadius: 10,
              textAlign: 'center',
              background: '#0F172A',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
            }}>
              <Upload size={32} color="#F97316" />
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#F8FAFC' }}>
                {file ? file.name : 'Selecione ou arraste sua planilha CSV'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                Formatos aceitos: .csv separado por vírgula ou ponto-e-vírgula (UTF-8)
              </div>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                style={{ marginTop: 8, fontSize: '0.78rem', color: '#CBD5E1' }}
              />
            </div>

            {/* Alerta de Erro */}
            {error && (
              <div style={{
                padding: '10px 14px',
                borderRadius: 6,
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid #EF4444',
                color: '#F87171',
                fontSize: '0.8125rem',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Estatísticas da Prévia */}
            {parsedRows.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#F8FAFC' }}>
                  📊 Prévia da Classificação ({parsedRows.length} clientes válidos):
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  <div style={{ backgroundColor: '#0F172A', padding: 12, borderRadius: 8, border: '1px solid #334155' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Régua D+15 (Acessórios)</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#F59E0B', marginTop: 2 }}>{countD15}</div>
                  </div>
                  <div style={{ backgroundColor: '#0F172A', padding: 12, borderRadius: 8, border: '1px solid #334155' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Régua D+180 (Bateria)</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#38BDF8', marginTop: 2 }}>{countD180}</div>
                  </div>
                  <div style={{ backgroundColor: '#0F172A', padding: 12, borderRadius: 8, border: '1px solid #334155' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Régua D+360 (Upgrade)</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#A78BFA', marginTop: 2 }}>{countD360}</div>
                  </div>
                </div>

                {/* Tabela de Amostra */}
                <div style={{ maxHeight: 160, overflowY: 'auto', border: '1px solid #334155', borderRadius: 6 }}>
                  <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#0F172A', color: '#94A3B8' }}>
                        <th style={{ padding: '8px 12px' }}>Nome</th>
                        <th style={{ padding: '8px 12px' }}>WhatsApp Higienizado</th>
                        <th style={{ padding: '8px 12px' }}>iPhone</th>
                        <th style={{ padding: '8px 12px' }}>Régua Atribuída</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedRows.slice(0, 5).map((row, idx) => (
                        <tr key={idx} style={{ borderTop: '1px solid #334155' }}>
                          <td style={{ padding: '8px 12px', color: '#F8FAFC', fontWeight: 600 }}>{row.name}</td>
                          <td style={{ padding: '8px 12px', color: '#34D399' }}>{row.phone}</td>
                          <td style={{ padding: '8px 12px', color: '#F97316' }}>{row.deviceModel}</td>
                          <td style={{ padding: '8px 12px', color: '#38BDF8', fontWeight: 700 }}>
                            {row.lifecycleTag.toUpperCase()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Ações */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: '1px solid #475569',
                  backgroundColor: 'transparent',
                  color: '#94A3B8',
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={parsedRows.length === 0 || isProcessing}
                onClick={handleConfirmImport}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 18px',
                  borderRadius: 6,
                  border: 'none',
                  backgroundColor: parsedRows.length === 0 || isProcessing ? '#475569' : '#16A34A',
                  color: '#FFFFFF',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  cursor: parsedRows.length === 0 || isProcessing ? 'not-allowed' : 'pointer',
                }}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Importando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Confirmar & Ativar {parsedRows.length} Clientes</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
