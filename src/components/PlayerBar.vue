<script setup>
import { useMusicStore } from '../store/musicStore';

const musicStore = useMusicStore();
musicStore.init(); // Inicializamos los eventos al cargar la barra

// Formateador de tiempo (00:00)
const formatTime = (seconds) => {
  if (!seconds) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Función para cuando el usuario mueve la barra de progreso
const handleSeek = (e) => {
  const newTime = (e.target.value / 100) * musicStore.duration;
  musicStore.seek(newTime);
};
</script>

<template>
  <footer v-if="musicStore.currentSong" class="h-24 w-full bg-fondo border-t border-white/5 px-8 flex items-center justify-between shadow-neu">
    
    <div @click="musicStore.toggleFullScreen()" class="flex items-center gap-4 w-1/4">
      <div class="w-14 h-14 rounded-xl overflow-hidden neu-pressed p-1">
        <img v-if="musicStore.currentSong.cover" :src="musicStore.currentSong.cover" class="w-full h-full object-cover rounded-lg" />
      </div>
      <div class="flex flex-col truncate">
        <span class="text-blanco font-semibold truncate">{{ musicStore.currentSong.name }}</span>
        <span class="text-xs text-muted truncate">{{ musicStore.currentSong.artist }}</span>
      </div>
    </div>

    <div class="flex flex-col items-center gap-2 flex-1 max-w-2xl">
      <div class="flex items-center gap-6">
        <button @click="musicStore.prevSong()" class="text-muted hover:text-accent transition-colors">
          <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
        </button>
        
        <button @click="musicStore.togglePlay()" class="w-12 h-12 rounded-full neu-flat flex items-center justify-center text-accent active:neu-pressed">
          <svg v-if="!musicStore.isPlaying" width="28" height="28" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          <svg v-else width="28" height="28" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
        </button>

        <button @click="musicStore.nextSong()" class="text-muted hover:text-accent transition-colors">
          <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
        </button>
      </div>

      <div class="w-full flex items-center gap-3 px-4 group">
        <span class="text-[10px] font-mono text-muted w-10 text-right">{{ formatTime(musicStore.currentTime) }}</span>
        
        <div class="flex-1 relative h-6 flex items-center">
          <input 
            type="range" 
            min="0" 
            max="100" 
            :value="(musicStore.currentTime / musicStore.duration) * 100 || 0"
            @input="handleSeek"
            class="absolute w-full h-1 z-10 cursor-pointer opacity-0"
          >
          <div class="w-full h-2 rounded-full neu-pressed overflow-hidden relative">
            <div 
              class="absolute top-0 left-0 h-full bg-accent shadow-[0_0_10px_rgba(240,181,54,0.5)] transition-all duration-100"
              :style="{ width: `${(musicStore.currentTime / musicStore.duration) * 100 || 0}%` }"
            ></div>
          </div>
        </div>

        <span class="text-[10px] font-mono text-muted w-10">{{ formatTime(musicStore.duration) }}</span>
      </div>
    </div>

    <div class="flex items-center justify-end gap-4 w-1/4">
       <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.01" 
          v-model="musicStore.volume" 
          @input="musicStore.updateVolume($event.target.value)"
          class="w-24 h-1 accent-accent"
       >
    </div>
  </footer>
</template>