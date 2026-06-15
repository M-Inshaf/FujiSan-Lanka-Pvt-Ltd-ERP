/**
 * Backup & Restore System
 * FujiSan Lanka ERP - Electron Desktop Application
 * 
 * Handles:
 * - Full database backups (JSON export)
 * - Scheduled backups
 * - Data restoration from backup files
 * - Backup versioning and management
 * - Cloud sync integration (ready)
 * - Data integrity verification
 */

class BackupRestoreSystem {
    constructor() {
        this.backupDirectory = 'backups';
        this.backupPrefix = 'fujisan-backup';
        this.maxLocalBackups = 10;
        this.backupInterval = 3600000; // 1 hour in milliseconds
        this.backupHistory = [];
        this.isRestoring = false;
        this.init();
    }

    /**
     * Initialize backup system
     */
    init() {
        this.loadBackupHistory();
        this.startAutoBackup();
        this.setupEventListeners();
        console.log('[BackupRestore] System initialized');
    }

    /**
     * Setup event listeners for backup/restore triggers
     */
    setupEventListeners() {
        // Listen for data changes to trigger backup
        window.addEventListener('app-data-changed', () => {
            this.scheduleBackup();
        });

        // Listen for app before-quit to save backup
        if (window.electron?.onBeforeQuit) {
            window.electron.onBeforeQuit(() => {
                this.createBackup('before-quit');
            });
        }
    }

    /**
     * Create a backup of all application data
     * @param {string} label - Backup label/description
     * @returns {Promise<object>} Backup metadata
     */
    async createBackup(label = 'manual') {
        try {
            console.log(`[BackupRestore] Creating ${label} backup...`);

            // Gather all data from storage
            const backupData = await this.gatherBackupData();

            // Create backup object with metadata
            const backup = {
                id: this.generateBackupId(),
                timestamp: new Date().toISOString(),
                label: label,
                version: '1.0',
                appVersion: '1.0.0',
                dataSize: JSON.stringify(backupData).length,
                checksum: this.calculateChecksum(backupData),
                data: backupData
            };

            // Save to local storage
            await this.saveBackupLocally(backup);

            // Add to history
            this.backupHistory.push({
                id: backup.id,
                timestamp: backup.timestamp,
                label: backup.label,
                dataSize: backup.dataSize,
                location: 'local'
            });

            // Trim old backups if exceeded max
            await this.trimOldBackups();

            // Save backup history
            this.saveBackupHistory();

            console.log(`[BackupRestore] Backup created: ${backup.id}`);
            this.notifyBackupComplete(backup);

            return backup;
        } catch (error) {
            console.error('[BackupRestore] Error creating backup:', error);
            this.notifyBackupError(error);
            throw error;
        }
    }

    /**
     * Gather all application data from storage
     * @returns {Promise<object>} Complete application data
     */
    async gatherBackupData() {
        const data = {
            timestamp: new Date().toISOString(),
            modules: {}
        };

        // Backup each module's data
        const modules = [
            'dashboard',
            'sub-garments',
            'customers',
            'suppliers',
            'inventory',
            'production-costing',
            'expenses',
            'staff',
            'reports',
            'cheque-tracker',
            'settings'
        ];

        for (const module of modules) {
            const moduleData = await this.getModuleData(module);
            if (moduleData) {
                data.modules[module] = moduleData;
            }
        }

        // Backup system settings
        data.settings = this.getSystemSettings();

        // Backup user preferences
        data.preferences = this.getUserPreferences();

        return data;
    }

    /**
     * Get module-specific data from storage
     * @param {string} moduleName - Name of module
     * @returns {Promise<object>} Module data
     */
    async getModuleData(moduleName) {
        try {
            // Try to get from localStorage first
            const key = `${moduleName}-data`;
            const localData = localStorage.getItem(key);
            if (localData) {
                return JSON.parse(localData);
            }

            // Try IndexedDB if available
            if (window.indexedDB) {
                return await this.getIndexedDBData(moduleName);
            }

            return null;
        } catch (error) {
            console.warn(`[BackupRestore] Error getting ${moduleName} data:`, error);
            return null;
        }
    }

    /**
     * Get data from IndexedDB
     * @param {string} moduleName - Module name
     * @returns {Promise<object>} Data from IndexedDB
     */
    async getIndexedDBData(moduleName) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('FujiSanDB');

