<script setup>
import { computed, watch, ref, nextTick } from 'vue';
import { useMusicStore } from '../store/musicStore';

const musicStore = useMusicStore();

// Referencias para el scroll
const containerRef = ref(null);
const lineRefs = ref([]);

const lyrics = computed(() => musicStore.lyrics);
const currentIndex = computed(() => musicStore.currentLyricIndex);

// Altura de cada línea (en píxeles) para el cálculo del scroll
const LINE_HEIGHT = 40; 

// Vigilar el cambio de línea para hacer scroll automático
watch(currentIndex, () => {
  if (currentIndex.value !== -1) {
    scrollToActiveLine();
  }
});

const scrollToActiveLine = () => {
  // Calculamos el desplazamiento para que la línea activa quede en el centro
  // Si la línea activa es la 'i', el transform debe ser -(i * altura) + altura_para_centrar
  // En un contenedor de 3 líneas, el centro es la posición de la 2da línea.
};
</script>

<template>
  <div class="relative w-full max-w-md mx-auto">
    <!-- Contenedor Estilo "Pantalla Inset" (Hundido) -->
    <div 
      class="h-[120px] overflow-hidden rounded-2xl neu-pressed border border-white/5 flex flex-col items-center relative"
      ref="containerRef"
    >
      <div class="absolute inset-0 z-10 pointer-events-none"></div>

      <div 
        class="flex flex-col transition-transform duration-100 ease-out py-[40px]"
        :style="{ transform: `translateY(-${currentIndex * LINE_HEIGHT}px)` }"
      >
        <div 
          v-for="(line, index) in lyrics" 
          :key="index"
          :ref="el => lineRefs[index] = el"
          class="h-[40px] flex items-center justify-center px-4 transition-all duration-300"
          :class="[
            index === currentIndex 
              ? 'text-accent font-bold scale-110 opacity-100 z-20' 
              : 'text-muted opacity-40 scale-90 blur-[0.5px]'
          ]"
        >
          <p class="text-center text-sm line-clamp-1">
            {{ line.text }}
          </p>
        </div>

        <!-- Estado vacío -->
        <div v-if="lyrics.length === 0" class="h-full flex items-center justify-center text-muted text-xs italic">
          {{ musicStore.currentSong?.hasLyrics ? 'Cargando letras...' : 'No hay letras disponibles' }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Personalización de colores si no usas Tailwind puro para el neumorfismo */
  .neu-pressed {
    box-shadow: inset 4px 4px 8px rgba(0, 0, 0, 0.4),
                inset -4px -4px 8px rgba(255, 255, 255, 0.05);
  }

</style>