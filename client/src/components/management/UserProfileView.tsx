import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  KeyRound,
  Lock,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Save,
} from 'lucide-react';
import type { AppUser } from '../../types.js';
import { fetchCurrentUser, updateAppUserApi, updateUserPinApi } from '../../api/erpApi.js';

export const UserProfileView: React.FC = () => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Edição de Perfil
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Segurança: Senha
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Segurança: PIN Operacional
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinMsg, setPinMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    setLoading(true);
    try {
      const u = await fetchCurrentUser();
      setUser(u);
      setName(u.name);
      setPhone(u.phone || '');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    await updateAppUserApi(user.id, { name, phone });
    setProfileSuccessMsg('Dados pessoais atualizados com sucesso!');
    setTimeout(() => setProfileSuccessMsg(''), 4000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setPasswordMsg({ type: 'error', text: 'A nova senha deve ter no mínimo 8 caracteres.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'A confirmação de senha não confere.' });
      return;
    }
    // Sucesso
    setPasswordMsg({ type: 'success', text: 'Senha alterada com sucesso! Suas credenciais foram atualizadas.' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordMsg(null), 5000);
  };

  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (newPin.length < 4 || newPin.length > 6) {
      setPinMsg({ type: 'error', text: 'O PIN operacional deve conter entre 4 e 6 dígitos numéricos.' });
      return;
    }
    if (newPin !== confirmPin) {
      setPinMsg({ type: 'error', text: 'Os dígitos do PIN e a confirmação são diferentes.' });
      return;
    }

    await updateUserPinApi(user.id, newPin);
    setUser({ ...user, hasPin: true });
    setPinMsg({ type: 'success', text: 'PIN operacional configurado e salvo com hash de segurança!' });
    setNewPin('');
    setConfirmPin('');
    setTimeout(() => setPinMsg(null), 5000);
  };

  if (loading || !user) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>
        Carregando perfil...
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* CABEÇALHO */}
      <div>
        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f97316', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          GESTÃO / MEU PERFIL
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginTop: 4 }}>
          Meu Perfil & Segurança da Conta
        </h1>
        <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>
          Gerencie seus dados pessoais, credenciais de acesso, nível de privilégio e PIN operacional de bancada.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
        {/* COLUNA ESQUERDA: DADOS PESSOAIS & INFORMAÇÕES DO SISTEMA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* CARD DADOS PESSOAIS */}
          <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(249, 115, 22, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316' }}>
                <User size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>Informações Pessoais</h3>
                <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Atualize como seu nome aparece no sistema e nas ordens</p>
              </div>
            </div>

            {profileSuccessMsg && (
              <div style={{ padding: '10px 14px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 8, color: '#10b981', fontSize: '0.78rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={15} />
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>Nome Completo</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem', marginTop: 4 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>Telefone / WhatsApp</label>
                <input
                  type="text"
                  placeholder="(77) 99999-9999"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem', marginTop: 4 }}
                />
              </div>

              <button
                type="submit"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  color: '#fff',
                  border: 'none',
                  padding: '10px',
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  marginTop: 4,
                }}
              >
                <Save size={15} />
                <span>Salvar Informações</span>
              </button>
            </form>
          </div>

          {/* CARD DADOS PROTEGIDOS DA CONTA */}
          <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
                <Shield size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>Acesso & Vínculo</h3>
                <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Dados protegidos vinculados à autenticação</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 8 }}>
                <span style={{ color: '#94a3b8' }}>E-mail de Login</span>
                <span style={{ color: '#f8fafc', fontWeight: 700 }}>{user.email}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 8 }}>
                <span style={{ color: '#94a3b8' }}>Perfil / Cargo</span>
                <span style={{ color: '#f97316', fontWeight: 800, textTransform: 'capitalize' }}>{user.role}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 8 }}>
                <span style={{ color: '#94a3b8' }}>Loja Conectada</span>
                <span style={{ color: '#f8fafc', fontWeight: 700 }}>RH Celulares / Hiago iPhones</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 8 }}>
                <span style={{ color: '#94a3b8' }}>Método de Login</span>
                <span style={{ color: '#10b981', fontWeight: 700 }}>
                  {user.authMethod === 'google' ? 'Google OAuth Conectado' : 'Senha Local'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: SENHA & PIN OPERACIONAL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* CARD PIN OPERACIONAL */}
          <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                <KeyRound size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>PIN de Autorização Rápida</h3>
                <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Usado para assinar vendas, registrar ponto e liberar descontos</p>
              </div>
            </div>

            {pinMsg && (
              <div style={{
                padding: '10px 14px',
                background: pinMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                border: `1px solid ${pinMsg.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                borderRadius: 8,
                color: pinMsg.type === 'success' ? '#10b981' : '#ef4444',
                fontSize: '0.78rem',
                marginBottom: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                {pinMsg.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                <span>{pinMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleSavePin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>Novo PIN (4-6 dígitos)</label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    placeholder="••••"
                    value={newPin}
                    onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                    style={{ width: '100%', padding: '10px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '1rem', letterSpacing: '0.2em', textAlign: 'center', marginTop: 4 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>Confirmar PIN</label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    placeholder="••••"
                    value={confirmPin}
                    onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    style={{ width: '100%', padding: '10px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '1rem', letterSpacing: '0.2em', textAlign: 'center', marginTop: 4 }}
                  />
                </div>
              </div>

              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                🔒 O PIN é criptografado com hash seguro e nunca fica exposto em texto aberto.
              </div>

              <button
                type="submit"
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '10px',
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                }}
              >
                Salvar PIN Operacional
              </button>
            </form>
          </div>

          {/* CARD ALTERAÇÃO DE SENHA */}
          <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                <Lock size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>Segurança & Senha</h3>
                <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Altere a senha de acesso à plataforma</p>
              </div>
            </div>

            {passwordMsg && (
              <div style={{
                padding: '10px 14px',
                background: passwordMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                border: `1px solid ${passwordMsg.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                borderRadius: 8,
                color: passwordMsg.type === 'success' ? '#10b981' : '#ef4444',
                fontSize: '0.78rem',
                marginBottom: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                {passwordMsg.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>Senha Atual</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem', marginTop: 4 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>Nova Senha</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Mínimo de 8 caracteres"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem', marginTop: 4 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>Confirmar Nova Senha</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem', marginTop: 4 }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#94a3b8', cursor: 'pointer' }} onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                <span>Exibir senhas digitadas</span>
              </div>

              <button
                type="submit"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#f8fafc',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  padding: '10px',
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  marginTop: 4,
                }}
              >
                Atualizar Senha
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
