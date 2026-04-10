// main.js (electron)
import { app, BrowserWindow, ipcMain, dialog, protocol } from 'electron'; // Añadimos protocol aquí
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Registrar el esquema antes de que la app esté lista
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
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.resolve(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  });

  win.loadURL('http://localhost:5173');
  
  // Opcional: abrir herramientas de desarrollo para ver errores de audio
  // win.webContents.openDevTools();
}

ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  
  if (result.canceled) {
    return null;
  } else {
    return result.filePaths[0];
  }
});

// 2. Manejar el estado Ready correctamente
app.whenReady().then(() => {
  protocol.registerFileProtocol('atom', (request, callback) => {
    try {
      // 1. Usamos el constructor URL para que Node parsee la ruta por nosotros
      const url = new URL(request.url);
      
      // En tu error: url.host es "d" y url.pathname es "/Music/Musica/..."
      // 2. Decodificamos los caracteres especiales (como ese %C2%B4 de la tilde)
      const drive = url.host; 
      const filePath = decodeURIComponent(url.pathname);
      
      // 3. Reconstruimos la ruta de Windows: "D" + ":" + "/Music/..."
      // path.join se encarga de que las barras sean las correctas (\ o /)
      const fullPath = path.normalize(`${drive}:${filePath}`);

      callback({ path: fullPath });
    } catch (error) {
      console.error('Error fatal en protocolo atom:', error);
      callback({ error: -6 }); // ERR_FILE_NOT_FOUND
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