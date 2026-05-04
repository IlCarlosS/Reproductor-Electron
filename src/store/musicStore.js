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
    lyrics: [],
  }),

  getters: {
    // Encuentra el índice de la letra que corresponde al tiempo actual
    currentLyricIndex(state) {
      if (!state.lyrics.length) return -1;
      // Buscamos la última línea cuyo tiempo sea menor o igual al actual
      return state.lyrics.findLastIndex(line => line.time <= state.currentTime);
    }
  },

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
      this.lyrics = [];
      if (song.lrcPath) {
        this.loadLyrics();
      }
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

    //Shuffle From Here: La elegida va primero, el resto se mezcla
    shuffleFromHere(targetSong) {
      // Filtramos la elegida para no duplicarla
      const otherSongs = this.songs.filter(s => s.path !== targetSong.path);
      
      // Algoritmo de Fisher-Yates para las demás
      for (let i = otherSongs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [otherSongs[i], otherSongs[j]] = [otherSongs[j], otherSongs[i]];
      }
      
      // Reconstruimos la lista: la elegida primero + las mezcladas
      this.songs = [targetSong, ...otherSongs];
      
      // Iniciamos la reproducción inmediatamente
      this.setCurrentSong(targetSong);
    },

    // Play Next: Mueve la canción justo después de la actual
    playNext(targetSong) {
      // Si no hay canción sonando, la ponemos al principio
      if (!this.currentSong) {
        const filtered = this.songs.filter(s => s.path !== targetSong.path);
        this.songs = [targetSong, ...filtered];
        return;
      }

      // Si la elegida es la que ya está sonando, no hacemos nada
      if (this.currentSong.path === targetSong.path) return;

      // Eliminamos la canción de su posición actual
      const filteredSongs = this.songs.filter(s => s.path !== targetSong.path);
      
      // Buscamos el nuevo índice de la canción actual (que pudo cambiar al filtrar)
      const currentIndex = filteredSongs.findIndex(s => s.path === this.currentSong.path);
      
      // La insertamos justo después
      filteredSongs.splice(currentIndex + 1, 0, targetSong);
      
      this.songs = filteredSongs;
    },

    // Remove from List: Filtra la canción del array actual
    removeFromList(targetSong) {
      // Si la canción a eliminar es la que está sonando, pasamos a la siguiente primero
      if (this.currentSong?.path === targetSong.path) {
        this.nextSong();
      }
      
      this.songs = this.songs.filter(s => s.path !== targetSong.path);
    },

    async loadLyrics() {
      // Si la canción no tiene ruta de letra, limpiamos el estado
      if (!this.currentSong?.lrcPath) {
        this.lyrics = [];
        return;
      }

      try {
        const rawText = await window.electronAPI.readLyricsFile(this.currentSong.lrcPath);
        if (rawText) {
          this.lyrics = this.parseLRC(rawText);
        }
      } catch (error) {
        console.error("Error al cargar letras:", error);
        this.lyrics = [];
      }
    },

    parseLRC(text) {
      const lines = text.split('\n');
      const lrcArray = [];
      // Regex para capturar [minutos:segundos.milisegundos]
      const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

      lines.forEach(line => {
        const match = timeRegex.exec(line);
        if (match) {
          const minutes = parseInt(match[1]);
          const seconds = parseInt(match[2]);
          const ms = parseInt(match[3]);
          
          // Convertimos a segundos totales (punto flotante)
          // El formato .lrc suele usar centésimas (2 dígitos) o milésimas (3 dígitos)
          const time = minutes * 60 + seconds + (ms > 99 ? ms / 1000 : ms / 100);
          const lyricText = line.replace(timeRegex, '').trim();
          
          if (lyricText) {
            lrcArray.push({ time, text: lyricText });
          }
        }
      });
      
      // Aseguramos que estén ordenadas por tiempo
      return lrcArray.sort((a, b) => a.time - b.time);
    },
  }
});