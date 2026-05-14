<!-- SongItem.vue -->
<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useMusicStore } from '../store/musicStore';

const musicStore = useMusicStore();
const props = defineProps({
  song: Object,
  index: Number
});

// Detectar si esta canción es la que está sonando
const isActive = computed(() => {
  return musicStore.currentSong?.path === props.song.path;
});

const showMenu = ref(false);
const menuRef = ref(null);

// Función para abrir con clic derecho
const handleRightClick = (e) => {
  // Cerramos cualquier otro menú que pudiera estar abierto primero
  showMenu.value = true;
};

const toggleMenu = (e) => {
  e.stopPropagation(); 
  showMenu.value = !showMenu.value;
};

const closeMenu = (e) => {
  if (menuRef.value && !menuRef.value.contains(e.target)) {
    showMenu.value = false;
  }
};

onMounted(() => window.addEventListener('click', closeMenu));
onUnmounted(() => window.removeEventListener('click', closeMenu));
</script>

<template>
  <div
    @contextmenu.prevent="handleRightClick" 
    class="flex items-center justify-between p-4 my-2 mx-1 rounded-2xl cursor-pointer group relative transition-all duration-300"
    :class="[
      isActive 
        ? 'neu-pressed z-10 shadow-accent/5 border-accent/20 border' 
        : 'neu-flat neu-hover hover:z-20 border-transparent border'
    ]"
  >
    
    <!-- Contenedor Principal -->
    <div @click="musicStore.setCurrentSong(song)" class="flex items-center gap-4 flex-1 overflow-hidden">
      <div 
        class="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl overflow-hidden border border-white/5 transition-all"
        :class="isActive ? 'neu-flat' : 'neu-pressed'"
      >
        <img v-if="song.cover" :src="song.cover" class="w-full h-full object-cover" />
        
        <div v-else class="flex items-center justify-center transition-colors">
          <!-- Icono de reproducción si está activa, si no, el número -->
          <svg v-if="isActive" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-accent animate-pulse" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3v18M8 8v8M16 6v12M4 11v2M20 9v6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span v-else class="text-xs font-bold text-muted group-hover:hidden">{{ index + 1 }}</span>
          
          <svg v-if="!isActive" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-accent hidden group-hover:block" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5.14v14c0 .866.443 1.187 1.1 1.187.16 0 .33-.035.49-.11l10-7c.41-.287.646-.61.646-1.077 0-.466-.235-.79-.647-1.077l-10-7c-.16-.074-.33-.108-.49-.108-.657 0-1.1.32-1.1 1.186Z" />
          </svg>
        </div>
      </div>

      <div class="overflow-hidden">
        <h3 
          class="font-medium truncate max-w-[250px] transition-colors"
          :class="isActive ? 'text-accent' : 'text-blanco group-hover:text-accent'"
        >
          {{ song.name }}
        </h3>
        <p class="text-xs text-muted truncate">{{ song.artist }} • {{ song.album }}</p>
      </div>
    </div>

    <!-- Info y Botón de Menú -->
    <div class="flex items-center gap-4 ml-4">
      <span 
        class="text-[9px] uppercase font-black px-2 py-0.5 rounded-md neu-pressed tracking-[0.15em] border border-white/5 hidden sm:block transition-colors"
        :class="isActive ? 'text-accent' : 'text-accent/60'"
      >
        {{ song.extension.replace('.', '') }}
      </span>
      <span class="text-sm font-mono opacity-80 w-12 text-right transition-colors" :class="isActive ? 'text-accent' : 'text-blanco'">
        {{ song.duration }}
      </span>
      
      <button 
        @click="toggleMenu"
        class="p-2 rounded-lg transition-all"
        :class="[
          isActive ? 'opacity-100 neu-pressed text-accent' : 'opacity-0 group-hover:opacity-100 neu-flat hover:neu-pressed text-muted hover:text-accent'
        ]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
      </button>
    </div>

    <!-- Menú Desplegable Neumórfico -->
    <div 
      v-if="showMenu" 
      ref="menuRef"
      class="absolute right-4 top-14 w-56 rounded-2xl neu-flat border border-white/5 z-50 p-2 animate-in fade-in zoom-in duration-150"
    >
      <div class="flex flex-col gap-1">
        <!-- Reproducir Siguiente -->
        <button @click="musicStore.playNext(song); showMenu = false" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:neu-pressed text-xs font-semibold text-blanco/80 hover:text-accent transition-all text-left">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-playlist"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M11 17a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M17 17v-13h4" /><path d="M13 5h-10" /><path d="M3 9l10 0" /><path d="M9 13h-6" /></svg>
          Reproducir a Continuación
        </button>

        <!-- Shuffle desde aquí -->
        <button @click="musicStore.shuffleFromHere(song); showMenu = false" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:neu-pressed text-xs font-semibold text-blanco/80 hover:text-accent transition-all text-left">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22"/><path d="m18 2 4 4-4 4"/><path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2"/><path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8"/><path d="m18 14 4 4-4 4"/></svg>
          Iniciar Aleatorio Desde Aquí
        </button>

        <div class="h-[1px] bg-white/5 my-1 mx-2"></div>

        <!-- Quitar / Ocultar -->
        <button @click="musicStore.removeFromList(song); showMenu = false" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:neu-pressed text-xs font-semibold text-red-400 hover:text-red-500 transition-all text-left">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="m19 6-2 14H7L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          Eliminar de la Lista
        </button>
      </div>
    </div>
  </div>
</template>