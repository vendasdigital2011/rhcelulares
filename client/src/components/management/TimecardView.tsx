import React, { useState, useEffect } from 'react';
import {
  Clock,
  MapPin,
  ShieldCheck,
  Printer,
  Download,
  CheckCircle2,
  Calendar,
  Navigation,
} from 'lucide-react';
import type {
  AppUser,
  TimecardRecord,
  TimecardType,
  StoreLocationConfig,
} from '../../types.js';
import {
  fetchAppUsers,
  fetchCurrentUser,
  fetchNextAllowedPunch,
  punchTimecardApi,
  fetchTimecardMonthlyMirror,
  fetchStoreLocationConfig,
  saveStoreLocationConfigApi,
  createTimecardAdjustmentApi,
  fetchTimecardRecords,
} from '../../api/erpApi.js';

export const TimecardView: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [selectedUserForMirror, setSelectedUserForMirror] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');

  // Próxima marcação
  const [nextPunchInfo, setNextPunchInfo] = useState<{
    nextType: TimecardType;
    label: string;
    currentStatus: string;
  }>({
    nextType: 'entry',
    label: 'Entrada',
    currentStatus: 'Fora da jornada',
  });

  // Espelho mensal
  const [mirror, setMirror] = useState<{
    days: any[];
    totalMinutes: number;
    formattedTotal: string;
  }>({
    days: [],
    totalMinutes: 0,
    formattedTotal: '0h 0min',
  });

  // Marcações originais
  const [originalRecords, setOriginalRecords] = useState<TimecardRecord[]>([]);

  // Localização da loja
  const [locConfig, setLocConfig] = useState<StoreLocationConfig>({
    latitude: -3.1190275,
    longitude: -60.0217314,
    radiusMeters: 150,
    requireGps: true,
  });

  // Mensagens
  const [punchMsg, setPunchMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [locSavedMsg, setLocSavedMsg] = useState(false);

  // Formulário de Ajuste
  const [adjUser, setAdjUser] = useState('');
  const [adjDate, setAdjDate] = useState(new Date().toISOString().split('T')[0]);
  const [adjType, setAdjType] = useState<TimecardType>('entry');
  const [adjTime, setAdjTime] = useState('08:00');
  const [adjReason, setAdjReason] = useState('');
  const [adjSuccessMsg, setAdjSuccessMsg] = useState('');

  const loadData = async () => {
    const [u, userList, loc] = await Promise.all([
      fetchCurrentUser(),
      fetchAppUsers(),
      fetchStoreLocationConfig(),
    ]);
    setCurrentUser(u);
    setUsers(userList);
    setLocConfig(loc);

    const activeUser = selectedUserForMirror || u.id;
    setSelectedUserForMirror(activeUser);
    setAdjUser(activeUser);

    const [nextP, mData, recs] = await Promise.all([
      fetchNextAllowedPunch(u.id),
      fetchTimecardMonthlyMirror(activeUser, selectedMonth),
      fetchTimecardRecords(activeUser, selectedMonth),
    ]);

    setNextPunchInfo(nextP);
    setMirror(mData);
    setOriginalRecords(recs);
  };

  useEffect(() => {
    loadData();
  }, [selectedUserForMirror, selectedMonth]);

  const handlePunch = async (type: TimecardType) => {
    if (!currentUser) return;
    setPunchMsg(null);

    let coords: { latitude: number; longitude: number } | undefined = undefined;

    if (navigator.geolocation && locConfig.requireGps) {
      try {
        const pos: GeolocationPosition = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 });
        });
        coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
      } catch {
        // GPS indisponível no momento
      }
    }

    const rec = await punchTimecardApi(currentUser.id, currentUser.name, type, coords);
    setPunchMsg({
      type: 'success',
      text: `Marcação de ${type === 'entry' ? 'Entrada' : type === 'lunch_start' ? 'Início de Intervalo' : type === 'lunch_end' ? 'Fim de Intervalo' : 'Saída'} registrada com sucesso às ${new Date(rec.timestamp).toLocaleTimeString()}!`,
    });

    setTimeout(() => setPunchMsg(null), 5000);
    loadData();
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocalização não suportada pelo navegador.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLocConfig({
          ...locConfig,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      () => {
        alert('Não foi possível obter a localização atual. Verifique as permissões de GPS do navegador.');
      }
    );
  };

  const handleSaveLocation = async () => {
    await saveStoreLocationConfigApi(locConfig);
    setLocSavedMsg(true);
    setTimeout(() => setLocSavedMsg(false), 3000);
  };

  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !adjReason) return;

    const target = users.find(u => u.id === adjUser) || currentUser;

    await createTimecardAdjustmentApi({
      userId: target.id,
      userName: target.name,
      targetDate: adjDate,
      adjustedType: adjType,
      adjustedTime: adjTime,
      reason: adjReason,
      authorId: currentUser.id,
      authorName: currentUser.name,
      status: 'approved',
    });

    setAdjSuccessMsg('Ajuste de ponto gravado com histórico auditável!');
    setAdjReason('');
    setTimeout(() => setAdjSuccessMsg(''), 4000);
    loadData();
  };

  const handleExportCSV = () => {
    let csv = 'Data;Entrada;Inicio_Intervalo;Fim_Intervalo;Saida;Total_Horas;Status\n';
    mirror.days.forEach(d => {
      csv += `${d.date};${d.entry};${d.lunchStart};${d.lunchEnd};${d.exit};${d.totalHours};${d.status}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `espelho_ponto_${selectedMonth}.csv`;
    link.click();
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* CABEÇALHO */}
      <div>
        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f97316', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          EQUIPE E JORNADA
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginTop: 4 }}>
          Ponto
        </h1>
        <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>
          Registre a jornada com horário seguro do servidor, localização pontual e histórico auditável.
        </p>
      </div>

      {punchMsg && (
        <div style={{
          padding: '12px 18px',
          background: punchMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: `1px solid ${punchMsg.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          borderRadius: 10,
          color: punchMsg.type === 'success' ? '#10b981' : '#ef4444',
          fontSize: '0.82rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <CheckCircle2 size={16} />
          <span>{punchMsg.text}</span>
        </div>
      )}

      {/* CARD 1: REGISTRAR MINHA JORNADA (CONFORME IMAGEM 3) */}
      <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#10b981' }}>
              Horário da loja <span style={{ color: '#94a3b8', fontWeight: 400 }}>America/Manaus</span>
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc', marginTop: 4 }}>
              Registrar minha jornada
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>
              Situação atual: <strong style={{ color: '#f8fafc' }}>{nextPunchInfo.currentStatus}</strong>. A localização é solicitada somente ao registrar.
            </p>
          </div>

          <div style={{ background: '#090d16', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 10, padding: '10px 18px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Meu total no mês</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f8fafc', marginTop: 2 }}>
              {mirror.formattedTotal}
            </div>
          </div>
        </div>

        {/* 4 BOTÕES SEQUENCIAIS DE MARCAÇÃO */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginTop: 20 }}>
          {[
            { type: 'entry' as TimecardType, label: 'Entrada' },
            { type: 'lunch_start' as TimecardType, label: 'Início do intervalo' },
            { type: 'lunch_end' as TimecardType, label: 'Fim do intervalo' },
            { type: 'exit' as TimecardType, label: 'Saída' },
          ].map(btn => {
            const isAllowedNext = nextPunchInfo.nextType === btn.type;
            return (
              <button
                key={btn.type}
                onClick={() => handlePunch(btn.type)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '16px 14px',
                  borderRadius: 10,
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: isAllowedNext ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                  background: isAllowedNext
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : 'rgba(255, 255, 255, 0.03)',
                  color: isAllowedNext ? '#fff' : '#64748b',
                  boxShadow: isAllowedNext ? '0 4px 14px rgba(16, 185, 129, 0.35)' : 'none',
                }}
              >
                <Clock size={16} />
                <span>{btn.label}</span>
              </button>
            );
          })}
        </div>

        <div style={{ textAlign: 'center', marginTop: 14, fontSize: '0.72rem', color: '#94a3b8' }}>
          Próxima marcação permitida: <strong style={{ color: '#10b981' }}>{nextPunchInfo.label}</strong>.
        </div>
      </div>

      {/* SEÇÃO DO MEIO: ESPELHO MENSAL & INTEGRIDADE / MARCAÇÕES ORIGINAIS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
        {/* CARD: ESPELHO MENSAL */}
        <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc' }}>
                <Calendar size={16} color="#f97316" />
                <span>Espelho mensal</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>
                {users.find(u => u.id === selectedUserForMirror)?.name || currentUser?.name} • {mirror.formattedTotal} no período.
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="month"
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                style={{
                  padding: '5px 8px',
                  background: '#131b2e',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 6,
                  color: '#fff',
                  fontSize: '0.75rem',
                }}
              />

              <select
                value={selectedUserForMirror}
                onChange={e => setSelectedUserForMirror(e.target.value)}
                style={{ padding: '6px 10px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 6, color: '#fff', fontSize: '0.75rem' }}
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>

              <button
                onClick={handleExportCSV}
                style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255, 255, 255, 0.05)', color: '#cbd5e1', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '6px 10px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
              >
                <Download size={13} />
                <span>CSV</span>
              </button>

              <button
                onClick={() => window.print()}
                style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255, 255, 255, 0.05)', color: '#cbd5e1', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '6px 10px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
              >
                <Printer size={13} />
                <span>Imprimir</span>
              </button>
            </div>
          </div>

          <div style={{ border: '1px dashed rgba(255, 255, 255, 0.1)', borderRadius: 10, padding: 16, minHeight: 180 }}>
            {mirror.days.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b', fontSize: '0.8rem' }}>
                Nenhuma marcação neste período.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ color: '#94a3b8', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <th style={{ padding: '6px 8px' }}>Data</th>
                    <th style={{ padding: '6px 8px' }}>Entrada</th>
                    <th style={{ padding: '6px 8px' }}>Intervalo</th>
                    <th style={{ padding: '6px 8px' }}>Retorno</th>
                    <th style={{ padding: '6px 8px' }}>Saída</th>
                    <th style={{ padding: '6px 8px' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {mirror.days.map((d, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)', color: '#f8fafc' }}>
                      <td style={{ padding: '8px 8px', color: '#94a3b8' }}>{d.date}</td>
                      <td style={{ padding: '8px 8px', color: '#10b981', fontWeight: 700 }}>{d.entry}</td>
                      <td style={{ padding: '8px 8px' }}>{d.lunchStart}</td>
                      <td style={{ padding: '8px 8px' }}>{d.lunchEnd}</td>
                      <td style={{ padding: '8px 8px', color: '#ef4444', fontWeight: 700 }}>{d.exit}</td>
                      <td style={{ padding: '8px 8px', fontWeight: 800, color: '#f97316' }}>{d.totalHours}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* COLUNA: INTEGRIDADE & MARCAÇÕES ORIGINAIS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* CARD INTEGRIDADE */}
          <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc', marginBottom: 12 }}>
              <ShieldCheck size={18} color="#10b981" />
              <span>Integridade</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.75rem', color: '#94a3b8' }}>
              <div>• Horário gerado no servidor</div>
              <div>• Sequência da jornada validada</div>
              <div>• Originais sem edição ou exclusão</div>
              <div>• Correções com autor e justificativa</div>
              <div>• GPS indisponível fica sinalizado</div>
            </div>
          </div>

          {/* CARD MARCAÇÕES ORIGINAIS */}
          <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc', marginBottom: 10 }}>
              <MapPin size={16} color="#f97316" />
              <span>Marcações originais</span>
            </div>

            {originalRecords.length === 0 ? (
              <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Nenhuma marcação original.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 150, overflowY: 'auto', fontSize: '0.72rem' }}>
                {originalRecords.slice(-5).map(r => (
                  <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 6px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 4 }}>
                    <span style={{ color: '#cbd5e1' }}>{r.type.toUpperCase()} • {new Date(r.timestamp).toLocaleTimeString()}</span>
                    <span style={{ color: '#64748b', fontFamily: 'monospace' }}>{r.hash.substring(0, 10)}...</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PARTE INFERIOR: LOCAL PERMITIDO & AJUSTAR MARCAÇÃO */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
        {/* CARD: LOCAL PERMITIDO */}
        <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc' }}>
            <Navigation size={18} color="#f97316" />
            <span>Local permitido</span>
          </div>

          <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            Na loja, toque em "Usar localização atual" e salve o raio permitido. Marcações externas são sinalizadas, mas não bloqueadas.
          </p>

          {locSavedMsg && (
            <div style={{ padding: '8px 12px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: 6, color: '#10b981', fontSize: '0.75rem', fontWeight: 700 }}>
              Localização salva com sucesso!
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Latitude</label>
              <input
                type="number"
                step="0.0000001"
                value={locConfig.latitude}
                onChange={e => setLocConfig({ ...locConfig, latitude: Number(e.target.value) })}
                style={{ width: '100%', marginTop: 4, padding: '8px 10px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.8rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Longitude</label>
              <input
                type="number"
                step="0.0000001"
                value={locConfig.longitude}
                onChange={e => setLocConfig({ ...locConfig, longitude: Number(e.target.value) })}
                style={{ width: '100%', marginTop: 4, padding: '8px 10px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.8rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Raio em metros</label>
            <input
              type="number"
              value={locConfig.radiusMeters}
              onChange={e => setLocConfig({ ...locConfig, radiusMeters: Number(e.target.value) })}
              style={{ width: '100%', marginTop: 4, padding: '8px 10px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.8rem' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', color: '#cbd5e1' }}>
            <input
              type="checkbox"
              id="reqGps"
              checked={locConfig.requireGps}
              onChange={e => setLocConfig({ ...locConfig, requireGps: e.target.checked })}
            />
            <label htmlFor="reqGps">Solicitar localização</label>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button
              onClick={handleUseCurrentLocation}
              style={{ flex: 1, padding: '9px', background: 'rgba(255, 255, 255, 0.05)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Usar localização atual
            </button>
            <button
              onClick={handleSaveLocation}
              style={{ flex: 1, padding: '9px', background: '#090d16', color: '#f8fafc', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Salvar configuração
            </button>
          </div>
        </div>

        {/* CARD: AJUSTAR MARCAÇÃO */}
        <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc' }}>
            <Clock size={18} color="#f97316" />
            <span>Ajustar marcação</span>
          </div>

          <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            Correções manuais autorizadas com justificativa auditável, preservando a marcação original no banco.
          </p>

          {adjSuccessMsg && (
            <div style={{ padding: '8px 12px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: 6, color: '#10b981', fontSize: '0.75rem', fontWeight: 700 }}>
              {adjSuccessMsg}
            </div>
          )}

          <form onSubmit={handleSaveAdjustment} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Funcionário</label>
                <select
                  value={adjUser}
                  onChange={e => setAdjUser(e.target.value)}
                  style={{ width: '100%', marginTop: 4, padding: '8px 10px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.78rem' }}
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Data</label>
                <input
                  type="date"
                  required
                  value={adjDate}
                  onChange={e => setAdjDate(e.target.value)}
                  style={{ width: '100%', marginTop: 4, padding: '8px 10px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.78rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Tipo de Batida</label>
                <select
                  value={adjType}
                  onChange={e => setAdjType(e.target.value as any)}
                  style={{ width: '100%', marginTop: 4, padding: '8px 10px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.78rem' }}
                >
                  <option value="entry">Entrada</option>
                  <option value="lunch_start">Início Intervalo</option>
                  <option value="lunch_end">Fim Intervalo</option>
                  <option value="exit">Saída</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Horário Corrigido</label>
                <input
                  type="time"
                  required
                  value={adjTime}
                  onChange={e => setAdjTime(e.target.value)}
                  style={{ width: '100%', marginTop: 4, padding: '8px 10px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.78rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Justificativa Obrigatória</label>
              <input
                type="text"
                required
                placeholder="Ex: Esquecimento, consulta médica, bateria descarregada"
                value={adjReason}
                onChange={e => setAdjReason(e.target.value)}
                style={{ width: '100%', marginTop: 4, padding: '8px 10px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.78rem' }}
              />
            </div>

            <button
              type="submit"
              style={{
                marginTop: 6,
                padding: '9px',
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Registrar Correção Auditada
            </button>
          </form>
        </div>
      </div>

      {/* BANNER INFORMATIVO / PORTARIA 671 (CONFORME IMAGEM 3) */}
      <div style={{ background: 'rgba(234, 179, 8, 0.08)', border: '1px solid rgba(234, 179, 8, 0.25)', borderRadius: 10, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Clock size={18} color="#eab308" />
        <span style={{ fontSize: '0.75rem', color: '#fef08a' }}>
          <strong>Controle operacional:</strong> esta primeira versão organiza marcações e ajustes, mas ainda não constitui um REP-P certificado nos termos da Portaria MTP nº 671.
        </span>
      </div>
    </div>
  );
};
