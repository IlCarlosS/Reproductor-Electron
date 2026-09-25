// main.js (electron)
import { app, BrowserWindow, ipcMain, dialog, protocol, net } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { pathToFileURL } from 'url';
import fs from 'fs';
import { existsSync, readFileSync, writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONFIG_PATH = path.join(app.getPath('userData'), 'player-settings.json');

// --- HANDLER PARA LEER ARCHIVOS DE TEXTO (.LRC) ---
ipcMain.handle('read-file', async (event, filePath) => {
  try {
    // Leemos el archivo con codificación utf-8 para obtener el texto
    const content = await fs.promises.readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    console.error("Error al leer el archivo:", error);
    return null;
  }
});

// --- 1. FUNCIÓN DE BÚSQUEDA PROFUNDA ---
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
          // Buscamos si existe un archivo .lrc con el mismo nombre
          const lrcPath = fullPath.replace(ext, '.lrc');
          const hasLyrics = fs.existsSync(lrcPath);

          // Ahora devolvemos un objeto con la info básica necesaria
          results.push({
            path: fullPath,
            name: file.name.replace(ext, ''),
            extension: ext,
            lrcPath: hasLyrics ? lrcPath : null
          });
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

//abre el diálogo para elegir la carpeta
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  return result.canceled ? null : result.filePaths[0];
});

//buscar todas las rutas de canciones
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
    autoHideMenuBar: true,
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
  protocol.handle('atom', (request) => {
    try {
      // request.url es "atom://C/Users/..." en Windows o "atom://home/usuario/..." en Linux
      // Le quitamos el prefijo 'atom://'
      let rawPath = decodeURIComponent(request.url.replace(/^atom:\/\//, ''));

      let fullPath;

      if (process.platform === 'win32') {
        // En Windows, reconstruimos la letra de unidad (ej: "C/Users..." -> "C:/Users...")
        if (rawPath.length >= 2 && rawPath[1] === '/') {
          fullPath = rawPath[0] + ':' + rawPath.slice(1);
        } else {
          fullPath = rawPath;
        }
      } else {
        // En Linux / macOS, aseguramos que la ruta comience con '/'
        fullPath = rawPath.startsWith('/') ? rawPath : '/' + rawPath;
      }

      // Convertimos la ruta normalizada del sistema a una URL de archivo válida (file:///)
      const fileUrl = pathToFileURL(path.normalize(fullPath)).toString();

      return net.fetch(fileUrl);
    } catch (error) {
      console.error('Error fatal en protocolo atom:', error);
      return new Response('File not found', { status: 404 });
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