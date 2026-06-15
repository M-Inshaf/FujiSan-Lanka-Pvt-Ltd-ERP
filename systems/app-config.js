/**
 * App Config System
 * Manages application configuration, settings, defaults, and environment variables
 * Integrated with Electron and persistent storage
 */

class AppConfig {
  constructor() {
    this.config = {};
    this.defaults = this.getDefaultConfig();
    this.configStorageKey = 'hummingbird_config';
    this.init();
  }

  /**
   * Initialize app config
   */
  init() {
    this.loadConfig();
    this.validateConfig();
    this.setupConfigWatchers();
  }

  /**
   * Get default configuration
   */
  getDefaultConfig() {
    return {
      app: {
        name: 'Hummingbird Clothing ERP',
        version: '1.0.0',
        company: 'FujiSan Lanka Pvt Ltd',
        language: 'en',
        currency: 'LKR',
        timezone: 'Asia/Colombo',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: 'HH:mm:ss'
      },
      database: {
        type: 'json',
        autoBackup: true,
        backupInterval: 3600000,
        maxBackups: 10,
        compressBackups: true
      },
      ui: {
        theme: 'light',
        fontSize: 14,
        sidebarCollapsed: false,
        animationsEnabled: true,
        showNotifications: true,
        notificationDuration: 3000
      },
      export: {
        defaultFormat: 'excel',
        includeTimestamp: true,
        defaultPath: './exports',
        autoOpen: false
      },
      pdf: {
        pageSize: 'A4',
        orientation: 'portrait',
        margin: 10,
        headerFooter: true,
        pageNumbers: true
      },
      security: {
        autoLockEnabled: false,
        autoLockTimeout: 300000,
        passwordRequired: false,
        encryptionEnabled: false,
        sessionTimeout: 900000
      },
      modules: {
        dashboard: { enabled: true },
        subGarments: { enabled: true },
        customers: { enabled: true },
        suppliers: { enabled: true },
        inventory: { enabled: true },
        productionCosting: { enabled: true },
        expenses: { enabled: true },
        staff: { enabled: true },
        reports: { enabled: true },
        chequeTracker: { enabled: true },
        settings: { enabled: true }
      },
      features: {
        advancedReporting: true,
        inventoryTracking: true,
        costingAnalysis: true,
        expenseManagement: true,
        staffManagement: true,
        chequeTracking: true,
        dataExport: true,
        pdfGeneration: true
      },
      developer: {
        debugMode: false,
        logLevel: 'info',
        devToolsEnabled: false,
        mockData: false
      }
    };
  }

  /**
   * Load configuration from storage
   */
  loadConfig() {
    try {
      let saved = null;

      // Try Electron storage first
      if (window.electronAPI && window.electronAPI.storage) {
        saved = window.electronAPI.storage.get(this.configStorageKey);
      }

      // Fallback to localStorage
      if (!saved) {
        const storedConfig = localStorage.getItem(this.configStorageKey);
        if (storedConfig) {
          saved = JSON.parse(storedConfig);
        }
      }

      if (saved) {
        this.config = this.mergeConfigs(this.defaults, saved);
      } else {
        this.config = JSON.parse(JSON.stringify(this.defaults));
      }
    } catch (error) {
      console.error('Config load error:', error);
      this.config = JSON.parse(JSON.stringify(this.defaults));
    }
  }

  /**
   * Merge configs (saved overwrites defaults)
   */
  mergeConfigs(defaults, saved) {
    const merged = JSON.parse(JSON.stringify(defaults));
    Object.keys(saved).forEach(key => {
      if (typeof saved[key] === 'object' && !Array.isArray(saved[key])) {
        merged[key] = { ...merged[key], ...saved[key] };
      } else {
        merged[key] = saved[key];
      }
    });
    return merged;
  }

  /**
   * Validate configuration
   */
  validateConfig() {
    const required = ['app', 'database', 'ui', 'modules'];
    required.forEach(key => {
      if (!this.config[key]) {
        console.warn(`Missing config section: ${key}, using defaults`);
        this.config[key] = this.defaults[key];
      }
    });
  }

  /**
   * Setup config change watchers
   */
  setupConfigWatchers() {
    // Listen for storage changes from other tabs
    window.addEventListener('storage', (e) => {
      if (e.key === this.configStorageKey) {
        this.loadConfig();
        this.dispatchConfigChangeEvent();
      }
    });
  }

  /**
   * Get config value by path
   */
  get(path, defaultValue = null) {
    const keys = path.split('.');
    let value = this.config;

    for (let key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return defaultValue;
      }
    }

