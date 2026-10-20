/**
 * SERVIÇO GLOBAL DE TEMAS E DESIGN SYSTEM — CRM HIAGO / BALCÃO OS
 * Gerencia White Mode, Black Mode, System Mode, paletas de cores,
 * tipografia, bordas globais, densidade, acessibilidade e persistência.
 */

export type ThemeMode = 'light' | 'dark' | 'system';
export type LayoutDensity = 'comfortable' | 'default' | 'compact';
export type FontFamilyOption = 'Inter' | 'Roboto' | 'Open Sans' | 'Lato' | 'Nunito Sans' | 'System UI';
export type ShadowIntensity = 'none' | 'subtle' | 'medium' | 'strong';

export interface ThemeColors {
  primary: string;
  primaryHover: string;
  secondary: string;
  accent: string;
  // Superfícies e Fundos
  canvasBg: string;
  surfaceBg: string;
  surfaceHover: string;
  surfaceMuted: string;
  cardBg: string;
  sidebarBg: string;
  sidebarBorder: string;
  sidebarText: string;
  headerBg: string;
  headerBorder: string;
  // Textos
  textMain: string;
  textSecondary: string;
  textTertiary: string;
  // Bordas e Delimitadores
  borderDefault: string;
  borderSubtle: string;
  borderStrong: string;
  borderFocus: string;
  borderError: string;
  borderSuccess: string;
  borderWarning: string;
  // Status Semânticos
  statusSuccess: string;
  statusSuccessBg: string;
  statusInfo: string;
  statusInfoBg: string;
  statusWarning: string;
  statusWarningBg: string;
  statusDanger: string;
  statusDangerBg: string;
}

export interface TypographyConfig {
  fontFamily: FontFamilyOption;
  headingFontFamily: FontFamilyOption;
  baseFontSize: number; // 13, 14, 15, 16
  scaleRatio: number; // 1.15 a 1.33
  fontWeightRegular: number;
  fontWeightMedium: number;
  fontWeightBold: number;
  lineHeight: number; // 1.4 a 1.6
}

export interface GeometryConfig {
  borderWidth: number; // 1 ou 2
  radiusSm: number; // 4
  radiusMd: number; // 8
  radiusLg: number; // 12
  radiusXl: number; // 16
  density: LayoutDensity;
  shadowIntensity: ShadowIntensity;
}

export interface BrandIdentityConfig {
  storeDisplayName: string;
  primaryLogoUrl: string;
  darkLogoUrl: string;
  lightLogoUrl: string;
  faviconUrl: string;
}

export interface AccessibilityConfig {
  highContrast: boolean;
  reducedMotion: boolean;
  increasedFocusRing: boolean;
  largeTouchTargets: boolean;
}

export interface VisualThemeConfig {
  id: string;
  name: string;
  mode: ThemeMode;
  colors: ThemeColors;
  typography: TypographyConfig;
  geometry: GeometryConfig;
  brand: BrandIdentityConfig;
  accessibility: AccessibilityConfig;
  updatedAt: string;
}

// ==========================================
// PALETAS PADRÃO DO DESIGN SYSTEM
// ==========================================

export const DEFAULT_DARK_COLORS: ThemeColors = {
  primary: '#F97316', // Laranja Hiago
  primaryHover: '#EA580C',
  secondary: '#2563EB',
  accent: '#38BDF8',
  canvasBg: '#0F1117',
  surfaceBg: '#181C26',
  surfaceHover: '#1F2432',
  surfaceMuted: '#141822',
  cardBg: '#181C26',
  sidebarBg: '#12151E',
  sidebarBorder: '#272F44',
  sidebarText: '#94A3B8',
  headerBg: '#151923',
  headerBorder: '#272F44',
  textMain: '#F8FAFC',
  textSecondary: '#94A3B8',
  textTertiary: '#64748B',
  borderDefault: '#272F44',
  borderSubtle: '#1E2536',
  borderStrong: '#3B4561',
  borderFocus: '#F97316',
  borderError: '#EF4444',
  borderSuccess: '#10B981',
  borderWarning: '#F59E0B',
  statusSuccess: '#34D399',
  statusSuccessBg: 'rgba(16, 185, 129, 0.12)',
  statusInfo: '#38BDF8',
  statusInfoBg: 'rgba(56, 189, 248, 0.12)',
  statusWarning: '#FBBF24',
  statusWarningBg: 'rgba(245, 158, 11, 0.12)',
  statusDanger: '#F87171',
  statusDangerBg: 'rgba(239, 68, 68, 0.12)',
};

