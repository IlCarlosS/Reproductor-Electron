<script setup>
import { useMusicStore } from '../store/musicStore';

const musicStore = useMusicStore();

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
    
    <div class="flex-1 w-full flex flex-col items-center justify-center relative">
      
      <div class="absolute w-full flex items-center justify-center gap-1 opacity-40 px-20">
        <div v-for="h in [30,50,80,40,90,60,30,70,100,60,40,80]" :key="h" class="w-1.5 bg-accent rounded-full" :style="{height: h + 'px'}"></div>
        <div class="w-80"></div> <div v-for="h in [80,40,60,100,70,30,60,90,40,80,50,30]" :key="h + 'r'" class="w-1.5 bg-accent rounded-full" :style="{height: h + 'px'}"></div>
      </div>

      <div class="w-72 h-72 rounded-full neu-flat p-6 relative z-10">
        <div class="w-full h-full rounded-full overflow-hidden border-4 border-bg shadow-inner">
          <img v-if="musicStore.currentSong.cover" :src="musicStore.currentSong.cover" class="w-full h-full object-cover" />
          <div v-else class="w-full h-full flex items-center justify-center bg-negro text-muted">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 17a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" /><path d="M9 17v-13h10v13" /><path d="M9 8h10" /></svg>
          </div>
        </div>
      </div>

      <div class="mt-12 text-center">
        <h2 class="text-3xl font-bold text-accent mb-2 uppercase tracking-widest">{{ musicStore.currentSong.name }}</h2>
        <p class="text-muted font-medium tracking-tight">{{ musicStore.currentSong.artist }}</p>
      </div>

      <div class="mt-10">
        <button class="px-8 py-3 rounded-2xl neu-pressed text-sm font-semibold flex items-center gap-3 hover:neu-flat transition-all">
          See Lyrics
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6h10" /><path d="M8 12h10" /><path d="M8 18h5" /><path d="M3 12h.01" /><path d="M3 6h.01" /><path d="M3 18h.01" /></svg>
        </button>
      </div>
    </div>

    <div class="w-full max-w-4xl flex flex-col items-center gap-10">
      
      <div class="flex items-center gap-8">
        <button @click="musicStore.shuffleSongs()" class="p-4 rounded-full neu-flat hover:text-accent transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 4l3 3l-3 3" /><path d="M18 20l3 -3l-3 -3" /><path d="M3 7h3a5 5 0 0 1 4.45 2.74" /><path d="M21 7h-5a5 5 0 0 0 -4.45 2.74" /><path d="M12 14.26a5 5 0 0 1 4.45 2.74h5" /><path d="M3 17h3a5 5 0 0 0 4.45 -2.74" /></svg>
        </button>
        
        <button @click="musicStore.prevSong()" class="p-5 rounded-full neu-flat hover:text-accent">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 20L9 12L19 4V20ZM5 19V5H7V19H5Z"/></svg>
        </button>

        <button @click="musicStore.togglePlay()" class="p-8 rounded-full neu-flat text-accent active:neu-pressed transition-all">
          <svg v-if="!musicStore.isPlaying" width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          <svg v-else width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
        </button>

        <button @click="musicStore.nextSong()" class="p-5 rounded-full neu-flat hover:text-accent">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M5 4L15 12L5 20V4ZM17 5V19H19V5H17Z"/></svg>
        </button>

        <button class="p-4 rounded-full neu-flat hover:text-accent">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v-3a3 3 0 0 1 3 -3h13m-3 -3l3 3l-3 3" /><path d="M20 12v3a3 3 0 0 1 -3 3h-13m3 3l-3 -3l3 -3" /></svg>
        </button>
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