<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useMusicStore } from '../store/musicStore';

const musicStore = useMusicStore();
const canvasRef = ref(null);
let ctx = null;
let analyser = null;
let animationId = null;
let dataArray = null;

const ACCENT_COLOR = '#FFC107'; 
const GLOW_COLOR = 'rgba(255, 193, 7, 0.4)'; 

const draw = () => {
  if (!ctx || !analyser) return;

  const canvas = canvasRef.value;
  if(!canvas) return;
  
  analyser.getByteFrequencyData(dataArray);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
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
  ctx.roundRect(x, y, w, h, r); // Versión moderna y limpia de rectángulos redondeados
  ctx.fill();
};

onMounted(() => {
  ctx = canvasRef.value.getContext('2d');
  
  // Pedimos el analizador al store. Si ya existe, nos da el mismo.
  analyser = musicStore.getAnalyser();
  dataArray = new Uint8Array(analyser.frequencyBinCount);

  const resize = () => {
    if(!canvasRef.value) return;
    canvasRef.value.width = canvasRef.value.parentElement.clientWidth;
    canvasRef.value.height = canvasRef.value.parentElement.clientHeight;
  };
  
  window.addEventListener('resize', resize);
  resize();
  draw();
});

onUnmounted(() => {
  cancelAnimationFrame(animationId);
});
</script>

<template>
  <div class="absolute inset-0 w-full h-full flex items-center justify-center -z-10 pointer-events-none p-20">
    <canvas ref="canvasRef" class="w-full h-full opacity-70"></canvas>
  </div>
</template>