export const DEFAULT_LIGHT_COLORS: ThemeColors = {
  primary: '#2563EB', // Azul Corporativo / Balcão OS
  primaryHover: '#1D4ED8',
  secondary: '#F97316',
  accent: '#0284C7',
  canvasBg: '#F8FAFC',
  surfaceBg: '#FFFFFF',
  surfaceHover: '#F1F5F9',
  surfaceMuted: '#E2E8F0',
  cardBg: '#FFFFFF',
  sidebarBg: '#0F172A',
  sidebarBorder: '#1E293B',
  sidebarText: '#94A3B8',
  headerBg: '#FFFFFF',
  headerBorder: '#E2E8F0',
  textMain: '#0F172A',
  textSecondary: '#475569',
  textTertiary: '#94A3B8',
  borderDefault: '#E2E8F0',
  borderSubtle: '#F1F5F9',
  borderStrong: '#CBD5E1',
  borderFocus: '#2563EB',
  borderError: '#DC2626',
  borderSuccess: '#16A34A',
  borderWarning: '#D97706',
  statusSuccess: '#16A34A',
  statusSuccessBg: '#F0FDF4',
  statusInfo: '#2563EB',
  statusInfoBg: '#EFF6FF',
  statusWarning: '#D97706',
  statusWarningBg: '#FFFBEB',
  statusDanger: '#DC2626',
  statusDangerBg: '#FEF2F2',
};

export const DEFAULT_TYPOGRAPHY: TypographyConfig = {
  fontFamily: 'Inter',
  headingFontFamily: 'Inter',
  baseFontSize: 14,
  scaleRatio: 1.25,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightBold: 600,
  lineHeight: 1.5,
};

export const DEFAULT_GEOMETRY: GeometryConfig = {
  borderWidth: 1,
  radiusSm: 6,
  radiusMd: 8,
  radiusLg: 12,
  radiusXl: 16,
  density: 'default',
  shadowIntensity: 'subtle',
};

export const DEFAULT_BRAND: BrandIdentityConfig = {
  storeDisplayName: 'Hiago iPhones',
  primaryLogoUrl: '',
  darkLogoUrl: '',
  lightLogoUrl: '',
  faviconUrl: '',
};

export const DEFAULT_ACCESSIBILITY: AccessibilityConfig = {
  highContrast: false,
  reducedMotion: false,
  increasedFocusRing: false,
  largeTouchTargets: false,
};

// ==========================================
// PRESETS PRÉ-CONFIGURADOS DO SISTEMA
// ==========================================