            request.onsuccess = (event) => {
                const db = event.target.result;
                const storeName = `${moduleName}-store`;

                if (!db.objectStoreNames.contains(storeName)) {
                    resolve(null);
                    return;
                }

                const transaction = db.transaction(storeName, 'readonly');
                const store = transaction.objectStore(storeName);
                const getAllRequest = store.getAll();

                getAllRequest.onsuccess = () => {
                    resolve(getAllRequest.result);
                };

                getAllRequest.onerror = () => {
                    reject(getAllRequest.error);
                };
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    /**
     * Get system settings from storage
     * @returns {object} System settings
     */
    getSystemSettings() {
        return {
            theme: localStorage.getItem('app-theme') || 'light',
            language: localStorage.getItem('app-language') || 'en',
            currency: localStorage.getItem('app-currency') || 'LKR',
            companyName: localStorage.getItem('company-name') || '',
            companyAddress: localStorage.getItem('company-address') || '',
            companyPhone: localStorage.getItem('company-phone') || '',
            companyEmail: localStorage.getItem('company-email') || ''
        };
    }

    /**
     * Get user preferences
     * @returns {object} User preferences
     */
    getUserPreferences() {
        return {
            sidebarCollapsed: localStorage.getItem('sidebar-collapsed') === 'true',
            autoBackup: localStorage.getItem('auto-backup') !== 'false',
            defaultView: localStorage.getItem('default-view') || 'dashboard',
            dateFormat: localStorage.getItem('date-format') || 'YYYY-MM-DD',
            timeFormat: localStorage.getItem('time-format') || '24h',
            itemsPerPage: parseInt(localStorage.getItem('items-per-page') || '50')
        };
    }

    /**
     * Save backup to local storage
     * @param {object} backup - Backup object
     * @returns {Promise<void>}
     */
    async saveBackupLocally(backup) {
        try {
            const backupKey = `${this.backupPrefix}-${backup.id}`;
            
            // For Electron, use IPC to save to file system
            if (window.electron?.saveBackup) {
                await window.electron.saveBackup(backup);
            } else {
                // Browser fallback - use localStorage (limited)
                localStorage.setItem(backupKey, JSON.stringify(backup));
            }
        } catch (error) {
            console.error('[BackupRestore] Error saving backup locally:', error);
            throw error;
        }
    }

    /**
     * Restore application data from backup
     * @param {string} backupId - ID of backup to restore
     * @returns {Promise<object>} Restoration result
     */
    async restoreFromBackup(backupId) {
        if (this.isRestoring) {
            throw new Error('Restoration already in progress');
        }

        this.isRestoring = true;

        try {
            console.log(`[BackupRestore] Starting restoration from backup: ${backupId}`);

            // Retrieve backup
            const backup = await this.getBackup(backupId);
            if (!backup) {
                throw new Error(`Backup not found: ${backupId}`);
            }

            // Verify backup integrity
            const isValid = this.verifyBackupIntegrity(backup);
            if (!isValid) {
                throw new Error('Backup integrity check failed');
            }

            // Create safety backup before restoration
            await this.createBackup('pre-restore-safety');

            // Clear current data (careful!)
            await this.clearAllData();

            // Restore module data
            const restorationResult = await this.restoreModuleData(backup.data.modules);

            // Restore settings
            this.restoreSettings(backup.data.settings);

            // Restore preferences
            this.restorePreferences(backup.data.preferences);

            console.log('[BackupRestore] Restoration completed successfully');
            this.notifyRestorationComplete(backup);

            this.isRestoring = false;

            return {
                success: true,
                backupId: backupId,
                modulesRestored: Object.keys(backup.data.modules).length,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('[BackupRestore] Error during restoration:', error);
            this.notifyRestorationError(error);
            this.isRestoring = false;
            throw error;
        }
    }

    /**
     * Get backup from storage
     * @param {string} backupId - Backup ID
     * @returns {Promise<object>} Backup object
     */
    async getBackup(backupId) {
        try {
            // Try Electron file system first
            if (window.electron?.getBackup) {
                return await window.electron.getBackup(backupId);
            }

            // Browser fallback
            const backupKey = `${this.backupPrefix}-${backupId}`;
            const backupJson = localStorage.getItem(backupKey);
            return backupJson ? JSON.parse(backupJson) : null;
        } catch (error) {
            console.error('[BackupRestore] Error retrieving backup:', error);
            return null;
        }
    }

    /**
     * Restore module data
     * @param {object} modulesData - Module data from backup
     * @returns {Promise<object>} Restoration results
     */
    async restoreModuleData(modulesData) {
        const results = {};

        for (const [moduleName, data] of Object.entries(modulesData)) {
            try {
                // Save to localStorage
                const key = `${moduleName}-data`;
                localStorage.setItem(key, JSON.stringify(data));

                // Also restore to IndexedDB if available
                if (window.indexedDB) {
                    await this.restoreIndexedDBData(moduleName, data);
                }

                results[moduleName] = { success: true };
                console.log(`[BackupRestore] Restored module: ${moduleName}`);
            } catch (error) {
                console.error(`[BackupRestore] Error restoring ${moduleName}:`, error);
                results[moduleName] = { success: false, error: error.message };
            }
        }

        return results;
    }

    /**
     * Restore data to IndexedDB
     * @param {string} moduleName - Module name
     * @param {object} data - Data to restore
     * @returns {Promise<void>}
     */
    async restoreIndexedDBData(moduleName, data) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('FujiSanDB');

            request.onsuccess = (event) => {
                const db = event.target.result;
                const storeName = `${moduleName}-store`;

                if (!db.objectStoreNames.contains(storeName)) {
                    resolve();
                    return;
                }

                const transaction = db.transaction(storeName, 'readwrite');
                const store = transaction.objectStore(storeName);

                // Clear existing data
                const clearRequest = store.clear();

                clearRequest.onsuccess = () => {
                    // Add restored data
                    if (Array.isArray(data)) {
                        data.forEach(item => store.add(item));
                    } else {
                        store.add(data);
                    }

                    transaction.oncomplete = () => {
                        resolve();
                    };

                    transaction.onerror = () => {
                        reject(transaction.error);
                    };
                };

                clearRequest.onerror = () => {
                    reject(clearRequest.error);
                };
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    /**
     * Restore system settings
     * @param {object} settings - Settings to restore
     */
    restoreSettings(settings) {
        if (!settings) return;

        Object.entries(settings).forEach(([key, value]) => {
            const storageKey = key === 'theme' ? 'app-theme' :
                              key === 'language' ? 'app-language' :
                              key === 'currency' ? 'app-currency' :
                              `company-${key.replace('company', '')}`;

            localStorage.setItem(storageKey, value);
        });
    }

    /**
     * Restore user preferences
     * @param {object} preferences - Preferences to restore
     */
    restorePreferences(preferences) {
        if (!preferences) return;

        const prefMap = {
            'sidebarCollapsed': 'sidebar-collapsed',
            'autoBackup': 'auto-backup',
            'defaultView': 'default-view',
            'dateFormat': 'date-format',
            'timeFormat': 'time-format',
            'itemsPerPage': 'items-per-page'
        };

        Object.entries(preferences).forEach(([key, value]) => {
            const storageKey = prefMap[key];
            if (storageKey) {
                localStorage.setItem(storageKey, value);
            }
        });
    }

    /**
     * Verify backup integrity using checksum
     * @param {object} backup - Backup object
     * @returns {boolean} Is backup valid
     */
    verifyBackupIntegrity(backup) {
        if (!backup.data || !backup.checksum) {
            return false;
        }

        const calculatedChecksum = this.calculateChecksum(backup.data);
        return calculatedChecksum === backup.checksum;
    }

    /**
     * Calculate checksum for data integrity
     * @param {object} data - Data to calculate checksum for
     * @returns {string} Checksum hash
     */
    calculateChecksum(data) {
        const dataString = JSON.stringify(data);
        let hash = 0;

        for (let i = 0; i < dataString.length; i++) {
            const char = dataString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }

        return Math.abs(hash).toString(16);
    }

    /**
     * Clear all application data
     * @returns {Promise<void>}
     */
    async clearAllData() {
        try {
            // Clear localStorage (except backups and system settings)
            const keysToKeep = ['app-theme', 'app-language', 'app-currency', 'sidebar-collapsed'];
            const keysToRemove = [];

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (!keysToKeep.includes(key) && !key.includes(this.backupPrefix)) {
                    keysToRemove.push(key);
                }
            }

            keysToRemove.forEach(key => localStorage.removeItem(key));

            // Clear IndexedDB
            if (window.indexedDB) {
                const dbs = await this.getAllIndexedDBNames();
                dbs.forEach(db => indexedDB.deleteDatabase(db));
            }

            console.log('[BackupRestore] All data cleared');
        } catch (error) {
            console.error('[BackupRestore] Error clearing data:', error);
            throw error;
        }
    }

    /**
     * Get all IndexedDB database names
     * @returns {Promise<string[]>} Database names
     */
    async getAllIndexedDBNames() {
        if (!window.indexedDB.databases) {
            return ['FujiSanDB']; // Fallback
        }

        const databases = await window.indexedDB.databases();
        return databases.map(db => db.name);
    }

    /**
     * Export backup as downloadable file
     * @param {string} backupId - Backup ID
     * @returns {Promise<void>}
     */
    async exportBackupFile(backupId) {
        try {
            const backup = await this.getBackup(backupId);
            if (!backup) {
                throw new Error('Backup not found');
            }

            // Create blob
            const blob = new Blob([JSON.stringify(backup, null, 2)], {
                type: 'application/json'
            });

            // Create download link
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${this.backupPrefix}-${backupId}-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            console.log(`[BackupRestore] Backup exported: ${backupId}`);
        } catch (error) {
            console.error('[BackupRestore] Error exporting backup:', error);
            throw error;
        }
    }

    /**
     * Import backup from file
     * @param {File} file - Backup file to import
     * @returns {Promise<object>} Imported backup metadata
     */
    async importBackupFile(file) {
        try {
            const content = await file.text();
            const backup = JSON.parse(content);

            // Validate backup structure
            if (!backup.data || !backup.timestamp) {
                throw new Error('Invalid backup file format');
            }

            // Save imported backup
            await this.saveBackupLocally(backup);

            // Add to history
            this.backupHistory.push({
                id: backup.id,
                timestamp: backup.timestamp,
                label: 'imported',
                dataSize: backup.dataSize,
                location: 'local'
            });

            this.saveBackupHistory();

            console.log(`[BackupRestore] Backup imported: ${backup.id}`);
            return backup;
        } catch (error) {
            console.error('[BackupRestore] Error importing backup:', error);
            throw error;
        }
    }

    /**
     * Schedule automatic backup
     */
    scheduleBackup() {
        if (this.backupTimer) {
            clearTimeout(this.backupTimer);
        }

        this.backupTimer = setTimeout(() => {
            this.createBackup('auto');
        }, 300000); // 5 minute delay after data change
    }

    /**
     * Start automatic backup interval
     */
    startAutoBackup() {
        // Create backup every hour
        this.autoBackupInterval = setInterval(() => {
            if (localStorage.getItem('auto-backup') !== 'false') {
                this.createBackup('auto');
            }
        }, this.backupInterval);

        console.log('[BackupRestore] Auto backup started');
    }

    /**
     * Stop automatic backup
     */
    stopAutoBackup() {
        if (this.autoBackupInterval) {
            clearInterval(this.autoBackupInterval);
            console.log('[BackupRestore] Auto backup stopped');
        }
    }

    /**
     * Trim old backups beyond max limit
     * @returns {Promise<void>}
     */
    async trimOldBackups() {
        if (this.backupHistory.length <= this.maxLocalBackups) {
            return;
        }

        // Sort by timestamp
        this.backupHistory.sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );

        // Remove oldest backups
        const toRemove = this.backupHistory.splice(this.maxLocalBackups);

        for (const backup of toRemove) {
            const backupKey = `${this.backupPrefix}-${backup.id}`;
            localStorage.removeItem(backupKey);

            if (window.electron?.deleteBackup) {
                await window.electron.deleteBackup(backup.id);
            }
        }

        this.saveBackupHistory();
        console.log(`[BackupRestore] Trimmed ${toRemove.length} old backups`);
    }

    /**
     * Get all available backups
     * @returns {array} Backup history
     */
    getBackups() {
        return this.backupHistory.sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );
    }

