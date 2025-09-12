// globals.js
// ======= INIZIO: Stato Globale dell'Applicazione =======
const svg = document.getElementById("canvas");
if (!svg) {
  console.error("Canvas SVG non trovato");
}
const gridLayer      = document.getElementById("grid-layer");
const elementsLayer  = document.getElementById("elements-layer");
const axesLayer      = document.getElementById("axes-layer");
const overlayLayer   = document.getElementById("overlay-layer");

// Offset e zoom della canvas
let canvasOffsetX = 4; // offset in millimetri
let canvasOffsetY = 4; // offset in millimetri
let canvasZoomFactor = 1.0;

// Dimensione area di lavoro 
let canvasWidth = window.innerWidth;
let canvasHeight = window.innerHeight;

// Unità di misura, precisione e griglia
let currentUnit = "mm";         // "mm", "cm", "px"
let canvasPrecision = 1; // default = 1 unità
let pixelsPerUnit = 3.7795;     // 1 mm ≈ 3.7795 px (standard 96dpi)

let dpiMonitor2 = 127; // pixel per pollice monitor macbook 14'' (254 nativa)
let dpiMonitor = 67; //102; // pixel per pollice monitor BenQ PD3220U ()
//let gridStep = 10;         // Passo della griglia in unità correnti

let pxPerMM = dpiMonitor / 25.4;

// Visibilità elementi
let showGrid = true;
let gridSpacing = 10; // Passo di default della griglia in unità correnti
let showAxes = true;
let showRulers = false;

// Stato per il pan (spostamento della scena), 
// il move (spostamento degli oggetti), 
// lo scale (ridimensionamento degli oggeti) e 
// il rotate (la rotazione degli oggetti)
let startPan = { x: 0, y: 0 }; // punto di inizio di default per il pan
let startMove = { x: 0, y: 0 }; // ""
let startScale = { x: 0, y: 0 };  // ""
let startRotate = { x: 0, y: 0 }; // ""

let mouseDownTime = 0;
let stickyMode = false;
let lastX = 0, lastY = 0;

let moving = false;
let panning = false;
let zooming = false;
let scaling = false;
let rotating = false;

let currentHandle = null;

// Array globale degli elementi creati
let elements = [];

// Indice dell'ultimo elemento selezionato
//let selectedElementIndex = -1;

// array degli elementi selezionati, perché 
// potrebbe esserci più di un elemento selezionato
let selectedElements = [];

// ID progressivo per ogni nuovo elemento
let nextElementId = 1;

// dimensione degli handlers in mm
handlerRectSize = 2;

// variabile globale appState 
// === Stati della app ===
const AppStates = {
  DEFAULT: "default",
  MOVE: "move",
  ROTATE: "rotate",
  SCALE: "scale",
  PAN: "pan"
};
// Stato attuale della app
let currentState = AppStates.DEFAULT;
// Per ricordare lo stato precedente
let previousState = AppStates.DEFAULT; 


// ======= FINE: Stato Globale dell'Applicazione =======

// ======= INIZIO: Utility Stato =======

function generateElementId() {
  return nextElementId++;
}

// === Utility: conversione unità → pixel ===
// non utilizzate per ora 
/*
function getGridStepInPixels() {
  return gridStep * pixelsPerUnit * canvasZoomFactor;
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
*/

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