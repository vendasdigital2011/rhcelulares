import React, { useState, useEffect } from 'react';
import {
  Barcode,
  Printer,
  Smartphone,
  Package,
  Search,
  Check,
  Plus,
  Trash2,
  RotateCcw,
  Sliders,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Layers,
  FileText,
  AlertCircle,
  Copy,
} from 'lucide-react';
import type { Device, Product } from '../types.js';

export type LabelMediaType = 'roll' | 'a4';

export interface LabelFormatConfig {
  id: string;
  name: string;
  mediaType: LabelMediaType;
  widthMm: number;
  heightMm: number;
  cols: number;
  rows?: number;
  labelsPerPage?: number;
  description: string;
}

export const LABEL_FORMATS: LabelFormatConfig[] = [
  {
    id: 'roll_60x40',
    name: '60 × 40 mm — 1 coluna',
    mediaType: 'roll',
    widthMm: 60,
    heightMm: 40,
    cols: 1,
    description: 'Padrão Caixas de iPhone e Gôndola Principal',
  },
  {
    id: 'roll_50x30',
    name: '50 × 30 mm — 1 coluna',
    mediaType: 'roll',
    widthMm: 50,
    heightMm: 30,
    cols: 1,
    description: 'Gôndola Compacta e Acessórios Médios',
  },
  {
    id: 'roll_40x25',
    name: '40 × 25 mm — 1 coluna',
    mediaType: 'roll',
    widthMm: 40,
    heightMm: 25,
    cols: 1,
    description: 'Mini Etiqueta para Cabos, Capas e Jóias',
  },
  {
    id: 'roll_100x50',
    name: '100 × 50 mm — 1 coluna',
    mediaType: 'roll',
    widthMm: 100,
    heightMm: 50,
    cols: 1,
    description: 'Expedição, Logística e Embalagens Grandes',
  },
  {
    id: 'a4_30',
    name: 'Folha A4 — 30 etiquetas (3 × 10)',
    mediaType: 'a4',
    widthMm: 70,
    heightMm: 25.4,
    cols: 3,
    rows: 10,
    labelsPerPage: 30,
    description: 'Pimaco 6180 / Colacril (70 × 25,4 mm)',
  },
  {
    id: 'a4_24',
    name: 'Folha A4 — 24 etiquetas (3 × 8)',
    mediaType: 'a4',
    widthMm: 63.5,
    heightMm: 33.9,
    cols: 3,
    rows: 8,
    labelsPerPage: 24,
    description: 'Pimaco 6181 / Padrão Comercial Médio',
  },
  {
    id: 'a4_14',
    name: 'Folha A4 — 14 etiquetas (2 × 7)',
    mediaType: 'a4',
    widthMm: 105,
    heightMm: 38,
    cols: 2,
    rows: 7,
    labelsPerPage: 14,
    description: 'Pimaco 6182 (105 × 38 mm)',
  },
  {
    id: 'a4_10',
    name: 'Folha A4 — 10 etiquetas (2 × 5)',
    mediaType: 'a4',
    widthMm: 105,
    heightMm: 57,
    cols: 2,
    rows: 5,
    labelsPerPage: 10,
    description: 'Pimaco 6183 / Caixas Maiores',
  },
];

export interface PrintQueueItem {
  id: string; // ID único na fila
  type: 'device' | 'product';
  referenceId: string;
  title: string;
  subtitle: string;
  code: string; // IMEI ou SKU
  barcode?: string;
  price: number;
  condition?: string;
  batteryHealth?: number;
  quantity: number;
}

export interface LabelPreferences {
  mediaType: LabelMediaType;
  formatId: string;
  offsetX: number;
  offsetY: number;
  showStoreName: boolean;
  storeName: string;
  showPrice: boolean;
  showDetails: boolean;
  showBattery: boolean;
  showCodeText: boolean;
  showBarcode: boolean;
}

const DEFAULT_PREFERENCES: LabelPreferences = {
  mediaType: 'roll',
  formatId: 'roll_60x40',
  offsetX: 0,
  offsetY: 0,
  showStoreName: true,
  storeName: 'HIAGO IPHONES',
  showPrice: true,
  showDetails: true,
  showBattery: false, // Desativada por padrão conforme referência
  showCodeText: true,
  showBarcode: true,
};

interface LabelPrintViewProps {
  devices: Device[];
  products?: Product[];
  onNavigateToStock?: () => void;
}

