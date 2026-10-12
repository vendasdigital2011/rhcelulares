import { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';
import type { Device } from '../types.js';

interface ShowcaseViewProps {
  devices: Device[];
  onOpenNewDevice: () => void;
}

export const ShowcaseView = ({ devices, onOpenNewDevice }: ShowcaseViewProps) => {
  const [isActive] = useState(true);
  const [publicSlug] = useState('loja-hiago-iphones');
  const [whatsapp] = useState('77981447719');
  const [copied, setCopied] = useState(false);

  const publicDevices = devices.filter(d => d.isShowcasePublic && d.status === 'available');
  const featuredDevices = publicDevices.filter(d => d.isShowcaseFeatured);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://hiagoiphones.com.br/loja/${publicSlug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div style={{
      padding: '24px 32px',
      maxWidth: 1280,
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
    }}>
      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            color: '#f97316',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            PÚBLICO
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginTop: 4 }}>
            Vitrine Online
          </h1>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>
            Publique aparelhos, escolha destaques e compartilhe um link público da loja para clientes do Instagram e WhatsApp.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => window.open(`https://wa.me/55${whatsapp}`, '_blank')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#f8fafc',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '9px 16px',
              borderRadius: 8,
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <ExternalLink size={14} /> Ver Pública
          </button>
          <button
            onClick={onOpenNewDevice}
            style={{
              background: '#f97316',
              color: '#fff',
              border: 'none',
              padding: '9px 18px',
              borderRadius: 8,
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            + Cadastrar Aparelho
          </button>
        </div>
      </div>

      {/* 4 CARDS SUPERIORES DO PRINT 16.27.46.jpeg */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <div className="glass-panel" style={{ padding: 18, borderRadius: 12 }}>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>Status da Vitrine</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: isActive ? '#10b981' : '#f59e0b', marginTop: 6 }}>
            {isActive ? 'Ativada' : 'Desativada'}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 4 }}>Controle geral da página pública</div>
        </div>

        <div className="glass-panel" style={{ padding: 18, borderRadius: 12 }}>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>Publicados</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc', marginTop: 6 }}>
            {publicDevices.length} Aparelhos
          </div>
          <div style={{ fontSize: '0.72rem', color: '#10b981', marginTop: 4 }}>Disponíveis para venda</div>
        </div>

        <div className="glass-panel" style={{ padding: 18, borderRadius: 12 }}>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>Destaques</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f59e0b', marginTop: 6 }}>
            {featuredDevices.length} Aparelhos
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 4 }}>Aparecem primeiro no topo</div>
        </div>

        <div className="glass-panel" style={{ padding: 18, borderRadius: 12 }}>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>Link Público</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#38bdf8', marginTop: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            /{publicSlug}
          </div>
          <button
            onClick={handleCopyLink}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#38bdf8',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              marginTop: 4,
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? 'Link Copiado!' : 'Copiar Link'}
          </button>
        </div>
      </div>

      {/* BLOCO DE PRÉVIA AO VIVO DA VITRINE */}
      <div className="glass-panel" style={{ padding: 22, borderRadius: 16 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', marginBottom: 12 }}>
          Prévia ao Vivo do Parcelamento na Vitrine
        </h3>
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 12,
          padding: '14px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>EXEMPLO PARA APARELHO DE R$ 3.000,00</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', marginTop: 4 }}>
              À vista no Pix: <span style={{ color: '#10b981' }}>R$ 3.000,00</span> ou <span style={{ color: '#38bdf8' }}>12x de R$ 280,00 no cartão</span>
            </div>
          </div>
          <span style={{ fontSize: '0.72rem', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '4px 10px', borderRadius: 20, fontWeight: 700 }}>
            Taxa Calculada da Máquina
          </span>
        </div>
      </div>
    </div>
  );
};