    return value;
  }

  /**
   * Set config value by path
   */
  set(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let target = this.config;

    for (let key of keys) {
      if (!(key in target)) {
        target[key] = {};
      }
      target = target[key];
    }

    target[lastKey] = value;
    this.saveConfig();
    this.dispatchConfigChangeEvent(path, value);
  }

  /**
   * Update multiple config values
   */
  update(updates) {
    Object.entries(updates).forEach(([path, value]) => {
      this.set(path, value);
    });
  }

  /**
   * Get entire config section
   */
  getSection(section) {
    return this.config[section] || this.defaults[section] || null;
  }

  /**
   * Set entire config section
   */
  setSection(section, values) {
    this.config[section] = { ...this.config[section], ...values };
    this.saveConfig();
    this.dispatchConfigChangeEvent(section);
  }

  /**
   * Save config to storage
   */
  saveConfig() {
    try {
      // Save to Electron storage
      if (window.electronAPI && window.electronAPI.storage) {
        window.electronAPI.storage.set(this.configStorageKey, this.config);
      }

      // Also save to localStorage
      localStorage.setItem(this.configStorageKey, JSON.stringify(this.config));
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  }

  /**
   * Reset to defaults
   */
  resetToDefaults() {
    this.config = JSON.parse(JSON.stringify(this.defaults));
    this.saveConfig();
    this.dispatchConfigChangeEvent('reset');
  }

  /**
   * Reset specific section
   */
  resetSection(section) {
    if (this.defaults[section]) {
      this.config[section] = JSON.parse(JSON.stringify(this.defaults[section]));
      this.saveConfig();
      this.dispatchConfigChangeEvent(section, 'reset');
    }
  }

  /**
   * Dispatch config change event
   */
  dispatchConfigChangeEvent(path = null, value = null) {
    const event = new CustomEvent('configChanged', {
      detail: { path, value, config: this.config }
    });
    window.dispatchEvent(event);
  }

  /**
   * Export config
   */
  exportConfig() {
    return {
      config: this.config,
      timestamp: new Date().toISOString(),
      version: this.config.app.version
    };
  }

  /**
   * Import config
   */
  importConfig(exported) {
    try {
      if (exported.config) {
        this.config = this.mergeConfigs(this.defaults, exported.config);
        this.validateConfig();
        this.saveConfig();
        this.dispatchConfigChangeEvent('import');
        return true;
      }
    } catch (error) {
      console.error('Config import error:', error);
      return false;
    }
  }

  /**
   * Get all module statuses
   */
  getEnabledModules() {
    const modules = this.get('modules', {});
    return Object.entries(modules)
      .filter(([, config]) => config.enabled)
      .map(([name]) => name);
  }

  /**
   * Check if module is enabled
   */
  isModuleEnabled(moduleName) {
    return this.get(`modules.${moduleName}.enabled`, false);
  }

  /**
   * Get all features
   */
  getFeatures() {
    return this.get('features', {});
  }

  /**
   * Check if feature is enabled
   */
  isFeatureEnabled(featureName) {
    return this.get(`features.${featureName}`, false);
  }

  /**
   * Get app info
   */
  getAppInfo() {
    return this.get('app', {});
  }

  /**
   * Get database config
   */
  getDatabaseConfig() {
    return this.get('database', {});
  }

  /**
   * Get UI settings
   */
  getUISettings() {
    return this.get('ui', {});
  }

  /**
   * Get export settings
   */
  getExportSettings() {
    return this.get('export', {});
  }

  /**
   * Get PDF settings
   */
  getPDFSettings() {
    return this.get('pdf', {});
  }

  /**
   * Get security settings
   */
  getSecuritySettings() {
    return this.get('security', {});
  }

  /**
   * Validate config against defaults
   */
  validateAgainstDefaults() {
    const issues = [];
    
    const checkKeys = (obj, defaults, path = '') => {
      Object.keys(defaults).forEach(key => {
        const currentPath = path ? `${path}.${key}` : key;
        if (!(key in obj)) {
          issues.push(`Missing config: ${currentPath}`);
        } else if (typeof defaults[key] === 'object' && !Array.isArray(defaults[key])) {
          checkKeys(obj[key] || {}, defaults[key], currentPath);
        }
      });
    };

    checkKeys(this.config, this.defaults);
    return issues;
  }

  /**
   * Get config summary
   */
  getSummary() {
    return {
      app: this.config.app.name,
      version: this.config.app.version,
      company: this.config.app.company,
      theme: this.config.ui.theme,
      language: this.config.app.language,
      currency: this.config.app.currency,
      enabledModules: this.getEnabledModules().length,
      enabledFeatures: Object.values(this.getFeatures()).filter(Boolean).length,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get full config object
   */
  getFullConfig() {
    return JSON.parse(JSON.stringify(this.config));
  }

  /**
   * Merge external config
   */
  mergeExternal(externalConfig) {
    this.config = this.mergeConfigs(this.config, externalConfig);
    this.validateConfig();
    this.saveConfig();
  }

  /**
   * Get default value for path
   */
  getDefault(path) {
    const keys = path.split('.');
    let value = this.defaults;

    for (let key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return null;
      }
    }

    return value;
  }

  /**
   * Check if value differs from default
   */
  isDifferentFromDefault(path) {
    return this.get(path) !== this.getDefault(path);
  }

  /**
   * Get all config paths that differ from defaults
   */
  getDifferentPaths() {
    const different = [];

    const check = (obj, defaults, path = '') => {
      Object.keys(obj).forEach(key => {
        const currentPath = path ? `${path}.${key}` : key;
        if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
          check(obj[key], defaults[key] || {}, currentPath);
        } else if (obj[key] !== defaults[key]) {
          different.push(currentPath);
        }
      });
    };

    check(this.config, this.defaults);
    return different;
  }
}

// Global initialization
let appConfig;

document.addEventListener('DOMContentLoaded', () => {
  appConfig = new AppConfig();
  
  // Expose globally for module access
  window.AppConfig = appConfig;
  
  // Apply initial settings
  if (appConfig.get('ui.animationsEnabled') === false) {
    document.documentElement.classList.add('no-animations');
  }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AppConfig;
}
