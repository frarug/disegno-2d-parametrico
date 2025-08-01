// state.js
// ======= INIZIO: Stato Globale dell'Applicazione =======

// Offset e zoom della canvas
let canvasOffsetX = 0;
let canvasOffsetY = 0;
let canvasZoomFactor = 1.0;

// Dimensione area di lavoro 
let canvasWidth = window.innerWidth;
let canvasHeight = window.innerHeight;

// Unità di misura e griglia
let currentUnit = "mm";         // "mm", "cm", "px"
let pixelsPerUnit = 3.7795;     // 1 mm ≈ 3.7795 px (standard 96dpi)
//let gridStep = 10;         // Passo della griglia in unità correnti


// Visibilità elementi
let showGrid = true;
let gridSpacing = 10; // Passo della griglia in unità correnti
let showAxes = true;

// Stato per il pan
let isPanning = false;
let startPan = { x: 0, y: 0 };

// Array globale degli elementi disegnati
let elements = [];

// Indice dell'elemento selezionato
let selectedElementIndex = -1;

// ID progressivo per ogni nuovo elemento
let nextElementId = 1;

// ======= FINE: Stato Globale dell'Applicazione =======

// ======= INIZIO: Utility Stato =======

function generateElementId() {
  return `elem${nextElementId++}`;
}

// === Utility: conversione unità → pixel ===
function getGridStepInPixels() {
  return gridStep * pixelsPerUnit * zoomFactor;
}

function resetState() {
  canvasOffsetX = 0;
  canvasOffsetY = 0;
  canvasZoomFactor = 1.0;
  elements = [];
  nextElementId = 1;
  selectedElementIndex = -1;
}

function addElement(type, props) {
  const element = {
    id: generateElementId(),
    type,
    props: { ...props },
    visible: true
  };
  elements.push(element);
  return element;
}

function getElementById(id) {
  return elements.find(el => el.id === id);
}

function updateElement(id, newProps) {
  const el = getElementById(id);
  if (el) {
    Object.assign(el.props, newProps);
  }
}

function deleteElement(id) {
  elements = elements.filter(el => el.id !== id);
}

// ======= FINE: Utility Stato =======