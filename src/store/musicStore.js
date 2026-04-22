// musicStore.js
import { defineStore } from 'pinia';
import { scanFolder } from '../services/scanner';

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
    currentSong: null,
    folderPath: null,
  }),

  actions: {
    async setFolderPath(path) {
      this.folderPath = path;
      // Guardamos la carpeta en el JSON inmediatamente
      await window.electronAPI.saveSettings({ lastFolder: path });
    },
    setSongs(songs) {
      this.songs = songs;
    },
    // LÓGICA DE AUDIO UNIFICADA
    async init() {
      // 1. Configuramos eventos de audio
      audio.ontimeupdate = () => { this.currentTime = audio.currentTime; };
      audio.onloadedmetadata = () => { this.duration = audio.duration; };
      audio.onended = () => { this.nextSong(); };
      
      // 2. Cargamos persistencia
      const settings = await window.electronAPI.getSettings();
      
      if (settings.volume !== undefined) {
        this.volume = settings.volume;
        audio.volume = this.volume;
      }

      if (settings.lastFolder) {
        this.folderPath = settings.lastFolder;
        // Escaneo profundo automático
        const results = await scanFolder(settings.lastFolder);
        this.songs = results;

        // 3. Recuperar última canción (SIN reproducir automáticamente)
        if (settings.lastSongPath && this.songs.length > 0) {
          const savedSong = this.songs.find(s => s.path === settings.lastSongPath);
          if (savedSong) {
            this.loadSong(savedSong, false); // false = no autoplay
          }
        }
      }
    },

    async initStore() {
      const settings = await window.electronAPI.getSettings();
      
      if (settings.volume !== undefined) {
        this.volume = settings.volume;
        // Asignar el volumen al objeto audio directamente también
        const audio = this.getNativeAudio();
        audio.volume = this.volume;
      }

      if (settings.lastFolder) {
        this.folderPath = settings.lastFolder;
        
        // 1. Escaneamos para recuperar la lista de canciones
        const results = await scanFolder(settings.lastFolder);
        this.songs = results;

        // 2. Solo si hay canciones, buscamos la última reproducida
        if (settings.lastSongPath && this.songs.length > 0) {
          const savedSong = this.songs.find(s => s.path === settings.lastSongPath);
          if (savedSong) {
            // Usamos loadSong con false para no disparar el Play automático
            this.loadSong(savedSong, false); 
          }
        }
      }
    },

    // 2. LÓGICA DE CARGA Y REPRODUCCIÓN (UNIFICADA)
    async loadFolder(path) {
      this.folderPath = path;
      await window.electronAPI.saveSettings({ lastFolder: path });
      const results = await scanFolder(path);
      this.songs = results;
    },

    // Esta función hace todo: guarda, formatea y suena
    setCurrentSong(song) {
      if (this.currentSong?.path === song.path) {
        this.togglePlay();
        return;
      }
      this.loadSong(song, true);
    },

    loadSong(song, shouldPlay = true) {
      this.currentSong = song;
      // Guardamos la canción en el JSON sin borrar la carpeta (gracias al spread en main.js)
      window.electronAPI.saveSettings({ lastSongPath: song.path });

      const pathSinPuntos = song.path.replace(':', '');
      const pathConBarras = pathSinPuntos.replaceAll('\\', '/');
      audio.src = `atom://${pathConBarras}`;
      
      if (shouldPlay) {
        audio.play().catch(e => {
          if (e.name !== 'AbortError') console.error("Error play:", e);
        });
        this.isPlaying = true;
      } else {
        this.isPlaying = false;
      }
    },

    togglePlay() {
      if (!this.currentSong) return;
      this.getAnalyser();
      
      if (this.isPlaying) {
        audio.pause();
      } else {
        audio.play().catch(e => {
          if (e.name !== 'AbortError') console.error("Error al reanudar:", e);
        });
      }
      this.isPlaying = !this.isPlaying;
    },

    getAnalyser() {
      if (!analyser) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source = audioCtx.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
      }
      if (audioCtx.state === 'suspended') audioCtx.resume();
      return analyser;
    },

    // Retornamos la instancia única para cualquier componente que la necesite
    getNativeAudio() {
      return audio;
    },
    
    // Función auxiliar para no repetir código
    loadSong(song, shouldPlay) {
      this.currentSong = song;
      window.electronAPI.saveSettings({ lastSongPath: song.path });

      const pathSinPuntos = song.path.replace(':', '');
      const pathConBarras = pathSinPuntos.replaceAll('\\', '/');
      audio.src = `atom://${pathConBarras}`;
      
      if (shouldPlay) {
        this.isPlaying = true;
        audio.play().catch(e => {
          if (e.name !== 'AbortError') console.error("Error de reproducción:", e);
        });
      } else {
        this.isPlaying = false;
      }
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
      window.electronAPI.saveSettings({ volume: this.volume });
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

    sortAZ() {
      // Ordenamos de la A a la Z basándonos en el nombre
      this.songs.sort((a, b) => a.name.localeCompare(b.name));
    },

    sortZA() {
      // Ordenamos de la Z a la A
      this.songs.sort((a, b) => b.name.localeCompare(a.name));
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