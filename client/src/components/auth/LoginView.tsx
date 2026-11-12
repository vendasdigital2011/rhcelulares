import React, { useState } from 'react';
import {
  Smartphone,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Building2,
  Users,
  Wrench,
  ShoppingBag
} from 'lucide-react';
import { AuthService, type AuthUser, type UserRole } from '../../services/authService.js';

interface LoginViewProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTenantId, setSelectedTenantId] = useState<string>('tenant-001');

  const tenants = AuthService.getTenants();

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor preencha e-mail e senha.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const user = await AuthService.login(email, password);
      // Vincula a loja selecionada
      if (user.tenantId !== selectedTenantId) {
        AuthService.switchTenant(selectedTenantId);
      }
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar login.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (role: UserRole) => {
    setError(null);
    const user = AuthService.quickLoginAs(role);
    if (user.tenantId !== selectedTenantId) {
      AuthService.switchTenant(selectedTenantId);
    }
    onLoginSuccess(user);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0F172A',
        backgroundImage: 'radial-gradient(at 0% 0%, rgba(37, 99, 235, 0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(22, 163, 74, 0.15) 0px, transparent 50%)',
        padding: '24px',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* CABEÇALHO DO LOGIN */}
        <div
          style={{
            padding: '28px 28px 20px',
            textAlign: 'center',
            borderBottom: '1px solid #F1F5F9',
            backgroundColor: '#FAFAFA',
          }}
        >
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 14,
              backgroundColor: '#16A34A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
              boxShadow: '0 8px 16px -2px rgba(22, 163, 74, 0.3)',
            }}
          >
            <Smartphone size={28} color="#FFFFFF" />
          </div>

          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
            Hiago iPhones ERP
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: '6px 0 0' }}>
            Acesso ao Sistema Comercial & CRM WhatsApp 360°
          </p>
        </div>

        {/* CORPO DO FORMULÁRIO */}
        <div style={{ padding: '24px 28px' }}>
          {error && (
            <div
              style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#DC2626',
                borderRadius: 8,
                padding: '10px 14px',
                fontSize: '0.75rem',
                fontWeight: 600,
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleFormLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* SELETOR DE LOJA MULTI-TENANT */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <Building2 size={14} color="#2563EB" />
                <span>Loja / Filial (Multi-Tenant):</span>
              </label>
              <select
                value={selectedTenantId}
                onChange={(e) => setSelectedTenantId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid #CBD5E1',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: '#0F172A',
                  backgroundColor: '#F8FAFC',
                  outline: 'none',
                }}
              >
                {tenants.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* E-MAIL */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <Mail size={14} color="#64748B" />
                <span>E-mail do Usuário:</span>
              </label>
              <input
                type="email"
                placeholder="Ex: admin@hiagoiphones.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid #CBD5E1',
                  fontSize: '0.8125rem',
                  color: '#0F172A',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* SENHA */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <Lock size={14} color="#64748B" />
                <span>Senha:</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid #CBD5E1',
                  fontSize: '0.8125rem',
                  color: '#0F172A',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 6,
                backgroundColor: '#16A34A',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 8,
                padding: '11px',
                fontSize: '0.875rem',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{loading ? 'Entrando...' : 'Entrar no Sistema'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* DIVISOR */}
          <div style={{ position: 'relative', margin: '22px 0 16px', textAlign: 'center' }}>
            <div style={{ position: 'absolute', inset: '50% 0 0', borderTop: '1px solid #E2E8F0' }} />
            <span style={{ position: 'relative', backgroundColor: '#FFFFFF', padding: '0 10px', fontSize: '0.6875rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>
              Ou acesse por Perfil RBAC (Demonstração)
            </span>
          </div>

          {/* BOTÕES DE ACESSO RÁPIDO 1-CLIQUE */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              style={{
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                color: '#1E40AF',
                borderRadius: 8,
                padding: '8px 10px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                textAlign: 'left',
              }}
            >
              <ShieldCheck size={16} color="#2563EB" />
              <div>
                <div>👑 Dono</div>
                <div style={{ fontSize: '0.625rem', fontWeight: 500, color: '#3B82F6' }}>Acesso Total</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('manager')}
              style={{
                backgroundColor: '#FEF3C7',
                border: '1px solid #FDE68A',
                color: '#92400E',
                borderRadius: 8,
                padding: '8px 10px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                textAlign: 'left',
              }}
            >
              <Users size={16} color="#D97706" />
              <div>
                <div>💼 Gerente</div>
                <div style={{ fontSize: '0.625rem', fontWeight: 500, color: '#B45309' }}>Vendas & Equipe</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('seller')}
              style={{
                backgroundColor: '#DCFCE7',
                border: '1px solid #BBF7D0',
                color: '#166534',
                borderRadius: 8,
                padding: '8px 10px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                textAlign: 'left',
              }}
            >
              <ShoppingBag size={16} color="#16A34A" />
              <div>
                <div>📱 Vendedor</div>
                <div style={{ fontSize: '0.625rem', fontWeight: 500, color: '#15803D' }}>PDV & WhatsApp</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('technician')}
              style={{
                backgroundColor: '#F1F5F9',
                border: '1px solid #E2E8F0',
                color: '#334155',
                borderRadius: 8,
                padding: '8px 10px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                textAlign: 'left',
              }}
            >
              <Wrench size={16} color="#475569" />
              <div>
                <div>🔧 Técnico</div>
                <div style={{ fontSize: '0.625rem', fontWeight: 500, color: '#64748B' }}>Ordens de Serviço</div>
              </div>
            </button>
          </div>
        </div>

        {/* RODAPÉ */}
        <div
          style={{
            padding: '12px 28px',
            backgroundColor: '#F8FAFC',
            borderTop: '1px solid #F1F5F9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.6875rem',
            color: '#64748B',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <ShieldCheck size={12} color="#16A34A" />
            <span>Sessão Segura JWT / RLS</span>
          </span>
          <span>v2.1 • Multi-Tenant</span>
        </div>
      </div>
    </div>
  );
};

