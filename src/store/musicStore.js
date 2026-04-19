// musicStore.js
import { defineStore } from 'pinia';

// Mantenemos UNA SOLA instancia para todo el ciclo de vida de la app
const audio = new Audio();
let audioCtx = null;
let analyser = null;
let source = null;

export const useMusicStore = defineStore('music', {
  state: () => ({
    songs: [],
    folderPath: null,
    currentSong: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.7,
    isFullScreen: false,
    repeatMode: 'all', // Opciones: 'none', 'all', 'one'
  }),

  actions: {
    setSongs(songs) {
      this.songs = songs;
    },
    
    setFolderPath(path) {
      this.folderPath = path;
    },

    // LÓGICA DE AUDIO UNIFICADA
    init() {
      audio.ontimeupdate = () => {
        this.currentTime = audio.currentTime;
      };
      audio.onloadedmetadata = () => {
        this.duration = audio.duration;
      };
      audio.onended = () => {
        if (this.repeatMode === 'one') {
          audio.currentTime = 0;
          audio.play();
        } else if (this.repeatMode === 'all') {
          this.nextSong();
        } else {
          // 'none': si es la última canción, paramos. Si no, siguiente.
          const index = this.songs.findIndex(s => s.path === this.currentSong?.path);
          if (index < this.songs.length - 1) {
            this.nextSong();
          } else {
            this.isPlaying = false;
          }
        }
      };
      audio.volume = this.volume;
    },

    getAnalyser() {
      if (!analyser) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;

        // Conectamos el ÚNICO objeto audio al analizador
        source = audioCtx.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
      }
      
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      
      return analyser;
    },

    // Retornamos la instancia única para cualquier componente que la necesite
    getNativeAudio() {
      return audio;
    },
    
    setCurrentSong(song) {
      if (this.currentSong?.path === song.path) {
        this.togglePlay();
        return;
      }
      
      this.currentSong = song;

      // Limpieza de ruta para Electron
      const pathSinPuntos = song.path.replace(':', '');
      const pathConBarras = pathSinPuntos.replaceAll('\\', '/');

      // Cargamos la fuente en nuestra instancia única
      audio.src = `atom://${pathConBarras}`;
      
      audio.play().catch(e => {
        console.error("Error de reproducción:", e);
      });
      
      this.isPlaying = true;
    },

    togglePlay() {
      if (!this.currentSong) return;
      
      // Inicializamos el analizador si no existe al primer play
      this.getAnalyser();
      
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

    // Unificamos el manejo de volumen
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

    shuffleSongs() {
      for (let i = this.songs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.songs[i], this.songs[j]] = [this.songs[j], this.songs[i]];
      }
    },
    
    toggleFullScreen() {
      this.isFullScreen = !this.isFullScreen;
    },

    toggleRepeatMode() {
      const modes = ['none', 'all', 'one'];
      const currentIndex = modes.indexOf(this.repeatMode);
      this.repeatMode = modes[(currentIndex + 1) % modes.length];
    },
  }
});