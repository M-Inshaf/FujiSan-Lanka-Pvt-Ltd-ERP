/**
 * HUMMINGBIRD CLOTHING ERP - SETTINGS MODULE
 * modules/settings/settings.js
 * 
 * Complete settings system following Sub Garments architecture
 * Features: Application configuration, backup/restore, theme management, data utilities, system info
 */

class SettingsModule {
  constructor() {
    this.appConfigKey = 'appConfig';
    this.appConfig = this.loadAppConfig();
    this.appVersion = '1.0.0';
    this.buildDate = new Date().toISOString();
    this.init();
  }

  /**
   * Load app configuration from storage
   */
  loadAppConfig() {
    try {
      const stored = localStorage.getItem(this.appConfigKey);
      return stored ? JSON.parse(stored) : this.getDefaultConfig();
    } catch (error) {
      console.error('Error loading app config:', error);
      return this.getDefaultConfig();
    }
  }

  /**
   * Get default application configuration
   */
  getDefaultConfig() {
    return {
      companyName: 'FujiSan Lanka Pvt Ltd',
      brandName: 'Hummingbird Clothing',
      theme: 'dark',
      currency: 'LKR',
      language: 'en',
      timezone: 'Asia/Colombo',
      dateFormat: 'YYYY-MM-DD',
      timeFormat: '24h',
      decimalPlaces: 2,
      autoBackup: true,
      backupInterval: 7,
      notificationsEnabled: true,
      soundEnabled: true,
      dataRetention: 365
    };
  }

  /**
   * Save app configuration
   */
  saveAppConfig() {
    try {
      localStorage.setItem(this.appConfigKey, JSON.stringify(this.appConfig));
      return true;
    } catch (error) {
      console.error('Error saving app config:', error);
      return false;
    }
  }

  /**
   * Initialize module on page load
   */
  init() {
    this.setupEventListeners();
    this.renderGeneralSettings();
    this.renderAppearanceSettings();
    this.renderDataSettings();
    this.renderBackupSettings();
    this.renderAboutSection();
    this.displaySystemInfo();
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // General settings form
    const generalForm = document.getElementById('generalSettingsForm');
    if (generalForm) {
      generalForm.addEventListener('submit', (e) => this.handleGeneralSettingsSubmit(e));
    }

    // Appearance settings form
    const appearanceForm = document.getElementById('appearanceSettingsForm');
    if (appearanceForm) {
      appearanceForm.addEventListener('submit', (e) => this.handleAppearanceSettingsSubmit(e));
    }

    // Data settings buttons
    const clearCacheBtn = document.getElementById('clearCacheBtn');
    const exportAllDataBtn = document.getElementById('exportAllDataBtn');
    const importDataBtn = document.getElementById('importDataBtn');
    
    if (clearCacheBtn) {
      clearCacheBtn.addEventListener('click', () => this.clearCache());
    }
    if (exportAllDataBtn) {
      exportAllDataBtn.addEventListener('click', () => this.exportAllData());
    }
    if (importDataBtn) {
      importDataBtn.addEventListener('click', () => this.showImportModal());
    }

    // Backup buttons
    const backupNowBtn = document.getElementById('backupNowBtn');
    const restoreBackupBtn = document.getElementById('restoreBackupBtn');
    const deleteAllDataBtn = document.getElementById('deleteAllDataBtn');
    
    if (backupNowBtn) {
      backupNowBtn.addEventListener('click', () => this.createBackup());
    }
    if (restoreBackupBtn) {
      restoreBackupBtn.addEventListener('click', () => this.showRestoreModal());
    }
    if (deleteAllDataBtn) {
      deleteAllDataBtn.addEventListener('click', () => this.deleteAllData());
    }

    // Theme toggle
    const themeSelect = document.getElementById('appTheme');
    if (themeSelect) {
      themeSelect.addEventListener('change', (e) => this.changeTheme(e.target.value));
    }
  }

