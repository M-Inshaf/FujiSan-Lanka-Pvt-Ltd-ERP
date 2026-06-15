/**
 * Theme Manager System
 * Manages dark/light mode toggling, persistence, and CSS variable updates
 * Integrated with Electron IPC and browser storage
 */

class ThemeManager {
  constructor() {
    this.currentTheme = 'light';
    this.themeStorageKey = 'hummingbird_theme';
    this.cssVariables = {};
    this.init();
  }

  /**
   * Initialize theme manager
   */
  init() {
    this.loadSavedTheme();
    this.setupThemeToggleListener();
    this.applyTheme(this.currentTheme);
    this.setupSystemPreference();
  }

  /**
   * Load saved theme from storage
   */
  loadSavedTheme() {
    try {
      // Try Electron storage first
      if (window.electronAPI && window.electronAPI.storage) {
        const saved = window.electronAPI.storage.get(this.themeStorageKey);
        if (saved) {
          this.currentTheme = saved;
          return;
        }
      }

      // Fallback to localStorage
      const saved = localStorage.getItem(this.themeStorageKey);
      if (saved) {
        this.currentTheme = saved;
        return;
      }

      // Check system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        this.currentTheme = 'dark';
      } else {
        this.currentTheme = 'light';
      }
    } catch (error) {
      console.warn('Theme load error:', error);
      this.currentTheme = 'light';
    }
  }

  /**
   * Setup system preference listener
   */
  setupSystemPreference() {
    if (!window.matchMedia) return;

    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeQuery.addEventListener('change', (e) => {
      if (!localStorage.getItem(this.themeStorageKey)) {
        this.applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  /**
   * Setup theme toggle listener
   */
  setupThemeToggleListener() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => this.toggleTheme());
    }

    // Keyboard shortcut: Ctrl/Cmd + Shift + T
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        this.toggleTheme();
      }
    });
  }

  /**
   * Toggle between light and dark theme
   */
  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme(newTheme);
  }

  /**
   * Apply theme and save preference
   */
  applyTheme(theme) {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    this.updateCSSVariables(theme);
    this.updateThemeToggleButton();
    this.saveThemePreference();
    this.dispatchThemeChangeEvent();
  }

  /**
   * Update CSS variables based on theme
   */
  updateCSSVariables(theme) {
    const variables = this.getThemeVariables(theme);
    Object.entries(variables).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });
    this.cssVariables = variables;
  }

  /**
   * Get theme-specific CSS variables
   */
  getThemeVariables(theme) {
    const lightTheme = {
      'bg-primary': '#ffffff',
      'bg-secondary': '#f5f5f5',
      'bg-tertiary': '#efefef',
      'text-primary': '#1a1a1a',
      'text-secondary': '#666666',
      'text-tertiary': '#999999',
      'border-color': '#e0e0e0',
      'border-light': '#f0f0f0',
      'shadow-sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
      'shadow-md': '0 4px 6px rgba(0, 0, 0, 0.1)',
      'shadow-lg': '0 10px 15px rgba(0, 0, 0, 0.1)',
      'glass-bg': 'rgba(255, 255, 255, 0.7)',
      'glass-border': 'rgba(255, 255, 255, 0.18)',
      'success-color': '#10b981',
      'warning-color': '#f59e0b',
      'error-color': '#ef4444',
      'info-color': '#3b82f6',
      'table-hover': '#f9fafb',
      'input-bg': '#ffffff',
      'input-border': '#d1d5db',
      'input-focus': '#3b82f6',
      'scroll-track': '#f0f0f0',
      'scroll-thumb': '#cccccc'
    };

    const darkTheme = {
      'bg-primary': '#1a1a1a',
      'bg-secondary': '#2d2d2d',
      'bg-tertiary': '#3d3d3d',
      'text-primary': '#ffffff',
      'text-secondary': '#e0e0e0',
      'text-tertiary': '#999999',
      'border-color': '#404040',
      'border-light': '#333333',
      'shadow-sm': '0 1px 2px rgba(0, 0, 0, 0.3)',
      'shadow-md': '0 4px 6px rgba(0, 0, 0, 0.4)',
      'shadow-lg': '0 10px 15px rgba(0, 0, 0, 0.5)',
      'glass-bg': 'rgba(45, 45, 45, 0.5)',
      'glass-border': 'rgba(255, 255, 255, 0.1)',
      'success-color': '#10b981',
      'warning-color': '#f59e0b',
      'error-color': '#ef4444',
      'info-color': '#60a5fa',
      'table-hover': '#2d2d2d',
      'input-bg': '#2d2d2d',
      'input-border': '#404040',
      'input-focus': '#60a5fa',
      'scroll-track': '#2d2d2d',
      'scroll-thumb': '#555555'
    };

    return theme === 'dark' ? darkTheme : lightTheme;
  }

  /**
   * Update theme toggle button appearance
   */
  updateThemeToggleButton() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
      const icon = themeToggleBtn.querySelector('i') || themeToggleBtn.querySelector('svg');
      if (icon) {
        icon.className = this.currentTheme === 'dark' ? 'icon-sun' : 'icon-moon';
        themeToggleBtn.title = this.currentTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
      }
    }
  }

  /**
   * Save theme preference to storage
   */
  saveThemePreference() {
    try {
      // Save to Electron storage
      if (window.electronAPI && window.electronAPI.storage) {
        window.electronAPI.storage.set(this.themeStorageKey, this.currentTheme);
      }

      // Also save to localStorage as fallback
      localStorage.setItem(this.themeStorageKey, this.currentTheme);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  }

  /**
   * Dispatch custom theme change event
   */
  dispatchThemeChangeEvent() {
    const event = new CustomEvent('themeChanged', {
      detail: { theme: this.currentTheme, variables: this.cssVariables }
    });
    window.dispatchEvent(event);
  }

  /**
   * Get current theme
   */
  getCurrentTheme() {
    return this.currentTheme;
  }

  /**
   * Set theme directly
   */
  setTheme(theme) {
    if (['light', 'dark'].includes(theme)) {
      this.applyTheme(theme);
    }
  }

  /**
   * Get CSS variable value
   */
  getCSSVariable(key) {
    return this.cssVariables[key] || null;
  }

  /**
   * Update single CSS variable
   */
  setCSSVariable(key, value) {
    document.documentElement.style.setProperty(`--${key}`, value);
    this.cssVariables[key] = value;
  }

  /**
   * Export theme colors for use in charts/exports
   */
  getThemeColors() {
    return {
      primary: this.getCSSVariable('bg-primary'),
      secondary: this.getCSSVariable('bg-secondary'),
      text: this.getCSSVariable('text-primary'),
      success: this.getCSSVariable('success-color'),
      warning: this.getCSSVariable('warning-color'),
      error: this.getCSSVariable('error-color'),
      info: this.getCSSVariable('info-color')
    };
  }

  /**
   * Create theme stylesheet link
   */
  createThemeLink(href) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

  /**
   * Remove theme stylesheet
   */
  removeThemeLink(href) {
    const link = document.querySelector(`link[href="${href}"]`);
    if (link) {
      link.remove();
    }
  }

  /**
   * Get theme configuration object
   */
  getThemeConfig() {
    return {
      current: this.currentTheme,
      available: ['light', 'dark'],
      variables: this.cssVariables,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Reset theme to default
   */
  resetThemeToDefault() {
    localStorage.removeItem(this.themeStorageKey);
    if (window.electronAPI && window.electronAPI.storage) {
      window.electronAPI.storage.delete(this.themeStorageKey);
    }
    
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.applyTheme(prefersDark ? 'dark' : 'light');
  }

  /**
   * Sync theme across tabs/windows
   */
  setupStorageSync() {
    window.addEventListener('storage', (e) => {
      if (e.key === this.themeStorageKey && e.newValue) {
        this.applyTheme(e.newValue);
      }
    });
  }

  /**
   * Get computed style value
   */
  getComputedStyle(element, property) {
    return window.getComputedStyle(element).getPropertyValue(property).trim();
  }

  /**
   * Apply theme-aware styling to element
   */
  applyThemeToElement(element, lightStyles, darkStyles) {
    const styles = this.currentTheme === 'dark' ? darkStyles : lightStyles;
    Object.assign(element.style, styles);
  }

  /**
   * Export current theme settings
   */
  exportThemeSettings() {
    return {
      theme: this.currentTheme,
      variables: this.cssVariables,
      timestamp: Date.now()
    };
  }

  /**
   * Import theme settings
   */
  importThemeSettings(settings) {
    if (settings.theme) {
      this.applyTheme(settings.theme);
    }
    if (settings.variables) {
      Object.entries(settings.variables).forEach(([key, value]) => {
        this.setCSSVariable(key, value);
      });
    }
  }
}

// Global initialization
let themeManager;

document.addEventListener('DOMContentLoaded', () => {
  themeManager = new ThemeManager();
  themeManager.setupStorageSync();
  
  // Expose globally for module access
  window.ThemeManager = themeManager;
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThemeManager;
}
