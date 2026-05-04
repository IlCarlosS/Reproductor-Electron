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
    // 1. Obtenemos el array de objetos { path, name, extension, lrcPath } desde main.js
    const allFiles = await window.electronAPI.scanDirectory(folderPath);

    // 2. Procesamos cada objeto para extraer metadatos
    const songPromises = allFiles.map(async (fileData) => {
      
      // Extraemos metadatos usando la ruta que viene en el objeto
      const meta = await window.electronAPI.getMetadata(fileData.path);

      return {
        // Usamos el título del metadato o el nombre que ya extrajo main.js
        name: meta?.title || fileData.name,
        path: fileData.path,
        extension: fileData.extension,
        // Pasamos la info de las letras directamente al Store
        lrcPath: fileData.lrcPath,
        hasLyrics: !!fileData.lrcPath,
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