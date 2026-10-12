import React, { useState } from 'react';
import { Search, FileText } from 'lucide-react';
import type { Sale } from '../types.js';

interface SalesHistoryViewProps {
  sales: Sale[];
  onOpenWarranty: (saleId: string) => void;
}

export const SalesHistoryView: React.FC<SalesHistoryViewProps> = ({ sales, onOpenWarranty }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSales = sales.filter(s =>
    s.saleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.customerPhone?.includes(searchTerm) ||
    s.items.some(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()) || i.imei?.includes(searchTerm))
  );

  const totalVolume = sales.reduce((acc, s) => acc + s.total, 0);

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Vendas & Histórico
            </span>
            <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 12 }}>
              {sales.length} Vendas Registradas
            </span>
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#f8fafc', marginTop: 4 }}>
            Histórico Geral de Vendas
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
            Consulte todas as operações de balcão, trocas com volta (Trade-in) e emita comprovantes.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '10px 18px', borderRadius: 12, textAlign: 'right' }}>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600 }}>Volume Total Faturado</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#10b981' }}>
            R$ {totalVolume.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* BARRA DE PESQUISA */}
      <div style={{ position: 'relative' }}>
        <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 14, top: 12 }} />
        <input
          type="text"
          placeholder="Buscar por número da venda, cliente, telefone ou IMEI do aparelho..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 10,
            padding: '10px 14px 10px 42px',
            color: '#fff',
            fontSize: '0.85rem',
            outline: 'none',
          }}
        />
      </div>

      {/* TABELA DE VENDAS */}
      <div className="glass-panel" style={{ borderRadius: 14, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8' }}>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Nº Venda</th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Data</th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Cliente</th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Itens Vendidos</th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Trade-In (Troca)</th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Total Final</th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Pagamento</th>
              <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.map((sale) => (
              <tr
                key={sale.id}
                style={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                  transition: 'background 0.15s ease',
                }}
              >
                <td style={{ padding: '12px 16px', fontWeight: 800, color: '#f97316' }}>
                  {sale.saleNumber}
                </td>
                <td style={{ padding: '12px 16px', color: '#94a3b8' }}>
                  {sale.date}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontWeight: 700, color: '#f8fafc' }}>{sale.customerName}</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{sale.customerPhone || 'S/ telefone'}</div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  {sale.items.map((item, idx) => (
                    <div key={idx} style={{ color: '#cbd5e1', fontSize: '0.78rem' }}>
                      • {item.quantity}x {item.name}
                    </div>
                  ))}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  {sale.tradeIn ? (
                    <div>
                      <div style={{ color: '#10b981', fontWeight: 700, fontSize: '0.78rem' }}>
                        {sale.tradeIn.model}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                        Entrada: R$ {sale.tradeIn.evaluatedValue.toLocaleString('pt-BR')}
                      </div>
                    </div>
                  ) : (
                    <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Sem troca</span>
                  )}
                </td>
                <td style={{ padding: '12px 16px', fontWeight: 800, color: '#10b981', fontSize: '0.92rem' }}>
                  R$ {sale.total.toLocaleString('pt-BR')}
                </td>
                <td style={{ padding: '12px 16px', color: '#cbd5e1', fontSize: '0.78rem' }}>
                  {sale.paymentMethod}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <button
                    onClick={() => onOpenWarranty(sale.id)}
                    style={{
                      background: 'rgba(249, 115, 22, 0.12)',
                      border: '1px solid rgba(249, 115, 22, 0.3)',
                      color: '#f97316',
                      borderRadius: 6,
                      padding: '5px 10px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                    title="Emitir Termo de Garantia"
                  >
                    <FileText size={12} />
                    Garantia
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