  /**
   * Render general settings section
   */
  renderGeneralSettings() {
    const container = document.getElementById('generalSettingsContainer');
    if (!container) return;

    let html = `
      <form id="generalSettingsForm" class="settings-form">
        <div class="form-group">
          <label>Company Name</label>
          <input type="text" id="companyName" value="${this.appConfig.companyName}" required>
        </div>

        <div class="form-group">
          <label>Brand Name</label>
          <input type="text" id="brandName" value="${this.appConfig.brandName}" required>
        </div>

        <div class="form-group">
          <label>Currency</label>
          <select id="currency">
            <option value="LKR" ${this.appConfig.currency === 'LKR' ? 'selected' : ''}>LKR (Sri Lankan Rupee)</option>
            <option value="USD" ${this.appConfig.currency === 'USD' ? 'selected' : ''}>USD (US Dollar)</option>
            <option value="EUR" ${this.appConfig.currency === 'EUR' ? 'selected' : ''}>EUR (Euro)</option>
            <option value="GBP" ${this.appConfig.currency === 'GBP' ? 'selected' : ''}>GBP (British Pound)</option>
            <option value="INR" ${this.appConfig.currency === 'INR' ? 'selected' : ''}>INR (Indian Rupee)</option>
          </select>
        </div>

        <div class="form-group">
          <label>Language</label>
          <select id="language">
            <option value="en" ${this.appConfig.language === 'en' ? 'selected' : ''}>English</option>
            <option value="si" ${this.appConfig.language === 'si' ? 'selected' : ''}>Sinhala</option>
            <option value="ta" ${this.appConfig.language === 'ta' ? 'selected' : ''}>Tamil</option>
          </select>
        </div>

        <div class="form-group">
          <label>Timezone</label>
          <select id="timezone">
            <option value="Asia/Colombo" ${this.appConfig.timezone === 'Asia/Colombo' ? 'selected' : ''}>Asia/Colombo (UTC+5:30)</option>
            <option value="UTC" ${this.appConfig.timezone === 'UTC' ? 'selected' : ''}>UTC</option>
            <option value="Asia/Kolkata" ${this.appConfig.timezone === 'Asia/Kolkata' ? 'selected' : ''}>Asia/Kolkata (UTC+5:30)</option>
            <option value="Asia/Bangkok" ${this.appConfig.timezone === 'Asia/Bangkok' ? 'selected' : ''}>Asia/Bangkok (UTC+7:00)</option>
          </select>
        </div>

        <div class="form-group">
          <label>Date Format</label>
          <select id="dateFormat">
            <option value="YYYY-MM-DD" ${this.appConfig.dateFormat === 'YYYY-MM-DD' ? 'selected' : ''}>YYYY-MM-DD</option>
            <option value="DD-MM-YYYY" ${this.appConfig.dateFormat === 'DD-MM-YYYY' ? 'selected' : ''}>DD-MM-YYYY</option>
            <option value="MM-DD-YYYY" ${this.appConfig.dateFormat === 'MM-DD-YYYY' ? 'selected' : ''}>MM-DD-YYYY</option>
          </select>
        </div>

        <div class="form-group">
          <label>Time Format</label>
          <select id="timeFormat">
            <option value="24h" ${this.appConfig.timeFormat === '24h' ? 'selected' : ''}>24-Hour Format</option>
            <option value="12h" ${this.appConfig.timeFormat === '12h' ? 'selected' : ''}>12-Hour Format</option>
          </select>
        </div>

        <div class="form-group">
          <label>Decimal Places</label>
          <input type="number" id="decimalPlaces" value="${this.appConfig.decimalPlaces}" min="0" max="4" required>
        </div>

        <button type="submit" class="btn-primary">Save General Settings</button>
      </form>
    `;

    container.innerHTML = html;
  }

  /**
   * Render appearance settings section
   */
  renderAppearanceSettings() {
    const container = document.getElementById('appearanceSettingsContainer');
    if (!container) return;

    let html = `
      <form id="appearanceSettingsForm" class="settings-form">
        <div class="form-group">
          <label>Theme</label>
          <select id="appTheme">
            <option value="dark" ${this.appConfig.theme === 'dark' ? 'selected' : ''}>Dark Mode</option>
            <option value="light" ${this.appConfig.theme === 'light' ? 'selected' : ''}>Light Mode</option>
            <option value="auto" ${this.appConfig.theme === 'auto' ? 'selected' : ''}>Auto (System)</option>
          </select>
        </div>

        <div class="form-group">
          <label>
            <input type="checkbox" id="notificationsEnabled" ${this.appConfig.notificationsEnabled ? 'checked' : ''}>
            Enable Notifications
          </label>
        </div>

        <div class="form-group">
          <label>
            <input type="checkbox" id="soundEnabled" ${this.appConfig.soundEnabled ? 'checked' : ''}>
            Enable Sound Alerts
          </label>
        </div>

        <button type="submit" class="btn-primary">Save Appearance Settings</button>
      </form>
    `;

    container.innerHTML = html;
  }

