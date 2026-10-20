import React, { useState, useEffect } from 'react';
import {
  Palette,
  Sun,
  Moon,
  Laptop,
  Type,
  Square,
  Layout,
  Building2,
  Eye,
  RotateCcw,
  Save,
  CheckCircle2,
  Sparkles,
  Download,
  Check,
} from 'lucide-react';
import {
  themeService,
  type VisualThemeConfig,
  type ThemeMode,
  type FontFamilyOption,
  type LayoutDensity,
  type ShadowIntensity,
  SYSTEM_PRESETS,
} from '../../services/themeService.js';
import { updateStoreSettingsApi } from '../../api/erpApi.js';

type DesignerTab =
  | 'appearance'
  | 'colors'
  | 'typography'
  | 'borders'
  | 'layout'
  | 'brand'
  | 'accessibility'
  | 'presets';

export const AppearanceDesignerSubmodule: React.FC = () => {
  const [theme, setTheme] = useState<VisualThemeConfig>(() => themeService.getTheme());
  const [activeTab, setActiveTab] = useState<DesignerTab>('appearance');
  const [saveStatus, setSaveStatus] = useState<{ type: 'idle' | 'saving' | 'saved' | 'error'; message?: string }>({
    type: 'idle',
  });
  const [activeColorCategory, setActiveColorCategory] = useState<'brand' | 'surfaces' | 'borders' | 'status'>('brand');

  useEffect(() => {
    const unsubscribe = themeService.subscribe((updated) => {
      setTheme(updated);
    });
    return () => unsubscribe();
  }, []);

  const handleModeChange = (mode: ThemeMode) => {
    themeService.setMode(mode);
  };

  const handleColorChange = (key: keyof VisualThemeConfig['colors'], value: string) => {
    const updated = {
      ...theme.colors,
      [key]: value,
    };
    themeService.updateTheme({ colors: updated });
  };

  const handleTypographyChange = (updates: Partial<VisualThemeConfig['typography']>) => {
    themeService.updateTheme({
      typography: { ...theme.typography, ...updates },
    });
  };

  const handleGeometryChange = (updates: Partial<VisualThemeConfig['geometry']>) => {
    themeService.updateTheme({
      geometry: { ...theme.geometry, ...updates },
    });
  };

  const handleBrandChange = (updates: Partial<VisualThemeConfig['brand']>) => {
    themeService.updateTheme({
      brand: { ...theme.brand, ...updates },
    });
  };

  const handleAccessibilityChange = (updates: Partial<VisualThemeConfig['accessibility']>) => {
    themeService.updateTheme({
      accessibility: { ...theme.accessibility, ...updates },
    });
  };

  const handleApplyPreset = (presetKey: string) => {
    themeService.applyPreset(presetKey);
    setSaveStatus({ type: 'saved', message: `Preset "${SYSTEM_PRESETS[presetKey]?.name}" aplicado!` });
    setTimeout(() => setSaveStatus({ type: 'idle' }), 3000);
  };

  const handleSaveAll = async () => {
    setSaveStatus({ type: 'saving' });
    try {
      // 1. Persiste no localStorage via ThemeService
      themeService.updateTheme(theme);

      // 2. Tenta sincronizar institucionalmente na tabela store_settings do Supabase
      await updateStoreSettingsApi({
        storeName: theme.brand.storeDisplayName,
        logoUrl: theme.brand.primaryLogoUrl,
      });

      setSaveStatus({ type: 'saved', message: 'Configurações de aparência salvas com sucesso!' });
      setTimeout(() => setSaveStatus({ type: 'idle' }), 3500);
    } catch (err) {
      console.warn('Erro ao sincronizar com backend:', err);
      setSaveStatus({
        type: 'saved',
        message: 'Tema salvo localmente no navegador (sincronização cloud pendente).',
      });
      setTimeout(() => setSaveStatus({ type: 'idle' }), 3500);
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Tem certeza que deseja restaurar as configurações visuais para o padrão oficial?')) {
      themeService.resetToDefault();
      setSaveStatus({ type: 'saved', message: 'Padrão oficial restaurado com sucesso!' });
      setTimeout(() => setSaveStatus({ type: 'idle' }), 3000);
    }
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(theme, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `hiago_theme_${theme.mode}_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const tabs = [
    { id: 'appearance' as DesignerTab, label: 'Modo & Geral', icon: Sun },
    { id: 'colors' as DesignerTab, label: 'Paleta de Cores', icon: Palette },
    { id: 'typography' as DesignerTab, label: 'Tipografia', icon: Type },
    { id: 'borders' as DesignerTab, label: 'Bordas & Formas', icon: Square },
    { id: 'layout' as DesignerTab, label: 'Densidade & Layout', icon: Layout },
    { id: 'brand' as DesignerTab, label: 'Identidade Visual', icon: Building2 },
    { id: 'accessibility' as DesignerTab, label: 'Acessibilidade', icon: Eye },
    { id: 'presets' as DesignerTab, label: 'Presets & Backup', icon: Sparkles },
  ];

  const fontOptions: FontFamilyOption[] = ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Nunito Sans', 'System UI'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 1. CABEÇALHO DO MÓDULO DESIGNER COM AÇÕES RÁPIDAS */}
      <div
        className="crm-card"
        style={{
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(249, 115, 22, 0.25)',
            }}
          >
            <Palette size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                Designer Global & Design System
              </h2>
              <span
                className="status-chip status-available"
                style={{ fontSize: '0.6875rem', textTransform: 'uppercase' }}
              >
                Tokens Ativos
              </span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '3px 0 0' }}>
              Personalize White Mode, Black Mode, paleta institucional, bordas nítidas de 1px e tipografia em todo o CRM.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {saveStatus.message && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.8125rem',
                color: saveStatus.type === 'error' ? 'var(--status-danger)' : 'var(--status-success)',
                fontWeight: 500,
              }}
            >
              <CheckCircle2 size={16} />
              <span>{saveStatus.message}</span>
            </div>
          )}

          <button
            onClick={handleResetDefaults}
            className="balcao-btn-secondary"
            title="Restaurar aparência original de fábrica"
          >
            <RotateCcw size={14} />
            <span>Restaurar Padrão</span>
          </button>

          <button
            onClick={handleSaveAll}
            className="balcao-btn-primary"
            disabled={saveStatus.type === 'saving'}
            style={{ minWidth: 140 }}
          >
            <Save size={15} />
            <span>{saveStatus.type === 'saving' ? 'Gravando...' : 'Salvar Alterações'}</span>
          </button>
        </div>
      </div>

      {/* 2. LAYOUT DIVIDIDO: CONTROLES À ESQUERDA + PREVIEW EM TEMPO REAL À DIREITA */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(420px, 1.1fr) minmax(380px, 0.9fr)', gap: 20 }}>
        {/* COLUNA ESQUERDA: NAVEGAÇÃO DE ABAS E CONFIGURAÇÕES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Abas Superiores do Designer */}
          <div
            className="crm-card"
            style={{
              padding: 6,
              display: 'flex',
              gap: 4,
              overflowX: 'auto',
              borderBottom: 'var(--border-width) solid var(--border-default)',
            }}
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78125rem',
                    fontWeight: isActive ? 600 : 500,
                    border: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                    color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                    transition: 'all var(--animation-duration) ease',
                  }}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Painel de Conteúdo da Aba Ativa */}
          <div className="crm-card" style={{ padding: '22px 24px', minHeight: 460 }}>
            {/* 1. ABA APARÊNCIA & MODO */}
            {activeTab === 'appearance' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-main)', margin: '0 0 4px' }}>
                    Modo de Exibição da Interface
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Selecione se o CRM deve ser exibido em tema claro, escuro ou acompanhar automaticamente o sistema operacional.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {/* White Mode */}
                  <div
                    onClick={() => handleModeChange('light')}
                    style={{
                      padding: 16,
                      borderRadius: 'var(--radius-md)',
                      border: `var(--border-width) solid ${
                        theme.mode === 'light' ? 'var(--color-primary)' : 'var(--border-default)'
                      }`,
                      backgroundColor: theme.mode === 'light' ? 'var(--surface-hover)' : 'var(--surface-bg)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      gap: 10,
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #CBD5E1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#0F172A',
                      }}
                    >
                      <Sun size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        White Mode
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                        Tema Claro com superfícies limpas e bordas suaves.
                      </div>
                    </div>
                    {theme.mode === 'light' && (
                      <span
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: 'var(--color-primary)',
                        }}
                      />
                    )}
                  </div>

                  {/* Black Mode */}
                  <div
                    onClick={() => handleModeChange('dark')}
                    style={{
                      padding: 16,
                      borderRadius: 'var(--radius-md)',
                      border: `var(--border-width) solid ${
                        theme.mode === 'dark' ? 'var(--color-primary)' : 'var(--border-default)'
                      }`,
                      backgroundColor: theme.mode === 'dark' ? 'var(--surface-hover)' : 'var(--surface-bg)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      gap: 10,
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        backgroundColor: '#0F1117',
                        border: '1px solid #272F44',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#F8FAFC',
                      }}
                    >
                      <Moon size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        Black Mode
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                        Tema Escuro grafite com bordas de 1px deliberadas.
                      </div>
                    </div>
                    {theme.mode === 'dark' && (
                      <span
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: 'var(--color-primary)',
                        }}
                      />
                    )}
                  </div>

                  {/* System Mode */}
                  <div
                    onClick={() => handleModeChange('system')}
                    style={{
                      padding: 16,
                      borderRadius: 'var(--radius-md)',
                      border: `var(--border-width) solid ${
                        theme.mode === 'system' ? 'var(--color-primary)' : 'var(--border-default)'
                      }`,
                      backgroundColor: theme.mode === 'system' ? 'var(--surface-hover)' : 'var(--surface-bg)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      gap: 10,
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        backgroundColor: 'var(--surface-muted)',
                        border: '1px solid var(--border-default)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-main)',
                      }}
                    >
                      <Laptop size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        System Mode
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                        Automático conforme SO do computador/celular.
                      </div>
                    </div>
                    {theme.mode === 'system' && (
                      <span
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: 'var(--color-primary)',
                        }}
                      />
                    )}
                  </div>
                </div>

                <div style={{ borderTop: 'var(--border-width) solid var(--border-default)', paddingTop: 16 }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', margin: '0 0 10px' }}>
                    Intensidade das Sombras e Profundidade
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                    {(['none', 'subtle', 'medium', 'strong'] as ShadowIntensity[]).map((intensity) => (
                      <button
                        key={intensity}
                        onClick={() => handleGeometryChange({ shadowIntensity: intensity })}
                        style={{
                          padding: '10px 8px',
                          borderRadius: 'var(--radius-sm)',
                          border: `var(--border-width) solid ${
                            theme.geometry.shadowIntensity === intensity
                              ? 'var(--color-primary)'
                              : 'var(--border-default)'
                          }`,
                          backgroundColor:
                            theme.geometry.shadowIntensity === intensity ? 'var(--surface-hover)' : 'var(--surface-bg)',
                          color: 'var(--text-main)',
                          fontSize: '0.8125rem',
                          fontWeight: theme.geometry.shadowIntensity === intensity ? 600 : 500,
                          cursor: 'pointer',
                          textTransform: 'capitalize',
                        }}
                      >
                        {intensity === 'none'
                          ? 'Sem Sombra'
                          : intensity === 'subtle'
                          ? 'Sutil'
                          : intensity === 'medium'
                          ? 'Média'
                          : 'Destacada'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. ABA CORES */}
            {activeTab === 'colors' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {/* Categorias de Cores */}
                <div style={{ display: 'flex', gap: 6, borderBottom: 'var(--border-width) solid var(--border-default)', paddingBottom: 10 }}>
                  {[
                    { id: 'brand' as const, label: 'Marca & Destaque' },
                    { id: 'surfaces' as const, label: 'Superfícies & Telas' },
                    { id: 'borders' as const, label: 'Bordas & Linhas' },
                    { id: 'status' as const, label: 'Status & Alertas' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveColorCategory(cat.id)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.78125rem',
                        fontWeight: activeColorCategory === cat.id ? 600 : 500,
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: activeColorCategory === cat.id ? 'var(--surface-muted)' : 'transparent',
                        color: activeColorCategory === cat.id ? 'var(--text-main)' : 'var(--text-secondary)',
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Subcategoria 1: Marca & Ação */}
                {activeColorCategory === 'brand' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <ColorField
                      label="Cor Primária (Botões e Ações)"
                      value={theme.colors.primary}
                      onChange={(val) => {
                        handleColorChange('primary', val);
                        handleColorChange('primaryHover', val);
                      }}
                    />
                    <ColorField
                      label="Cor Secundária"
                      value={theme.colors.secondary}
                      onChange={(val) => handleColorChange('secondary', val)}
                    />
                    <ColorField
                      label="Cor de Destaque / Accent"
                      value={theme.colors.accent}
                      onChange={(val) => handleColorChange('accent', val)}
                    />
                    <ColorField
                      label="Foco de Seleção / Anel"
                      value={theme.colors.borderFocus}
                      onChange={(val) => handleColorChange('borderFocus', val)}
                    />
                  </div>
                )}

                {/* Subcategoria 2: Superfícies */}
                {activeColorCategory === 'surfaces' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <ColorField
                      label="Fundo Principal (Canvas)"
                      value={theme.colors.canvasBg}
                      onChange={(val) => handleColorChange('canvasBg', val)}
                    />
                    <ColorField
                      label="Fundo de Cards e Painéis"
                      value={theme.colors.cardBg}
                      onChange={(val) => {
                        handleColorChange('cardBg', val);
                        handleColorChange('surfaceBg', val);
                      }}
                    />
                    <ColorField
                      label="Fundo da Sidebar Lateral"
                      value={theme.colors.sidebarBg}
                      onChange={(val) => handleColorChange('sidebarBg', val)}
                    />
                    <ColorField
                      label="Fundo do Cabeçalho Superior"
                      value={theme.colors.headerBg}
                      onChange={(val) => handleColorChange('headerBg', val)}
                    />
                    <ColorField
                      label="Texto Principal"
                      value={theme.colors.textMain}
                      onChange={(val) => handleColorChange('textMain', val)}
                    />
                    <ColorField
                      label="Texto Secundário / Labels"
                      value={theme.colors.textSecondary}
                      onChange={(val) => handleColorChange('textSecondary', val)}
                    />
                  </div>
                )}

                {/* Subcategoria 3: Bordas */}
                {activeColorCategory === 'borders' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <ColorField
                      label="Borda Padrão (Cards e Tabelas)"
                      value={theme.colors.borderDefault}
                      onChange={(val) => handleColorChange('borderDefault', val)}
                    />
                    <ColorField
                      label="Borda Sutil (Divisórias Internas)"
                      value={theme.colors.borderSubtle}
                      onChange={(val) => handleColorChange('borderSubtle', val)}
                    />
                    <ColorField
                      label="Borda Destacada (Hover e Foco)"
                      value={theme.colors.borderStrong}
                      onChange={(val) => handleColorChange('borderStrong', val)}
                    />
                    <ColorField
                      label="Borda da Sidebar"
                      value={theme.colors.sidebarBorder}
                      onChange={(val) => handleColorChange('sidebarBorder', val)}
                    />
                  </div>
                )}

                {/* Subcategoria 4: Status Semânticos */}
                {activeColorCategory === 'status' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <ColorField
                      label="Sucesso (Disponível / Pago)"
                      value={theme.colors.statusSuccess}
                      onChange={(val) => handleColorChange('statusSuccess', val)}
                    />
                    <ColorField
                      label="Informativo / Em Andamento"
                      value={theme.colors.statusInfo}
                      onChange={(val) => handleColorChange('statusInfo', val)}
                    />
                    <ColorField
                      label="Atenção / O.S. Aguardando"
                      value={theme.colors.statusWarning}
                      onChange={(val) => handleColorChange('statusWarning', val)}
                    />
                    <ColorField
                      label="Perigo / Cancelado / Erro"
                      value={theme.colors.statusDanger}
                      onChange={(val) => handleColorChange('statusDanger', val)}
                    />
                  </div>
                )}
              </div>
            )}

            {/* 3. ABA TIPOGRAFIA */}
            {activeTab === 'typography' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-main)', margin: '0 0 4px' }}>
                    Família Tipográfica
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Fontes de alta legibilidade para dashboards e relatórios operacionais.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {fontOptions.map((font) => (
                    <button
                      key={font}
                      onClick={() => handleTypographyChange({ fontFamily: font, headingFontFamily: font })}
                      style={{
                        padding: '12px 10px',
                        borderRadius: 'var(--radius-sm)',
                        border: `var(--border-width) solid ${
                          theme.typography.fontFamily === font ? 'var(--color-primary)' : 'var(--border-default)'
                        }`,
                        backgroundColor:
                          theme.typography.fontFamily === font ? 'var(--surface-hover)' : 'var(--surface-bg)',
                        color: 'var(--text-main)',
                        fontSize: '0.875rem',
                        fontWeight: theme.typography.fontFamily === font ? 600 : 400,
                        fontFamily: font,
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>{font}</span>
                      {theme.typography.fontFamily === font && <Check size={14} color="var(--color-primary)" />}
                    </button>
                  ))}
                </div>

                <div style={{ borderTop: 'var(--border-width) solid var(--border-default)', paddingTop: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      Tamanho de Fonte Base: {theme.typography.baseFontSize}px
                    </label>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Padrão: 14px (Limites: 12px a 18px)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="18"
                    step="1"
                    value={theme.typography.baseFontSize}
                    onChange={(e) => handleTypographyChange({ baseFontSize: Number(e.target.value) })}
                    style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      Altura de Linha (Line-Height): {theme.typography.lineHeight}
                    </label>
                  </div>
                  <input
                    type="range"
                    min="1.3"
                    max="1.7"
                    step="0.05"
                    value={theme.typography.lineHeight}
                    onChange={(e) => handleTypographyChange({ lineHeight: Number(e.target.value) })}
                    style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                  />
                </div>
              </div>
            )}

            {/* 4. ABA BORDAS & FORMAS */}
            {activeTab === 'borders' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-main)', margin: '0 0 4px' }}>
                    Sistema Global de Bordas e Contornos
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Garante que nenhum card, campo de formulário ou tabela fique sem delimitação visual visível.
                  </p>
                </div>

                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: 8 }}>
                    Espessura Padrão das Bordas
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <button
                      onClick={() => handleGeometryChange({ borderWidth: 1 })}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-sm)',
                        border: `1px solid ${theme.geometry.borderWidth === 1 ? 'var(--color-primary)' : 'var(--border-default)'}`,
                        backgroundColor: theme.geometry.borderWidth === 1 ? 'var(--surface-hover)' : 'var(--surface-bg)',
                        color: 'var(--text-main)',
                        fontWeight: 600,
                        fontSize: '0.8125rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>1px (Nítida & Moderna - Padrão)</span>
                      {theme.geometry.borderWidth === 1 && <Check size={16} color="var(--color-primary)" />}
                    </button>
                    <button
                      onClick={() => handleGeometryChange({ borderWidth: 2 })}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-sm)',
                        border: `2px solid ${theme.geometry.borderWidth === 2 ? 'var(--color-primary)' : 'var(--border-default)'}`,
                        backgroundColor: theme.geometry.borderWidth === 2 ? 'var(--surface-hover)' : 'var(--surface-bg)',
                        color: 'var(--text-main)',
                        fontWeight: 600,
                        fontSize: '0.8125rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>2px (Mais Marcada / Alto Contraste)</span>
                      {theme.geometry.borderWidth === 2 && <Check size={16} color="var(--color-primary)" />}
                    </button>
                  </div>
                </div>

                <div style={{ borderTop: 'var(--border-width) solid var(--border-default)', paddingTop: 16 }}>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: 8 }}>
                    Escala de Arredondamento (Border Radius)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                    {[
                      { label: 'Reto (0px)', sm: 0, md: 0, lg: 0 },
                      { label: 'Sutil (4-6px)', sm: 4, md: 6, lg: 8 },
                      { label: 'Padrão (6-10px)', sm: 6, md: 8, lg: 12 },
                      { label: 'Arredondado (10-16px)', sm: 8, md: 12, lg: 16 },
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleGeometryChange({ radiusSm: item.sm, radiusMd: item.md, radiusLg: item.lg })}
                        style={{
                          padding: '12px 8px',
                          borderRadius: `${item.md}px`,
                          border: `var(--border-width) solid ${
                            theme.geometry.radiusMd === item.md ? 'var(--color-primary)' : 'var(--border-default)'
                          }`,
                          backgroundColor:
                            theme.geometry.radiusMd === item.md ? 'var(--surface-hover)' : 'var(--surface-bg)',
                          color: 'var(--text-main)',
                          fontSize: '0.78125rem',
                          fontWeight: theme.geometry.radiusMd === item.md ? 600 : 500,
                          cursor: 'pointer',
                          textAlign: 'center',
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 5. ABA DENSIDADE & LAYOUT */}
            {activeTab === 'layout' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-main)', margin: '0 0 4px' }}>
                    Densidade da Informação & Espaçamentos
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Ajuste o espaçamento de tabelas e formulários para visualizar mais linhas por tela.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {[
                    { id: 'compact' as LayoutDensity, label: 'Compacta', desc: 'Mais dados por tela (32px altura)' },
                    { id: 'default' as LayoutDensity, label: 'Padrão Balcão', desc: 'Equilíbrio ideal (38px altura)' },
                    { id: 'comfortable' as LayoutDensity, label: 'Confortável', desc: 'Espaçamento amplo (44px altura)' },
                  ].map((d) => (
                    <div
                      key={d.id}
                      onClick={() => handleGeometryChange({ density: d.id })}
                      style={{
                        padding: 16,
                        borderRadius: 'var(--radius-md)',
                        border: `var(--border-width) solid ${
                          theme.geometry.density === d.id ? 'var(--color-primary)' : 'var(--border-default)'
                        }`,
                        backgroundColor:
                          theme.geometry.density === d.id ? 'var(--surface-hover)' : 'var(--surface-bg)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                      }}
                    >
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        {d.label}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {d.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. ABA IDENTIDADE VISUAL */}
            {activeTab === 'brand' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-main)', margin: '0 0 4px' }}>
                    Identidade Institucional da Loja (White-Label)
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Configure o nome comercial da loja e as logos para cabeçalho e relatórios.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: 4 }}>
                      Nome de Exibição da Loja
                    </label>
                    <input
                      type="text"
                      className="crm-input"
                      value={theme.brand.storeDisplayName}
                      onChange={(e) => handleBrandChange({ storeDisplayName: e.target.value })}
                      placeholder="Ex: Hiago iPhones"
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: 4 }}>
                      URL do Logotipo Principal
                    </label>
                    <input
                      type="text"
                      className="crm-input"
                      value={theme.brand.primaryLogoUrl}
                      onChange={(e) => handleBrandChange({ primaryLogoUrl: e.target.value })}
                      placeholder="https://exemplo.com/logo.png"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 7. ABA ACESSIBILIDADE */}
            {activeTab === 'accessibility' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-main)', margin: '0 0 4px' }}>
                    Acessibilidade e Usabilidade
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Recursos universais para melhorar a legibilidade e navegação por teclado.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 12,
                      borderRadius: 'var(--radius-sm)',
                      border: 'var(--border-width) solid var(--border-default)',
                      backgroundColor: 'var(--surface-bg)',
                      cursor: 'pointer',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        Anel de Foco Aumentado (Focus Visible)
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Destaca nitidamente botões e inputs selecionados via teclado (Tab).
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={theme.accessibility.increasedFocusRing}
                      onChange={(e) => handleAccessibilityChange({ increasedFocusRing: e.target.checked })}
                      style={{ width: 18, height: 18, accentColor: 'var(--color-primary)' }}
                    />
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 12,
                      borderRadius: 'var(--radius-sm)',
                      border: 'var(--border-width) solid var(--border-default)',
                      backgroundColor: 'var(--surface-bg)',
                      cursor: 'pointer',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        Redução de Movimento (Reduced Motion)
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Desativa transições e animações para evitar cansaço visual.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={theme.accessibility.reducedMotion}
                      onChange={(e) => handleAccessibilityChange({ reducedMotion: e.target.checked })}
                      style={{ width: 18, height: 18, accentColor: 'var(--color-primary)' }}
                    />
                  </label>
                </div>
              </div>
            )}

            {/* 8. ABA PRESETS & RESTAURAÇÃO */}
            {activeTab === 'presets' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-main)', margin: '0 0 4px' }}>
                    Temas e Presets Prontos
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Alterne instantaneamente entre configurações pré-testadas e harmônicas.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {Object.entries(SYSTEM_PRESETS).map(([key, preset]) => (
                    <div
                      key={key}
                      onClick={() => handleApplyPreset(key)}
                      style={{
                        padding: 14,
                        borderRadius: 'var(--radius-md)',
                        border: 'var(--border-width) solid var(--border-default)',
                        backgroundColor: 'var(--surface-bg)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        transition: 'border-color var(--animation-duration) ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-default)')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                          {preset.name}
                        </span>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <span
                            style={{
                              width: 14,
                              height: 14,
                              borderRadius: '50%',
                              backgroundColor: preset.colors.primary,
                              border: '1px solid #FFFFFF',
                            }}
                          />
                          <span
                            style={{
                              width: 14,
                              height: 14,
                              borderRadius: '50%',
                              backgroundColor: preset.colors.canvasBg,
                              border: '1px solid #71717A',
                            }}
                          />
                        </div>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Modo: {preset.mode.toUpperCase()} • Fonte: {preset.typography.fontFamily} • Bordas: {preset.geometry.borderWidth}px
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: 'var(--border-width) solid var(--border-default)', paddingTop: 16, display: 'flex', gap: 10 }}>
                  <button onClick={handleExportJson} className="balcao-btn-secondary" style={{ flex: 1 }}>
                    <Download size={14} />
                    <span>Exportar Configuração JSON</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* COLUNA DIREITA: PREVIEW EM TEMPO REAL COM COMPONENTES REAIS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Eye size={16} color="var(--color-primary)" />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Pré-Visualização em Tempo Real (Live Preview)
              </span>
            </div>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
              Reflete instantaneamente as variáveis CSS
            </span>
          </div>

          {/* Card Mockup Interativo que Reage ao Tema */}
          <div
            className="crm-card"
            style={{
              padding: 18,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              boxShadow: 'var(--shadow-card)',
            }}
          >
            {/* Header Simulado */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: 12,
                borderBottom: 'var(--border-width) solid var(--border-default)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-primary)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.8125rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  H
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  {theme.brand.storeDisplayName || 'Hiago iPhones'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <span className="status-chip status-available">Loja Online</span>
                <span className="status-chip status-maintenance">3 O.S.</span>
              </div>
            </div>

            {/* KPI Cards em Miniatura com Bordas Visíveis */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              <div
                style={{
                  padding: 10,
                  borderRadius: 'var(--radius-sm)',
                  border: 'var(--border-width) solid var(--border-default)',
                  backgroundColor: 'var(--surface-bg)',
                }}
              >
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>Faturamento Hoje</div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-main)', marginTop: 2 }}>
                  R$ 14.850
                </div>
              </div>
              <div
                style={{
                  padding: 10,
                  borderRadius: 'var(--radius-sm)',
                  border: 'var(--border-width) solid var(--border-default)',
                  backgroundColor: 'var(--surface-bg)',
                }}
              >
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>Aparelhos Ativos</div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-main)', marginTop: 2 }}>
                  28 un
                </div>
              </div>
              <div
                style={{
                  padding: 10,
                  borderRadius: 'var(--radius-sm)',
                  border: 'var(--border-width) solid var(--border-default)',
                  backgroundColor: 'var(--surface-bg)',
                }}
              >
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>Ordens de Serviço</div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--status-warning)', marginTop: 2 }}>
                  5 pendentes
                </div>
              </div>
            </div>

            {/* Formulário / Campo com Foco */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Busca de Aparelho por IMEI / Cliente
              </label>
              <input
                type="text"
                className="crm-input"
                placeholder="Digite o IMEI ou nome..."
                defaultValue="3589201140921"
                style={{ width: '100%', fontSize: '0.8125rem' }}
              />
            </div>

            {/* Tabela de Dados com Linhas e Bordas Nítidas */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Exemplo de Tabela Operacional
              </div>
              <table className="crm-table" style={{ fontSize: '0.8125rem' }}>
                <thead>
                  <tr>
                    <th>Modelo</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 500 }}>iPhone 15 Pro Max 256GB</td>
                    <td>
                      <span className="status-chip status-available">Em Estoque</span>
                    </td>
                    <td className="text-financial">R$ 6.200,00</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 500 }}>iPhone 13 128GB Azul</td>
                    <td>
                      <span className="status-chip status-reserved">Reservado</span>
                    </td>
                    <td className="text-financial">R$ 3.100,00</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 500 }}>Troca de Tela iPhone 11</td>
                    <td>
                      <span className="status-chip status-maintenance">Bancada</span>
                    </td>
                    <td className="text-financial">R$ 380,00</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Conjunto de Botões */}
            <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
              <button className="crm-btn-primary" style={{ flex: 1 }}>
                Ação Primária
              </button>
              <button className="crm-btn-secondary" style={{ flex: 1 }}>
                Ação Secundária
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente Auxiliar para Seleção de Cor
interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
}

const ColorField: React.FC<ColorFieldProps> = ({ label, value, onChange }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)' }}>
        {label}
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="color"
          value={value.startsWith('#') && value.length === 7 ? value : '#F97316'}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-sm)',
            border: 'var(--border-width) solid var(--border-default)',
            cursor: 'pointer',
            padding: 0,
            backgroundColor: 'transparent',
          }}
        />
        <input
          type="text"
          className="crm-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ flex: 1, fontSize: '0.8125rem', fontFamily: 'monospace' }}
        />
      </div>
    </div>
  );
};
