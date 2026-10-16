import React, { useState, useEffect } from 'react';
import {
  Save,
  UserPlus,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import type { AppUser, ModulePermissions } from '../../types.js';
import {
  fetchAppUsers,
  createAppUserApi,
  updateAppUserApi,
  updateUserPinApi,
  updateUserPermissionsApi,
} from '../../api/erpApi.js';

export const UsersPermissionsView: React.FC = () => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Form Novo Colaborador
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<AppUser['role']>('vendedor');
  const [inviteMsg, setInviteMsg] = useState('');

  // Edição do Usuário Selecionado
  const [editName, setEditName] = useState('');
  const [editStatus, setEditStatus] = useState<boolean>(true);
  const [editSuccessMsg, setEditSuccessMsg] = useState('');

  // PIN do Usuário Selecionado
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinSuccessMsg, setPinSuccessMsg] = useState('');

  // Permissões do Usuário Selecionado
  const [permissions, setPermissions] = useState<ModulePermissions | null>(null);
  const [permSuccessMsg, setPermSuccessMsg] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const list = await fetchAppUsers();
      setUsers(list);
      if (list.length > 0) {
        const target = list.find(u => u.id === selectedUserId) || list[0];
        setSelectedUserId(target.id);
        setEditName(target.name);
        setEditStatus(target.active);
        setPermissions(target.permissions);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSelectUser = (u: AppUser) => {
    setSelectedUserId(u.id);
    setEditName(u.name);
    setEditStatus(u.active);
    setPermissions(u.permissions);
    setEditSuccessMsg('');
    setPinSuccessMsg('');
    setPermSuccessMsg('');
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    await createAppUserApi({
      name: newName,
      email: newEmail,
      role: newRole,
    });

    setInviteMsg(`Convite enviado e colaborador ${newName} cadastrado com sucesso!`);
    setNewName('');
    setNewEmail('');
    setTimeout(() => setInviteMsg(''), 4000);
    loadUsers();
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;

    await updateAppUserApi(selectedUserId, {
      name: editName,
      active: editStatus,
    });

    setEditSuccessMsg('Dados do colaborador atualizados com sucesso!');
    setTimeout(() => setEditSuccessMsg(''), 4000);
    loadUsers();
  };

  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    if (newPin.length < 4) {
      alert('O PIN deve conter no mínimo 4 dígitos.');
      return;
    }
    if (newPin !== confirmPin) {
      alert('A confirmação do PIN não confere.');
      return;
    }

    await updateUserPinApi(selectedUserId, newPin);
    setPinSuccessMsg('PIN de balcão atualizado com sucesso!');
    setNewPin('');
    setConfirmPin('');
    setTimeout(() => setPinSuccessMsg(''), 4000);
  };

  const togglePermission = (module: keyof ModulePermissions, key: string) => {
    if (!permissions) return;
    const currentVal = (permissions[module] as any)[key];
    const updated = {
      ...permissions,
      [module]: {
        ...permissions[module],
        [key]: !currentVal,
      },
    };
    setPermissions(updated);
  };

  const handleSavePermissions = async () => {
    if (!selectedUserId || !permissions) return;
    await updateUserPermissionsApi(selectedUserId, permissions);
    setPermSuccessMsg('Matriz de permissões salva e aplicada com sucesso!');
    setTimeout(() => setPermSuccessMsg(''), 4000);
  };

  if (loading) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>
        Carregando equipe e permissões...
      </div>
    );
  }

  const activeUser = users.find(u => u.id === selectedUserId);

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* CABEÇALHO */}
      <div>
        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f97316', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          EQUIPE
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginTop: 4 }}>
          Usuários e permissões
        </h1>
        <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>
          Cadastre a equipe da loja, defina perfis de acesso e configure as permissões individuais.
        </p>
      </div>

      {/* CARD 1: EQUIPE AUTORIZADA (FORMULÁRIO DE ADICIONAR / CONVIDAR) */}
      <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(249, 115, 22, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316' }}>
            <UserPlus size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc' }}>Equipe autorizada</h3>
          </div>
        </div>

        {inviteMsg && (
          <div style={{ padding: '10px 14px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 8, color: '#10b981', fontSize: '0.78rem', marginBottom: 14 }}>
            {inviteMsg}
          </div>
        )}

        <form onSubmit={handleInviteUser}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8' }}>Nome</label>
              <input
                type="text"
                required
                placeholder="Nome do colaborador"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                style={{ width: '100%', marginTop: 4, padding: '10px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.82rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8' }}>E-mail do colaborador</label>
              <input
                type="email"
                required
                placeholder="email@gmail.com"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                style={{ width: '100%', marginTop: 4, padding: '10px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.82rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8' }}>Perfil inicial</label>
              <select
                value={newRole}
                onChange={e => setNewRole(e.target.value as any)}
                style={{ width: '100%', marginTop: 4, padding: '10px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.82rem' }}
              >
                <option value="vendedor">Vendedor</option>
                <option value="gerente">Gerente</option>
                <option value="tecnico">Técnico</option>
                <option value="financeiro">Financeiro</option>
                <option value="dono">Dono</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              marginTop: 16,
              padding: '12px',
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
            }}
          >
            Convidar
          </button>
        </form>
      </div>

      {/* SELEÇÃO DO USUÁRIO ATIVO & GERENCIAMENTO */}
      {activeUser && (
        <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* HEADER DO USUÁRIO SELECIONADO */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#10b981' }} />
              <div>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>
                  {activeUser.name}
                </span>
                <span style={{ marginLeft: 8, fontSize: '0.72rem', padding: '2px 8px', borderRadius: 6, background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontWeight: 700 }}>
                  Acesso {activeUser.role}
                </span>
                <span style={{ marginLeft: 8, fontSize: '0.72rem', color: '#10b981' }}>
                  • E-mail confirmado
                </span>
              </div>
            </div>

            {/* SELETOR DE COLABORADOR */}
            <div style={{ display: 'flex', gap: 8 }}>
              {users.map(u => (
                <button
                  key={u.id}
                  onClick={() => handleSelectUser(u)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background: u.id === selectedUserId ? '#f97316' : 'rgba(255, 255, 255, 0.05)',
                    color: u.id === selectedUserId ? '#fff' : '#94a3b8',
                  }}
                >
                  {u.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {editSuccessMsg && (
            <div style={{ padding: '8px 12px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: 6, color: '#10b981', fontSize: '0.75rem' }}>
              {editSuccessMsg}
            </div>
          )}

          {/* CAMPOS DE EDIÇÃO BÁSICA */}
          <form onSubmit={handleSaveUser}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8' }}>Nome</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  style={{ width: '100%', marginTop: 4, padding: '10px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.82rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8' }}>Status</label>
                <select
                  value={editStatus ? 'active' : 'inactive'}
                  onChange={e => setEditStatus(e.target.value === 'active')}
                  style={{ width: '100%', marginTop: 4, padding: '10px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.82rem' }}
                >
                  <option value="active">Ativo</option>
                  <option value="inactive">Desativado / Suspenso</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button
                type="button"
                onClick={() => setEditStatus(false)}
                style={{ flex: 1, padding: '9px', background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 8, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Desativar acesso
              </button>
              <button
                type="submit"
                style={{ flex: 1, padding: '9px', background: 'rgba(255, 255, 255, 0.08)', color: '#f8fafc', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: 8, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Salvar dados
              </button>
            </div>
          </form>

          {/* CARD PIN DO BALCÃO (CONFORME IMAGEM 2) */}
          <div style={{ background: 'rgba(249, 115, 22, 0.04)', border: '1px solid rgba(249, 115, 22, 0.2)', borderRadius: 10, padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f97316' }}>PIN de acesso do balcão</div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>
                  Usado para autorização rápida de operações no balcão e no ponto eletrônico
                </div>
              </div>
              <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 6, background: activeUser.hasPin ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: activeUser.hasPin ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                {activeUser.hasPin ? 'PIN Ativo' : 'Sem PIN'}
              </span>
            </div>

            {pinSuccessMsg && (
              <div style={{ padding: '8px 12px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: 6, color: '#10b981', fontSize: '0.75rem', marginTop: 10 }}>
                {pinSuccessMsg}
              </div>
            )}

            <form onSubmit={handleSavePin} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10, marginTop: 12 }}>
              <input
                type="password"
                maxLength={6}
                required
                placeholder="Criar PIN"
                value={newPin}
                onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                style={{ padding: '9px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem' }}
              />

              <input
                type="password"
                maxLength={6}
                required
                placeholder="Repita o PIN"
                value={confirmPin}
                onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                style={{ padding: '9px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem' }}
              />

              <button
                type="submit"
                style={{ padding: '9px 20px', background: '#f97316', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Salvar PIN
              </button>
            </form>
          </div>

          {/* MATRIZ DE PERMISSÕES GRANULARES POR MÓDULO (CONFORME IMAGEM 2) */}
          {permissions && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>Permissões de Acesso por Módulo</h4>
                  <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Ligue ou desligue o acesso a cada tela ou operação sensível</p>
                </div>
                <button
                  onClick={handleSavePermissions}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 18px',
                    borderRadius: 8,
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  <Save size={14} />
                  <span>Salvar permissões do colaborador</span>
                </button>
              </div>

              {permSuccessMsg && (
                <div style={{ padding: '10px 14px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 8, color: '#10b981', fontSize: '0.78rem', marginBottom: 16 }}>
                  {permSuccessMsg}
                </div>
              )}

              {/* GRID DOS MÓDULOS DE PERMISSÃO */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                {/* 1. DASHBOARD */}
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#38bdf8', marginBottom: 12 }}>Dashboard</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { key: 'viewFinancial', label: 'Ver financeiro' },
                      { key: 'viewRevenue', label: 'Ver faturamento' },
                      { key: 'viewStockAssets', label: 'Ver patrimônio em estoque' },
                    ].map(item => (
                      <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#cbd5e1' }}>
                        <span>{item.label}</span>
                        <button
                          type="button"
                          onClick={() => togglePermission('dashboard', item.key)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: (permissions.dashboard as any)[item.key] ? '#10b981' : '#64748b' }}
                        >
                          {(permissions.dashboard as any)[item.key] ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. FINANCEIRO */}
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#10b981', marginBottom: 12 }}>Financeiro</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { key: 'viewFinancial', label: 'Ver financeiro' },
                      { key: 'manualTransactions', label: 'Lançamentos manuais' },
                      { key: 'recordPayments', label: 'Registrar pagamentos' },
                      { key: 'viewSensitiveExpenses', label: 'Consultar despesas sensíveis' },
                    ].map(item => (
                      <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#cbd5e1' }}>
                        <span>{item.label}</span>
                        <button
                          type="button"
                          onClick={() => togglePermission('financial', item.key)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: (permissions.financial as any)[item.key] ? '#10b981' : '#64748b' }}
                        >
                          {(permissions.financial as any)[item.key] ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. FISCAL */}
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#eab308', marginBottom: 12 }}>Fiscal</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { key: 'viewInvoices', label: 'Ver notas fiscais emitidas' },
                      { key: 'issueInvoice', label: 'Emitir nota fiscal' },
                      { key: 'cancelInvoice', label: 'Cancelar nota fiscal' },
                      { key: 'fiscalSettings', label: 'Configurações fiscais' },
                    ].map(item => (
                      <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#cbd5e1' }}>
                        <span>{item.label}</span>
                        <button
                          type="button"
                          onClick={() => togglePermission('fiscal', item.key)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: (permissions.fiscal as any)[item.key] ? '#10b981' : '#64748b' }}
                        >
                          {(permissions.fiscal as any)[item.key] ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. MIGRAÇÃO DE DADOS */}
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#a855f7', marginBottom: 12 }}>Migração de dados</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { key: 'importDevices', label: 'Importar aparelhos e estoque' },
                      { key: 'exportData', label: 'Exportar dados' },
                      { key: 'resetDatabase', label: 'Zerar base' },
                      { key: 'restoreBackup', label: 'Restaurar backup' },
                    ].map(item => (
                      <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#cbd5e1' }}>
                        <span>{item.label}</span>
                        <button
                          type="button"
                          onClick={() => togglePermission('migration', item.key)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: (permissions.migration as any)[item.key] ? '#10b981' : '#64748b' }}
                        >
                          {(permissions.migration as any)[item.key] ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. CLIENTES */}
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f97316', marginBottom: 12 }}>Clientes</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { key: 'viewCustomers', label: 'Ver clientes' },
                      { key: 'editCustomers', label: 'Editar clientes' },
                    ].map(item => (
                      <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#cbd5e1' }}>
                        <span>{item.label}</span>
                        <button
                          type="button"
                          onClick={() => togglePermission('customers', item.key)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: (permissions.customers as any)[item.key] ? '#10b981' : '#64748b' }}
                        >
                          {(permissions.customers as any)[item.key] ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 6. APARELHOS */}
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f97316', marginBottom: 12 }}>Aparelhos</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { key: 'viewDevices', label: 'Ver aparelhos' },
                      { key: 'editDevices', label: 'Editar aparelhos' },
                      { key: 'returnToSupplier', label: 'Devolver para fornecedor' },
                      { key: 'markDefective', label: 'Marcar com defeito' },
                      { key: 'manageShowcase', label: 'Gerenciar vitrine' },
                    ].map(item => (
                      <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#cbd5e1' }}>
                        <span>{item.label}</span>
                        <button
                          type="button"
                          onClick={() => togglePermission('devices', item.key)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: (permissions.devices as any)[item.key] ? '#10b981' : '#64748b' }}
                        >
                          {(permissions.devices as any)[item.key] ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 7. VENDAS */}
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#10b981', marginBottom: 12 }}>Vendas</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { key: 'viewOwnSales', label: 'Ver próprias vendas' },
                      { key: 'viewAllSales', label: 'Ver vendas de todos' },
                      { key: 'startSale', label: 'Iniciar vendas' },
                      { key: 'authorizeDiscount', label: 'Autorizar descontos' },
                      { key: 'cancelSale', label: 'Cancelar vendas' },
                      { key: 'cashSangria', label: 'Lançar sangria no caixa' },
                    ].map(item => (
                      <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#cbd5e1' }}>
                        <span>{item.label}</span>
                        <button
                          type="button"
                          onClick={() => togglePermission('sales', item.key)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: (permissions.sales as any)[item.key] ? '#10b981' : '#64748b' }}
                        >
                          {(permissions.sales as any)[item.key] ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 8. ASSISTÊNCIA */}
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f97316', marginBottom: 12 }}>Assistência Técnica</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { key: 'viewAllOrders', label: 'Ver todas as ordens' },
                      { key: 'openOrder', label: 'Abrir ordem de serviço' },
                      { key: 'updateStatus', label: 'Alterar status da OS' },
                      { key: 'startRepair', label: 'Iniciar reparo' },
                      { key: 'completeRepair', label: 'Concluir reparo' },
                      { key: 'deliverDevice', label: 'Entregar equipamento' },
                    ].map(item => (
                      <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#cbd5e1' }}>
                        <span>{item.label}</span>
                        <button
                          type="button"
                          onClick={() => togglePermission('assistance', item.key)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: (permissions.assistance as any)[item.key] ? '#10b981' : '#64748b' }}
                        >
                          {(permissions.assistance as any)[item.key] ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
