# Neumorphic Music Player
Una aplicación de escritorio moderna y minimalista diseñada para entusiastas de la música que prefieren gestionar su propia colección de archivos locales. Este reproductor no solo reproduce sonido; ofrece una experiencia táctil y visual a través de una interfaz Neumórfica refinada.

## Estética y Diseño
El proyecto se basa en el Neumorfismo (Soft UI), una tendencia de diseño que utiliza sombras paralelas (luces y sombras) para crear componentes que parecen "extruidos" o "hundidos" en el fondo.

- Minimalismo: Interfaz limpia sin distracciones.
- Interactividad: Botones con estados neu-flat, neu-hover y neu-pressed que reaccionan al usuario.
- Paleta de colores: Tonos suaves y neutros con acentos sutiles para resaltar elementos activos.

## Tecnologías Usadas
- Electron: Framework principal para convertir la app web en una aplicación de escritorio nativa.
- Vue.js 3: Framework progresivo para construir la interfaz de usuario de forma reactiva.
- Pinia: Gestión de estado centralizada para controlar el audio y la configuración.
- Vite: Herramienta de construcción ultra rápida para el frontend.
- Tailwind CSS: Para el estilizado rápido mediante clases de utilidad y efectos neumórficos personalizados.
- Music-Metadata: Motor de extracción para leer metadatos de archivos de audio (MP3, FLAC, etc.).
- Electron-Builder: Herramienta para empaquetar la aplicación en un ejecutable (.exe).

## Estructura del Proyecto
```
music-player/
├── dist/                   # Archivos compilados de Vue para producción
├── release/                # Ejecutable (.exe) generado
├── public/                 # Recursos estáticos (Icono de la app)
├── src/
│   ├── assets/             # Multimedia vue
│   ├── components/         # Componentes reutilizables (PlayerBar.vue, SongItem.vue, VisualizerCanvas.vue)
│   ├── store/              # Lógica de Pinia (musicStore.js)
│   ├── services/           # Funciones de ayuda (scanner.js)
│   ├── views/              # Vistas de la aplicación (FullReproductor.vue, ListaSong.vue)
│   └── App.vue             # Componente raíz
│   └── style.css           # Estilos globales y fuentes
├── main.js                 # Proceso principal de Electron (Main Process)
├── preload.cjs             # Puente seguro entre Electron y Vue (Context Bridge)
├── package.json            # Scripts de compilación y dependencias
└── vite.config.js          # Configuración de rutas y plugins de Vite
```

## Metodología de Desarrollo
El proyecto se desarrolló bajo un enfoque Modular y Seguro, siguiendo estas fases:
- Aislamiento de Contexto: Uso estricto de preload para separar el frontend del acceso directo a Node.js.
- Persistencia Inteligente: Implementación de un sistema de "mezcla de datos" en main.js para asegurar que el guardado de una canción no borre la ubicación de la carpeta.
- Escaneo Profundo: Algoritmo recursivo basado en fs.promises para encontrar archivos de audio en subcarpetas de forma asíncrona.
- Optimización de UI: Uso de localeCompare para un ordenamiento alfabético que respeta caracteres especiales.

## Descripción de Archivos Clave
- main.js	Gestiona el ciclo de vida de la app, crea la ventana principal, maneja el escaneo recursivo de archivos y la persistencia en el disco.
- preload.cjs	Expone funciones seguras al frontend (IPC) para que Vue pueda comunicarse con el sistema de archivos sin comprometer la seguridad.
- musicStore.js	El "cerebro" musical. Controla el objeto Audio, el volumen, el orden de las canciones y sincroniza los cambios con el proceso principal.
- ListaSong.vue	Vista principal que muestra la biblioteca. Incluye el botón de selección de carpeta y las funciones de ordenamiento A-Z/Z-A.
- player-settings.json	Archivo generado en el sistema del usuario para recordar la última carpeta, canción y volumen.

## Funcionamiento de Vistas
### Vista de Biblioteca (ListaSong.vue)
- Selección de Carpeta: Permite al usuario elegir un directorio raíz. La app lo recordará automáticamente en el próximo inicio.
- Listado Reactivo: Muestra todas las canciones encontradas en el escaneo profundo.
- Ordenamiento Dinámico: Botones para organizar la colección de forma ascendente, descendente o  aleatorio.
- Player Bar: Play/Pause, barra de progreso y control de volumen persistente.
- Memoria de Sesión: Si cierras la app y la vuelves a abrir, cargará exactamente la última canción y carpeta que escuchaste en la posición donde la dejaste.

### Vista de Reproductor (FullReproductor.vue)
- Control de Audio: Play/Pause, barra de progreso, repetir, reproducir aleatoria y control de volumen.
- Visualización: Muestra metadatos (nombre de canción, artista) recuperados mediante el motor de escaneo.
- Ondas de audios: Soporte para visualizadores de espectro de audio mediante AudioContext.

## Guía de Inicio Rápido
```
# Instalar todas las dependencias
npm install

# Depuración en Desarrollo (Dev Mode)
npm run dev
# Nota: Este comando lanza simultáneamente el servidor de Vite para el frontend y el proceso de Electron. Recuerda que si haces cambios en main.js, deberás reiniciar el comando, pero si cambias los .vue, se actualizarán solos (HMR).

# Luego ejecuta el empaquetado
npm run dist
```
Resultado: Encontrarás el ejecutable en la carpeta /release. Si configuraste el target como portable, será un único archivo listo para usar.

## Próximas Actualizaciones: 
- Implementación de "See Lyrics" para lectura de archivos .lrc.