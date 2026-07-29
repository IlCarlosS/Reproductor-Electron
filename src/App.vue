<!-- App.vue -->
<script setup>
import ListaSong from './views/ListaSong.vue';
import FullReproductor from './views/FullReproductor.vue';
import { onMounted } from 'vue';
import { useMusicStore } from './store/musicStore';

const musicStore = useMusicStore();

onMounted(() => {
  musicStore.initStore();
  
  // Rescatamos el tema al instante en que la app despierta
  const savedTheme = localStorage.getItem('app-theme') || 'fender';
  document.documentElement.setAttribute('data-theme', savedTheme);
});
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