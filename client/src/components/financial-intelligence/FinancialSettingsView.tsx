import React, { useState, useEffect } from 'react';
import {
  Key,
  Percent,
  CheckCircle2,
  AlertCircle,
  Save,
} from 'lucide-react';
import type { FinancialIntelligenceConfig } from '../../types.js';
import { FinancialIntelligenceRepository } from '../../repositories/financialIntelligenceRepository.js';

export const FinancialSettingsView: React.FC = () => {
  const [config, setConfig] = useState<FinancialIntelligenceConfig>(() => {
    return FinancialIntelligenceRepository.getConfig();
  });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [serverStatus, setServerStatus] = useState<{ configured: boolean; model?: string }>({ configured: false });

  useEffect(() => {
    async function checkServer() {
      try {
        const res = await fetch('/api/financial-intelligence/config');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setServerStatus({
              configured: json.data.openaiApiKeyConfigured,
              model: json.data.model,
            });
          }
        }
      } catch (e) {
        // Fallback offline
      }
    }
    checkServer();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = FinancialIntelligenceRepository.saveConfig(config);
    setConfig(updated);

    try {
      await fetch('/api/financial-intelligence/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
    } catch (e) {}

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 840 }}>
      {/* 1. CABEÇALHO */}
      <div style={{
        background: '#0d1322',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 14,
        padding: '20px 24px',
      }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc' }}>
          Configurações da Inteligência Financeira & Parâmetros
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: 4 }}>
          Ajuste as premissas de cálculo do DRE, metas de rentabilidade e parâmetros da OpenAI API.
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* 2. CARD INTEGRAÇÃO COM OPENAI API */}
        <div style={{
          background: '#0d1322',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 14,
          padding: 22,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Key size={18} color="#f59e0b" />
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>
              Integração com OpenAI API (Servidor Seguro)
            </h3>
          </div>

          <div style={{
            background: serverStatus.configured ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
            border: `1px solid ${serverStatus.configured ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
            borderRadius: 8,
            padding: 14,
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            {serverStatus.configured ? (
              <CheckCircle2 size={20} color="#10b981" />
            ) : (
              <AlertCircle size={20} color="#f59e0b" />
            )}
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
              {serverStatus.configured ? (
                <>
                  <strong style={{ color: '#10b981' }}>Chave da OpenAI ativa no Servidor.</strong> As análises executam com inteligência generativa oficial da OpenAI em conjunto com o motor determinístico.
                </>
              ) : (
                <>
                  <strong style={{ color: '#f59e0b' }}>Modo Motor Determinístico Ativo:</strong> Nenhuma chave <code>OPENAI_API_KEY</code> detectada no servidor. O sistema continua operando com 100% das fórmulas, DRE, cenários e recomendações baseadas nas regras de negócio.
                </>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: 6 }}>
                Modelo da OpenAI:
              </label>
              <select
                value={config.model}
                onChange={e => setConfig({ ...config, model: e.target.value })}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 6,
                  color: '#fff',
                  fontSize: '0.82rem',
                }}
              >
                <option value="gpt-4o-mini">GPT-4o Mini (Recomendado - Rápido & Econômico)</option>
                <option value="gpt-4o">GPT-4o (Completo - Raciocínio Avançado)</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: 6 }}>
                Temperatura (Criatividade vs Precisão):
              </label>
              <input
                type="number"
                min="0.1"
                max="0.7"
                step="0.1"
                value={config.temperature}
                onChange={e => setConfig({ ...config, temperature: parseFloat(e.target.value) || 0.3 })}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 6,
                  color: '#fff',
                  fontSize: '0.82rem',
                }}
              />
              <span style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 4, display: 'block' }}>
                Padrão 0.3 para garantir respostas rigorosas e sem alucinações.
              </span>
            </div>
          </div>
        </div>

        {/* 3. PARÂMETROS FINANCEIROS DA OPERAÇÃO */}
        <div style={{
          background: '#0d1322',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 14,
          padding: 22,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Percent size={18} color="#3b82f6" />
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>
              Parâmetros de Cálculo da Controladoria (RM SaaS)
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: 6 }}>
                Taxa Média de Cartão Provisionada (%):
              </label>
              <input
                type="number"
                step="0.1"
                value={config.defaultCardFeeRate}
                onChange={e => setConfig({ ...config, defaultCardFeeRate: parseFloat(e.target.value) || 3.2 })}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 6,
                  color: '#fff',
                  fontSize: '0.82rem',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: 6 }}>
                Meta de Margem Bruta Geral (%):
              </label>
              <input
                type="number"
                step="0.5"
                value={config.targetGrossMargin}
                onChange={e => setConfig({ ...config, targetGrossMargin: parseFloat(e.target.value) || 25.0 })}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 6,
                  color: '#fff',
                  fontSize: '0.82rem',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: 6 }}>
                Dias Mínimos de Reserva de Caixa:
              </label>
              <input
                type="number"
                value={config.minCashReserveDays}
                onChange={e => setConfig({ ...config, minCashReserveDays: parseInt(e.target.value) || 30 })}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 6,
                  color: '#fff',
                  fontSize: '0.82rem',
                }}
              />
            </div>
          </div>
        </div>

        {/* BOTÃO SALVAR */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            type="submit"
            style={{
              background: '#3b82f6',
              border: 'none',
              color: '#fff',
              padding: '10px 24px',
              borderRadius: 8,
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Save size={16} />
            <span>Salvar Configurações</span>
          </button>

          {savedSuccess && (
            <span style={{ fontSize: '0.8rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={16} />
              Configurações salvas com sucesso!
            </span>
          )}
        </div>
      </form>
    </div>
  );
};