export const SYSTEM_PRESETS: Record<string, VisualThemeConfig> = {
  hiago_dark: {
    id: 'hiago_dark',
    name: 'Hiago Dark (Grafite Oficial)',
    mode: 'dark',
    colors: DEFAULT_DARK_COLORS,
    typography: DEFAULT_TYPOGRAPHY,
    geometry: DEFAULT_GEOMETRY,
    brand: DEFAULT_BRAND,
    accessibility: DEFAULT_ACCESSIBILITY,
    updatedAt: new Date().toISOString(),
  },
  hiago_light: {
    id: 'hiago_light',
    name: 'Hiago Light (White Mode Balcão)',
    mode: 'light',
    colors: DEFAULT_LIGHT_COLORS,
    typography: DEFAULT_TYPOGRAPHY,
    geometry: DEFAULT_GEOMETRY,
    brand: DEFAULT_BRAND,
    accessibility: DEFAULT_ACCESSIBILITY,
    updatedAt: new Date().toISOString(),
  },
  minimalista: {
    id: 'minimalista',
    name: 'Minimalista Neutro',
    mode: 'light',
    colors: {
      ...DEFAULT_LIGHT_COLORS,
      primary: '#18181B',
      primaryHover: '#27272A',
      secondary: '#52525B',
      borderDefault: '#E4E4E7',
      borderSubtle: '#F4F4F5',
      borderStrong: '#A1A1AA',
      canvasBg: '#FAFAFA',
      cardBg: '#FFFFFF',
      surfaceBg: '#FFFFFF',
      sidebarBg: '#18181B',
      sidebarBorder: '#27272A',
    },
    typography: { ...DEFAULT_TYPOGRAPHY, fontFamily: 'Inter' },
    geometry: { ...DEFAULT_GEOMETRY, radiusSm: 4, radiusMd: 6, radiusLg: 8, shadowIntensity: 'none' },
    brand: DEFAULT_BRAND,
    accessibility: DEFAULT_ACCESSIBILITY,
    updatedAt: new Date().toISOString(),
  },
  alto_contraste: {
    id: 'alto_contraste',
    name: 'Alto Contraste (Acessibilidade WCAG)',
    mode: 'dark',
    colors: {
      ...DEFAULT_DARK_COLORS,
      canvasBg: '#000000',
      surfaceBg: '#0A0A0A',
      cardBg: '#0A0A0A',
      sidebarBg: '#000000',
      headerBg: '#000000',
      textMain: '#FFFFFF',
      textSecondary: '#D4D4D8',
      borderDefault: '#FFFFFF',
      borderSubtle: '#71717A',
      borderStrong: '#FFFFFF',
      borderFocus: '#60A5FA',
      primary: '#60A5FA',
      primaryHover: '#93C5FD',
    },
    typography: { ...DEFAULT_TYPOGRAPHY, baseFontSize: 15, fontWeightMedium: 600, fontWeightBold: 700 },
    geometry: { ...DEFAULT_GEOMETRY, borderWidth: 2, radiusSm: 4, radiusMd: 6, shadowIntensity: 'none' },
    brand: DEFAULT_BRAND,
    accessibility: { ...DEFAULT_ACCESSIBILITY, highContrast: true, increasedFocusRing: true },
    updatedAt: new Date().toISOString(),
  },
  esmeralda_pro: {
    id: 'esmeralda_pro',
    name: 'Esmeralda Finanças',
    mode: 'dark',
    colors: {
      ...DEFAULT_DARK_COLORS,
      primary: '#10B981',
      primaryHover: '#059669',
      accent: '#34D399',
      borderFocus: '#10B981',
      canvasBg: '#0C1311',
      surfaceBg: '#131F1C',
      cardBg: '#131F1C',
      sidebarBg: '#0A110F',
      sidebarBorder: '#1F342F',
      borderDefault: '#1F342F',
    },
    typography: DEFAULT_TYPOGRAPHY,
    geometry: DEFAULT_GEOMETRY,
    brand: DEFAULT_BRAND,
    accessibility: DEFAULT_ACCESSIBILITY,
    updatedAt: new Date().toISOString(),
  },
  azul_cobalto: {
    id: 'azul_cobalto',
    name: 'Azul Cobalto Corporativo',
    mode: 'light',
    colors: {
      ...DEFAULT_LIGHT_COLORS,
      primary: '#1D4ED8',
      primaryHover: '#1E40AF',
      secondary: '#0284C7',
      accent: '#0369A1',
      borderFocus: '#1D4ED8',
      canvasBg: '#F0F4F8',
      surfaceBg: '#FFFFFF',
      cardBg: '#FFFFFF',
      borderDefault: '#D1D9E0',
    },
    typography: { ...DEFAULT_TYPOGRAPHY, fontFamily: 'Roboto' },
    geometry: DEFAULT_GEOMETRY,
    brand: DEFAULT_BRAND,
    accessibility: DEFAULT_ACCESSIBILITY,
    updatedAt: new Date().toISOString(),
  },
};

const STORAGE_KEY_THEME = 'hiago_visual_theme_v2';
const STORAGE_KEY_USER_PREF = 'hiago_user_theme_mode';

// ==========================================
// CLASSE SINGLETON DO GERENCIADOR DE TEMAS
// ==========================================

export class ThemeService {
  private static instance: ThemeService;
  private currentTheme: VisualThemeConfig = SYSTEM_PRESETS.hiago_dark;
  private listeners: Array<(theme: VisualThemeConfig) => void> = [];
  private mediaQueryList: MediaQueryList | null = null;

  private constructor() {
    this.init();
  }

  public static getInstance(): ThemeService {
    if (!ThemeService.instance) {
      ThemeService.instance = new ThemeService();
    }
    return ThemeService.instance;
  }

