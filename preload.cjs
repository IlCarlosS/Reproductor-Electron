// preload.cjs
const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');
const mm = require('music-metadata');

contextBridge.exposeInMainWorld('electronAPI', {
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  readdir: (p) => fs.readdirSync(p),
  basename: (p, ext) => path.basename(p, ext),
  join: (...args) => path.join(...args),
  
  getMetadata: async (filePath) => {
    try {
      const metadata = await mm.parseFile(filePath);
      let coverBase64 = null;

      if (metadata.common.picture && metadata.common.picture.length > 0) {
        const pic = metadata.common.picture[0];
        
        // --- CAMBIO CRÍTICO AQUÍ ---
        // Forzamos a que sea un Buffer de Node y luego a base64
        const buffer = Buffer.from(pic.data);
        const base64String = buffer.toString('base64');
        
        // Algunos archivos devuelven 'jpg', otros 'image/jpeg'. Normalizamos:
        const mimeType = pic.format.includes('/') ? pic.format : `image/${pic.format}`;
        coverBase64 = `data:${mimeType};base64,${base64String}`;
      }

      return {
        title: metadata.common.title || null,
        artist: metadata.common.artist || 'Artista desconocido',
        album: metadata.common.album || 'Álbum desconocido',
        duration: metadata.format.duration || 0,
        picture: coverBase64 
      };
    } catch (error) {
      console.error("Error en getMetadata:", error);
      return null;
    }
  }
});