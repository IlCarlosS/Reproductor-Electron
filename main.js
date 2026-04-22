// main.js (electron)
import { app, BrowserWindow, ipcMain, dialog, protocol } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { existsSync, readFileSync, writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONFIG_PATH = path.join(app.getPath('userData'), 'player-settings.json');

// --- 1. FUNCIÓN DE BÚSQUEDA PROFUNDA (AÑADIR ESTO) ---
async function getFilesRecursively(dirPath) {
  const SUPPORTED_EXTS = ['.mp3', '.flac', '.opus', '.wav'];
  let results = [];
  
  try {
    // IMPORTANTE: Usamos fs.promises.readdir para poder usar 'await'
    const list = await fs.promises.readdir(dirPath, { withFileTypes: true });

    for (const file of list) {
      const fullPath = path.join(dirPath, file.name);
      
      if (file.isDirectory()) {
        const recursiveResults = await getFilesRecursively(fullPath);
        results = results.concat(recursiveResults);
      } else {
        const ext = path.extname(file.name).toLowerCase();
        if (SUPPORTED_EXTS.includes(ext)) {
          results.push(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`Error escaneando: ${dirPath}`, error);
  }
  return results;
}

// Helper para leer la configuración inicial de forma síncrona al arrancar
function getInitialSettings() {
  try {
    if (existsSync(CONFIG_PATH)) {
      return JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
    }
  } catch (e) {
    console.error("Error leyendo settings:", e);
  }
  return { lastFolder: null, lastSongPath: null, volume: 0.5 };
}

// --- 2. HANDLERS PARA COMUNICACIÓN CON VUE ---

// Este solo abre el diálogo para elegir la carpeta
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  return result.canceled ? null : result.filePaths[0];
});

// Este hace el trabajo sucio de buscar todas las rutas de canciones (AÑADIR ESTO)
ipcMain.handle('get-settings', () => {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const data = fs.readFileSync(CONFIG_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error al leer settings:", error);
  }
  return {};
});

ipcMain.handle('save-settings', (event, newSettings) => {
  try {
    let currentConfig = {};
    if (fs.existsSync(CONFIG_PATH)) {
      const data = fs.readFileSync(CONFIG_PATH, 'utf-8');
      currentConfig = JSON.parse(data);
    }

    const updatedConfig = { ...currentConfig, ...newSettings };
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(updatedConfig, null, 2));
    return true;
  } catch (error) {
    console.error("Error al persistir datos:", error);
    return false;
  }
});

// Handler para el escaneo
ipcMain.handle('scan-directory', async (event, folderPath) => {
  return await getFilesRecursively(folderPath);
});

// 3. Configuración de Protocolo y Ventana (Se mantiene igual)
protocol.registerSchemesAsPrivileged([
  { 
    scheme: 'atom', 
    privileges: { 
      secure: true, 
      standard: true, 
      supportFetchAPI: true, 
      bypassCSP: true, 
      stream: true 
    } 
  }
]);

function createWindow() {
  // Cambiamos 'win' por 'mainWindow' para que coincida con lo de abajo
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  });

  // Ahora 'mainWindow' sí existe y funcionará
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173');
    // mainWindow.webContents.openDevTools(); 
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }
}

app.whenReady().then(() => {
  protocol.registerFileProtocol('atom', (request, callback) => {
    try {
      const url = new URL(request.url);
      const drive = url.host; 
      const filePath = decodeURIComponent(url.pathname);
      const fullPath = path.normalize(`${drive}:${filePath}`);
      callback({ path: fullPath });
    } catch (error) {
      console.error('Error fatal en protocolo atom:', error);
      callback({ error: -6 });
    }
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});