import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './style.css'

const app = createApp(App)
const pinia = createPinia()

// PRIMERO: Registramos Pinia
app.use(pinia)

// DESPUÉS: Montamos la app
app.mount('#app')