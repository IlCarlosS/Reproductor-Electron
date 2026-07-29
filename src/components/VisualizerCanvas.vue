<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useMusicStore } from '../store/musicStore';

const musicStore = useMusicStore();
const canvasRef = ref(null);
let ctx = null;
let analyser = null;
let animationId = null;
let dataArray = null;

// 1. Cambiamos de const a let e inicializamos con el color fallback
let ACCENT_COLOR = '#FFC107'; 
let GLOW_COLOR = 'rgba(255, 193, 7, 0.4)'; 
let observer = null;

// 2. Helper para convertir el color HEX de la variable CSS a RGBA para el resplandor
const hexToRgba = (hex, alpha = 0.4) => {
  const cleanHex = hex.trim().replace('#', '');
  if (cleanHex.length !== 6) return `rgba(255, 193, 7, ${alpha})`;
  
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// 3. Extrae la variable --color-accent del tema activo en CSS
const updateCanvasColors = () => {
  const cssColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-accent')
    .trim();

  if (cssColor) {
    ACCENT_COLOR = cssColor;
    GLOW_COLOR = hexToRgba(cssColor, 0.4);
  }
};

const draw = () => {
  if (!ctx || !analyser) return;

  const canvas = canvasRef.value;
  if (!canvas) return;
  
  analyser.getByteFrequencyData(dataArray);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Usa automáticamente el ACCENT_COLOR y GLOW_COLOR que actualiza el observador
  ctx.fillStyle = ACCENT_COLOR;
  ctx.shadowBlur = 12;
  ctx.shadowColor = GLOW_COLOR; 

  const numBars = 40; 
  const barWidth = 4; 
  const gap = 6; 
  const centerGap = 300; 
  const startX_R = (canvas.width / 2) + (centerGap / 2); 
  const startX_L = (canvas.width / 2) - (centerGap / 2); 

  for (let i = 0; i < numBars; i++) {
    let barHeight = (dataArray[i] / 255) * (canvas.height * 0.90); 
    barHeight = Math.max(4, barHeight); 

    // Derecha
    fillRoundedRect(ctx, startX_R + (i * (barWidth + gap)), (canvas.height / 2) - (barHeight / 2), barWidth, barHeight, 3); 
    // Izquierda
    fillRoundedRect(ctx, startX_L - (i * (barWidth + gap)) - barWidth, (canvas.height / 2) - (barHeight / 2), barWidth, barHeight, 3);
  }

  animationId = requestAnimationFrame(draw);
};

const fillRoundedRect = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
};

let resizeHandler = null;

onMounted(() => {
  ctx = canvasRef.value.getContext('2d');
  
  analyser = musicStore.getAnalyser();
  dataArray = new Uint8Array(analyser.frequencyBinCount);

  // 4. Sincronizamos colores iniciales al montar
  updateCanvasColors();

  // 5. Escuchamos cambios en el atributo data-theme del documentElement
  observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.attributeName === 'data-theme') {
        updateCanvasColors();
      }
    }
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });

  resizeHandler = () => {
    if (!canvasRef.value) return;
    canvasRef.value.width = canvasRef.value.parentElement.clientWidth;
    canvasRef.value.height = canvasRef.value.parentElement.clientHeight;
  };
  
  window.addEventListener('resize', resizeHandler);
  resizeHandler();
  draw();
});

onUnmounted(() => {
  cancelAnimationFrame(animationId);
  // Limpieza de eventos y observadores para optimizar memoria
  if (resizeHandler) window.removeEventListener('resize', resizeHandler);
  if (observer) observer.disconnect();
});
</script>

<template>
  <div class="absolute inset-0 w-full h-full flex items-center justify-center -z-10 pointer-events-none p-20">
    <canvas ref="canvasRef" class="w-full h-full opacity-70"></canvas>
  </div>
</template>