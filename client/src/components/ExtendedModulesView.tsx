import React from 'react';
import {
  Truck,
  Plus,
  ShieldAlert,
  FileText,
  ArrowUpRight,
  CreditCard,
  LifeBuoy,
  CheckCircle2,
  MessageSquare,
  UploadCloud,
  DownloadCloud,
} from 'lucide-react';
import type { ERPNavTab } from './Sidebar.js';
import type { Accessory, Device } from '../types.js';

interface ExtendedModulesViewProps {
  tab: ERPNavTab;
  accessories: Accessory[];
  devices: Device[];
  onNavigateToPOS?: () => void;
  onOpenNewDevice?: () => void;
}

export const ExtendedModulesView: React.FC<ExtendedModulesViewProps> = ({
  tab,
  accessories,
}) => {

  // 1. COMPRA DE TELEFONE (TRADE-IN & USADOS)
  if (tab === 'phone_purchases') {
    const mockPurchases = [
      { id: 'cp-1', date: '12/10/2026', customer: 'Marcos Vinicius', model: 'iPhone 13 128GB', imei: '358920192837482', battery: 86, evaluation: 2200, status: 'approved', hasContract: true },
      { id: 'cp-2', date: '10/10/2026', customer: 'Ana Beatriz Souza', model: 'iPhone 12 64GB', imei: '354819203948192', battery: 82, evaluation: 1550, status: 'approved', hasContract: true },
      { id: 'cp-3', date: '08/10/2026', customer: 'Felipe Santana', model: 'iPhone 14 Pro 128GB', imei: '351928374650123', battery: 91, evaluation: 3600, status: 'in_review', hasContract: false },
    ];

    return (
      <div style={{ padding: '24px 32px', maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f97316', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              ESTOQUE & VITRINE
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginTop: 4 }}>
              Compra de Telefone
            </h1>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>
              Avaliação de aparelhos usados, compra de seminovos de clientes no balcão e emissão do termo de compra e venda.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => window.open('https://consultaserialaparelho.com.br/', '_blank')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(239, 68, 68, 0.12)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '8px 14px',
                borderRadius: 8,
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <ShieldAlert size={14} />
              <span>Consultar Restrição IMEI (Anatel)</span>
            </button>

            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 8,
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
              }}
            >
              <Plus size={15} />
              <span>+ Nova Compra de Telefone</span>
            </button>
          </div>
        </div>

        {/* TABELA DE COMPRAS */}
        <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8' }}>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Data</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Cliente</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Aparelho</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>IMEI</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Bateria</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Valor Pago</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Status</th>
                <th style={{ padding: '14px 18px', fontWeight: 700, textAlign: 'right' }}>Termo</th>
              </tr>
            </thead>
            <tbody>
              {mockPurchases.map((cp) => (
                <tr key={cp.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', color: '#f8fafc' }}>
                  <td style={{ padding: '14px 18px', color: '#94a3b8' }}>{cp.date}</td>
                  <td style={{ padding: '14px 18px', fontWeight: 600 }}>{cp.customer}</td>
                  <td style={{ padding: '14px 18px', fontWeight: 700, color: '#f97316' }}>{cp.model}</td>
                  <td style={{ padding: '14px 18px', fontFamily: 'monospace', color: '#94a3b8' }}>{cp.imei}</td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 12, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 700, fontSize: '0.75rem' }}>
                      {cp.battery}%
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', fontWeight: 800 }}>R$ {cp.evaluation.toLocaleString('pt-BR')}</td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: 6,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      background: cp.status === 'approved' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                      color: cp.status === 'approved' ? '#10b981' : '#eab308',
                    }}>
                      {cp.status === 'approved' ? 'Entrou no Estoque' : 'Em Avaliação'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <button style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#38bdf8', padding: '5px 10px', borderRadius: 6, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.72rem' }}>
                      <FileText size={12} />
                      <span>Termo de Compra</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // 2. PRODUTOS & ACESSÓRIOS
  if (tab === 'products') {
    return (
      <div style={{ padding: '24px 32px', maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f97316', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              ESTOQUE & VITRINE
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginTop: 4 }}>
              Produtos & Acessórios
            </h1>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>
              Controle de estoque de capas, películas, carregadores homologados e periféricos da loja.
            </p>
          </div>

          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              color: '#fff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: 8,
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
            }}
          >
            <Plus size={15} />
            <span>+ Novo Produto</span>
          </button>
        </div>

        {/* TABELA DE PRODUTOS */}
        <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8' }}>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Nome do Produto</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Categoria</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Estoque</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Preço de Custo</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Preço de Venda</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Margem de Lucro</th>
              </tr>
            </thead>
            <tbody>
              {accessories.map((acc) => {
                const profit = acc.sellPrice - acc.costPrice;
                const margin = Math.round((profit / acc.sellPrice) * 100);
                return (
                  <tr key={acc.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', color: '#f8fafc' }}>
                    <td style={{ padding: '14px 18px', fontWeight: 700 }}>{acc.name}</td>
                    <td style={{ padding: '14px 18px', color: '#94a3b8' }}>{acc.category}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: 12,
                        background: acc.stock < 15 ? 'rgba(234, 179, 8, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: acc.stock < 15 ? '#eab308' : '#10b981',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                      }}>
                        {acc.stock} unid.
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', color: '#94a3b8' }}>R$ {acc.costPrice.toFixed(2)}</td>
                    <td style={{ padding: '14px 18px', fontWeight: 800, color: '#f97316' }}>R$ {acc.sellPrice.toFixed(2)}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ color: '#10b981', fontWeight: 700 }}>
                        +R$ {profit.toFixed(2)} ({margin}%)
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // 3. PEÇAS DE REPARO
  if (tab === 'parts') {
    const mockParts = [
      { id: 'pc-1', name: 'Tela Frontal OLED iPhone 13 (True Tone)', category: 'Display', stock: 6, minStock: 2, cost: 240, sale: 650 },
      { id: 'pc-2', name: 'Tela Frontal Incell iPhone 11', category: 'Display', stock: 8, minStock: 3, cost: 95, sale: 320 },
      { id: 'pc-3', name: 'Bateria Foxconn c/ Flex iPhone 12 (100% Saúde)', category: 'Bateria', stock: 12, minStock: 4, cost: 65, sale: 280 },
      { id: 'pc-4', name: 'Bateria Foxconn c/ Flex iPhone 13', category: 'Bateria', stock: 5, minStock: 3, cost: 85, sale: 320 },
      { id: 'pc-5', name: 'Conector de Carga Lightning iPhone 13 Pro', category: 'Conector', stock: 4, minStock: 2, cost: 45, sale: 250 },
      { id: 'pc-6', name: 'Módulo Câmera Traseira iPhone 14', category: 'Câmera', stock: 2, minStock: 2, cost: 280, sale: 750 },
    ];

    return (
      <div style={{ padding: '24px 32px', maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f97316', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              ASSISTÊNCIA & BANCADA
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginTop: 4 }}>
              Peças de Reparo
            </h1>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>
              Estoque de peças técnicas para ordens de serviço. Ao inserir a peça na O.S., a baixa de estoque ocorre automaticamente.
            </p>
          </div>

          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              color: '#fff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: 8,
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
            }}
          >
            <Plus size={15} />
            <span>+ Nova Peça</span>
          </button>
        </div>

        {/* TABELA DE PEÇAS */}
        <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8' }}>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Nome da Peça</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Tipo</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Estoque</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Custo da Peça</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Preço c/ Mão de Obra</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {mockParts.map((pc) => (
                <tr key={pc.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', color: '#f8fafc' }}>
                  <td style={{ padding: '14px 18px', fontWeight: 700 }}>{pc.name}</td>
                  <td style={{ padding: '14px 18px', color: '#94a3b8' }}>{pc.category}</td>
                  <td style={{ padding: '14px 18px', fontWeight: 800 }}>{pc.stock} unid.</td>
                  <td style={{ padding: '14px 18px', color: '#94a3b8' }}>R$ {pc.cost.toFixed(2)}</td>
                  <td style={{ padding: '14px 18px', fontWeight: 800, color: '#f97316' }}>R$ {pc.sale.toFixed(2)}</td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: 6,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      background: pc.stock <= pc.minStock ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      color: pc.stock <= pc.minStock ? '#ef4444' : '#10b981',
                    }}>
                      {pc.stock <= pc.minStock ? 'Estoque Crítico' : 'Normal'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // 4. FORNECEDORES
  if (tab === 'suppliers') {
    const mockSuppliers = [
      { id: 'forn-1', name: 'Distribuidora Alpha SP', contact: 'Rodrigo Vendas', phone: '+55 11 98765-4321', type: 'iPhones Novos e Lacrados', city: 'São Paulo - SP' },
      { id: 'forn-2', name: 'Miami Tech Importadora', contact: 'Carlos Import', phone: '+55 11 99123-9876', type: 'Seminovos Grade A / Swap', city: 'Campinas - SP' },
      { id: 'forn-3', name: 'Fox Parts Distribuição', contact: 'Julio Peças', phone: '+55 11 97654-1234', type: 'Telas e Baterias Originais', city: 'São Paulo - SP' },
    ];

    return (
      <div style={{ padding: '24px 32px', maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f97316', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              GESTÃO DE PARCEIROS
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginTop: 4 }}>
              Fornecedores
            </h1>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>
              Fornecedores de iPhones lacrados, seminovos de atacado, telas e peças de bancada.
            </p>
          </div>

          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              color: '#fff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: 8,
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
            }}
          >
            <Plus size={15} />
            <span>+ Novo Fornecedor</span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
          {mockSuppliers.map((forn) => (
            <div key={forn.id} style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(249, 115, 22, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316' }}>
                  <Truck size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc' }}>{forn.name}</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{forn.city}</div>
                </div>
              </div>

              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                  <span>Especialidade:</span>
                  <span style={{ color: '#f8fafc', fontWeight: 600 }}>{forn.type}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                  <span>Contato comercial:</span>
                  <span style={{ color: '#f8fafc', fontWeight: 600 }}>{forn.contact}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                  <span>WhatsApp:</span>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>{forn.phone}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }


  // 6. ASSINATURA
  if (tab === 'subscription') {
    return (
      <div style={{ padding: '24px 32px', maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f97316', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            SISTEMA & PLANO
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginTop: 4 }}>
            Assinatura & Licenciamento
          </h1>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>
            Gestão do plano ativo, recursos liberados e histórico de faturas do sistema Balcão Phones.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
          <div style={{ background: '#0d121f', border: '1px solid rgba(249, 115, 22, 0.3)', borderRadius: 12, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f97316', textTransform: 'uppercase', background: 'rgba(249, 115, 22, 0.12)', padding: '4px 10px', borderRadius: 20 }}>
                Plano Pro Balcão
              </span>
              <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle2 size={13} />
                <span>Ativo</span>
              </span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#f8fafc', marginTop: 14 }}>
              R$ 149<span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 500 }}>/mês</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 6 }}>
              Aparelhos ilimitados por IMEI • Módulo O.S. com Checklist • Gerador de Etiquetas Térmicas • Pós-venda Preditivo
            </p>
            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', marginTop: 16, paddingTop: 14, display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8' }}>
              <span>Próxima renovação:</span>
              <strong style={{ color: '#f8fafc' }}>15/11/2026</strong>
            </div>
          </div>

          <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
                <CreditCard size={16} color="#f97316" />
                <span>Forma de Pagamento Cadastrada</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 8 }}>
                Cartão de crédito com final •••• 8842 (Mastercard). Cobrança automática recorrente com emissão de nota fiscal direta.
              </p>
            </div>
            <button
              onClick={() => alert('Direcionando para portal seguro de cobrança!')}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#f8fafc',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '10px 14px',
                borderRadius: 8,
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                marginTop: 16,
              }}
            >
              Atualizar Cartão ou Trocar Plano
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 7. SUPORTE
  if (tab === 'support') {
    return (
      <div style={{ padding: '24px 32px', maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f97316', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            CENTRAL DE AJUDA
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginTop: 4 }}>
            Suporte ao Lojista
          </h1>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>
            Fale com a equipe de especialistas Balcão Phones para tirar dúvidas de fluxo, impressoras ou bugs.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          <div style={{ background: '#0d121f', border: '1px solid rgba(37, 211, 102, 0.25)', borderRadius: 12, padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#25d366' }}>
              <MessageSquare size={20} />
              <strong style={{ fontSize: '0.95rem' }}>WhatsApp Direto do Suporte</strong>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 10 }}>
              Atendimento ágil de segunda a sábado das 08h às 20h para resolver dúvidas operacionais no balcão.
            </p>
            <button
              onClick={() => window.open('https://wa.me/5511999999999?text=Preciso+de+suporte+no+sistema+Balcao+Phones', '_blank')}
              style={{
                background: '#25d366',
                color: '#06260f',
                border: 'none',
                padding: '9px 16px',
                borderRadius: 8,
                fontSize: '0.8rem',
                fontWeight: 800,
                cursor: 'pointer',
                marginTop: 16,
              }}
            >
              Chamar no WhatsApp →
            </button>
          </div>

          <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#38bdf8' }}>
              <LifeBuoy size={20} />
              <strong style={{ fontSize: '0.95rem' }}>Central de Documentação</strong>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 10 }}>
              Vídeos passo a passo: como configurar impressora térmica Elgin/Zebra, checklist de O.S. e cadastro de IMEI.
            </p>
            <button
              onClick={() => alert('Abrindo tutoriais em vídeo')}
              style={{
                background: 'rgba(56, 189, 248, 0.1)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                padding: '9px 16px',
                borderRadius: 8,
                fontSize: '0.8rem',
                fontWeight: 800,
                cursor: 'pointer',
                marginTop: 16,
              }}
            >
              Ver Tutoriais em Vídeo
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 8. MIGRAÇÃO DE DADOS
  if (tab === 'migration') {
    return (
      <div style={{ padding: '24px 32px', maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f97316', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            UTILITÁRIOS
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginTop: 4 }}>
            Migração de Dados
          </h1>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>
            Importe seu estoque de iPhones e lista de clientes vindos de planilhas Excel ou de outros sistemas.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
          <div style={{ background: '#0d121f', border: '1px dashed rgba(249, 115, 22, 0.4)', borderRadius: 12, padding: 26, textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', padding: 14, borderRadius: '50%', background: 'rgba(249, 115, 22, 0.1)', color: '#f97316', marginBottom: 12 }}>
              <UploadCloud size={30} />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>Importar Planilha (Excel / CSV)</h3>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 6, maxWidth: 360, margin: '6px auto 16px' }}>
              Faça o upload do seu arquivo de estoque com colunas: Modelo, IMEI, Capacidade, Cor, Saúde da Bateria e Valor.
            </p>
            <input type="file" accept=".csv, .xlsx, .xls" style={{ display: 'none' }} id="file-migrate" onChange={() => alert('Planilha recebida com sucesso! 24 aparelhos validados para importação.')} />
            <label
              htmlFor="file-migrate"
              style={{
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                color: '#fff',
                padding: '9px 18px',
                borderRadius: 8,
                fontSize: '0.8rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-block',
              }}
            >
              Selecionar Arquivo .CSV ou .XLSX
            </label>
          </div>

          <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 26, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#f8fafc', fontWeight: 800 }}>
                <DownloadCloud size={18} color="#f97316" />
                <span>Exportar Backup Completo</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 8 }}>
                Exporte todo o banco de dados da loja em um clique: aparelhos, clientes, histórico de vendas e ordens de serviço.
              </p>
            </div>
            <button
              onClick={() => alert('Download do backup gerado em JSON/Excel iniciado.')}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#f8fafc',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '10px 14px',
                borderRadius: 8,
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                marginTop: 16,
              }}
            >
              Baixar Backup do Sistema
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 9. GESTÃO: FINANCEIRO, RELATÓRIOS, COMISSÕES, PONTO, USUÁRIOS
  return (
    <div style={{ padding: '24px 32px', maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f97316', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          GESTÃO DA LOJA
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginTop: 4 }}>
          {tab === 'financial' && 'Gestão Financeira & DRE'}
          {tab === 'reports' && 'Relatórios Operacionais'}
          {tab === 'commissions' && 'Comissões de Vendedores & Técnicos'}
          {tab === 'timecard' && 'Controle de Ponto Eletrônico'}
          {tab === 'users' && 'Equipe & Permissões'}
          {tab === 'profile' && 'Meu Perfil & Loja'}
        </h1>
        <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>
          Controle centralizado dos indicadores de desempenho, equipe e conformidade da Hiago iPhones.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>Faturamento do Mês</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc', marginTop: 6 }}>R$ 18.490,00</div>
          <div style={{ fontSize: '0.72rem', color: '#10b981', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <ArrowUpRight size={14} />
            <span>+14% em relação ao mês anterior</span>
          </div>
        </div>

        <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>Lucro Líquido Real</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981', marginTop: 6 }}>R$ 4.280,00</div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 4 }}>Margem líquida apurada: 23,1%</div>
        </div>

        <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>Comissões Calculadas</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f97316', marginTop: 6 }}>R$ 820,00</div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 4 }}>2 vendedores + 1 técnico</div>
        </div>
      </div>
    </div>
  );
};
