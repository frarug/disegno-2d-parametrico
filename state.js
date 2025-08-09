// state.js
// ======= INIZIO: Stato Globale dell'Applicazione =======

// Offset e zoom della canvas
let canvasOffsetX = 4; // offset in millimetri
let canvasOffsetY = 4; // offset in millimetri
let canvasZoomFactor = 1.0;

// Dimensione area di lavoro 
let canvasWidth = window.innerWidth;
let canvasHeight = window.innerHeight;

// Unità di misura e griglia
let currentUnit = "mm";         // "mm", "cm", "px"
let pixelsPerUnit = 3.7795;     // 1 mm ≈ 3.7795 px (standard 96dpi)

let dpiMonitor2 = 127; // pixel per pollice monitor macbook 14'' (254 nativa)
let dpiMonitor = 67; //102; // pixel per pollice monitor BenQ PD3220U ()
//let gridStep = 10;         // Passo della griglia in unità correnti

let pxPerMM = dpiMonitor / 25.4;

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
  return nextElementId++;
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

// === DEFAULT STYLE SETTINGS ===
const defaultFillStyle = {
  fill: 'none',
  fillOpacity: 1.0
};

const defaultStrokeStyle = {
  stroke: '#000000',
  strokeWidth: 1,
  strokeOpacity: 1.0,
  strokeDasharray: 'none',  // es: '5,5' per tratteggiato
  strokeLinecap: 'butt',    // butt, round, square
  strokeLinejoin: 'miter'   // miter, round, bevel
};

// ======= FINE: Utility Stato =======