  private init() {
    try {
      // 1. Carrega tema completo salvo
      const savedTheme = localStorage.getItem(STORAGE_KEY_THEME);
      if (savedTheme) {
        const parsed = JSON.parse(savedTheme);
        this.currentTheme = {
          ...SYSTEM_PRESETS.hiago_dark,
          ...parsed,
          colors: { ...SYSTEM_PRESETS.hiago_dark.colors, ...parsed.colors },
          typography: { ...DEFAULT_TYPOGRAPHY, ...parsed.typography },
          geometry: { ...DEFAULT_GEOMETRY, ...parsed.geometry },
          brand: { ...DEFAULT_BRAND, ...parsed.brand },
          accessibility: { ...DEFAULT_ACCESSIBILITY, ...parsed.accessibility },
        };
      }

      // 2. Sobrescreve modo pelo preferido do usuário se existir
      const userMode = localStorage.getItem(STORAGE_KEY_USER_PREF) as ThemeMode | null;
      if (userMode && ['light', 'dark', 'system'].includes(userMode)) {
        this.currentTheme.mode = userMode;
      }
    } catch (e) {
      console.warn('Erro ao restaurar tema local:', e);
      this.currentTheme = SYSTEM_PRESETS.hiago_dark;
    }

    // 3. Configura observador de preferência do sistema operacional
    if (typeof window !== 'undefined' && window.matchMedia) {
      this.mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
      this.mediaQueryList.addEventListener('change', () => {
        if (this.currentTheme.mode === 'system') {
          this.applyTheme(this.currentTheme);
        }
      });
    }

    // 4. Aplica imediatamente no DOM
    this.applyTheme(this.currentTheme);
  }

  public getTheme(): VisualThemeConfig {
    return { ...this.currentTheme };
  }

  public getEffectiveMode(): 'light' | 'dark' {
    if (this.currentTheme.mode === 'system') {
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return 'dark';
    }
    return this.currentTheme.mode;
  }

  public setMode(mode: ThemeMode) {
    this.currentTheme.mode = mode;
    try {
      localStorage.setItem(STORAGE_KEY_USER_PREF, mode);
    } catch {}

    // Ajusta cores padrão correspondentes se o usuário mudar o tema base
    if (mode === 'light' && this.currentTheme.colors.canvasBg === DEFAULT_DARK_COLORS.canvasBg) {
      this.currentTheme.colors = { ...DEFAULT_LIGHT_COLORS };
    } else if (mode === 'dark' && this.currentTheme.colors.canvasBg === DEFAULT_LIGHT_COLORS.canvasBg) {
      this.currentTheme.colors = { ...DEFAULT_DARK_COLORS };
    }

    this.saveTheme(this.currentTheme);
  }

  public applyPreset(presetKey: string) {
    const preset = SYSTEM_PRESETS[presetKey];
    if (!preset) return;
    this.currentTheme = {
      ...preset,
      brand: { ...this.currentTheme.brand }, // preserva dados institucionais da loja
      updatedAt: new Date().toISOString(),
    };
    this.saveTheme(this.currentTheme);
  }

  public updateTheme(updates: Partial<VisualThemeConfig>) {
    this.currentTheme = {
      ...this.currentTheme,
      ...updates,
      colors: updates.colors ? { ...this.currentTheme.colors, ...updates.colors } : this.currentTheme.colors,
      typography: updates.typography ? { ...this.currentTheme.typography, ...updates.typography } : this.currentTheme.typography,
      geometry: updates.geometry ? { ...this.currentTheme.geometry, ...updates.geometry } : this.currentTheme.geometry,
      brand: updates.brand ? { ...this.currentTheme.brand, ...updates.brand } : this.currentTheme.brand,
      accessibility: updates.accessibility ? { ...this.currentTheme.accessibility, ...updates.accessibility } : this.currentTheme.accessibility,
      updatedAt: new Date().toISOString(),
    };
    this.saveTheme(this.currentTheme);
  }

  public resetToDefault() {
    this.currentTheme = { ...SYSTEM_PRESETS.hiago_dark, updatedAt: new Date().toISOString() };
    this.saveTheme(this.currentTheme);
  }

  private saveTheme(theme: VisualThemeConfig) {
    this.currentTheme = theme;
    try {
      localStorage.setItem(STORAGE_KEY_THEME, JSON.stringify(theme));
      localStorage.setItem(STORAGE_KEY_USER_PREF, theme.mode);
    } catch (e) {
      console.warn('Falha ao salvar tema no localStorage:', e);
    }

    this.applyTheme(theme);
    this.notifyListeners();
  }

  public subscribe(listener: (theme: VisualThemeConfig) => void): () => void {
    this.listeners.push(listener);
    listener(this.currentTheme);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(l => {
      try {
        l(this.currentTheme);
      } catch (err) {
        console.error('Erro no listener de tema:', err);
      }
    });
  }

