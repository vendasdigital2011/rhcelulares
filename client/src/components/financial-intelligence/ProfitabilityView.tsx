import React from 'react';
import { Info } from 'lucide-react';
import type { FinancialConsolidatedData } from '../../types.js';

interface ProfitabilityViewProps {
  data: FinancialConsolidatedData;
}

export const ProfitabilityView: React.FC<ProfitabilityViewProps> = ({ data }) => {
  const { dre, categoryProfitability } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 1. CABEÇALHO */}
      <div style={{
        background: '#0d1322',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 14,
        padding: '20px 24px',
      }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc' }}>
          Demonstração do Resultado do Exercício (DRE) & Rentabilidade
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: 4 }}>
          Apuração contábil segregando receita bruta, deduções fiscais/cartão, custo de mercadorias vendidas (CMV) e despesas fixas.
        </p>
      </div>

      {/* 2. DRE GERENCIAL ESTRUTURADO */}
      <div style={{
        background: '#0d1322',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 14,
        padding: 24,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>
            DRE Gerencial Consolidado &bull; {dre.period}
          </h3>
          <span style={{
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#10b981',
            fontSize: '0.75rem',
            fontWeight: 800,
            padding: '3px 10px',
            borderRadius: 6,
          }}>
            Status: {dre.dataQuality === 'complete' ? 'Cálculo 100% Auditado' : 'Estimado'}
          </span>
        </div>

        {/* CASCATA DRE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.85rem' }}>
          {/* (+) Receita Bruta */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 8 }}>
            <span style={{ fontWeight: 700, color: '#f8fafc' }}>(+) RECEITA BRUTA TOTAL</span>
            <strong style={{ color: '#3b82f6', fontSize: '1rem' }}>R$ {dre.grossRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
          </div>

          {/* (-) Deduções / Taxas */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 14px 8px 30px', color: '#ef4444' }}>
            <span>(-) Taxas de Intermediação & Cartões de Crédito (Média 3.2%)</span>
            <span>- R$ {dre.cardFeesAndDiscounts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>

          {/* (=) Receita Líquida */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(59, 130, 246, 0.08)', borderLeft: '4px solid #3b82f6', borderRadius: '0 8px 8px 0' }}>
            <span style={{ fontWeight: 800, color: '#f8fafc' }}>(=) RECEITA OPERACIONAL LÍQUIDA</span>
            <strong style={{ color: '#60a5fa', fontSize: '1rem' }}>R$ {dre.netRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
          </div>

          {/* (-) CMV Total */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(239, 68, 68, 0.04)', borderRadius: 8 }}>
            <span style={{ fontWeight: 700, color: '#f8fafc' }}>(-) CUSTO DAS MERCADORIAS E SERVIÇOS (CMV / CSP)</span>
            <strong style={{ color: '#ef4444' }}>- R$ {dre.cmvTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
          </div>

          {/* Subitens de CMV */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 30, fontSize: '0.78rem', color: '#94a3b8' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingRight: 14 }}>
              <span>&bull; Custo dos iPhones Vendidos (Aquisição)</span>
              <span>- R$ {dre.cmvDevices.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingRight: 14 }}>
              <span>&bull; Custo dos Acessórios Vendidos</span>
              <span>- R$ {dre.cmvAccessories.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingRight: 14 }}>
              <span>&bull; Custo de Peças e Telas Consumidas em O.S.</span>
              <span>- R$ {dre.cmvParts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* (=) Lucro Bruto */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(16, 185, 129, 0.08)', borderLeft: '4px solid #10b981', borderRadius: '0 8px 8px 0' }}>
            <div>
              <span style={{ fontWeight: 800, color: '#f8fafc' }}>(=) LUCRO BRUTO (MARGEM DE CONTRIBUIÇÃO)</span>
              <span style={{ marginLeft: 10, fontSize: '0.78rem', color: '#10b981', fontWeight: 800 }}>
                ({dre.grossMarginPercent.toFixed(1)}% de margem)
              </span>
            </div>
            <strong style={{ color: '#10b981', fontSize: '1.05rem' }}>R$ {dre.grossProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
          </div>

          {/* (-) Despesas Operacionais */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 8 }}>
            <div>
              <span style={{ fontWeight: 700, color: '#f8fafc' }}>(-) DESPESAS OPERACIONAIS FIXAS & VARIÁVEIS</span>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Aluguel, salários, comissões pagas, energia, marketing, sistemas</div>
            </div>
            <strong style={{ color: '#ef4444' }}>- R$ {dre.operationalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
          </div>

          {/* (=) Resultado Líquido */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '14px 18px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 10,
            marginTop: 8,
          }}>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>
                (=) RESULTADO LÍQUIDO FINAL DO PERÍODO
              </div>
              <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, marginTop: 2 }}>
                Margem Líquida Real: {dre.netMarginPercent.toFixed(1)}% sobre o faturamento
              </div>
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: dre.netResult >= 0 ? '#10b981' : '#ef4444' }}>
              R$ {dre.netResult.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* NOTA DE AUDITORIA */}
        <div style={{
          marginTop: 20,
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: 8,
          padding: 12,
          fontSize: '0.75rem',
          color: '#94a3b8',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
        }}>
          <Info size={16} color="#3b82f6" style={{ marginTop: 2, flexShrink: 0 }} />
          <div>
            <strong>Critério Contábil Rigoroso:</strong> O lucro líquido não corresponde ao dinheiro sobrando no banco. Pagamentos para compra de lotes futuros de estoque constituem ativo patrimonial, e não despesa corrente do DRE.
          </div>
        </div>
      </div>

      {/* 3. TÍQUETE MÉDIO E TABELA DE CATEGORIAS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20 }}>
        {/* TÍQUETES MÉDIOS */}
        <div style={{ background: '#0d1322', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', marginBottom: 14 }}>
            Métricas de Eficiência Comercial
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: 12, background: 'rgba(255, 255, 255, 0.03)', borderRadius: 8 }}>
              <div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Tíquete Médio por Venda (Smartphones)</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginTop: 2 }}>
                  R$ {dre.ticketMediumSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', alignSelf: 'center' }}>
                {dre.totalSalesCount} aparelhos vendidos
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: 12, background: 'rgba(255, 255, 255, 0.03)', borderRadius: 8 }}>
              <div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Tíquete Médio por Ordem de Serviço (O.S.)</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981', marginTop: 2 }}>
                  R$ {dre.ticketMediumOS.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', alignSelf: 'center' }}>
                {dre.totalOSCount} ordens concluídas
              </span>
            </div>
          </div>
        </div>

        {/* PARTICIPAÇÃO POR LINHA */}
        <div style={{ background: '#0d1322', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', marginBottom: 14 }}>
            Rentabilidade por Linha de Negócio
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {categoryProfitability.map((cat, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 8 }}>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc' }}>{cat.category}</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                    Share: {cat.shareOfTotalRevenuePercent.toFixed(1)}% do faturamento total
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#10b981' }}>
                    {cat.marginPercent.toFixed(1)}% margem
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    Lucro R$ {cat.grossProfit.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
