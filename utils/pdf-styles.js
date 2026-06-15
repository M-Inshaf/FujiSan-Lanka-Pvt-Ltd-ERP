/**
 * PDF STYLES SYSTEM
 * utils/pdf-styles.js
 * 
 * Purpose: Provide PDF styling templates, theme support, and CSS-to-PDF conversion
 * for all module reports and exports
 * 
 * Architecture: Works with pdf-generator.js to apply consistent styling
 * Integrates with Sub Garments module patterns for color, typography, and layout
 */

// ============================================================================
// COLOR PALETTE (Glassmorphism Theme)
// ============================================================================

const COLORS = {
  // Primary Colors
  primary: '#6366f1',        // Indigo
  secondary: '#8b5cf6',      // Purple
  accent: '#ec4899',         // Pink
  
  // Neutral Colors
  white: '#ffffff',
  black: '#000000',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
  
  // Semantic Colors
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  
  // Text Colors
  textPrimary: '#111827',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',
  
  // Background Colors
  bgLight: '#f9fafb',
  bgDefault: '#ffffff',
  bgDark: '#f3f4f6',
};

// ============================================================================
// TYPOGRAPHY SYSTEM
// ============================================================================

const TYPOGRAPHY = {
  // Font Families
  fonts: {
    primary: 'Arial, Helvetica, sans-serif',
    mono: 'Courier New, monospace',
    serif: 'Georgia, serif',
  },
  
  // Font Sizes (in points for PDF)
  sizes: {
    xs: 8,
    sm: 9,
    base: 10,
    lg: 12,
    xl: 14,
    '2xl': 16,
    '3xl': 18,
    '4xl': 20,
    '5xl': 24,
  },
  
  // Font Weights
  weights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  // Line Heights
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
  
  // Letter Spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
};

// ============================================================================
// SPACING SYSTEM (in pixels/points)
// ============================================================================

const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
};

// ============================================================================
// BORDER & SHADOW STYLES
// ============================================================================

const BORDERS = {
  none: 'none',
  thin: '0.5px solid',
  light: '1px solid',
  medium: '1.5px solid',
  thick: '2px solid',
};

const SHADOWS = {
  none: 'none',
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.1)',
};

// ============================================================================
// PRESET STYLES (Template-based)
// ============================================================================

const PRESET_STYLES = {
  // Header Styles
  header: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottom: `${BORDERS.light} ${COLORS.gray300}`,
  },
  
  // Subheader Styles
  subheader: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  
  // Title Styles
  title: {
    fontSize: TYPOGRAPHY.sizes['3xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
    marginBottom: SPACING.lg,
  },
  
  // Subtitle Styles
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  
  // Body Text
  body: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.normal,
    color: COLORS.textPrimary,
    lineHeight: TYPOGRAPHY.lineHeights.normal,
  },
  
  // Small Text (metadata, dates, etc.)
  small: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.normal,
    color: COLORS.textMuted,
  },
  
  // Bold Emphasis
  bold: {
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
  },
  
  // Muted Text
  muted: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.normal,
    color: COLORS.textMuted,
  },
};

// ============================================================================
// TABLE STYLES
// ============================================================================

