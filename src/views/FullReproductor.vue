<script setup>
import { ref } from 'vue';
import { useMusicStore } from '../store/musicStore';
import VisualizerCanvas from '../components/VisualizerCanvas.vue';
import LyricsView from '../components/LyricsView.vue';

const musicStore = useMusicStore();
const showLyrics = ref(false);

const formatTime = (seconds) => {
  if (!seconds) return "00:00:00";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const handleSeek = (e) => {
  const newTime = (e.target.value / 100) * musicStore.duration;
  musicStore.seek(newTime);
};

const toggleLyrics = async () => {
  showLyrics.value = !showLyrics.value;
  
  // Si las abrimos y no hay letras cargadas aún, las pedimos al Store
  if (showLyrics.value && musicStore.lyrics.length === 0) {
    await musicStore.loadLyrics();
  }
};
</script>

<template>
  <div v-if="musicStore.currentSong" class="fixed inset-0 z-50 bg-bg flex flex-col items-center justify-between p-12 animate-in fade-in duration-300">
    
    <button 
      @click="musicStore.toggleFullScreen()" 
      class="absolute top-8 left-8 w-16 h-16 flex items-center justify-center rounded-full neu-flat hover:text-accent active:neu-pressed transition-all duration-200 z-50 group"
      title="Volver a la lista"
    >
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="group-hover:-translate-x-1 transition-transform pointer-events-none">
        <path d="M15 18l-6-6 6-6"/>
      </svg>
    </button>
    
    <div class="flex-1 w-full flex flex-col items-center justify-center relative overflow-hidden">
      <div class="relative w-full flex items-center justify-center h-80">
        
        <div class="absolute inset-0 w-full h-full pointer-events-none">
          <VisualizerCanvas />
        </div>

        <div class="w-72 h-72 rounded-full neu-flat p-6 relative z-10 transform hover:scale-105 transition-transform duration-500">
          <div 
            class="w-full h-full rounded-full overflow-hidden border-4 border-bg shadow-inner relative animate-vinyl"
            :style="{ animationPlayState: musicStore.isPlaying ? 'running' : 'paused' }"
          >
            <img 
              v-if="musicStore.currentSong.cover" 
              :src="musicStore.currentSong.cover" 
              class="w-full h-full object-cover" 
            />
            
            <div v-else class="w-full h-full flex items-center justify-center bg-negro text-muted">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M9 17a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
                <path d="M9 17v-13h10v13" /><path d="M9 8h10" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8 text-center px-10 z-20 max-w-4xl">
        <h2 class="text-3xl font-bold text-accent mb-2 uppercase tracking-[0.2em] truncate drop-shadow-md">
          {{ musicStore.currentSong.name }}
        </h2>
        <p class="text-muted font-medium tracking-widest opacity-80">
          {{ musicStore.currentSong.artist }}
        </p>
      </div>

      <div class="mt-8 mb-8 z-20 flex flex-col items-center gap-5">
        <!-- Componente de Letras con transición -->
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="transform scale-95 opacity-0"
          enter-to-class="transform scale-100 opacity-100"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="transform scale-100 opacity-100"
          leave-to-class="transform scale-95 opacity-0"
        >
          <LyricsView v-if="showLyrics" />
        </Transition>

        <!-- Botón de "See Lyrics" -->
        <button 
          @click="toggleLyrics"
          :class="[
            'px-8 py-3 rounded-2xl text-sm font-semibold flex items-center gap-3 transition-all group',
            showLyrics ? 'neu-pressed text-accent' : 'neu-flat hover:neu-pressed text-blanco/80'
          ]"
        >
          {{ showLyrics ? 'Ocultar Letra' : 'Ver Letra' }}
          <svg 
            :class="[
              'transition-transform duration-300',
              showLyrics ? 'rotate-180' : 'group-hover:translate-x-1'
            ]" 
            width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          >
            <path d="M8 6h10" /><path d="M8 12h10" /><path d="M8 18h5" /><path d="M3 12h.01" /><path d="M3 6h.01" /><path d="M3 18h.01" />
          </svg>
        </button>
      </div>

    </div>

    <div class="w-full max-w-4xl flex flex-col items-center gap-10">
      <div class="flex items-center justify-between w-full">
        <button @click="musicStore.shuffleSongs()" class="p-4 rounded-full neu-flat hover:text-accent transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 4l3 3l-3 3" /><path d="M18 20l3 -3l-3 -3" /><path d="M3 7h3a5 5 0 0 1 4.45 2.74" /><path d="M21 7h-5a5 5 0 0 0 -4.45 2.74" /><path d="M12 14.26a5 5 0 0 1 4.45 2.74h5" /><path d="M3 17h3a5 5 0 0 0 4.45 -2.74" /></svg>
        </button>

        <div class="flex items-center gap-8">
          <button @click="musicStore.prevSong()" class="p-5 rounded-full neu-flat hover:text-accent transition-all active:scale-95">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 20L9 12L19 4V20ZM5 19V5H7V19H5Z"/></svg>
          </button>

          <button @click="musicStore.togglePlay()" class="p-9 rounded-full neu-flat text-accent active:neu-pressed transition-all transform hover:scale-105">
            <svg v-if="!musicStore.isPlaying" width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            <svg v-else width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
          </button>

          <button @click="musicStore.nextSong()" class="p-5 rounded-full neu-flat hover:text-accent transition-all active:scale-95">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M5 4L15 12L5 20V4ZM17 5V19H19V5H17Z"/></svg>
          </button>
        </div>

        <button 
          @click="musicStore.toggleRepeatMode()" 
          class="p-4 rounded-full neu-flat transition-all relative group"
          :class="musicStore.repeatMode !== 'none' ? 'text-accent shadow-inner' : 'text-text'"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 12v-3a3 3 0 0 1 3 -3h13m-3 -3l3 3l-3 3" />
            <path d="M20 12v3a3 3 0 0 1 -3 3h-13m3 3l-3 -3l3 -3" />
          </svg>
          <span v-if="musicStore.repeatMode === 'one'" class="absolute -top-1 -right-1 text-[10px] font-bold bg-accent text-bg px-1 rounded-full">1</span>
        </button>
      </div>

      <div class="flex items-center gap-4 w-64 mt-4">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="opacity-50">
          <path d="M11 5L6 9H2V15H6L11 19V5Z" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
        
        <div class="flex-1 h-3 rounded-full neu-inset px-2 flex items-center">
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            v-model="musicStore.volume" 
            @input="musicStore.updateVolume($event.target.value)"
            class="w-full bg-transparent appearance-none cursor-pointer accent-accent custom-slider"
          >
        </div>

        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="opacity-50">
          <path d="M11 5L6 9H2V15H6L11 19V5Z" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
      </div>

      <div class="w-full group">
        <div class="relative w-full h-1.5 bg-negro rounded-full neu-pressed mb-4">
          <div class="absolute h-full bg-accent rounded-full shadow-[0_0_10px_rgba(255,193,7,0.4)]" :style="{width: (musicStore.currentTime / musicStore.duration) * 100 + '%'}"></div>
          <input type="range" @input="handleSeek" :value="(musicStore.currentTime / musicStore.duration) * 100 || 0" class="absolute w-full h-full opacity-0 cursor-pointer z-10">
        </div>
        <div class="flex justify-between text-xs font-mono text-muted uppercase tracking-tighter">
          <span>{{ formatTime(musicStore.currentTime) }}</span>
          <span>{{ formatTime(musicStore.duration) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>