  /**
   * Render data settings section
   */
  renderDataSettings() {
    const container = document.getElementById('dataSettingsContainer');
    if (!container) return;

    const cacheSize = this.calculateCacheSize();

    let html = `
      <div class="settings-section">
        <h3>Data Management</h3>
        
        <div class="settings-item">
          <div class="settings-info">
            <h4>Cache Size</h4>
            <p>${cacheSize} KB</p>
          </div>
          <button id="clearCacheBtn" class="btn-secondary">Clear Cache</button>
        </div>

        <div class="settings-item">
          <div class="settings-info">
            <h4>Data Retention</h4>
            <p>Keep data for ${this.appConfig.dataRetention} days</p>
          </div>
        </div>

        <div class="settings-item">
          <div class="settings-info">
            <h4>Export All Data</h4>
            <p>Export all application data as JSON</p>
          </div>
          <button id="exportAllDataBtn" class="btn-secondary">Export</button>
        </div>

        <div class="settings-item">
          <div class="settings-info">
            <h4>Import Data</h4>
            <p>Import previously exported data</p>
          </div>
          <button id="importDataBtn" class="btn-secondary">Import</button>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  /**
   * Render backup settings section
   */
  renderBackupSettings() {
    const container = document.getElementById('backupSettingsContainer');
    if (!container) return;

    const lastBackup = localStorage.getItem('lastBackupDate');
    const lastBackupText = lastBackup ? new Date(lastBackup).toLocaleString('en-LK') : 'Never';

    let html = `
      <div class="settings-section">
        <h3>Backup & Restore</h3>

        <div class="settings-item">
          <div class="settings-info">
            <h4>Automatic Backup</h4>
            <p>Last backup: ${lastBackupText}</p>
          </div>
          <label>
            <input type="checkbox" id="autoBackupEnabled" ${this.appConfig.autoBackup ? 'checked' : ''}>
            Enable automatic backups every ${this.appConfig.backupInterval} days
          </label>
        </div>

        <div class="settings-item">
          <div class="settings-info">
            <h4>Manual Backup</h4>
            <p>Create a backup of all data now</p>
          </div>
          <button id="backupNowBtn" class="btn-secondary">Backup Now</button>
        </div>

        <div class="settings-item">
          <div class="settings-info">
            <h4>Restore from Backup</h4>
            <p>Restore data from a previous backup</p>
          </div>
          <button id="restoreBackupBtn" class="btn-secondary">Restore</button>
        </div>

        <div class="settings-item danger">
          <div class="settings-info">
            <h4>Delete All Data</h4>
            <p>Permanently delete all application data</p>
          </div>
          <button id="deleteAllDataBtn" class="btn-danger">Delete All</button>
        </div>
      </div>
    `;

    container.innerHTML = html;

    // Setup additional event listeners
    const autoBackupCheckbox = document.getElementById('autoBackupEnabled');
    if (autoBackupCheckbox) {
      autoBackupCheckbox.addEventListener('change', (e) => {
        this.appConfig.autoBackup = e.target.checked;
        this.saveAppConfig();
      });
    }
  }

  /**
   * Render about section
   */
  renderAboutSection() {
    const container = document.getElementById('aboutContainer');
    if (!container) return;

    let html = `
      <div class="about-section">
        <h3>About Hummingbird Clothing ERP</h3>
        
        <div class="about-info">
          <div class="info-item">
            <label>Application</label>
            <p>Hummingbird Clothing ERP</p>
          </div>

          <div class="info-item">
            <label>Company</label>
            <p>FujiSan Lanka Pvt Ltd</p>
          </div>

          <div class="info-item">
            <label>Version</label>
            <p>${this.appVersion}</p>
          </div>

          <div class="info-item">
            <label>Build Date</label>
            <p>${new Date(this.buildDate).toLocaleDateString('en-LK')}</p>
          </div>

          <div class="info-item">
            <label>Architecture</label>
            <p>Electron.js + Vanilla JavaScript (Offline-First)</p>
          </div>

          <div class="info-item">
            <label>Storage</label>
            <p>Local JSON + IndexedDB</p>
          </div>

          <div class="info-item">
            <label>Technology Stack</label>
            <ul>
              <li>Electron.js (Desktop Framework)</li>
              <li>HTML5 + CSS3 + Vanilla JavaScript</li>
              <li>LocalStorage + IndexedDB</li>
              <li>PDF Export (html2canvas + jsPDF)</li>
              <li>Excel Export (XLSX Library)</li>
              <li>Glassmorphism Design</li>
              <li>Dark/Light Theme Support</li>
            </ul>
          </div>

          <div class="info-item">
            <label>Modules</label>
            <ul>
              <li>Dashboard</li>
              <li>Sub Garments (Foundation)</li>
              <li>Customers</li>
              <li>Suppliers</li>
              <li>Inventory</li>
              <li>Production Costing</li>
              <li>Expenses</li>
              <li>Staff & Payroll</li>
              <li>Reports</li>
              <li>Cheque Tracker</li>
              <li>Settings & Utilities</li>
            </ul>
          </div>

          <div class="info-item">
            <label>License</label>
            <p>Proprietary - FujiSan Lanka Pvt Ltd</p>
          </div>

          <div class="info-item">
            <label>Contact</label>
            <p>For support, contact: support@fujisinlanka.com</p>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  /**
   * Display system information
   */
  displaySystemInfo() {
    const container = document.getElementById('systemInfoContainer');
    if (!container) return;

    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    const language = navigator.language;
    const memoryUsage = performance.memory ? (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB' : 'N/A';
    const localStorageUsage = this.calculateStorageUsage();

    let html = `
      <div class="system-info">
        <h3>System Information</h3>
        
        <div class="info-grid">
          <div class="info-card">
            <label>Platform</label>
            <p>${platform}</p>
          </div>

          <div class="info-card">
            <label>User Agent</label>
            <p style="font-size: 12px;">${userAgent}</p>
          </div>

          <div class="info-card">
            <label>Language</label>
            <p>${language}</p>
          </div>

          <div class="info-card">
            <label>Memory Usage</label>
            <p>${memoryUsage}</p>
          </div>

          <div class="info-card">
            <label>LocalStorage Usage</label>
            <p>${localStorageUsage}</p>
          </div>

          <div class="info-card">
            <label>Total Records</label>
            <p>${this.calculateTotalRecords()}</p>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  /**
   * Handle general settings form submission
   */
  handleGeneralSettingsSubmit(e) {
    e.preventDefault();

    this.appConfig.companyName = document.getElementById('companyName').value;
    this.appConfig.brandName = document.getElementById('brandName').value;
    this.appConfig.currency = document.getElementById('currency').value;
    this.appConfig.language = document.getElementById('language').value;
    this.appConfig.timezone = document.getElementById('timezone').value;
    this.appConfig.dateFormat = document.getElementById('dateFormat').value;
    this.appConfig.timeFormat = document.getElementById('timeFormat').value;
    this.appConfig.decimalPlaces = parseInt(document.getElementById('decimalPlaces').value);

    this.saveAppConfig();
    alert('General settings saved successfully');
  }

  /**
   * Handle appearance settings form submission
   */
  handleAppearanceSettingsSubmit(e) {
    e.preventDefault();

    this.appConfig.theme = document.getElementById('appTheme').value;
    this.appConfig.notificationsEnabled = document.getElementById('notificationsEnabled').checked;
    this.appConfig.soundEnabled = document.getElementById('soundEnabled').checked;

    this.saveAppConfig();
    alert('Appearance settings saved successfully');
  }

  /**
   * Change theme
   */
  changeTheme(theme) {
    this.appConfig.theme = theme;
    this.saveAppConfig();
    
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
    alert('Theme changed to ' + theme.toUpperCase());
  }

  /**
   * Clear browser cache
   */
  clearCache() {
    if (!confirm('Are you sure you want to clear the application cache? This will not delete your data.')) return;

    // Clear session storage
    sessionStorage.clear();
    alert('Cache cleared successfully');
    this.renderDataSettings();
  }

  /**
   * Create backup of all data
   */
  createBackup() {
    const backup = {
      timestamp: new Date().toISOString(),
      version: this.appVersion,
      config: this.appConfig,
      data: this.getAllData()
    };

    const dataStr = JSON.stringify(backup, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    localStorage.setItem('lastBackupDate', new Date().toISOString());
    alert('Backup created successfully');
    this.renderBackupSettings();
  }

  /**
   * Show restore modal
   */
  showRestoreModal() {
    const modal = document.getElementById('restoreModal');
    if (modal) {
      modal.style.display = 'block';
    }
  }

  /**
   * Restore from backup file
   */
  restoreFromBackup(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backup = JSON.parse(e.target.result);
        
        if (!backup.timestamp || !backup.data) {
          alert('Invalid backup file');
          return;
        }

        // Restore all data
        Object.entries(backup.data).forEach(([key, value]) => {
          localStorage.setItem(key, JSON.stringify(value));
        });

        // Restore config
        if (backup.config) {
          this.appConfig = backup.config;
          this.saveAppConfig();
        }

        alert('Data restored successfully from backup');
        window.location.reload();
      } catch (error) {
        alert('Error restoring backup: ' + error.message);
      }
    };
    reader.readAsText(file);
  }

  /**
   * Show import modal
   */
  showImportModal() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.addEventListener('change', (e) => {
      if (e.target.files[0]) {
        this.restoreFromBackup(e.target.files[0]);
      }
    });
    input.click();
  }

  /**
   * Export all data
   */
  exportAllData() {
    const data = this.getAllData();
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert('Data exported successfully');
  }

  /**
   * Get all application data
   */
  getAllData() {
    const dataKeys = [
      'subGarments',
      'customers',
      'suppliers',
      'inventory',
      'productionCosting',
      'expenses',
      'staff',
      'payroll',
      'attendance',
      'cheques',
      'dashboardMetrics'
    ];

    const allData = {};
    dataKeys.forEach(key => {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          allData[key] = JSON.parse(data);
        }
      } catch (error) {
        console.error(`Error exporting ${key}:`, error);
      }
    });

    return allData;
  }

  /**
   * Delete all data permanently
   */
  deleteAllData() {
    if (!confirm('⚠️ WARNING: This will permanently delete ALL application data. Are you sure?')) return;
    if (!confirm('⚠️ This action CANNOT be undone. Click OK again to confirm.')) return;

    const dataKeys = [
      'subGarments',
      'customers',
      'suppliers',
      'inventory',
      'productionCosting',
      'expenses',
      'staff',
      'payroll',
      'attendance',
      'cheques',
      'dashboardMetrics',
      this.appConfigKey
    ];

    dataKeys.forEach(key => {
      localStorage.removeItem(key);
    });

    alert('All data has been permanently deleted');
    window.location.reload();
  }

  /**
   * Calculate cache size in KB
   */
  calculateCacheSize() {
    let totalSize = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length + key.length;
      }
    }
    return (totalSize / 1024).toFixed(2);
  }

  /**
   * Calculate storage usage
   */
  calculateStorageUsage() {
    const size = this.calculateCacheSize();
    return size + ' KB';
  }

  /**
   * Calculate total records across all modules
   */
  calculateTotalRecords() {
    let total = 0;
    const modules = ['subGarments', 'customers', 'suppliers', 'inventory', 'expenses', 'staff', 'payroll', 'cheques'];
    
    modules.forEach(module => {
      try {
        const data = localStorage.getItem(module);
        if (data) {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) {
            total += parsed.length;
          }
        }
      } catch (error) {
        console.error(`Error counting ${module}:`, error);
      }
    });

    return total;
  }
}

// Initialize module when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.settingsModule = new SettingsModule();
  });
} else {
  window.settingsModule = new SettingsModule();
}
