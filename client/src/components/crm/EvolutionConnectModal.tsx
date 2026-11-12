import React, { useState, useEffect } from 'react';
import {
  QrCode,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X
} from 'lucide-react';

interface EvolutionConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EVOLUTION_URL = 'https://evolutionapi.vps10855.panel.icontainer.net';
const EVOLUTION_API_KEY = 'FDB6C5615270-4894-9905-7471FF266CBE';
const EVOLUTION_INSTANCE = 'hiago';

export const EvolutionConnectModal: React.FC<EvolutionConnectModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState<'open' | 'connecting' | 'close'>('close');
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      // Tenta via backend proxy primeiro
      let res = await fetch('/api/whatsapp/evolution/status').catch(() => null);
      if (res && res.ok) {
        const json = await res.json();
        if (json.data?.state) {
          setState(json.data.state);
          return json.data.state;
        }
      }

      // Fallback direto à Evolution API
      const directRes = await fetch(`${EVOLUTION_URL}/instance/connectionState/${EVOLUTION_INSTANCE}`, {
        headers: { apikey: EVOLUTION_API_KEY }
      });
      if (directRes.ok) {
        const directJson = await directRes.json();
        const curState = directJson?.instance?.state || 'close';
        setState(curState);
        return curState;
      }
    } catch {
      // Ignora erro transitório
    }
    return 'close';
  };

  const fetchQRCode = async () => {
    setLoading(true);
    setError(null);
    try {
      // Tenta via backend
      let res = await fetch('/api/whatsapp/evolution/qrcode').catch(() => null);
      if (res && res.ok) {
        const json = await res.json();
        if (json.data?.base64) {
          setQrBase64(json.data.base64);
          setPairingCode(json.data.pairingCode || null);
          setLoading(false);
          return;
        }
      }

      // Fallback direto
      const directRes = await fetch(`${EVOLUTION_URL}/instance/connect/${EVOLUTION_INSTANCE}`, {
        headers: { apikey: EVOLUTION_API_KEY }
      });
      if (directRes.ok) {
        const directJson = await directRes.json();
        if (directJson.base64) {
          setQrBase64(directJson.base64);
          setPairingCode(directJson.pairingCode || null);
          setLoading(false);
          return;
        }
      }

      throw new Error('Não foi possível gerar o QR Code no momento');
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar QR Code');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const checkAndLoad = async () => {
      const curState = await fetchStatus();
      if (isMounted && curState !== 'open') {
        fetchQRCode();
      }
    };

    checkAndLoad();

    // Polling a cada 4 segundos enquanto o modal estiver aberto
    const interval = setInterval(async () => {
      const curState = await fetchStatus();
      if (curState === 'open') {
        setQrBase64(null);
      }
    }, 4000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: 16,
    }}>
      <div style={{
        backgroundColor: '#1E293B',
        borderRadius: 12,
        border: '1px solid #334155',
        padding: 24,
        width: '100%',
        maxWidth: 480,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
      }}>
        {/* Header do Modal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 8,
              backgroundColor: 'rgba(22, 163, 74, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#22C55E'
            }}>
              <QrCode size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                Conectar WhatsApp da Loja
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#94A3B8', margin: '2px 0 0 0' }}>
                Evolution API Oficial (Instância: <strong style={{ color: '#F8FAFC' }}>hiago</strong>)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Status: Conectado com Sucesso */}
        {state === 'open' ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '24px 16px',
            gap: 16,
            backgroundColor: '#0F172A',
            borderRadius: 10,
            border: '1px solid #10B981',
          }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10B981',
            }}>
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#34D399', margin: 0 }}>
                WhatsApp 100% Conectado!
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#94A3B8', marginTop: 6, margin: '6px 0 0 0' }}>
                O número oficial da loja (<strong style={{ color: '#F8FAFC' }}>+55 77 98144-7719</strong>) está ativo e sincronizado em tempo real.
              </p>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              width: '100%',
              backgroundColor: '#1E293B',
              padding: 12,
              borderRadius: 8,
              fontSize: '0.8125rem',
              textAlign: 'left',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8' }}>
                <span>Status da Conexão:</span>
                <span style={{ color: '#34D399', fontWeight: 700 }}>● Online (Open)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8' }}>
                <span>Instância:</span>
                <span style={{ color: '#F8FAFC', fontWeight: 600 }}>hiago</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8' }}>
                <span>Provedor:</span>
                <span style={{ color: '#38BDF8', fontWeight: 600 }}>Evolution API v2</span>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                width: '100%',
                padding: '10px 16px',
                borderRadius: 8,
                border: 'none',
                backgroundColor: '#16A34A',
                color: '#FFFFFF',
                fontSize: '0.875rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Concluir & Abrir Inbox
            </button>
          </div>
        ) : (
          /* Estado Desconectado / Exibição do QR Code */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            {/* Box do QR Code */}
            <div style={{
              width: 240,
              height: 240,
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              overflow: 'hidden',
              position: 'relative',
            }}>
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: '#64748B' }}>
                  <RefreshCw size={28} className="animate-spin text-orange-500" />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Gerando QR Code...</span>
                </div>
              ) : qrBase64 ? (
                <img
                  src={qrBase64.startsWith('data:') ? qrBase64 : `data:image/png;base64,${qrBase64}`}
                  alt="QR Code WhatsApp"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : error ? (
                <div style={{ textAlign: 'center', padding: 16, color: '#EF4444' }}>
                  <AlertCircle size={28} style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontSize: '0.75rem' }}>{error}</div>
                </div>
              ) : null}
            </div>

            {/* Código de Pareamento Alternativo */}
            {pairingCode && (
              <div style={{
                backgroundColor: '#0F172A',
                padding: '8px 16px',
                borderRadius: 8,
                border: '1px solid #334155',
                textAlign: 'center',
              }}>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Código de Pareamento WhatsApp: </span>
                <strong style={{ fontSize: '1rem', color: '#F97316', letterSpacing: 2, marginLeft: 6 }}>
                  {pairingCode}
                </strong>
              </div>
            )}

            {/* 3 Passos Guiados */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              width: '100%',
              backgroundColor: '#0F172A',
              padding: 14,
              borderRadius: 8,
              fontSize: '0.8125rem',
              color: '#CBD5E1',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  backgroundColor: '#F97316',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  flexShrink: 0,
                }}>1</span>
                <span>Abra o WhatsApp no celular da sua loja (<strong style={{ color: '#F8FAFC' }}>77 98144-7719</strong>)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  backgroundColor: '#F97316',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  flexShrink: 0,
                }}>2</span>
                <span>Toque em <strong>Configurações / Aparelhos Conectados</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  backgroundColor: '#F97316',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  flexShrink: 0,
                }}>3</span>
                <span>Toque em <strong>Conectar um Aparelho</strong> e aponte para o QR Code acima</span>
              </div>
            </div>

            {/* Botão de Atualizar */}
            <button
              onClick={fetchQRCode}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                width: '100%',
                padding: '10px 16px',
                borderRadius: 8,
                border: '1px solid #475569',
                backgroundColor: 'transparent',
                color: '#E2E8F0',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>{loading ? 'Atualizando...' : 'Atualizar QR Code'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
