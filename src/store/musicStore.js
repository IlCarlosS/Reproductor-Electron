//musicStore.js
import { defineStore } from 'pinia';
// Creamos la instancia de audio fuera del objeto para evitar problemas de reactividad de Vue
const audio = new Audio();

export const useMusicStore = defineStore('music', {
  state: () => ({
    songs: [],
    folderPath: null, // <--- Faltaba esto
    currentSong: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.7,
    isFullScreen: false,
  }),

  actions: {
    // NUEVAS/RECUPERADAS: Para que ListaSong.vue no falle
    setSongs(songs) {
      this.songs = songs;
    },
    
    setFolderPath(path) {
      this.folderPath = path;
    },

    // LÓGICA DE AUDIO
    init() {
      audio.ontimeupdate = () => {
        this.currentTime = audio.currentTime;
      };
      audio.onloadedmetadata = () => {
        this.duration = audio.duration;
      };
      audio.onended = () => {
        this.nextSong();
      };
      audio.volume = this.volume;
    },

    setCurrentSong(song) {
      if (this.currentSong?.path === song.path) {
        this.togglePlay();
        return;
      }
      
      this.currentSong = song;

      // 1. Transformamos "D:\Music\..." en "D/Music/..." 
      // (Quitamos los ":" para que no rompa la URL de Chromium)
      const pathSinPuntos = song.path.replace(':', '');
      const pathConBarras = pathSinPuntos.replaceAll('\\', '/');

      // 2. Resultado final: atom://D/Music/Musica/archivo.flac
      audio.src = `atom://${pathConBarras}`;
      
      console.log("Intentando reproducir:", audio.src); // Para que verifiques en consola
      
      audio.play().catch(e => {
        console.error("Error de reproducción:", e);
      });
      
      this.isPlaying = true;
    },

    togglePlay() {
      if (!this.currentSong) return;
      
      if (this.isPlaying) {
        audio.pause();
      } else {
        audio.play().catch(e => console.error("Error al reanudar:", e));
      }
      this.isPlaying = !this.isPlaying;
    },

    seek(time) {
      if (!isNaN(time)) {
        audio.currentTime = time;
      }
    },

    updateVolume(value) {
      this.volume = parseFloat(value);
      audio.volume = this.volume;
    },

    nextSong() {
      if (this.songs.length === 0) return;
      const index = this.songs.findIndex(s => s.path === this.currentSong?.path);
      const nextIndex = (index + 1) % this.songs.length;
      this.setCurrentSong(this.songs[nextIndex]);
    },

    prevSong() {
      if (this.songs.length === 0) return;
      const index = this.songs.findIndex(s => s.path === this.currentSong?.path);
      const prevIndex = (index - 1 + this.songs.length) % this.songs.length;
      this.setCurrentSong(this.songs[prevIndex]);
    },

    sortAZ() {
      this.songs.sort((a, b) => a.name.localeCompare(b.name));
    },

    sortZA() {
      this.songs.sort((a, b) => b.name.localeCompare(a.name));
    },

    shuffleSongs() {
      // Algoritmo Fisher-Yates para un mezclado puramente aleatorio
      for (let i = this.songs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.songs[i], this.songs[j]] = [this.songs[j], this.songs[i]];
      }
    },
    
    toggleFullScreen() {
      this.isFullScreen = !this.isFullScreen;
    },
  }
});