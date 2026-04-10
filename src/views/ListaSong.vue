//ListaSong.vue
<script setup>
import { useMusicStore } from '../store/musicStore';
import { scanFolder } from '../services/scanner';
import SongItem from '../components/SongItem.vue';
import PlayerBar from '../components/PlayerBar.vue';

// Accedemos al store
const musicStore = useMusicStore();

// Función para seleccionar carpeta
const handleSelectFolder = async () => {
  const selectedPath = await window.electronAPI.selectFolder();
  if (selectedPath) {
    musicStore.setFolderPath(selectedPath);
    // Añadimos el await aquí
    const foundSongs = await scanFolder(selectedPath); 
    musicStore.setSongs(foundSongs);
  }
};
</script>

<template>
  <div class="h-screen w-screen flex flex-col bg-fondo text-blanco overflow-hidden">
    
    <div class="flex-1 flex flex-col p-8 overflow-hidden">
      
      <header class="flex justify-between items-center mb-10 shrink-0">
        <div class="flex items-center gap-4">
          <div class="p-3 rounded-xl neu-flat">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-accent"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M3 17a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" /><path d="M13 17a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" /><path d="M9 17v-13h10v13" /><path d="M9 8h10" /></svg>
          </div>
          <h1 class="text-2xl font-bold tracking-tight">Lista de canciones</h1>
        </div>

        <button @click="handleSelectFolder" class="flex items-center gap-2 px-5 py-2.5 rounded-xl neu-flat neu-hover group active:neu-pressed">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-accent group-hover:scale-110 transition-transform"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M2 6c0 -.796 .316 -1.558 .879 -2.121c.563 -.563 1.325 -.879 2.121 -.879h4l.099 .005c.229 .023 .444 .124 .608 .288l2.707 2.707h6.586c.796 0 1.558 .316 2.121 .879c.319 .319 .559 .703 .707 1.121l-14.523 0c-.407 0 -.805 .125 -1.14 .356c-.292 .203 -.525 .48 -.674 .801l-.058 .141l-1.379 3.676c-.194 .517 .068 1.093 .585 1.287c.517 .194 1.094 -.068 1.288 -.585l1.134 -3.027c.146 -.39 .519 -.649 .937 -.649h13.002l.217 .012c.216 .024 .426 .082 .624 .173c.054 .025 .107 .053 .159 .083c.199 .115 .377 .263 .525 .439c.188 .222 .325 .482 .403 .762c.077 .28 .092 .573 .045 .859c-.001 .008 -.003 .016 -.005 .024l-.995 5.21c-.131 .686 -.497 1.304 -1.036 1.749c-.47 .389 -1.046 .624 -1.65 .677l-.261 .012h-14.026c-.796 0 -1.558 -.316 -2.121 -.879c-.563 -.563 -.879 -1.325 -.879 -2.121v-11z" /></svg>
          <span class="text-sm font-medium">Seleccionar carpeta</span>
        </button>
      </header>

      <div v-if="musicStore.songs.length > 0" class="flex gap-4 mb-6 shrink-0">
        <button @click="musicStore.sortAZ()" class="p-2.5 rounded-lg neu-flat neu-hover active:neu-pressed flex items-center gap-2 text-xs font-semibold text-muted hover:text-accent transition-colors" title="Ordenar A-Z">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 10v-5c0 -1.38 .62 -2 2 -2s2 .62 2 2v5m0 -3h-4" /><path d="M19 21h-4l4 -7h-4" /><path d="M4 15l3 3l3 -3" /><path d="M7 6v12" /></svg>
          A-Z
        </button>

        <button @click="musicStore.sortZA()" class="p-2.5 rounded-lg neu-flat neu-hover active:neu-pressed flex items-center gap-2 text-xs font-semibold text-muted hover:text-accent transition-colors" title="Ordenar Z-A">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 10v-5c0 -1.38 .62 -2 2 -2s2 .62 2 2v5m0 -3h-4" /><path d="M19 21h-4l4 -7h-4" /><path d="M4 9l3 -3l3 3" /><path d="M7 6v12" /></svg>
          Z-A
        </button>

        <button @click="musicStore.shuffleSongs()" class="p-2.5 rounded-lg neu-flat neu-hover active:neu-pressed flex items-center gap-2 text-xs font-semibold text-muted hover:text-accent transition-colors" title="Mezclar">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 4l3 3l-3 3" /><path d="M18 20l3 -3l-3 -3" /><path d="M3 7h3a5 5 0 0 1 4.45 2.74" /><path d="M21 7h-5a5 5 0 0 0 -4.45 2.74" /><path d="M12 14.26a5 5 0 0 1 4.45 2.74h5" /><path d="M3 17h3a5 5 0 0 0 4.45 -2.74" /></svg>
          Aleatorio
        </button>
      </div>

      <main class="flex-1 overflow-hidden flex flex-col">
        
        <div v-if="musicStore.songs.length === 0" 
             class="flex-1 flex flex-col items-center justify-center rounded-3xl neu-pressed">
          <div class="mb-8 p-6 rounded-3xl neu-flat">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="w-20 h-20 text-muted/40">
              <path d="M21 3a1 1 0 0 1 0 2h-3v12a4 4 0 1 1 -2.001 -3.465l.001 -9.535a1 1 0 0 1 1 -1z" />
              <path d="M14 5a1 1 0 0 1 -1 1h-10a1 1 0 1 1 0 -2h10a1 1 0 0 1 1 1" />
              <path d="M14 9a1 1 0 0 1 -1 1h-10a1 1 0 1 1 0 -2h10a1 1 0 0 1 1 1" />
              <path d="M10 13a1 1 0 0 1 -1 1h-6a1 1 0 0 1 0 -2h6a1 1 0 0 1 1 1" />
            </svg>
          </div>
          <h2 class="text-lg font-medium text-muted">No has seleccionado una biblioteca aún</h2>
        </div>

        <div v-else class="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <SongItem 
            v-for="(song, index) in musicStore.songs" 
            :key="song.path" 
            :song="song" 
            :index="index"
          />
        </div>
      </main>
    </div>

    <PlayerBar /> 

  </div>
</template>

<style scoped>
/* Scrollbar personalizada para que no rompa el diseño */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 10px;
}
</style>