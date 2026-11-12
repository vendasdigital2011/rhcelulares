import React, { useState, useEffect } from 'react';
import {
  Zap,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Headphones,
  BatteryCharging,
  RefreshCw,
  Send,
  Edit2,
  Save,
  Users,
  Smartphone,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import type { Customer, Sale } from '../../types.js';

interface EligibleClient {
  id: string;
  customerName: string;
  customerPhone: string;
  deviceModel: string;
  purchaseDate: string;
  batteryHealth?: number;
}

interface LifecycleRuleUI {
  id: string;
  code: 'd0_warranty' | 'd15_accessories' | 'd180_battery_checkup' | 'd360_upgrade';
  name: string;
  triggerDays: number;
  description: string;
  active: boolean;
  templateMessage: string;
  eligibleCount: number;
  executedCount: number;
  convertedCount: number;
  lastExecutedAt?: string;
  eligibleClients: EligibleClient[];
}

interface CrmAutomationRulesViewProps {
  sales?: Sale[];
  customers?: Customer[];
}

const DEFAULT_RULES: LifecycleRuleUI[] = [
  {
    id: 'rule-d0',
    code: 'd0_warranty',
    name: 'D+0: Termo de Garantia Imediato & Agradecimento',
    triggerDays: 0,
    description: 'Disparado logo após a conclusão da venda no balcão com o termo de garantia oficial de 90 dias.',
    active: true,
    templateMessage: 'Olá {cliente}! Parabéns pelo seu novo {aparelho}! 📱✨ Segue o seu Termo de Garantia de 90 dias da Hiago iPhones. Seu aparelho foi 100% testado e higienizado antes da entrega. Qualquer dúvida sobre o uso ou backup, estamos à disposição por aqui!',
    eligibleCount: 3,
    executedCount: 42,
    convertedCount: 42,
    lastExecutedAt: new Date(Date.now() - 1800000).toISOString(),
    eligibleClients: [
      { id: 'cli-01', customerName: 'Felipe Santana', customerPhone: '(77) 99112-8877', deviceModel: 'iPhone 14 128GB Azul', purchaseDate: 'Hoje' },
      { id: 'cli-02', customerName: 'Renata Meireles', customerPhone: '(77) 99881-2233', deviceModel: 'iPhone 13 128GB Estelar', purchaseDate: 'Hoje' },
      { id: 'cli-03', customerName: 'Diego Silveira', customerPhone: '(77) 98114-5566', deviceModel: 'iPhone 15 256GB Preto', purchaseDate: 'Hoje' },
    ],
  },
  {
    id: 'rule-d15',
    code: 'd15_accessories',
    name: 'D+15: Oferta de Acessórios & Proteção',
    triggerDays: 15,
    description: 'Contato pós-adaptação para oferecer fonte turbo 20W, cabos homologados e película de reposição.',
    active: true,
    templateMessage: 'Olá {cliente}, tudo bem? Passando para checar como está a sua experiência com o seu {aparelho}! 🔋⚡ Se estiver precisando de fonte turbo USB-C de 20W original, fones ou uma capinha de silicone extra, separamos um cupom de 15% OFF de boas-vindas na loja para você hoje!',
    eligibleCount: 4,
    executedCount: 38,
    convertedCount: 14,
    lastExecutedAt: new Date(Date.now() - 86400000).toISOString(),
    eligibleClients: [
      { id: 'cli-04', customerName: 'Larissa Alencar', customerPhone: '(77) 98822-4411', deviceModel: 'iPhone 13 128GB', purchaseDate: 'Há 15 dias' },
      { id: 'cli-05', customerName: 'Bruno Carvalho', customerPhone: '(77) 99933-7788', deviceModel: 'iPhone 12 64GB', purchaseDate: 'Há 15 dias' },
      { id: 'cli-06', customerName: 'Juliana Pires', customerPhone: '(77) 99122-3344', deviceModel: 'iPhone 14 Pro 128GB', purchaseDate: 'Há 16 dias' },
      { id: 'cli-07', customerName: 'Gustavo Lima', customerPhone: '(77) 99877-6655', deviceModel: 'iPhone 11 128GB', purchaseDate: 'Há 15 dias' },
    ],
  },
  {
    id: 'rule-d180',
    code: 'd180_battery_checkup',
    name: 'D+180: Revisão Preventiva & Saúde da Bateria (6 Meses)',
    triggerDays: 180,
    description: 'Convite para avaliação de bancada gratuita e diagnóstico da saúde da bateria aos 6 meses de uso.',
    active: true,
    templateMessage: 'Olá {cliente}! Seu {aparelho} completou 6 meses com você! 🛠️✨ Como está a saúde da bateria dele? Gostaríamos de te convidar para passar aqui na nossa loja física para um check-up preventivo gratuito de bancada e limpeza interna de conectores. Vamos agendar?',
    eligibleCount: 3,
    executedCount: 29,
    convertedCount: 11,
    lastExecutedAt: new Date(Date.now() - 172800000).toISOString(),
    eligibleClients: [
      { id: 'cli-08', customerName: 'Thiago Nogueira', customerPhone: '(77) 98112-9900', deviceModel: 'iPhone 12 128GB', purchaseDate: 'Há 6 meses', batteryHealth: 87 },
      { id: 'cli-09', customerName: 'Beatriz Ramos', customerPhone: '(77) 99911-3322', deviceModel: 'iPhone 13 128GB', purchaseDate: 'Há 6 meses', batteryHealth: 89 },
      { id: 'cli-10', customerName: 'Carlos Eduardo', customerPhone: '(77) 98844-1122', deviceModel: 'iPhone 11 64GB', purchaseDate: 'Há 6 meses', batteryHealth: 83 },
    ],
  },
  {
    id: 'rule-d360',
    code: 'd360_upgrade',
    name: 'D+360: Ciclo de Upgrade & Avaliação de Trade-in (1 Ano)',
    triggerDays: 360,
    description: 'Campanha de aniversário de 1 ano do aparelho com avaliação máxima garantida do usado na troca.',
    active: true,
    templateMessage: 'Olá {cliente}! Seu {aparelho} completou 1 ano de uso hoje! 🥳🎉 Essa é a melhor janela de mercado para troca antes da desvalorização do próximo ciclo da Apple. Nós pré-aprovamos uma avaliação excelente do seu aparelho atual como entrada para você sair de iPhone mais novo hoje. Quer que eu faça uma simulação de parcelas sem compromisso?',
    eligibleCount: 2,
    executedCount: 18,
    convertedCount: 9,
    lastExecutedAt: new Date(Date.now() - 259200000).toISOString(),
    eligibleClients: [
      { id: 'cli-11', customerName: 'Marcelo Queiroz', customerPhone: '(77) 99188-7766', deviceModel: 'iPhone 13 128GB', purchaseDate: 'Há 12 meses', batteryHealth: 84 },
      { id: 'cli-12', customerName: 'Fernanda Diniz', customerPhone: '(77) 98877-2211', deviceModel: 'iPhone 12 64GB', purchaseDate: 'Há 12 meses', batteryHealth: 81 },
    ],
  },
];

export const CrmAutomationRulesView: React.FC<CrmAutomationRulesViewProps> = () => {
  const [rules, setRules] = useState<LifecycleRuleUI[]>(DEFAULT_RULES);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editedTemplate, setEditedTemplate] = useState<string>('');
  const [dispatchingRuleId, setDispatchingRuleId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [expandedClientsRuleId, setExpandedClientsRuleId] = useState<string | null>('rule-d0');

  useEffect(() => {
    fetch('/api/whatsapp/rules')
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          setRules(json.data);
        }
      })
      .catch(() => {
        // Usa DEFAULT_RULES de fallback
      });
  }, []);

  const handleToggle = async (ruleId: string) => {
    try {
      const res = await fetch(`/api/whatsapp/rules/${ruleId}/toggle`, { method: 'POST' });
      const json = await res.json();
      if (json.success && json.data) {
        setRules(prev => prev.map(r => r.id === ruleId ? json.data : r));
        setFeedbackMessage({ text: `Régua ${json.data.active ? 'ativada' : 'pausada'} com sucesso!`, type: 'info' });
        setTimeout(() => setFeedbackMessage(null), 3000);
        return;
      }
    } catch {
      // Local fallback
    }
    setRules(prev => prev.map(r => r.id === ruleId ? { ...r, active: !r.active } : r));
  };

  const handleStartEdit = (rule: LifecycleRuleUI) => {
    setEditingRuleId(rule.id);
    setEditedTemplate(rule.templateMessage);
  };

  const handleSaveTemplate = async (ruleId: string) => {
    try {
      await fetch(`/api/whatsapp/rules/${ruleId}/template`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateMessage: editedTemplate }),
      });
    } catch {
      // Local fallback
    }
    setRules(prev => prev.map(r => r.id === ruleId ? { ...r, templateMessage: editedTemplate } : r));
    setEditingRuleId(null);
    setFeedbackMessage({ text: 'Template da régua atualizado com sucesso!', type: 'success' });
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const handleTriggerBatch = async (rule: LifecycleRuleUI) => {
    setDispatchingRuleId(rule.id);
    try {
      const res = await fetch(`/api/whatsapp/rules/${rule.id}/trigger-batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operator: 'Hiago Vendas' }),
      });
      const json = await res.json();
      if (json.success) {
        setRules(prev => prev.map(r => r.id === rule.id ? {
          ...r,
          executedCount: r.executedCount + r.eligibleClients.length,
          lastExecutedAt: new Date().toISOString(),
        } : r));
        setFeedbackMessage({
          text: `🚀 Lote de ${rule.eligibleClients.length} mensagens disparado com sucesso via Meta Cloud API!`,
          type: 'success',
        });
      } else {
        throw new Error(json.error || 'Erro no envio');
      }
    } catch {
      // Fallback de demonstração em modo offline/dev
      setRules(prev => prev.map(r => r.id === rule.id ? {
        ...r,
        executedCount: r.executedCount + r.eligibleClients.length,
        lastExecutedAt: new Date().toISOString(),
      } : r));
      setFeedbackMessage({
        text: `🚀 [Modo Dev] Lote de ${rule.eligibleClients.length} mensagens disparado via Meta Cloud Simulado!`,
        type: 'success',
      });
    } finally {
      setDispatchingRuleId(null);
      setTimeout(() => setFeedbackMessage(null), 4500);
    }
  };

  // Indicadores
  const totalEligible = rules.reduce((acc, r) => acc + (r.active ? r.eligibleClients.length : 0), 0);
  const totalExecuted = rules.reduce((acc, r) => acc + r.executedCount, 0);
  const totalConverted = rules.reduce((acc, r) => acc + r.convertedCount, 0);
  const conversionRate = totalExecuted > 0 ? ((totalConverted / totalExecuted) * 100).toFixed(1) : '0';

  const getRuleIcon = (code: string) => {
    switch (code) {
      case 'd0_warranty':
        return <ShieldCheck size={20} className="text-emerald-400" />;
      case 'd15_accessories':
        return <Headphones size={20} className="text-amber-400" />;
      case 'd180_battery_checkup':
        return <BatteryCharging size={20} className="text-blue-400" />;
      case 'd360_upgrade':
        return <RefreshCw size={20} className="text-purple-400" />;
      default:
        return <Zap size={20} className="text-orange-400" />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
      {/* Header com Descrição & Status */}
      <div style={{
        backgroundColor: '#1E293B',
        borderRadius: 12,
        padding: 24,
        border: '1px solid #334155',
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: 8,
                backgroundColor: 'rgba(249, 115, 22, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f97316'
              }}>
                <Zap size={22} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                  Motor de Réguas Automáticas Plug & Play (Épico 09)
                </h2>
                <p style={{ fontSize: '0.875rem', color: '#94A3B8', margin: '4px 0 0 0' }}>
                  Automação oficial via Meta Cloud API para pós-venda, retenção, venda de acessórios e upgrades periódicos de iPhones.
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 20,
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: '#34D399',
              fontSize: '0.8125rem',
              fontWeight: 600,
            }}>
              <CheckCircle2 size={14} /> 4 Réguas Plug & Play Ativas
            </span>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedbackMessage && (
          <div style={{
            padding: '12px 16px',
            borderRadius: 8,
            backgroundColor: feedbackMessage.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)',
            border: `1px solid ${feedbackMessage.type === 'success' ? '#10B981' : '#3B82F6'}`,
            color: '#FFFFFF',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <CheckCircle2 size={18} color={feedbackMessage.type === 'success' ? '#34D399' : '#60A5FA'} />
            <span>{feedbackMessage.text}</span>
          </div>
        )}

        {/* 4 KPIs de Retenção */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <div style={{ backgroundColor: '#0F172A', padding: 16, borderRadius: 8, border: '1px solid #334155' }}>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Elegíveis na Fila Hoje</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#F97316', marginTop: 4 }}>{totalEligible} clientes</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 2 }}>Prontos para envio de mensagem</div>
          </div>
          <div style={{ backgroundColor: '#0F172A', padding: 16, borderRadius: 8, border: '1px solid #334155' }}>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Mensagens Disparadas</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#38BDF8', marginTop: 4 }}>{totalExecuted} msgs</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 2 }}>Histórico de réguas executadas</div>
          </div>
          <div style={{ backgroundColor: '#0F172A', padding: 16, borderRadius: 8, border: '1px solid #334155' }}>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Retornos & Conversões</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#34D399', marginTop: 4 }}>{totalConverted} vendas</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 2 }}>Acessórios, serviços e upgrades</div>
          </div>
          <div style={{ backgroundColor: '#0F172A', padding: 16, borderRadius: 8, border: '1px solid #334155' }}>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Taxa de Conversão</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#A78BFA', marginTop: 4 }}>{conversionRate}%</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 2 }}>Média de retorno das 4 réguas</div>
          </div>
        </div>
      </div>

      {/* Grid com os 4 Cards das Réguas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {rules.map((rule) => {
          const isEditing = editingRuleId === rule.id;
          const isDispatching = dispatchingRuleId === rule.id;
          const isExpandedClients = expandedClientsRuleId === rule.id;

          return (
            <div
              key={rule.id}
              style={{
                backgroundColor: '#1E293B',
                borderRadius: 12,
                border: rule.active ? '1px solid #334155' : '1px dashed #475569',
                opacity: rule.active ? 1 : 0.75,
                overflow: 'hidden',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Topo do Card */}
              <div style={{
                padding: '18px 24px',
                borderBottom: '1px solid #334155',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12,
                backgroundColor: '#1E293B'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {getRuleIcon(rule.code)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                      {rule.name}
                    </h3>
                    <p style={{ fontSize: '0.8125rem', color: '#94A3B8', margin: '2px 0 0 0' }}>
                      {rule.description}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {/* Status Toggle */}
                  <button
                    onClick={() => handleToggle(rule.id)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 20,
                      border: 'none',
                      backgroundColor: rule.active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                      color: rule.active ? '#34D399' : '#94A3B8',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {rule.active ? '● Ativa' : '○ Pausada'}
                  </button>

                  {/* Disparar Lote Button */}
                  <button
                    disabled={!rule.active || rule.eligibleClients.length === 0 || isDispatching}
                    onClick={() => handleTriggerBatch(rule)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 16px',
                      borderRadius: 8,
                      border: 'none',
                      backgroundColor: (!rule.active || rule.eligibleClients.length === 0) ? '#475569' : '#16A34A',
                      color: '#FFFFFF',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      cursor: (!rule.active || rule.eligibleClients.length === 0 || isDispatching) ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Send size={14} />
                    <span>{isDispatching ? 'Disparando Lote...' : `Disparar Lote (${rule.eligibleClients.length})`}</span>
                  </button>
                </div>
              </div>

              {/* Corpo com Template da Mensagem & Métricas */}
              <div style={{ padding: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
                {/* Coluna 1: Template de Mensagem */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#94A3B8' }}>
                      Template Oficial WhatsApp (Meta Cloud)
                    </span>
                    {!isEditing ? (
                      <button
                        onClick={() => handleStartEdit(rule)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          background: 'none',
                          border: 'none',
                          color: '#38BDF8',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          fontWeight: 600,
                        }}
                      >
                        <Edit2 size={12} /> Editar
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSaveTemplate(rule.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          background: 'none',
                          border: 'none',
                          color: '#34D399',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          fontWeight: 600,
                        }}
                      >
                        <Save size={12} /> Salvar Template
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <textarea
                      value={editedTemplate}
                      onChange={(e) => setEditedTemplate(e.target.value)}
                      rows={4}
                      style={{
                        width: '100%',
                        backgroundColor: '#0F172A',
                        border: '1px solid #38BDF8',
                        borderRadius: 8,
                        padding: 12,
                        color: '#F8FAFC',
                        fontSize: '0.875rem',
                        lineHeight: 1.5,
                        resize: 'vertical',
                        outline: 'none',
                      }}
                    />
                  ) : (
                    <div style={{
                      backgroundColor: '#0F172A',
                      border: '1px solid #334155',
                      borderRadius: 8,
                      padding: 14,
                      color: '#E2E8F0',
                      fontSize: '0.875rem',
                      lineHeight: 1.5,
                    }}>
                      {rule.templateMessage}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.7rem', color: '#64748B' }}>Tags disponíveis:</span>
                    <span style={{ fontSize: '0.7rem', backgroundColor: '#334155', color: '#38BDF8', padding: '2px 6px', borderRadius: 4 }}>
                      {'{cliente}'}
                    </span>
                    <span style={{ fontSize: '0.7rem', backgroundColor: '#334155', color: '#F97316', padding: '2px 6px', borderRadius: 4 }}>
                      {'{aparelho}'}
                    </span>
                  </div>
                </div>

                {/* Coluna 2: Indicadores da Régua */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#94A3B8' }}>
                    Resultados & Conversão da Régua
                  </span>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div style={{ backgroundColor: '#0F172A', padding: 12, borderRadius: 8, border: '1px solid #334155' }}>
                      <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Disparos Executados</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#F8FAFC', marginTop: 2 }}>{rule.executedCount}</div>
                    </div>
                    <div style={{ backgroundColor: '#0F172A', padding: 12, borderRadius: 8, border: '1px solid #334155' }}>
                      <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Vendas Convertidas</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#34D399', marginTop: 2 }}>{rule.convertedCount}</div>
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: '#0F172A',
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1px solid #334155',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Taxa de Conversão:</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#A78BFA' }}>
                      {rule.executedCount > 0 ? ((rule.convertedCount / rule.executedCount) * 100).toFixed(1) : 0}%
                    </span>
                  </div>

                  {rule.lastExecutedAt && (
                    <div style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={12} />
                      <span>Último disparo: {new Date(rule.lastExecutedAt).toLocaleDateString('pt-BR')} às {new Date(rule.lastExecutedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Lista Recolhível de Clientes Elegíveis */}
              <div style={{ borderTop: '1px solid #334155', backgroundColor: '#0F172A' }}>
                <button
                  onClick={() => setExpandedClientsRuleId(isExpandedClients ? null : rule.id)}
                  style={{
                    width: '100%',
                    padding: '10px 24px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    color: '#94A3B8',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Users size={14} color="#38BDF8" />
                    <span>Clientes Elegíveis para este Disparo ({rule.eligibleClients.length})</span>
                  </span>
                  {isExpandedClients ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {isExpandedClients && (
                  <div style={{ padding: '0 24px 16px 24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {rule.eligibleClients.map((client) => (
                        <div
                          key={client.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: '#1E293B',
                            padding: '10px 14px',
                            borderRadius: 6,
                            border: '1px solid #334155',
                            fontSize: '0.8125rem',
                            flexWrap: 'wrap',
                            gap: 8,
                          }}
                        >
                          <div>
                            <span style={{ fontWeight: 600, color: '#F8FAFC' }}>{client.customerName}</span>
                            <span style={{ color: '#64748B', marginLeft: 8 }}>{client.customerPhone}</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ color: '#F97316', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Smartphone size={13} /> {client.deviceModel}
                            </span>
                            {client.batteryHealth && (
                              <span style={{
                                backgroundColor: client.batteryHealth < 85 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(52, 211, 153, 0.2)',
                                color: client.batteryHealth < 85 ? '#F87171' : '#34D399',
                                padding: '2px 8px',
                                borderRadius: 12,
                                fontSize: '0.75rem',
                                fontWeight: 700,
                              }}>
                                🔋 {client.batteryHealth}%
                              </span>
                            )}
                            <span style={{ color: '#94A3B8', fontSize: '0.75rem' }}>{client.purchaseDate}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
