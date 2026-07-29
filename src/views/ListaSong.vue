//ListaSong.vue
// ListaSong.vue
<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { useMusicStore } from '../store/musicStore';
import { scanFolder } from '../services/scanner';
import SongItem from '../components/SongItem.vue';
import PlayerBar from '../components/PlayerBar.vue';

const musicStore = useMusicStore();
const searchQuery = ref('');
const listContainer = ref(null);

// --- LÓGICA DE TEMAS ---
// Pon aquí los colores hexadecimales exactos que pusiste en tu style.css para cada tema
const themes = [
  { name: 'midnight', color: '#FFC107' }, 
  { name: 'pearl', color: '#7e57c2' }, 
  { name: 'gibson', color: '#d32f2f' }, 
  { name: 'fender', color: '#c0c0c0' },
  { name: 'matrix', color: '#00e676' } 
];

// Recuperamos el tema guardado o usamos uno por defecto
const currentTheme = ref(localStorage.getItem('app-theme') || 'midnight');

const changeTheme = (themeName) => {
  currentTheme.value = themeName;
  document.documentElement.setAttribute('data-theme', themeName);
  localStorage.setItem('app-theme', themeName);
};

const handleSelectFolder = async () => {
  const selectedPath = await window.electronAPI.selectFolder();
  if (selectedPath) {
    musicStore.setFolderPath(selectedPath);
    const foundSongs = await scanFolder(selectedPath); 
    musicStore.setSongs(foundSongs);
  }
};

const filteredSongs = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return musicStore.songs;
  
  return musicStore.songs.filter(song => 
    song.name.toLowerCase().includes(query) || 
    song.artist.toLowerCase().includes(query) ||
    song.album.toLowerCase().includes(query)
  );
});

const scrollToActive = async () => {
  await nextTick();
  const activeElement = listContainer.value?.querySelector('[data-active="true"]');
  if (activeElement) {
    activeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  }
};

watch(() => musicStore.currentSong?.path, () => {
  scrollToActive();
});

</script>
<template>
  <div class="h-screen w-screen flex flex-col bg-fondo text-blanco overflow-hidden">
    
    <div class="flex-1 flex flex-col p-8 overflow-hidden">
      
      <header class="flex justify-between items-center mb-10 shrink-0">
        <!-- Título y logo -->
        <div class="flex items-center gap-4">
          <div class="p-3 rounded-xl neu-flat">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-accent"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M3 17a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" /><path d="M13 17a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" /><path d="M9 17v-13h10v13" /><path d="M9 8h10" /></svg>
          </div>
          <h1 class="text-2xl font-bold tracking-tight">Lista de canciones</h1>
        </div>

        <!-- CONTROLES DERECHOS: Temas + Carpeta -->
        <div class="flex items-center gap-6">
          
          <!-- Selector de Temas Neumórfico -->
          <div class="flex items-center gap-3 p-2 px-3 rounded-2xl neu-pressed">
            <button 
              v-for="theme in themes" 
              :key="theme.name"
              @click="changeTheme(theme.name)"
              class="w-5 h-5 rounded-full transition-all duration-300 hover:scale-110"
              :class="currentTheme === theme.name ? 'ring-2 ring-white/70 ring-offset-2 ring-offset-transparent scale-110' : 'opacity-60 hover:opacity-100'"
              :style="{ backgroundColor: theme.color }"
              :title="`Tema ${theme.name}`"
            ></button>
          </div>

          <!-- Botón Seleccionar Carpeta -->
          <button @click="handleSelectFolder" class="flex items-center gap-2 px-5 py-2.5 rounded-xl neu-flat neu-hover group active:neu-pressed">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-accent group-hover:scale-110 transition-transform"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M2 6c0 -.796 .316 -1.558 .879 -2.121c.563 -.563 1.325 -.879 2.121 -.879h4l.099 .005c.229 .023 .444 .124 .608 .288l2.707 2.707h6.586c.796 0 1.558 .316 2.121 .879c.319 .319 .559 .703 .707 1.121l-14.523 0c-.407 0 -.805 .125 -1.14 .356c-.292 .203 -.525 .48 -.674 .801l-.058 .141l-1.379 3.676c-.194 .517 .068 1.093 .585 1.287c.517 .194 1.094 -.068 1.288 -.585l1.134 -3.027c.146 -.39 .519 -.649 .937 -.649h13.002l.217 .012c.216 .024 .426 .082 .624 .173c.054 .025 .107 .053 .159 .083c.199 .115 .377 .263 .525 .439c.188 .222 .325 .482 .403 .762c.077 .28 .092 .573 .045 .859c-.001 .008 -.003 .016 -.005 .024l-.995 5.21c-.131 .686 -.497 1.304 -1.036 1.749c-.47 .389 -1.046 .624 -1.65 .677l-.261 .012h-14.026c-.796 0 -1.558 -.316 -2.121 -.879c-.563 -.563 -.879 -1.325 -.879 -2.121v-11z" /></svg>
            <span class="text-sm font-medium">Seleccionar carpeta</span>
          </button>
          
        </div>
      </header>

      <div v-if="musicStore.songs.length > 0" class="flex items-center gap-4 mb-6 shrink-0">
        <!-- Botones A-Z, Z-A y Aleatorio -->
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

        <!-- BUSCADOR NEUMÓRFICO -->
        <div class="flex-1 relative group">
          <div class="absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Buscar canción, artista..." 
            class="w-full bg-transparent p-2.5 pl-10 rounded-xl neu-pressed border border-white/5 text-sm text-blanco placeholder:text-muted outline-none focus:border-accent/30 transition-all"
          />
        </div>
      </div>

      <main class="flex-1 overflow-hidden flex flex-col min-h-0">
        <!-- Estado: Sin biblioteca seleccionada -->
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

        <!-- Estado: Lista de canciones (con buscador y scroll activo) -->
        <div 
          v-else 
          ref="listContainer" 
          class="flex-1 overflow-y-auto pr-2 custom-scrollbar"
        >
          <!-- 
            1. Usamos 'filteredSongs' para que el buscador funcione.
            2. Añadimos ':data-active' para que el auto-scroll encuentre la canción.
          -->
          <SongItem 
            v-for="(song, index) in filteredSongs" 
            :key="song.path" 
            :song="song" 
            :index="index"
            :data-active="musicStore.currentSong?.path === song.path"
          />

          <!-- Mensaje extra: Si el buscador no arroja resultados -->
          <div v-if="filteredSongs.length === 0" class="flex flex-col items-center justify-center py-20 text-muted/50 italic">
            <p>No hay coincidencias para tu búsqueda</p>
          </div>
        </div>
      </main>
    </div>

    <PlayerBar /> 

  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 10px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.02); /* Fondo súper sutil */
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2); /* Color visible contra fondo oscuro */
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.4); /* Brilla al pasar el mouse */
  cursor: pointer;
}
</style>