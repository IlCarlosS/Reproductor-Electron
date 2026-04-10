<script setup>
import { useMusicStore } from '../store/musicStore';
const musicStore = useMusicStore();
defineProps({
  song: Object,
  index: Number
})
</script>

<template>
  <div class="flex items-center justify-between p-4 mb-4 rounded-2xl neu-flat neu-hover cursor-pointer group transition-all duration-200">
    <div @click="musicStore.setCurrentSong(song)" class="flex items-center gap-4">
        <div class="w-12 h-12 flex items-center justify-center rounded-xl overflow-hidden neu-pressed">
            <img v-if="song.cover" :src="song.cover" class="w-full h-full object-cover" />
            
            <div v-else class="text-muted group-hover:text-accent">
                <span class="text-xs font-bold group-hover:hidden">{{ index + 1 }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 hidden group-hover:block" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5.14v14c0 .866.443 1.187 1.1 1.187.16 0 .33-.035.49-.11l10-7c.41-.287.646-.61.646-1.077 0-.466-.235-.79-.647-1.077l-10-7c-.16-.074-.33-.108-.49-.108-.657 0-1.1.32-1.1 1.186Z" />
                </svg>
            </div>
        </div>

      <div>
        <h3 class="text-blanco font-medium truncate max-w-[300px]">{{ song.name }}</h3>
        <p class="text-xs text-muted">{{ song.artist }} • {{ song.album }}</p>
      </div>
    </div>

    <div class="flex items-center gap-6">
      <span class="text-[10px] uppercase font-bold px-2 py-1 rounded-md neu-pressed text-accent/70 tracking-widest">
        {{ song.extension.replace('.', '') }}
      </span>
      <span class="text-sm text-muted font-mono">{{ song.duration }}</span>
    </div>
  </div>
</template>