    /**
     * Delete a backup
     * @param {string} backupId - Backup ID
     * @returns {Promise<void>}
     */
    async deleteBackup(backupId) {
        try {
            const backupKey = `${this.backupPrefix}-${backupId}`;
            localStorage.removeItem(backupKey);

            if (window.electron?.deleteBackup) {
                await window.electron.deleteBackup(backupId);
            }

            // Remove from history
            this.backupHistory = this.backupHistory.filter(b => b.id !== backupId);
            this.saveBackupHistory();

            console.log(`[BackupRestore] Backup deleted: ${backupId}`);
        } catch (error) {
            console.error('[BackupRestore] Error deleting backup:', error);
            throw error;
        }
    }

    /**
     * Generate unique backup ID
     * @returns {string} Backup ID
     */
    generateBackupId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Load backup history from storage
     */
    loadBackupHistory() {
        try {
            const history = localStorage.getItem('backup-history');
            this.backupHistory = history ? JSON.parse(history) : [];
        } catch (error) {
            console.warn('[BackupRestore] Error loading backup history:', error);
            this.backupHistory = [];
        }
    }

    /**
     * Save backup history to storage
     */
    saveBackupHistory() {
        try {
            localStorage.setItem('backup-history', JSON.stringify(this.backupHistory));
        } catch (error) {
            console.error('[BackupRestore] Error saving backup history:', error);
        }
    }