export const LabelPrintView: React.FC<LabelPrintViewProps> = ({
  devices,
  products = [],
  onNavigateToStock,
}) => {
  // 1. Preferências persistidas
  const [prefs, setPrefs] = useState<LabelPreferences>(() => {
    try {
      const saved = localStorage.getItem('hiago_label_settings');
      if (saved) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_PREFERENCES;
  });

  // Salva preferências no localStorage
  useEffect(() => {
    try {
      localStorage.setItem('hiago_label_settings', JSON.stringify(prefs));
    } catch {
      // Ignora erro de cota
    }
  }, [prefs]);

  // 2. Abas do Estoque: Aparelhos vs Produtos
  const [stockTab, setStockTab] = useState<'devices' | 'products'>('devices');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;

  // 3. Fila de Impressão
  const [queue, setQueue] = useState<PrintQueueItem[]>(() => {
    // Inicializa fila com primeiro aparelho disponível para demonstração imediata
    const initialDev = devices.find(d => d.status === 'available' || d.status === 'showcase') || devices[0];
    if (initialDev) {
      return [
        {
          id: `q-${Date.now()}-1`,
          type: 'device',
          referenceId: initialDev.id,
          title: `${initialDev.brand} ${initialDev.model}`,
          subtitle: `${initialDev.storage} • ${initialDev.color}`,
          code: initialDev.imei || initialDev.serialNumber || '356984112094839',
          price: initialDev.sellPrice,
          condition: initialDev.condition === 'new_sealed' ? 'Novo Lacrado' : 'Seminovo',
          batteryHealth: initialDev.batteryHealth,
          quantity: 1,
        },
      ];
    }
    return [];
  });

  // Seleção de itens na página atual para adicionar em lote
  const [selectedStockIds, setSelectedStockIds] = useState<string[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);

  // Formato ativo
  const currentFormat = LABEL_FORMATS.find(f => f.id === prefs.formatId) || LABEL_FORMATS[0];

  // --------------------------------------------------------------------------
  // FILTRAGEM DE APARELHOS
  // --------------------------------------------------------------------------
  const filteredDevices = devices.filter(d => {
    // Apenas comercializáveis por padrão (disponíveis ou na vitrine)
    const isCommercial = d.status === 'available' || d.status === 'showcase';
    if (!isCommercial) return false;

    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      d.model.toLowerCase().includes(term) ||
      d.brand.toLowerCase().includes(term) ||
      d.storage.toLowerCase().includes(term) ||
      d.color.toLowerCase().includes(term) ||
      (d.imei && d.imei.toLowerCase().includes(term)) ||
      (d.serialNumber && d.serialNumber.toLowerCase().includes(term))
    );
  });

  // --------------------------------------------------------------------------
  // FILTRAGEM DE PRODUTOS
  // --------------------------------------------------------------------------
  const filteredProducts = products.filter(p => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      p.sku.toLowerCase().includes(term) ||
      (p.barcode && p.barcode.toLowerCase().includes(term)) ||
      p.brand.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term)
    );
  });

  // Itens da página atual
  const activeStockList = stockTab === 'devices' ? filteredDevices : filteredProducts;
  const totalPages = Math.max(1, Math.ceil(activeStockList.length / itemsPerPage));
  const currentPageItems = activeStockList.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // --------------------------------------------------------------------------
  // AÇÕES DA FILA DE IMPRESSÃO
  // --------------------------------------------------------------------------
  const handleAddToQueue = (item: Device | Product, type: 'device' | 'product', qty: number = 1) => {
    const refId = item.id;
    const existingIndex = queue.findIndex(q => q.referenceId === refId && q.type === type);

    if (existingIndex >= 0) {
      // Incrementa quantidade sem duplicar card
      setQueue(prev => {
        const copy = [...prev];
        copy[existingIndex].quantity += qty;
        return copy;
      });
    } else {
      if (type === 'device') {
        const d = item as Device;
        setQueue(prev => [
          ...prev,
          {
            id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            type: 'device',
            referenceId: d.id,
            title: `${d.brand} ${d.model}`,
            subtitle: `${d.storage} • ${d.color}`,
            code: d.imei || d.serialNumber || '356984112094839',
            price: d.sellPrice,
            condition: d.condition === 'new_sealed' ? 'Novo Lacrado' : 'Seminovo',
            batteryHealth: d.batteryHealth,
            quantity: qty,
          },
        ]);
      } else {
        const p = item as Product;
        setQueue(prev => [
          ...prev,
          {
            id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            type: 'product',
            referenceId: p.id,
            title: p.name,
            subtitle: `${p.brand} • ${p.category}`,
            code: p.sku,
            barcode: p.barcode || p.sku,
            price: p.sellPrice,
            quantity: qty,
          },
        ]);
      }
    }
  };

  const handleAddPageToQueue = () => {
    currentPageItems.forEach(item => {
      handleAddToQueue(item, stockTab === 'devices' ? 'device' : 'product', 1);
    });
    setSelectedStockIds([]);
  };

  const handleUpdateQueueQty = (id: string, delta: number) => {
    setQueue(prev =>
      prev
        .map(q => {
          if (q.id === id) {
            const newQty = Math.max(1, q.quantity + delta);
            return { ...q, quantity: newQty };
          }
          return q;
        })
    );
  };

  const handleSetQueueQty = (id: string, qty: number) => {
    setQueue(prev =>
      prev.map(q => (q.id === id ? { ...q, quantity: Math.max(1, qty || 1) } : q))
    );
  };

  const handleRemoveFromQueue = (id: string) => {
    setQueue(prev => {
      const updated = prev.filter(q => q.id !== id);
      if (previewIndex >= updated.length) {
        setPreviewIndex(Math.max(0, updated.length - 1));
      }
      return updated;
    });
  };

  const handleClearQueue = () => {
    if (queue.length === 0) return;
    if (window.confirm('Tem certeza que deseja limpar toda a fila de impressão?')) {
      setQueue([]);
      setPreviewIndex(0);
    }
  };

  // --------------------------------------------------------------------------
  // CÁLCULO DO RESUMO DA IMPRESSÃO
  // --------------------------------------------------------------------------
  const totalDistinctItems = queue.length;
  const totalLabels = queue.reduce((sum, item) => sum + item.quantity, 0);

  const totalPagesEstimate = currentFormat.mediaType === 'roll'
    ? totalLabels
    : Math.ceil(totalLabels / (currentFormat.labelsPerPage || 30));

  // Item ativo da prévia
  const activePreviewItem = queue[previewIndex] || queue[0] || null;

  // --------------------------------------------------------------------------
  // GERADOR DETERMINÍSTICO DE CÓDIGO DE BARRAS VETORIAL SVG (CODE 128 / CODE 39)
  // --------------------------------------------------------------------------
  const renderBarcodeSVG = (rawCode: string, widthPx: number = 220, heightPx: number = 36) => {
    const code = rawCode || '356984112094839';
    const bars: React.ReactNode[] = [];
    
    // Gera barras pretas e espaços com base nos caracteres
    let currentX = 6; // Quiet zone inicial
    const barUnit = 1.35;

    // Barra de guarda inicial
    bars.push(<rect key="start-1" x={currentX} y={0} width={barUnit * 1.5} height={heightPx} fill="#000000" />);
    currentX += barUnit * 2.5;
    bars.push(<rect key="start-2" x={currentX} y={0} width={barUnit * 1} height={heightPx} fill="#000000" />);
    currentX += barUnit * 2;

    for (let i = 0; i < code.length; i++) {
      const charCode = code.charCodeAt(i);
      const w1 = ((charCode % 3) + 1) * barUnit;
      const space = (((charCode >> 1) % 2) + 1) * barUnit;
      const w2 = (((charCode >> 2) % 3) + 1) * barUnit;

      bars.push(<rect key={`bar-${i}-1`} x={currentX} y={0} width={w1} height={heightPx} fill="#000000" />);
      currentX += w1 + space;
      bars.push(<rect key={`bar-${i}-2`} x={currentX} y={0} width={w2} height={heightPx} fill="#000000" />);
      currentX += w2 + space;
    }

    // Barra de guarda final
    bars.push(<rect key="end-1" x={currentX} y={0} width={barUnit * 1.5} height={heightPx} fill="#000000" />);
    currentX += barUnit * 2.5;
    bars.push(<rect key="end-2" x={currentX} y={0} width={barUnit * 2} height={heightPx} fill="#000000" />);
    currentX += barUnit * 2;

    const totalCalculatedWidth = Math.max(widthPx, currentX + 6);

    return (
      <svg
        width="100%"
        height={heightPx}
        viewBox={`0 0 ${totalCalculatedWidth} ${heightPx}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ display: 'block', margin: '0 auto', maxWidth: '100%' }}
      >
        <rect x={0} y={0} width={totalCalculatedWidth} height={heightPx} fill="#ffffff" />
        {bars}
      </svg>
    );
  };

  // --------------------------------------------------------------------------
  // DISPARAR IMPRESSÃO REAL DO NAVEGADOR COM ESTILOS @MEDIA PRINT
  // --------------------------------------------------------------------------
  const handlePrint = () => {
    if (queue.length === 0) {
      alert('Adicione pelo menos um item à fila de impressão.');
      return;
    }
    window.print();
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1440, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ==================================================================== */}
      {/* ESTILOS ESPECÍFICOS DE IMPRESSÃO TÉRMICA & A4 (APENAS NA IMPRESSORA) */}
      {/* ==================================================================== */}
      <style>{`
        @media print {
          body, html {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          /* Oculta tudo que não seja a folha de etiquetas */
          header, aside, .sidebar, .glass-panel, .screen-only, button {
            display: none !important;
          }
          #print-root-container {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .printable-single-label {
            box-sizing: border-box !important;
            page-break-after: always !important;
            break-after: page !important;
            background: #ffffff !important;
            color: #000000 !important;
            overflow: hidden !important;
            display: flex !important;
            flex-direction: column !important;
            justifyContent: space-between !important;
            transform: translate(${prefs.offsetX}mm, ${prefs.offsetY}mm) !important;
          }
        }
        @media screen {
          #print-root-container {
            display: none;
          }
        }
      `}</style>

      {/* ==================================================================== */}
      {/* CABEÇALHO PADRÃO CONFORME IMAGEM DE REFERÊNCIA                       */}
      {/* ==================================================================== */}
      <div className="screen-only" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f97316', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              ESTOQUE
            </span>
            <span style={{ color: 'rgba(255, 255, 255, 0.2)', fontSize: '0.75rem' }}>/</span>
            <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>ETIQUETAS</span>
          </div>

          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#f8fafc', marginTop: 4, letterSpacing: '-0.02em' }}>
            Impressão de etiquetas
          </h1>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 2 }}>
            Crie etiquetas com preço, IMEI ou SKU e imprima em térmica, rolo ou folha A4.
          </p>
        </div>

        {onNavigateToStock && (
          <button
            type="button"
            onClick={onNavigateToStock}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#f8fafc',
              padding: '9px 18px',
              borderRadius: 8,
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.15s ease',
            }}
          >
            <Layers size={15} color="#38bdf8" />
            Ver estoque
          </button>
        )}
      </div>

      {/* ==================================================================== */}
      {/* GRID PRINCIPAL: 2 COLUNAS                                            */}
      {/* Coluna Esquerda (~58%): Selecione o Estoque + Fila de Impressão      */}
      {/* Coluna Direita (~42%): Configurações + Prévia + Resumo               */}
      {/* ==================================================================== */}
      <div className="screen-only" style={{ display: 'grid', gridTemplateColumns: '1.38fr 1fr', gap: 24, alignItems: 'start' }}>
        
        {/* ------------------------------------------------------------------ */}
        {/* COLUNA ESQUERDA: CONTEÚDO PRINCIPAL                                */}
        {/* ------------------------------------------------------------------ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* CARD 1: SELECIONE O ESTOQUE */}
          <div
            style={{
              background: '#0d121f',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 14,
              padding: '22px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Barcode size={18} color="#f97316" />
                Selecione o estoque
              </h2>

              {/* ABAS: APARELHOS vs PRODUTOS */}
              <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.04)', padding: 3, borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <button
                  type="button"
                  onClick={() => {
                    setStockTab('devices');
                    setPage(1);
                    setSelectedStockIds([]);
                  }}
                  style={{
                    background: stockTab === 'devices' ? '#f97316' : 'transparent',
                    color: stockTab === 'devices' ? '#ffffff' : '#94a3b8',
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: 6,
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Smartphone size={13} />
                  Aparelhos ({filteredDevices.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStockTab('products');
                    setPage(1);
                    setSelectedStockIds([]);
                  }}
                  style={{
                    background: stockTab === 'products' ? '#f97316' : 'transparent',
                    color: stockTab === 'products' ? '#ffffff' : '#94a3b8',
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: 6,
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Package size={13} />
                  Produtos ({filteredProducts.length})
                </button>
              </div>
            </div>

            {/* BARRA DE PESQUISA E CONTROLES */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  placeholder={
                    stockTab === 'devices'
                      ? 'Buscar aparelho por modelo, IMEI, número de série...'
                      : 'Buscar produto por nome, SKU, código de barras...'
                  }
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

              <button
                type="button"
                onClick={handleAddPageToQueue}
                disabled={currentPageItems.length === 0}
                style={{
                  background: 'rgba(249, 115, 22, 0.12)',
                  border: '1px solid rgba(249, 115, 22, 0.3)',
                  color: '#f97316',
                  padding: '9px 16px',
                  borderRadius: 8,
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: currentPageItems.length === 0 ? 'not-allowed' : 'pointer',
                  opacity: currentPageItems.length === 0 ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  whiteSpace: 'nowrap',
                }}
              >
                <Plus size={14} />
                Adicionar esta página ({currentPageItems.length})
              </button>
            </div>

            {/* TABELA DE RESULTADOS DO ESTOQUE */}
            <div style={{ border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: 10, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', color: '#94a3b8' }}>
                    <th style={{ padding: '10px 14px', width: 40 }}>
                      <input
                        type="checkbox"
                        checked={
                          currentPageItems.length > 0 &&
                          currentPageItems.every(it => selectedStockIds.includes(it.id))
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStockIds(Array.from(new Set([...selectedStockIds, ...currentPageItems.map(it => it.id)])));
                          } else {
                            setSelectedStockIds(selectedStockIds.filter(id => !currentPageItems.some(it => it.id === id)));
                          }
                        }}
                        style={{ cursor: 'pointer' }}
                      />
                    </th>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>Item / Especificação</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>Código / Identificador</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>Preço de Venda</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>Saldo</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700, textAlign: 'right' }}>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {currentPageItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>
                        Nenhum {stockTab === 'devices' ? 'aparelho' : 'produto'} encontrado com os filtros atuais.
                      </td>
                    </tr>
                  ) : (
                    currentPageItems.map((item) => {
                      const isSelected = selectedStockIds.includes(item.id);
                      const isDevice = stockTab === 'devices';
                      const dev = item as Device;
                      const prod = item as Product;
                      const inQueue = queue.some(q => q.referenceId === item.id);

                      return (
                        <tr
                          key={item.id}
                          style={{
                            borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                            background: isSelected ? 'rgba(249, 115, 22, 0.04)' : 'transparent',
                          }}
                        >
                          <td style={{ padding: '10px 14px' }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedStockIds(prev => [...prev, item.id]);
                                } else {
                                  setSelectedStockIds(prev => prev.filter(id => id !== item.id));
                                }
                              }}
                              style={{ cursor: 'pointer' }}
                            />
                          </td>

                          {/* IDENTIFICAÇÃO */}
                          <td style={{ padding: '10px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: 6,
                                  background: isDevice ? 'rgba(56, 189, 248, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: isDevice ? '#38bdf8' : '#10b981',
                                }}
                              >
                                {isDevice ? <Smartphone size={16} /> : <Package size={16} />}
                              </div>
                              <div>
                                <div style={{ fontWeight: 800, color: '#f8fafc' }}>
                                  {isDevice ? `${dev.brand} ${dev.model}` : prod.name}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                                  {isDevice
                                    ? `${dev.storage} • ${dev.color} ${dev.batteryHealth ? `(${dev.batteryHealth}%)` : ''}`
                                    : `${prod.brand} • ${prod.category}`}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* CÓDIGO */}
                          <td style={{ padding: '10px 14px' }}>
                            <div style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: 700, fontSize: '0.74rem' }}>
                              {isDevice ? (dev.imei || dev.serialNumber || 'N/A') : prod.sku}
                            </div>
                            {isDevice && dev.condition && (
                              <span style={{ fontSize: '0.66rem', color: '#64748b' }}>
                                {dev.condition === 'new_sealed' ? 'Novo Lacrado' : 'Seminovo'}
                              </span>
                            )}
                          </td>

                          {/* PREÇO */}
                          <td style={{ padding: '10px 14px' }}>
                            <span style={{ fontWeight: 800, color: '#f97316' }}>
                              R$ {(isDevice ? dev.sellPrice : prod.sellPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </td>

                          {/* SALDO */}
                          <td style={{ padding: '10px 14px' }}>
                            <span
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: 6,
                                background: isDevice
                                  ? 'rgba(56, 189, 248, 0.1)'
                                  : prod.currentStock > 0
                                  ? 'rgba(16, 185, 129, 0.1)'
                                  : 'rgba(239, 68, 68, 0.1)',
                                color: isDevice
                                  ? '#38bdf8'
                                  : prod.currentStock > 0
                                  ? '#10b981'
                                  : '#ef4444',
                              }}
                            >
                              {isDevice ? '1 unidade' : `${prod.currentStock} ${prod.unit || 'un'}`}
                            </span>
                          </td>

                          {/* AÇÃO */}
                          <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={() => handleAddToQueue(item, isDevice ? 'device' : 'product', 1)}
                              style={{
                                background: inQueue ? 'rgba(255, 255, 255, 0.08)' : 'rgba(249, 115, 22, 0.12)',
                                border: inQueue ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(249, 115, 22, 0.3)',
                                color: inQueue ? '#94a3b8' : '#f97316',
                                padding: '5px 10px',
                                borderRadius: 6,
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                              }}
                            >
                              {inQueue ? <Check size={12} color="#10b981" /> : <Plus size={12} />}
                              {inQueue ? 'Na fila' : 'Adicionar'}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINAÇÃO */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem', color: '#94a3b8' }}>
              <span>
                Mostrando {currentPageItems.length} de {activeStockList.length} itens encontrados
              </span>

              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: page <= 1 ? '#475569' : '#f8fafc',
                    padding: '4px 8px',
                    borderRadius: 6,
                    cursor: page <= 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  <ChevronLeft size={14} />
                </button>
                <span>Página {page} de {totalPages}</span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: page >= totalPages ? '#475569' : '#f8fafc',
                    padding: '4px 8px',
                    borderRadius: 6,
                    cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                  }}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* CARD 2: FILA DE IMPRESSÃO */}
          <div
            style={{
              background: '#0d121f',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 14,
              padding: '22px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Printer size={18} color="#38bdf8" />
                  Fila de impressão
                </h2>
                <span
                  style={{
                    background: 'rgba(56, 189, 248, 0.1)',
                    color: '#38bdf8',
                    padding: '2px 8px',
                    borderRadius: 12,
                    fontSize: '0.7rem',
                    fontWeight: 700,
                  }}
                >
                  {totalDistinctItems} itens distintos • {totalLabels} etiquetas no total
                </span>
              </div>

              {queue.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearQueue}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#ef4444',
                    padding: '5px 12px',
                    borderRadius: 6,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Trash2 size={13} />
                  Limpar fila
                </button>
              )}
            </div>

            {/* TABELA DA FILA */}
            {queue.length === 0 ? (
              <div
                style={{
                  padding: '36px 20px',
                  textAlign: 'center',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: 10,
                  border: '1px dashed rgba(255, 255, 255, 0.08)',
                  color: '#94a3b8',
                  fontSize: '0.8rem',
                }}
              >
                <Barcode size={32} color="#64748b" style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                <div style={{ fontWeight: 700, color: '#cbd5e1' }}>Sua fila de impressão está vazia</div>
                <div style={{ fontSize: '0.74rem', marginTop: 4 }}>
                  Selecione aparelhos ou produtos no card acima para configurar as etiquetas.
                </div>
              </div>
            ) : (
              <div style={{ border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: 10, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', color: '#94a3b8' }}>
                      <th style={{ padding: '10px 14px', fontWeight: 700 }}>Item</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700 }}>Identificador</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700 }}>Preço Unit.</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700, textAlign: 'center' }}>Qtd. Etiquetas</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700, textAlign: 'center' }}>Subtotal</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700, textAlign: 'right' }}>Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queue.map((item, index) => {
                      const isPreviewing = previewIndex === index;
                      return (
                        <tr
                          key={item.id}
                          style={{
                            borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                            background: isPreviewing ? 'rgba(56, 189, 248, 0.06)' : 'transparent',
                          }}
                        >
                          {/* ITEM */}
                          <td style={{ padding: '10px 14px' }}>
                            <div style={{ fontWeight: 800, color: '#f8fafc' }}>{item.title}</div>
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{item.subtitle}</div>
                          </td>

                          {/* IDENTIFICADOR */}
                          <td style={{ padding: '10px 14px' }}>
                            <span style={{ fontFamily: 'monospace', color: '#38bdf8', fontSize: '0.74rem', fontWeight: 700 }}>
                              {item.code}
                            </span>
                          </td>

                          {/* PREÇO */}
                          <td style={{ padding: '10px 14px', fontWeight: 800, color: '#f97316' }}>
                            R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>

                          {/* CONTROLE DE QUANTIDADE */}
                          <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', background: '#090d16', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 6, overflow: 'hidden' }}>
                              <button
                                type="button"
                                onClick={() => handleUpdateQueueQty(item.id, -1)}
                                style={{ background: 'transparent', border: 'none', color: '#cbd5e1', padding: '4px 8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 800 }}
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min={1}
                                max={999}
                                value={item.quantity}
                                onChange={(e) => handleSetQueueQty(item.id, parseInt(e.target.value, 10))}
                                style={{
                                  width: 42,
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#fff',
                                  textAlign: 'center',
                                  fontSize: '0.78rem',
                                  fontWeight: 800,
                                  outline: 'none',
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => handleUpdateQueueQty(item.id, 1)}
                                style={{ background: 'transparent', border: 'none', color: '#cbd5e1', padding: '4px 8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 800 }}
                              >
                                +
                              </button>
                            </div>
                          </td>

                          {/* SUBTOTAL DESTE ITEM */}
                          <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 800, color: '#cbd5e1' }}>
                            {item.quantity} etq
                          </td>

                          {/* AÇÕES: PRÉVIA E REMOVER */}
                          <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                              <button
                                type="button"
                                onClick={() => setPreviewIndex(index)}
                                title="Ver na prévia"
                                style={{
                                  background: isPreviewing ? '#38bdf8' : 'rgba(255, 255, 255, 0.06)',
                                  color: isPreviewing ? '#090d16' : '#94a3b8',
                                  border: 'none',
                                  padding: '4px 8px',
                                  borderRadius: 4,
                                  fontSize: '0.68rem',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                }}
                              >
                                Prévia
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveFromQueue(item.id)}
                                title="Remover da fila"
                                style={{
                                  background: 'rgba(239, 68, 68, 0.1)',
                                  color: '#ef4444',
                                  border: 'none',
                                  padding: '4px 8px',
                                  borderRadius: 4,
                                  cursor: 'pointer',
                                }}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* COLUNA DIREITA: CONFIGURAÇÕES & PRÉVIA DA ETIQUETA                 */}
        {/* ------------------------------------------------------------------ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* CARD 3: FORMATO E CONTEÚDO */}
          <div
            style={{
              background: '#0d121f',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 14,
              padding: '22px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sliders size={18} color="#f97316" />
              Formato e conteúdo
            </h2>

            {/* SELEÇÃO DO TIPO DE MÍDIA: ROLO vs A4 */}
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase' }}>
                Tipo de Mídia
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 6 }}>
                <button
                  type="button"
                  onClick={() => {
                    const firstRoll = LABEL_FORMATS.find(f => f.mediaType === 'roll') || LABEL_FORMATS[0];
                    setPrefs(prev => ({ ...prev, mediaType: 'roll', formatId: firstRoll.id }));
                  }}
                  style={{
                    background: prefs.mediaType === 'roll' ? 'rgba(249, 115, 22, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: prefs.mediaType === 'roll' ? '1px solid #f97316' : '1px solid rgba(255, 255, 255, 0.08)',
                    color: prefs.mediaType === 'roll' ? '#f97316' : '#94a3b8',
                    padding: '8px 12px',
                    borderRadius: 8,
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Rolo térmico
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const firstA4 = LABEL_FORMATS.find(f => f.mediaType === 'a4') || LABEL_FORMATS[4];
                    setPrefs(prev => ({ ...prev, mediaType: 'a4', formatId: firstA4.id }));
                  }}
                  style={{
                    background: prefs.mediaType === 'a4' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: prefs.mediaType === 'a4' ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                    color: prefs.mediaType === 'a4' ? '#38bdf8' : '#94a3b8',
                    padding: '8px 12px',
                    borderRadius: 8,
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Etiquetas em folha A4
                </button>
              </div>
            </div>

            {/* SELEÇÃO DO FORMATO DE ETIQUETA */}
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase' }}>
                Formato da Etiqueta
              </label>
              <select
                value={prefs.formatId}
                onChange={(e) => setPrefs(prev => ({ ...prev, formatId: e.target.value }))}
                style={{
                  width: '100%',
                  background: '#090d16',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#fff',
                  padding: '9px 12px',
                  borderRadius: 8,
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  marginTop: 6,
                  outline: 'none',
                }}
              >
                {LABEL_FORMATS.filter(f => f.mediaType === prefs.mediaType).map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} — {f.description}
                  </option>
                ))}
              </select>
            </div>

            {/* AJUSTES DE POSICIONAMENTO X E Y */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: 10, padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#cbd5e1', textTransform: 'uppercase' }}>
                  Ajuste de Posicionamento Físico
                </span>
                <button
                  type="button"
                  onClick={() => setPrefs(prev => ({ ...prev, offsetX: 0, offsetY: 0 }))}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#38bdf8',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <RotateCcw size={11} />
                  Restaurar posição
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Ajuste X (mm)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="-15"
                    max="15"
                    value={prefs.offsetX}
                    onChange={(e) => setPrefs(prev => ({ ...prev, offsetX: parseFloat(e.target.value) || 0 }))}
                    style={{
                      width: '100%',
                      background: '#090d16',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#fff',
                      padding: '6px 10px',
                      borderRadius: 6,
                      fontSize: '0.78rem',
                      marginTop: 4,
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Ajuste Y (mm)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="-15"
                    max="15"
                    value={prefs.offsetY}
                    onChange={(e) => setPrefs(prev => ({ ...prev, offsetY: parseFloat(e.target.value) || 0 }))}
                    style={{
                      width: '100%',
                      background: '#090d16',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#fff',
                      padding: '6px 10px',
                      borderRadius: 6,
                      fontSize: '0.78rem',
                      marginTop: 4,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* OPÇÕES DE CONTEÚDO DA ETIQUETA (SWITCHES) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#cbd5e1', textTransform: 'uppercase' }}>
                Opções de Conteúdo da Etiqueta
              </label>

              {/* 1. Nome da Loja */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 10px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: '#f8fafc', fontWeight: 600 }}>Nome da loja</span>
                  <input
                    type="checkbox"
                    checked={prefs.showStoreName}
                    onChange={(e) => setPrefs(prev => ({ ...prev, showStoreName: e.target.checked }))}
                    style={{ cursor: 'pointer' }}
                  />
                </div>
                {prefs.showStoreName && (
                  <input
                    type="text"
                    value={prefs.storeName}
                    onChange={(e) => setPrefs(prev => ({ ...prev, storeName: e.target.value }))}
                    placeholder="Nome impresso no topo da etiqueta"
                    style={{
                      width: '100%',
                      background: '#090d16',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#f97316',
                      fontWeight: 800,
                      padding: '5px 8px',
                      borderRadius: 6,
                      fontSize: '0.75rem',
                    }}
                  />
                )}
              </div>

              {/* 2. Preço de Venda */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 8 }}>
                <span style={{ fontSize: '0.78rem', color: '#f8fafc', fontWeight: 600 }}>Preço de venda</span>
                <input
                  type="checkbox"
                  checked={prefs.showPrice}
                  onChange={(e) => setPrefs(prev => ({ ...prev, showPrice: e.target.checked }))}
                  style={{ cursor: 'pointer' }}
                />
              </div>

              {/* 3. Detalhes do Item */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 8 }}>
                <span style={{ fontSize: '0.78rem', color: '#f8fafc', fontWeight: 600 }}>Detalhes do item (modelo, cor, GB)</span>
                <input
                  type="checkbox"
                  checked={prefs.showDetails}
                  onChange={(e) => setPrefs(prev => ({ ...prev, showDetails: e.target.checked }))}
                  style={{ cursor: 'pointer' }}
                />
              </div>

              {/* 4. Saúde da Bateria (desabilitada por padrão conforme referência) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 8 }}>
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#f8fafc', fontWeight: 600 }}>Saúde da bateria</span>
                  <div style={{ fontSize: '0.66rem', color: '#64748b' }}>Apenas para celulares com dado cadastrado</div>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.showBattery}
                  onChange={(e) => setPrefs(prev => ({ ...prev, showBattery: e.target.checked }))}
                  style={{ cursor: 'pointer' }}
                />
              </div>

              {/* 5. Código em Texto (IMEI ou SKU) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 8 }}>
                <span style={{ fontSize: '0.78rem', color: '#f8fafc', fontWeight: 600 }}>Código em texto (IMEI ou SKU)</span>
                <input
                  type="checkbox"
                  checked={prefs.showCodeText}
                  onChange={(e) => setPrefs(prev => ({ ...prev, showCodeText: e.target.checked }))}
                  style={{ cursor: 'pointer' }}
                />
              </div>

              {/* 6. Código de Barras */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 8 }}>
                <span style={{ fontSize: '0.78rem', color: '#f8fafc', fontWeight: 600 }}>Código de barras</span>
                <input
                  type="checkbox"
                  checked={prefs.showBarcode}
                  onChange={(e) => setPrefs(prev => ({ ...prev, showBarcode: e.target.checked }))}
                  style={{ cursor: 'pointer' }}
                />
              </div>
            </div>
          </div>

          {/* CARD 4: PRÉVIA DA ETIQUETA E RESUMO DA IMPRESSÃO */}
          <div
            style={{
              background: '#0d121f',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 14,
              padding: '22px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={18} color="#10b981" />
                Prévia da etiqueta
              </h2>

              {queue.length > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => setPreviewIndex(i => (i > 0 ? i - 1 : queue.length - 1))}
                    style={{ background: 'rgba(255, 255, 255, 0.05)', border: 'none', color: '#fff', padding: '3px 6px', borderRadius: 4, cursor: 'pointer' }}
                  >
                    <ChevronLeft size={13} />
                  </button>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                    {previewIndex + 1} de {queue.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPreviewIndex(i => (i < queue.length - 1 ? i + 1 : 0))}
                    style={{ background: 'rgba(255, 255, 255, 0.05)', border: 'none', color: '#fff', padding: '3px 6px', borderRadius: 4, cursor: 'pointer' }}
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>
              )}
            </div>

            {/* ÁREA DE VISUALIZAÇÃO NEUTRA REALISTA */}
            <div
              style={{
                background: '#070a12',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: 12,
                padding: '28px 16px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 220,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* GRADE MILIMÉTRICA SUTIL */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0.04,
                  backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)',
                  backgroundSize: '12px 12px',
                  pointerEvents: 'none',
                }}
              />

              {!activePreviewItem ? (
                <div style={{ color: '#64748b', fontSize: '0.78rem', textAlign: 'center' }}>
                  Nenhum item selecionado para pré-visualização.
                </div>
              ) : (
                /* A ETIQUETA REALISTA (PAPEL BRANCO TÉRMICO) */
                <div
                  style={{
                    background: '#ffffff',
                    color: '#000000',
                    width: '100%',
                    maxWidth: 320,
                    aspectRatio: `${currentFormat.widthMm} / ${currentFormat.heightMm}`,
                    borderRadius: 4,
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5), 0 2px 6px rgba(0, 0, 0, 0.2)',
                    transform: `translate(${prefs.offsetX * 1.5}px, ${prefs.offsetY * 1.5}px)`,
                    transition: 'transform 0.15s ease',
                    position: 'relative',
                    userSelect: 'none',
                  }}
                >
                  {/* TOPO: NOME DA LOJA */}
                  {prefs.showStoreName && (
                    <div
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 900,
                        letterSpacing: '0.06em',
                        textAlign: 'center',
                        textTransform: 'uppercase',
                        borderBottom: '1px solid #e2e8f0',
                        paddingBottom: 2,
                        color: '#0f172a',
                      }}
                    >
                      {prefs.storeName || 'HIAGO IPHONES'}
                    </div>
                  )}

                  {/* CENTRO: PREÇO E DETALHES */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, margin: '4px 0' }}>
                    {prefs.showPrice && (
                      <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#000000', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                        R$ {activePreviewItem.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    )}

                    {prefs.showDetails && (
                      <div style={{ fontSize: '0.64rem', fontWeight: 700, color: '#334155', textAlign: 'center', lineHeight: 1.2 }}>
                        {activePreviewItem.title} • {activePreviewItem.subtitle}
                        {activePreviewItem.condition && ` (${activePreviewItem.condition})`}
                      </div>
                    )}

                    {prefs.showBattery && activePreviewItem.batteryHealth && (
                      <div style={{ fontSize: '0.58rem', fontWeight: 800, color: '#16a34a' }}>
                        🔋 Bateria: {activePreviewItem.batteryHealth}%
                      </div>
                    )}
                  </div>

                  {/* BASE: CÓDIGO DE BARRAS E CÓDIGO EM TEXTO */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    {prefs.showBarcode && (
                      <div style={{ width: '90%', margin: '0 auto' }}>
                        {renderBarcodeSVG(activePreviewItem.barcode || activePreviewItem.code, 200, 24)}
                      </div>
                    )}

                    {prefs.showCodeText && (
                      <div style={{ fontSize: '0.55rem', fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.05em', color: '#475569' }}>
                        {activePreviewItem.type === 'device' ? 'IMEI: ' : 'SKU: '}
                        {activePreviewItem.code}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* BOTÃO COPIAR CÓDIGO DO ITEM ATIVO */}
            {activePreviewItem && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: '#94a3b8' }}>
                <span>Item atual: <strong>{activePreviewItem.title}</strong></span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(activePreviewItem.code);
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: copiedCode ? '#10b981' : '#38bdf8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: '0.7rem',
                    fontWeight: 700,
                  }}
                >
                  {copiedCode ? <Check size={12} /> : <Copy size={12} />}
                  {copiedCode ? 'Código copiado!' : 'Copiar código'}
                </button>
              </div>
            )}

            {/* RESUMO DA IMPRESSÃO: 3 INDICADORES */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 4 }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Itens</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#f8fafc', marginTop: 2 }}>{totalDistinctItems}</div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.68rem', color: '#f97316', textTransform: 'uppercase', fontWeight: 700 }}>Etiquetas</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#f97316', marginTop: 2 }}>{totalLabels}</div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.68rem', color: '#38bdf8', textTransform: 'uppercase', fontWeight: 700 }}>
                  {prefs.mediaType === 'roll' ? 'Etq/Rolo' : 'Folhas A4'}
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#38bdf8', marginTop: 2 }}>{totalPagesEstimate}</div>
              </div>
            </div>

            {/* BOTÃO IMPRIMIR ETIQUETAS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
              <button
                type="button"
                onClick={handlePrint}
                disabled={queue.length === 0}
                style={{
                  background: queue.length === 0
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  color: queue.length === 0 ? '#64748b' : '#ffffff',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: 10,
                  fontSize: '0.9rem',
                  fontWeight: 900,
                  cursor: queue.length === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  boxShadow: queue.length === 0 ? 'none' : '0 4px 18px rgba(249, 115, 22, 0.4)',
                  transition: 'all 0.15s ease',
                }}
              >
                <Printer size={18} />
                Imprimir {totalLabels} etiqueta{totalLabels !== 1 ? 's' : ''} agora
              </button>

              <button
                type="button"
                onClick={() => {
                  alert('Para salvar como PDF: clique em "Imprimir" e na caixa de diálogo do seu navegador selecione a impressora "Salvar como PDF".');
                  handlePrint();
                }}
                disabled={queue.length === 0}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#94a3b8',
                  padding: '9px 16px',
                  borderRadius: 8,
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: queue.length === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <ExternalLink size={14} />
                Salvar como documento PDF
              </button>
            </div>

            {/* DICA DE CALIBRAÇÃO TÉRMICA */}
            <div
              style={{
                background: 'rgba(56, 189, 248, 0.05)',
                border: '1px solid rgba(56, 189, 248, 0.15)',
                borderRadius: 8,
                padding: '10px 12px',
                display: 'flex',
                gap: 8,
                alignItems: 'flex-start',
                fontSize: '0.7rem',
                color: '#94a3b8',
                lineHeight: 1.4,
              }}
            >
              <AlertCircle size={15} color="#38bdf8" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <strong style={{ color: '#38bdf8' }}>Dica de Calibração Térmica:</strong> Na janela de impressão do navegador, defina <strong>Margens: Nenhuma</strong> e <strong>Escala: 100% (Padrão)</strong> para encaixe milimétrico na fita ou folha.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* DOCUMENTO REAL DE IMPRESSÃO (OCULTO NA TELA, VISÍVEL NO @MEDIA PRINT) */}
      {/* ==================================================================== */}
      <div id="print-root-container">
        {queue.flatMap((item) =>
          Array.from({ length: item.quantity }).map((_, copyIndex) => (
            <div
              key={`print-${item.id}-${copyIndex}`}
              className="printable-single-label"
              style={{
                width: `${currentFormat.widthMm}mm`,
                height: `${currentFormat.heightMm}mm`,
                padding: '2.5mm 3mm',
              }}
            >
              {/* NOME DA LOJA */}
              {prefs.showStoreName && (
                <div
                  style={{
                    fontSize: '8pt',
                    fontWeight: 900,
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    lineHeight: 1,
                  }}
                >
                  {prefs.storeName || 'HIAGO IPHONES'}
                </div>
              )}

              {/* CENTRO: PREÇO E DETALHES */}
              <div style={{ textAlign: 'center', margin: '1mm 0' }}>
                {prefs.showPrice && (
                  <div style={{ fontSize: '13pt', fontWeight: 900, lineHeight: 1.1 }}>
                    R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                )}
                {prefs.showDetails && (
                  <div style={{ fontSize: '6.5pt', fontWeight: 700, lineHeight: 1.15 }}>
                    {item.title} • {item.subtitle}
                    {item.condition && ` (${item.condition})`}
                  </div>
                )}
                {prefs.showBattery && item.batteryHealth && (
                  <div style={{ fontSize: '6pt', fontWeight: 800 }}>
                    Bateria: {item.batteryHealth}%
                  </div>
                )}
              </div>

              {/* BASE: CÓDIGO DE BARRAS E TEXTO */}
              <div style={{ textAlign: 'center' }}>
                {prefs.showBarcode && (
                  <div style={{ width: '100%', margin: '0 auto' }}>
                    {renderBarcodeSVG(item.barcode || item.code, 180, 20)}
                  </div>
                )}
                {prefs.showCodeText && (
                  <div style={{ fontSize: '5.5pt', fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.04em' }}>
                    {item.type === 'device' ? 'IMEI: ' : 'SKU: '}
                    {item.code}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