const TABLE_STYLES = {
  // Header Row (table headers)
  headerRow: {
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    padding: SPACING.sm,
    textAlign: 'left',
    borderBottom: `${BORDERS.medium} ${COLORS.primary}`,
  },
  
  // Data Row
  dataRow: {
    backgroundColor: COLORS.white,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.normal,
    padding: SPACING.sm,
    borderBottom: `${BORDERS.light} ${COLORS.gray200}`,
  },
  
  // Alternating Row (zebra striping)
  alternateRow: {
    backgroundColor: COLORS.gray50,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.normal,
    padding: SPACING.sm,
    borderBottom: `${BORDERS.light} ${COLORS.gray200}`,
  },
  
  // Footer Row (totals)
  footerRow: {
    backgroundColor: COLORS.gray100,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
    padding: SPACING.md,
    borderTop: `${BORDERS.medium} ${COLORS.primary}`,
    borderBottom: `${BORDERS.medium} ${COLORS.primary}`,
  },
  
  // Cell Styles
  cell: {
    padding: SPACING.sm,
    borderRight: `${BORDERS.light} ${COLORS.gray200}`,
  },
  
  // Numeric Cell (right-aligned)
  numericCell: {
    padding: SPACING.sm,
    textAlign: 'right',
    fontFamily: TYPOGRAPHY.fonts.mono,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  
  // Status Cell
  statusCell: {
    padding: `${SPACING.xs} ${SPACING.sm}`,
    textAlign: 'center',
    fontSize: TYPOGRAPHY.sizes.sm,
    borderRadius: 3,
  },
};

// ============================================================================
// SEMANTIC BADGE/STATUS STYLES
// ============================================================================

const BADGE_STYLES = {
  success: {
    backgroundColor: COLORS.success,
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    padding: `${SPACING.xs} ${SPACING.sm}`,
  },
  
  warning: {
    backgroundColor: COLORS.warning,
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    padding: `${SPACING.xs} ${SPACING.sm}`,
  },
  
  danger: {
    backgroundColor: COLORS.danger,
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    padding: `${SPACING.xs} ${SPACING.sm}`,
  },
  
  info: {
    backgroundColor: COLORS.info,
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    padding: `${SPACING.xs} ${SPACING.sm}`,
  },
  
  default: {
    backgroundColor: COLORS.gray300,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    padding: `${SPACING.xs} ${SPACING.sm}`,
  },
};

// ============================================================================
// BOX/CONTAINER STYLES
// ============================================================================

const BOX_STYLES = {
  // Default Box
  default: {
    backgroundColor: COLORS.white,
    border: `${BORDERS.light} ${COLORS.gray200}`,
    borderRadius: 4,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  
  // Highlighted Box
  highlight: {
    backgroundColor: COLORS.gray50,
    border: `${BORDERS.light} ${COLORS.primary}`,
    borderRadius: 4,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  
  // Info Box
  info: {
    backgroundColor: '#eff6ff',
    border: `${BORDERS.light} ${COLORS.info}`,
    borderRadius: 4,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  
  // Success Box
  success: {
    backgroundColor: '#f0fdf4',
    border: `${BORDERS.light} ${COLORS.success}`,
    borderRadius: 4,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  
  // Warning Box
  warning: {
    backgroundColor: '#fffbeb',
    border: `${BORDERS.light} ${COLORS.warning}`,
    borderRadius: 4,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  
  // Danger Box
  danger: {
    backgroundColor: '#fef2f2',
    border: `${BORDERS.light} ${COLORS.danger}`,
    borderRadius: 4,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
};

// ============================================================================
// LAYOUT STYLES
// ============================================================================

const LAYOUT_STYLES = {
  // Page margins
  pageMargins: {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20,
  },
  
  // Page padding
  pagePadding: {
    top: SPACING.lg,
    right: SPACING.lg,
    bottom: SPACING.lg,
    left: SPACING.lg,
  },
  
  // Section spacing
  sectionSpacing: SPACING['2xl'],
  
  // Line height for content
  contentLineHeight: TYPOGRAPHY.lineHeights.relaxed,
};

// ============================================================================
// THEME VARIANTS
// ============================================================================

const THEME_VARIANTS = {
  // Light Theme (default)
  light: {
    background: COLORS.white,
    text: COLORS.textPrimary,
    border: COLORS.gray300,
    headerBg: COLORS.primary,
    headerText: COLORS.white,
  },
  
  // Dark Theme
  dark: {
    background: COLORS.gray900,
    text: COLORS.white,
    border: COLORS.gray700,
    headerBg: COLORS.gray800,
    headerText: COLORS.white,
  },
};

// ============================================================================
// CSS-TO-PDF CONVERTER
// ============================================================================

/**
 * Converts CSS-style properties to PDF-compatible format
 * 
 * @param {string} cssString - CSS property string (e.g., "color: red; font-size: 14px;")
 * @returns {object} PDF-compatible style object
 */
function convertCssToPdf(cssString) {
  if (!cssString) return {};
  
  const styles = {};
  const cssRules = cssString.split(';').filter(rule => rule.trim());
  
  cssRules.forEach(rule => {
    const [property, value] = rule.split(':').map(s => s.trim());
    
    if (!property || !value) return;
    
    // Convert CSS properties to PDF format
    switch (property.toLowerCase()) {
      case 'color':
        styles.color = value;
        break;
      case 'background-color':
      case 'background':
        styles.backgroundColor = value;
        break;
      case 'font-size':
        styles.fontSize = parseFloat(value);
        break;
      case 'font-weight':
        const weightMap = {
          'bold': 700,
          'normal': 400,
          'light': 300,
          'semibold': 600,
        };
        styles.fontWeight = weightMap[value] || parseInt(value);
        break;
      case 'font-family':
        styles.fontFamily = value.replace(/['"]/g, '');
        break;
      case 'text-align':
      case 'text-alignment':
        styles.textAlign = value;
        break;
      case 'padding':
      case 'padding-top':
      case 'padding-right':
      case 'padding-bottom':
      case 'padding-left':
        const paddingKey = `padding${property === 'padding' ? '' : property.replace('padding', '')}`;
        styles[paddingKey] = parseFloat(value);
        break;
      case 'margin':
      case 'margin-top':
      case 'margin-right':
      case 'margin-bottom':
      case 'margin-left':
        const marginKey = `margin${property === 'margin' ? '' : property.replace('margin', '')}`;
        styles[marginKey] = parseFloat(value);
        break;
      case 'border':
      case 'border-bottom':
      case 'border-top':
        styles.border = value;
        break;
      case 'line-height':
        styles.lineHeight = parseFloat(value);
        break;
      case 'letter-spacing':
        styles.letterSpacing = parseFloat(value);
        break;
      case 'opacity':
        styles.opacity = parseFloat(value);
        break;
      case 'display':
        styles.display = value;
        break;
      case 'width':
        styles.width = value;
        break;
      case 'height':
        styles.height = value;
        break;
      default:
        // Store custom properties as-is
        styles[property] = value;
    }
  });
  
  return styles;
}

// ============================================================================
// STYLE BUILDER (Fluent API)
// ============================================================================

/**
 * Fluent API for building complex PDF styles
 * 
 * Usage:
 * const style = new StyleBuilder()
 *   .setFontSize(12)
 *   .setBold()
 *   .setColor('red')
 *   .build();
 */
class StyleBuilder {
  constructor(baseStyle = {}) {
    this.style = { ...baseStyle };
  }
  
  setFontSize(size) {
    this.style.fontSize = size;
    return this;
  }
  
  setFontWeight(weight) {
    this.style.fontWeight = weight;
    return this;
  }
  
  setColor(color) {
    this.style.color = color;
    return this;
  }
  
  setBackgroundColor(color) {
    this.style.backgroundColor = color;
    return this;
  }
  
  setBold() {
    this.style.fontWeight = TYPOGRAPHY.weights.bold;
    return this;
  }
  
  setItalic() {
    this.style.fontStyle = 'italic';
    return this;
  }
  
  setAlignment(align) {
    this.style.textAlign = align;
    return this;
  }
  
  setPadding(top, right = top, bottom = top, left = right) {
    this.style.paddingTop = top;
    this.style.paddingRight = right;
    this.style.paddingBottom = bottom;
    this.style.paddingLeft = left;
    return this;
  }
  
  setMargin(top, right = top, bottom = top, left = right) {
    this.style.marginTop = top;
    this.style.marginRight = right;
    this.style.marginBottom = bottom;
    this.style.marginLeft = left;
    return this;
  }
  
  setBorder(style = BORDERS.light, color = COLORS.gray300) {
    this.style.border = `${style} ${color}`;
    return this;
  }
  
  setLineHeight(height) {
    this.style.lineHeight = height;
    return this;
  }
  
  applyPreset(presetName) {
    const preset = PRESET_STYLES[presetName];
    if (preset) {
      this.style = { ...this.style, ...preset };
    }
    return this;
  }
  
  build() {
    return { ...this.style };
  }
}

// ============================================================================
// THEME BUILDER
// ============================================================================

/**
 * Fluent API for building custom themes
 */
class ThemeBuilder {
  constructor(baseTheme = THEME_VARIANTS.light) {
    this.theme = { ...baseTheme };
  }
  
  setPrimaryColor(color) {
    this.theme.primaryColor = color;
    return this;
  }
  
  setSecondaryColor(color) {
    this.theme.secondaryColor = color;
    return this;
  }
  
  setAccentColor(color) {
    this.theme.accentColor = color;
    return this;
  }
  
  setBackgroundColor(color) {
    this.theme.background = color;
    return this;
  }
  
  setTextColor(color) {
    this.theme.text = color;
    return this;
  }
  
  setBorderColor(color) {
    this.theme.border = color;
    return this;
  }
  
  setHeaderBackground(color) {
    this.theme.headerBg = color;
    return this;
  }
  
  setHeaderText(color) {
    this.theme.headerText = color;
    return this;
  }
  
  build() {
    return { ...this.theme };
  }
}

// ============================================================================
// EXPORT FUNCTIONS
// ============================================================================

/**
 * Get preset style by name
 * @param {string} name - Style preset name
 * @returns {object} Style object
 */
function getPresetStyle(name) {
  return PRESET_STYLES[name] || {};
}

/**
 * Get table style variant
 * @param {string} variant - 'header', 'data', 'alternate', 'footer'
 * @returns {object} Table style object
 */
function getTableStyle(variant) {
  return TABLE_STYLES[`${variant}Row`] || TABLE_STYLES.dataRow;
}

/**
 * Get badge style by status
 * @param {string} status - 'success', 'warning', 'danger', 'info', 'default'
 * @returns {object} Badge style object
 */
function getBadgeStyle(status) {
  return BADGE_STYLES[status] || BADGE_STYLES.default;
}

/**
 * Get box style by type
 * @param {string} type - 'default', 'highlight', 'info', 'success', 'warning', 'danger'
 * @returns {object} Box style object
 */
function getBoxStyle(type) {
  return BOX_STYLES[type] || BOX_STYLES.default;
}

/**
 * Get theme variant
 * @param {string} theme - 'light' or 'dark'
 * @returns {object} Theme object
 */
function getTheme(theme) {
  return THEME_VARIANTS[theme] || THEME_VARIANTS.light;
}

/**
 * Merge multiple style objects
 * @param {...object} styles - Style objects to merge
 * @returns {object} Merged style object
 */
function mergeStyles(...styles) {
  return styles.reduce((acc, style) => ({ ...acc, ...style }), {});
}

/**
 * Clone and modify a style
 * @param {object} baseStyle - Base style to clone
 * @param {object} overrides - Properties to override
 * @returns {object} New style object
 */
function cloneStyle(baseStyle, overrides = {}) {
  return { ...baseStyle, ...overrides };
}

// ============================================================================
// MODULE EXPORTS
// ============================================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    // Color & Design System
    COLORS,
    TYPOGRAPHY,
    SPACING,
    BORDERS,
    SHADOWS,
    
    // Preset Styles
    PRESET_STYLES,
    TABLE_STYLES,
    BADGE_STYLES,
    BOX_STYLES,
    LAYOUT_STYLES,
    
    // Themes
    THEME_VARIANTS,
    
    // Functions
    convertCssToPdf,
    getPresetStyle,
    getTableStyle,
    getBadgeStyle,
    getBoxStyle,
    getTheme,
    mergeStyles,
    cloneStyle,
    
    // Builder Classes
    StyleBuilder,
    ThemeBuilder,
  };
}