    /**
     * Notify backup completion
     * @param {object} backup - Backup object
     */
    notifyBackupComplete(backup) {
        const event = new CustomEvent('backup-complete', { detail: backup });
        window.dispatchEvent(event);

        if (window.electron?.notify) {
            window.electron.notify({
                title: 'Backup Complete',
                body: `Backup created: ${backup.label} (${backup.dataSize} bytes)`,
                type: 'success'
            });
        }
    }

    /**
     * Notify backup error
     * @param {Error} error - Error object
     */
    notifyBackupError(error) {
        const event = new CustomEvent('backup-error', { detail: error });
        window.dispatchEvent(event);

        if (window.electron?.notify) {
            window.electron.notify({
                title: 'Backup Failed',
                body: error.message,
                type: 'error'
            });
        }
    }

    /**
     * Notify restoration completion
     * @param {object} backup - Restored backup
     */
    notifyRestorationComplete(backup) {
        const event = new CustomEvent('restoration-complete', { detail: backup });
        window.dispatchEvent(event);

        if (window.electron?.notify) {
            window.electron.notify({
                title: 'Data Restored',
                body: `Successfully restored from backup: ${backup.label}`,
                type: 'success'
            });
        }
    }

    /**
     * Notify restoration error
     * @param {Error} error - Error object
     */
    notifyRestorationError(error) {
        const event = new CustomEvent('restoration-error', { detail: error });
        window.dispatchEvent(event);

        if (window.electron?.notify) {
            window.electron.notify({
                title: 'Restoration Failed',
                body: error.message,
                type: 'error'
            });
        }
    }

