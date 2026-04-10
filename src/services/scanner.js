// scanner.js
// Función auxiliar para el tiempo
const formatDuration = (seconds) => {
  if (!seconds) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const scanFolder = async (folderPath) => {
  const SUPPORTED_EXTENSIONS = ['.mp3', '.flac', '.opus', '.wav'];
  
  try {
    const files = window.electronAPI.readdir(folderPath);
    const musicFiles = files.filter(file => {
      const ext = '.' + file.split('.').pop().toLowerCase();
      return SUPPORTED_EXTENSIONS.includes(ext);
    });

    const songPromises = musicFiles.map(async (file) => {
      const ext = '.' + file.split('.').pop();
      const fullPath = window.electronAPI.join(folderPath, file);
      
      const meta = await window.electronAPI.getMetadata(fullPath);

      return {
        // Si no hay título en los metadatos, usamos el nombre del archivo
        name: meta?.title || window.electronAPI.basename(file, ext),
        path: fullPath,
        extension: ext,
        artist: meta?.artist || 'Artista desconocido',
        album: meta?.album || 'Álbum desconocido',
        duration: formatDuration(meta?.duration),
        cover: meta?.picture || null // Esto ya es el string "data:image..."
      };
    });

    return await Promise.all(songPromises);
  } catch (error) {
    console.error("Error en scanner:", error);
    return [];
  }
}