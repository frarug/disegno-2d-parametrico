// main.js
import { resizeCanvas } from './drawing.js';
import { initInteractions } from './interactions.js';
import { initPalette } from './palette.js';

async function initApp() {
  resizeCanvas();         // Imposta dimensioni canvas
  initInteractions();     // Gestione pan, zoom, eventi mouse
  await initPalette();    // Carica interfaccia palette (dinamicamente o da HTML)
}

window.addEventListener('DOMContentLoaded', initApp);