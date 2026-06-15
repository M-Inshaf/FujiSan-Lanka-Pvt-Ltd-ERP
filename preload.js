/**
 * HUMMINGBIRD CLOTHING ERP - ELECTRON PRELOAD SCRIPT
 * preload.js
 * 
 * Secure IPC bridge between renderer and main process
 * Exposes controlled APIs to the renderer process via context isolation
 */

const { contextBridge, ipcRenderer } = require('electron');

/**
 * Expose secure APIs to renderer process via context bridge
 * Only explicitly exposed functions are available in the renderer
 */
contextBridge.exposeInMainWorld('electronAPI', {
  /**
   * FILE SYSTEM OPERATIONS
   */
  file: {
    read: (filePath) => ipcRenderer.invoke('file:read', filePath),
    write: (filePath, content) => ipcRenderer.invoke('file:write', filePath, content),
    delete: (filePath) => ipcRenderer.invoke('file:delete', filePath),
    exists: (filePath) => ipcRenderer.invoke('file:exists', filePath),
    listDir: (dirPath) => ipcRenderer.invoke('file:listDir', dirPath),
    mkdir: (dirPath) => ipcRenderer.invoke('file:mkdir', dirPath),
    stats: (filePath) => ipcRenderer.invoke('file:stats', filePath),
    savePdf: (filename, pdfBytes) => ipcRenderer.invoke('file:savePdf', filename, pdfBytes),
    saveExcel: (filename, excelBytes) => ipcRenderer.invoke('file:saveExcel', filename, excelBytes),
    open: (filePath) => ipcRenderer.invoke('file:open', filePath),
    showInFolder: (filePath) => ipcRenderer.invoke('file:showInFolder', filePath)
  },

  /**
   * FILE DIALOGS
   */
  dialog: {
    saveFile: (options) => ipcRenderer.invoke('dialog:saveFile', options),
    openFile: (options) => ipcRenderer.invoke('dialog:openFile', options),
    showMessage: (options) => ipcRenderer.invoke('dialog:showMessage', options)
  },

  /**
   * WINDOW OPERATIONS
   */
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close'),
    setTitle: (title) => ipcRenderer.invoke('window:setTitle', title),
    print: () => ipcRenderer.invoke('window:print'),
    reload: () => ipcRenderer.invoke('window:reload')
  },

  /**
   * APPLICATION INFORMATION
   */
  app: {
    getVersion: () => ipcRenderer.invoke('app:getVersion'),
    getDataPath: () => ipcRenderer.invoke('app:getDataPath'),
    getInfo: () => ipcRenderer.invoke('app:getInfo')
  },

  /**
   * NOTIFICATION SYSTEM
   */
  notification: {
    send: (title, options) => {
      // Uses Notification API (available in renderer)
      if ('Notification' in window) {
        return new Notification(title, options);
      }
    },
    requestPermission: () => {
      if ('Notification' in window) {
        return Notification.requestPermission();
      }
      return Promise.resolve('denied');
    }
  },

  /**
   * STORAGE UTILITIES
   */
  storage: {
    // LocalStorage is already available, but we provide wrapper for consistency
    setItem: (key, value) => {
      try {
        localStorage.setItem(key, value);
        return true;
      } catch (error) {
        console.error('Storage error:', error);
        return false;
      }
    },
    getItem: (key) => {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.error('Storage error:', error);
        return null;
      }
    },
    removeItem: (key) => {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (error) {
        console.error('Storage error:', error);
        return false;
      }
    },
    clear: () => {
      try {
        localStorage.clear();
        return true;
      } catch (error) {
        console.error('Storage error:', error);
        return false;
      }
    }
  },

  /**
   * BACKUP AND RESTORE
   */
  backup: {
    // File operations are handled through file.savePdf and file.saveExcel
    // Backup logic is implemented in settings.js module
    createBackup: async (backupData) => {
      try {
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `backup_${timestamp}.json`;
        const dataStr = JSON.stringify(backupData, null, 2);
        
        // Convert string to bytes for file save
        const encoder = new TextEncoder();
        const bytes = encoder.encode(dataStr);
        
        return await ipcRenderer.invoke('file:savePdf', filename, bytes);
      } catch (error) {
        console.error('Backup error:', error);
        throw error;
      }
    },
    
    restoreBackup: async (filePath) => {
      try {
        return await ipcRenderer.invoke('file:read', filePath);
      } catch (error) {
        console.error('Restore error:', error);
        throw error;
      }
    }
  },

  /**
   * PLATFORM INFORMATION
   */
  platform: {
    isWindows: process.platform === 'win32',
    isMac: process.platform === 'darwin',
    isLinux: process.platform === 'linux',
    getPlatform: () => process.platform,
    getArch: () => process.arch
  },

  /**
   * PROCESS INFORMATION
   */
  process: {
    getNodeVersion: () => process.versions.node,
    getChromeVersion: () => process.versions.chrome,
    getElectronVersion: () => process.versions.electron,
    getEnv: () => process.env.NODE_ENV || 'production'
  }
});

/**
 * Prevent navigation to external URLs
 * Keep app within the ERP interface
 */
window.addEventListener('new-window', (event) => {
  event.preventDefault();
});

/**
 * Handle drag and drop files
 * Useful for imports and file uploads
 */
document.addEventListener('dragover', (event) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'copy';
});

document.addEventListener('drop', (event) => {
  event.preventDefault();
  const files = event.dataTransfer.files;
  
  // Dispatch custom event for app to handle
  const dropEvent = new CustomEvent('filesDropped', {
    detail: { files: Array.from(files) }
  });
  document.dispatchEvent(dropEvent);
});

/**
 * Console logging wrapper (development only)
 */
if (process.env.NODE_ENV === 'development') {
  contextBridge.exposeInMainWorld('__DEV__', {
    log: console.log,
    warn: console.warn,
    error: console.error
  });
}

console.log('Preload script loaded - Renderer context initialized');
