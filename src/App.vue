<!-- App.vue -->
<script setup>
import ListaSong from './views/ListaSong.vue';
import FullReproductor from './views/FullReproductor.vue';
import { useMusicStore } from './store/musicStore';

// ¡ESTA ES LA LÍNEA QUE FALTABA! 
// Sin esto, la plantilla no sabe qué es "musicStore"
const musicStore = useMusicStore();
</script>

<template>
  <div class="w-screen h-screen bg-mainBg flex flex-col select-none">
    
    <div class="flex-1 overflow-hidden">
      <ListaSong v-show="!musicStore.isFullScreen" />
      <FullReproductor v-if="musicStore.isFullScreen" />
    </div>
  </div>
</template>

<style>
/* Quitamos el scrollbar global para que parezca una app nativa */
::-webkit-scrollbar {
  display: none;
}
</style>