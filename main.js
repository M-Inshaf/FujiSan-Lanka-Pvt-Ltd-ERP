/**
 * HUMMINGBIRD CLOTHING ERP - ELECTRON MAIN PROCESS
 * main.js
 * 
 * Electron application entry point with window management, IPC communication, and file system integration
 */

const { app, BrowserWindow, ipcMain, Menu, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = require('electron-is-dev');

let mainWindow;
let appDataPath;

/**
 * Application event: App ready
 * Create main application window
 */
app.on('ready', () => {
  appDataPath = app.getPath('userData');
  ensureDataDirectory();
  createWindow();
  setupIPCHandlers();
  createMenu();
});

/**
 * Application event: Window all closed
 * Quit app when all windows are closed (macOS behavior)
 */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * Application event: App activate (macOS)
 * Re-create window when app is activated
 */
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

/**
 * Create main application window
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false,
      sandbox: true
    },
    icon: path.join(__dirname, 'assets/images/icon.png')
  });

  // Load URL
  const startURL = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`;

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle any uncaught exceptions
  mainWindow.webContents.on('crashed', () => {
    dialog.showErrorBox('Application Error', 'The application has crashed. Please restart.');
    mainWindow.reload();
  });
}

/**
 * Ensure data directory exists
 */
function ensureDataDirectory() {
  const dataDir = path.join(appDataPath, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

/**
 * Setup IPC handlers for renderer communication
 */
function setupIPCHandlers() {
  /**
   * IPC: Read file
   */
  ipcMain.handle('file:read', async (event, filePath) => {
    try {
      const fullPath = path.join(appDataPath, filePath);
      return fs.readFileSync(fullPath, 'utf-8');
    } catch (error) {
      console.error('Error reading file:', error);
      throw error;
    }
  });

  /**
   * IPC: Write file
   */
  ipcMain.handle('file:write', async (event, filePath, content) => {
    try {
      const fullPath = path.join(appDataPath, filePath);
      const dir = path.dirname(fullPath);
      
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(fullPath, content, 'utf-8');
      return true;
    } catch (error) {
      console.error('Error writing file:', error);
      throw error;
    }
  });

  /**
   * IPC: Delete file
   */
  ipcMain.handle('file:delete', async (event, filePath) => {
    try {
      const fullPath = path.join(appDataPath, filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  });

  /**
   * IPC: List files in directory
   */
  ipcMain.handle('file:listDir', async (event, dirPath) => {
    try {
      const fullPath = path.join(appDataPath, dirPath);
      if (!fs.existsSync(fullPath)) {
        return [];
      }
      return fs.readdirSync(fullPath);
    } catch (error) {
      console.error('Error listing directory:', error);
      throw error;
    }
  });

  /**
   * IPC: Create directory
   */
  ipcMain.handle('file:mkdir', async (event, dirPath) => {
    try {
      const fullPath = path.join(appDataPath, dirPath);
      fs.mkdirSync(fullPath, { recursive: true });
      return true;
    } catch (error) {
      console.error('Error creating directory:', error);
      throw error;
    }
  });

  /**
   * IPC: Check if file exists
   */
  ipcMain.handle('file:exists', async (event, filePath) => {
    try {
      const fullPath = path.join(appDataPath, filePath);
      return fs.existsSync(fullPath);
    } catch (error) {
      console.error('Error checking file existence:', error);
      return false;
    }
  });

  /**
   * IPC: Get file stats
   */
  ipcMain.handle('file:stats', async (event, filePath) => {
    try {
      const fullPath = path.join(appDataPath, filePath);
      const stats = fs.statSync(fullPath);
      return {
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
        size: stats.size,
        modified: stats.mtime.toISOString(),
        created: stats.birthtime.toISOString()
      };
    } catch (error) {
      console.error('Error getting file stats:', error);
      throw error;
    }
  });

  /**
   * IPC: Save file dialog
   */
  ipcMain.handle('dialog:saveFile', async (event, options) => {
    const result = await dialog.showSaveDialog(mainWindow, {
      defaultPath: options.defaultPath || '',
      filters: options.filters || [],
      title: options.title || 'Save File'
    });
    return result.filePath || null;
  });

  /**
   * IPC: Open file dialog
   */
  ipcMain.handle('dialog:openFile', async (event, options) => {
    const result = await dialog.showOpenDialog(mainWindow, {
      defaultPath: options.defaultPath || '',
      filters: options.filters || [],
      title: options.title || 'Open File',
      properties: ['openFile']
    });
    return result.filePaths[0] || null;
  });

  /**
   * IPC: Show message dialog
   */
  ipcMain.handle('dialog:showMessage', async (event, options) => {
    const result = await dialog.showMessageBox(mainWindow, {
      type: options.type || 'info',
      title: options.title || 'Message',
      message: options.message || '',
      buttons: options.buttons || ['OK']
    });
    return result.response;
  });

  /**
   * IPC: Save PDF to file
   */
  ipcMain.handle('file:savePdf', async (event, filename, pdfBytes) => {
    try {
      const savePath = await dialog.showSaveDialog(mainWindow, {
        defaultPath: filename,
        filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
      });

      if (savePath.canceled) return null;

      const buffer = Buffer.from(pdfBytes);
      fs.writeFileSync(savePath.filePath, buffer);
      return savePath.filePath;
    } catch (error) {
      console.error('Error saving PDF:', error);
      throw error;
    }
  });

  /**
   * IPC: Save Excel to file
   */
  ipcMain.handle('file:saveExcel', async (event, filename, excelBytes) => {
    try {
      const savePath = await dialog.showSaveDialog(mainWindow, {
        defaultPath: filename,
        filters: [{ name: 'Excel Files', extensions: ['xlsx'] }]
      });

      if (savePath.canceled) return null;

      const buffer = Buffer.from(excelBytes);
      fs.writeFileSync(savePath.filePath, buffer);
      return savePath.filePath;
    } catch (error) {
      console.error('Error saving Excel:', error);
      throw error;
    }
  });

  /**
   * IPC: Open file in default application
   */
  ipcMain.handle('file:open', async (event, filePath) => {
    try {
      await shell.openPath(filePath);
      return true;
    } catch (error) {
      console.error('Error opening file:', error);
      throw error;
    }
  });

  /**
   * IPC: Show file in file manager
   */
  ipcMain.handle('file:showInFolder', async (event, filePath) => {
    try {
      shell.showItemInFolder(filePath);
      return true;
    } catch (error) {
      console.error('Error showing in folder:', error);
      throw error;
    }
  });

  /**
   * IPC: Get app version
   */
  ipcMain.handle('app:getVersion', () => {
    return app.getVersion();
  });

  /**
   * IPC: Get app data path
   */
  ipcMain.handle('app:getDataPath', () => {
    return appDataPath;
  });

  /**
   * IPC: Get app info
   */
  ipcMain.handle('app:getInfo', () => {
    return {
      version: app.getVersion(),
      name: app.name,
      buildVersion: '1.0.0',
      platform: process.platform,
      nodeVersion: process.versions.node,
      chromeVersion: process.versions.chrome,
      electronVersion: process.versions.electron,
      dataPath: appDataPath,
      isDev: isDev
    };
  });

  /**
   * IPC: Minimize window
   */
  ipcMain.on('window:minimize', () => {
    if (mainWindow) mainWindow.minimize();
  });

  /**
   * IPC: Maximize window
   */
  ipcMain.on('window:maximize', () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    }
  });

  /**
   * IPC: Close window
   */
  ipcMain.on('window:close', () => {
    if (mainWindow) mainWindow.close();
  });

  /**
   * IPC: Set window title
   */
  ipcMain.handle('window:setTitle', (event, title) => {
    if (mainWindow) mainWindow.setTitle(title);
    return true;
  });

  /**
   * IPC: Print window
   */
  ipcMain.handle('window:print', () => {
    if (mainWindow) {
      mainWindow.webContents.print();
    }
    return true;
  });

  /**
   * IPC: Reload window
   */
  ipcMain.handle('window:reload', () => {
    if (mainWindow) mainWindow.reload();
    return true;
  });
}

/**
 * Create application menu
 */
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About Hummingbird Clothing ERP',
              message: 'Hummingbird Clothing ERP',
              detail: 'A complete enterprise resource planning system for clothing manufacturing.\n\nVersion: 1.0.0\nDeveloped by: FujiSan Lanka Pvt Ltd'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

/**
 * Handle any uncaught exceptions
 */
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  dialog.showErrorBox('Application Error', 'An unexpected error occurred. Please restart the application.');
});

/**
 * Export module (required by Node.js)
 */
module.exports = {
  createWindow,
  setupIPCHandlers,
  ensureDataDirectory
};
