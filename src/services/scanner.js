// scanner.js
// Función auxiliar para formatear el tiempo (00:00)
const formatDuration = (seconds) => {
  if (!seconds) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const scanFolder = async (folderPath) => {
  try {
    // 1. Llamamos a la nueva función recursiva de Electron que creamos en main.js
    // Esto nos devuelve un Array con TODAS las rutas completas de archivos válidos
    const allFilePaths = await window.electronAPI.scanDirectory(folderPath);

    // 2. Procesamos cada ruta encontrada para extraer sus metadatos
    const songPromises = allFilePaths.map(async (fullPath) => {
      // Obtenemos la extensión y el nombre base del archivo para casos sin tags
      const ext = '.' + fullPath.split('.').pop();
      const fileName = window.electronAPI.basename(fullPath, ext);
      
      // Extraemos metadatos (título, artista, album, duración, cover)
      const meta = await window.electronAPI.getMetadata(fullPath);

      return {
        // Si el archivo no tiene tag de título, usamos el nombre del archivo
        name: meta?.title || fileName,
        path: fullPath,
        extension: ext,
        artist: meta?.artist || 'Artista desconocido',
        album: meta?.album || 'Álbum desconocido',
        duration: formatDuration(meta?.duration),
        cover: meta?.picture || null 
      };
    });

    // Esperamos a que todos los metadatos se procesen
    return await Promise.all(songPromises);

  } catch (error) {
    console.error("Error en el escaneo profundo (scanner.js):", error);
    return [];
  }
}