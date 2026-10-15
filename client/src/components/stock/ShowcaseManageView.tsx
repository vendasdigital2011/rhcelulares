import { useState } from 'react';
import {
  Globe,
  Copy,
  Check,
  Star,
  Smartphone,
  Eye,
  Search,
  ShoppingCart,
  MessageSquare,
  Lock,
} from 'lucide-react';
import type { Device, Product } from '../../types.js';

interface ShowcaseManageViewProps {
  devices: Device[];
  products?: Product[];
  onToggleShowcasePublic: (imei: string, isPublic: boolean) => void;
  onToggleShowcaseFeatured: (imei: string, isFeatured: boolean) => void;
  onStartSaleInPOS: (device: Device) => void;
  onOpenNewDevice?: () => void;
}

export const ShowcaseManageView: React.FC<ShowcaseManageViewProps> = ({
  devices,
  products: _products,
  onToggleShowcasePublic,
  onToggleShowcaseFeatured,
  onStartSaleInPOS,
  onOpenNewDevice: _onOpenNewDevice,
}) => {
  const [viewMode, setViewMode] = useState<'seller' | 'public'>('seller');
  const [searchTerm, setSearchTerm] = useState('');
  const [onlyFeatured, setOnlyFeatured] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const publicSlug = 'loja-hiago-iphones';

  // Filtra itens aptos para vitrine
  const showcaseDevices = devices.filter(d => {
    // Se for modo público, só mostra disponíveis e marcados como públicos
    if (viewMode === 'public') {
      if (d.status !== 'available' || !d.isShowcasePublic) return false;
    }

    const q = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm ||
      d.model.toLowerCase().includes(q) ||
      (d.color && d.color.toLowerCase().includes(q)) ||
      (d.storage && d.storage.toLowerCase().includes(q));

    const matchesFeatured = !onlyFeatured || d.isShowcaseFeatured;
    return matchesSearch && matchesFeatured;
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://hiagoiphones.com.br/loja/${publicSlug}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareWhatsApp = (dev: Device) => {
    const install12x = (dev.sellPrice * 1.12 / 12).toFixed(2);
    const text = encodeURIComponent(
      `🔥 *${dev.model} ${dev.storage} ${dev.color}* disponível na Hiago iPhones!\n` +
      `✨ Condição: ${dev.condition === 'new_sealed' ? 'Lacrado de Fábrica' : `Seminovo Impecável (${dev.batteryHealth || 85}% Bateria)`}\n` +
      `💰 À vista no Pix: R$ ${dev.sellPrice.toFixed(2)}\n` +
      `💳 Ou em 12x de R$ ${install12x} no cartão\n` +
      `🛡️ Garantia da loja e nota de procedência!\n\n` +
      `Quer garantir esse aparelho agora? Responda aqui!`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1360, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f97316', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            CATÁLOGO & VITRINE PÚBLICA
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginTop: 4 }}>
            Vitrine Online da Loja
          </h1>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>
            Apresentação comercial dos aparelhos em estoque com cálculo automático de parcelamento em 12x e link para redes sociais.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {/* Alternador de Modo: Vendedor (Completo) vs Cliente (Público) */}
          <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: 4, borderRadius: 8, display: 'flex', gap: 4 }}>
            <button
              onClick={() => setViewMode('seller')}
              style={{
                background: viewMode === 'seller' ? 'rgba(249, 115, 22, 0.2)' : 'transparent',
                color: viewMode === 'seller' ? '#f97316' : '#94a3b8',
                border: viewMode === 'seller' ? '1px solid rgba(249, 115, 22, 0.4)' : 'none',
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <Eye size={13} /> Visão Interna (Vendedor)
            </button>
            <button
              onClick={() => setViewMode('public')}
              style={{
                background: viewMode === 'public' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                color: viewMode === 'public' ? '#10b981' : '#94a3b8',
                border: viewMode === 'public' ? '1px solid rgba(16, 185, 129, 0.4)' : 'none',
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <Globe size={13} /> Prévia Pública do Cliente
            </button>
          </div>

          <button
            onClick={handleCopyLink}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(56, 189, 248, 0.12)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              padding: '9px 14px',
              borderRadius: 8,
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {copiedLink ? <Check size={14} /> : <Copy size={14} />}
            <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link da Vitrine'}</span>
          </button>
        </div>
      </div>

      {/* AVISO DO MODO PÚBLICO */}
      {viewMode === 'public' && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: 10,
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: '0.78rem',
          color: '#a7f3d0',
        }}>
          <Lock size={16} color="#10b981" />
          <span>
            <strong>Modo Vitrine Pública Ativado:</strong> Dados confidenciais (IMEI completo, custo de aquisição, fornecedor e margem interna) estão ocultados. Esta é a visão exata que o cliente tem no link externo.
          </span>
        </div>
      )}

      {/* FILTROS E PESQUISA */}
      <div className="glass-panel" style={{ padding: 14, borderRadius: 12, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 260 }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 11 }} />
            <input
              type="text"
              placeholder="Buscar aparelho na vitrine..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '9px 12px 9px 36px',
                borderRadius: 8,
                color: '#f8fafc',
                fontSize: '0.8rem',
                outline: 'none',
              }}
            />
          </div>
        </div>

        <button
          onClick={() => setOnlyFeatured(!onlyFeatured)}
          style={{
            background: onlyFeatured ? 'rgba(234, 179, 8, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            color: onlyFeatured ? '#eab308' : '#94a3b8',
            border: onlyFeatured ? '1px solid rgba(234, 179, 8, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
            padding: '8px 14px',
            borderRadius: 8,
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Star size={14} color={onlyFeatured ? '#eab308' : '#94a3b8'} />
          <span>{onlyFeatured ? 'Exibindo Destaques' : 'Apenas Destaques'}</span>
        </button>
      </div>

      {/* GRID DE CARDS DOS APARELHOS NA VITRINE */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
        {showcaseDevices.map((dev) => {
          const install12x = (dev.sellPrice * 1.12 / 12).toFixed(2);
          const isFeatured = !!dev.isShowcaseFeatured;
          const isPublic = dev.isShowcasePublic ?? true;

          return (
            <div
              key={dev.id || dev.imei}
              className="glass-panel"
              style={{
                background: '#0d121f',
                border: isFeatured ? '1.5px solid rgba(245, 158, 11, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 14,
                padding: 18,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
              }}
            >
              {isFeatured && (
                <div style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  color: '#f59e0b',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}>
                  <Star size={10} fill="#f59e0b" /> DESTAQUE
                </div>
              )}

              <div>
                {/* Ícone e Modelo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: 'rgba(249, 115, 22, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#f97316',
                  }}>
                    <Smartphone size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc' }}>
                      {dev.model}
                    </h3>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 1 }}>
                      {dev.storage} • {dev.color}
                    </div>
                  </div>
                </div>

                {/* Especificações e Selos */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
                  <span style={{
                    background: dev.condition === 'new_sealed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: dev.condition === 'new_sealed' ? '#10b981' : '#f59e0b',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 6,
                  }}>
                    {dev.condition === 'new_sealed' ? 'Lacrado' : 'Seminovo Impecável'}
                  </span>

                  {dev.batteryHealth && (
                    <span style={{
                      background: 'rgba(56, 189, 248, 0.12)',
                      color: '#38bdf8',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 6,
                    }}>
                      Saúde Bateria: {dev.batteryHealth}%
                    </span>
                  )}

                  {viewMode === 'seller' && (
                    <span style={{
                      background: dev.status === 'available' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(234, 179, 8, 0.12)',
                      color: dev.status === 'available' ? '#10b981' : '#eab308',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 6,
                    }}>
                      {dev.status === 'available' ? 'Disponível' : dev.status}
                    </span>
                  )}
                </div>

                {/* Preços e Parcelamento */}
                <div style={{ marginTop: 16, background: 'rgba(255, 255, 255, 0.02)', padding: 12, borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>À vista no Pix:</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#10b981' }}>
                    R$ {dev.sellPrice.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#cbd5e1', marginTop: 2 }}>
                    ou em <strong>12x de R$ {install12x}</strong> no cartão
                  </div>

                  {viewMode === 'seller' && (
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed rgba(255, 255, 255, 0.08)', fontSize: '0.68rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Custo: R$ {dev.purchasePrice.toFixed(2)}</span>
                      <span>Margem: +R$ {(dev.sellPrice - dev.purchasePrice).toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Botões de Venda e Compartilhamento */}
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <button
                    onClick={() => onStartSaleInPOS(dev)}
                    style={{
                      background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                      color: '#fff',
                      border: 'none',
                      padding: '8px 10px',
                      borderRadius: 6,
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <ShoppingCart size={13} /> Vender no PDV
                  </button>

                  <button
                    onClick={() => handleShareWhatsApp(dev)}
                    style={{
                      background: 'rgba(37, 211, 102, 0.15)',
                      color: '#25d366',
                      border: '1px solid rgba(37, 211, 102, 0.3)',
                      padding: '8px 10px',
                      borderRadius: 6,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <MessageSquare size={13} /> WhatsApp
                  </button>
                </div>

                {/* Controles do Vendedor */}
                {viewMode === 'seller' && dev.imei && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: '#94a3b8', paddingTop: 6 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={isPublic}
                        onChange={(e) => onToggleShowcasePublic(dev.imei!, e.target.checked)}
                      />
                      <span>Público</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={isFeatured}
                        onChange={(e) => onToggleShowcaseFeatured(dev.imei!, e.target.checked)}
                      />
                      <span>Destacar</span>
                    </label>
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