  public applyTheme(theme: VisualThemeConfig) {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    const body = document.body;

    const effectiveMode = this.getEffectiveMode();
    root.setAttribute('data-theme', effectiveMode);
    root.setAttribute('data-density', theme.geometry.density);

    // Font Family resolution
    let resolvedFont = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    switch (theme.typography.fontFamily) {
      case 'Roboto':
        resolvedFont = "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
        break;
      case 'Open Sans':
        resolvedFont = "'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
        break;
      case 'Lato':
        resolvedFont = "'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
        break;
      case 'Nunito Sans':
        resolvedFont = "'Nunito Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
        break;
      case 'System UI':
        resolvedFont = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        break;
      case 'Inter':
      default:
        resolvedFont = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        break;
    }

    // Densidade de padding
    let densityPadY = '12px';
    let densityPadX = '16px';
    let controlHeight = '38px';
    if (theme.geometry.density === 'compact') {
      densityPadY = '8px';
      densityPadX = '12px';
      controlHeight = '32px';
    } else if (theme.geometry.density === 'comfortable') {
      densityPadY = '16px';
      densityPadX = '20px';
      controlHeight = '44px';
    }

    // Variáveis CSS Globais Injetadas no Root
    const c = theme.colors;
    const g = theme.geometry;
    const t = theme.typography;

    const cssVars: Record<string, string> = {
      '--font-family': resolvedFont,
      '--base-font-size': `${t.baseFontSize}px`,
      '--line-height': `${t.lineHeight}`,

      // Fundos e Telas
      '--canvas-bg': c.canvasBg,
      '--bg-main': c.canvasBg,
      '--surface-bg': c.surfaceBg,
      '--surface-hover': c.surfaceHover,
      '--surface-muted': c.surfaceMuted,
      '--card-bg': c.cardBg,

      // Sidebar e Cabeçalho
      '--sidebar-bg': c.sidebarBg,
      '--sidebar-border': c.sidebarBorder,
      '--sidebar-text': c.sidebarText,
      '--header-bg': c.headerBg,
      '--header-border': c.headerBorder,

      // Textos
      '--text-main': c.textMain,
      '--text-secondary': c.textSecondary,
      '--text-tertiary': c.textTertiary,

      // Bordas e Delimitadores (GARANTIA DE 1PX/2PX VISÍVEIS)
      '--border-width': `${g.borderWidth}px`,
      '--border-color': c.borderDefault,
      '--border-default': c.borderDefault,
      '--border-subtle': c.borderSubtle,
      '--border-strong': c.borderStrong,
      '--border-focus': c.borderFocus,
      '--border-error': c.borderError,
      '--border-success': c.borderSuccess,
      '--border-warning': c.borderWarning,

      // Cores de Ação
      '--action-blue': c.primary,
      '--action-blue-hover': c.primaryHover,
      '--brand-orange': c.accent,
      '--color-primary': c.primary,
      '--color-primary-hover': c.primaryHover,
      '--color-secondary': c.secondary,
      '--color-accent': c.accent,

      // Raios de Arredondamento
      '--radius-sm': `${g.radiusSm}px`,
      '--radius-md': `${g.radiusMd}px`,
      '--radius-lg': `${g.radiusLg}px`,
      '--radius-xl': `${g.radiusXl}px`,

      // Densidade
      '--density-pad-y': densityPadY,
      '--density-pad-x': densityPadX,
      '--control-height': controlHeight,

      // Status
      '--status-success': c.statusSuccess,
      '--status-success-bg': c.statusSuccessBg,
      '--status-info': c.statusInfo,
      '--status-info-bg': c.statusInfoBg,
      '--status-warning': c.statusWarning,
      '--status-warning-bg': c.statusWarningBg,
      '--status-danger': c.statusDanger,
      '--status-danger-bg': c.statusDangerBg,
    };

    // Aplica cada variável no :root
    Object.entries(cssVars).forEach(([key, val]) => {
      root.style.setProperty(key, val);
    });

    // Atualiza classes do body
    body.style.backgroundColor = c.canvasBg;
    body.style.color = c.textMain;
    body.style.fontFamily = resolvedFont;
    body.style.fontSize = `${t.baseFontSize}px`;

    // Acessibilidade: anel de foco e redução de movimento
    if (theme.accessibility.increasedFocusRing) {
      root.style.setProperty('--focus-ring-width', '3px');
    } else {
      root.style.setProperty('--focus-ring-width', '2px');
    }

    if (theme.accessibility.reducedMotion) {
      root.style.setProperty('--animation-duration', '0s');
    } else {
      root.style.setProperty('--animation-duration', '0.18s');
    }
  }
}

export const themeService = ThemeService.getInstance();