    /**
     * Get backup statistics
     * @returns {object} Backup statistics
     */
    getStatistics() {
        const backups = this.backupHistory;
        const totalSize = backups.reduce((sum, b) => sum + (b.dataSize || 0), 0);

        return {
            totalBackups: backups.length,
            totalSize: totalSize,
            oldestBackup: backups.length > 0 ? new Date(backups[backups.length - 1].timestamp) : null,
            newestBackup: backups.length > 0 ? new Date(backups[0].timestamp) : null,
            averageSize: backups.length > 0 ? Math.floor(totalSize / backups.length) : 0
        };
    }
}

// Initialize and expose to window
if (typeof window !== 'undefined') {
    window.backupRestoreSystem = new BackupRestoreSystem();

    // Expose main functions for easy access
    window.createBackup = (label) => window.backupRestoreSystem.createBackup(label);
    window.restoreBackup = (id) => window.backupRestoreSystem.restoreFromBackup(id);
    window.getBackups = () => window.backupRestoreSystem.getBackups();
    window.exportBackup = (id) => window.backupRestoreSystem.exportBackupFile(id);
    window.importBackup = (file) => window.backupRestoreSystem.importBackupFile(file);
    window.deleteBackup = (id) => window.backupRestoreSystem.deleteBackup(id);
}

// Export for Node.js/Electron environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BackupRestoreSystem;
}
