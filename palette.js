// ====================
// PALETTE.JS
// Gestione controlli UI della palette e lista oggetti
// ====================

// Importante: si assume che lo state sia in variabili globali o importate
// Per semplicità accediamo direttamente a "state.js" come globali

// === Inizio sezione: Caricamento dinamico della palette ===


  async function loadPalette() {
    try {
      const response = await fetch("palette.html");
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
  
      const html = await response.text();
      const container = document.getElementById("palette-container");
  
      if (container) {
        container.innerHTML = html;
        initializePaletteInteractions();
      } else {
        console.error("Impossibile trovare #palette-container");
      }
    } catch (error) {
      console.error("Errore nel caricamento della palette:", error);
    }
  }
  
  // === Fine sezione: Caricamento dinamico della palette ===

// === Inizio sezione: Inizializzazione interazioni della palette ===

function initializePaletteInteractions() {
    const unitSelect = document.getElementById("unitSelect");
    // Unità di misura
    if (unitSelect) {
      unitSelect.addEventListener("change", (e) => {
        currentUnit = e.target.value;
      });
    } else {
        console.warn("L'unità di misura non è stata caricata cotrettamente.");
    }

    // Visibilità griglia (se presente)
    const gridCheckbox = document.getElementById("showGrid");
    if(gridCheckbox) {
      gridCheckbox.checked = showGrid;
      gridCheckbox.addEventListener("change", (e) => {
        showGrid = e.target.checked;
        renderCanvas();
      });
    }

    // Visibilità assi cartesiani (se presente)
    const axesCheckbox = document.getElementById("showAxes");
    if(axesCheckbox) {
        axesCheckbox.checked = showAxes;
        axesCheckbox.addEventListener("change", (e) => {
        showAxes = e.target.checked;
        renderCanvas();
      });
    }
  
    // Dimensione griglia (se presente)
    const gridSizeInput = document.getElementById("gridSize");
    if(gridSizeInput) {
      gridSizeInput.value = gridSpacing;
      
      gridSizeInput.addEventListener("change", (e) => {
        gridSpacing = parseFloat(e.target.value) || gridSpacing;
        if(gridSpacing < 0 ) gridSpacing = 0;
        renderCanvas();
      });
    }

    // Controlli zoom + - 1:1
    const zoomInBtn = document.getElementById("zoomIn");
    const zoomOutBtn = document.getElementById("zoomOut");
    const zoomResetBtn = document.getElementById("zoomReset");
    
    zoomInBtn.addEventListener("click", () => {
        canvasZoomFactor *= 1.1;
        renderCanvas();
        updateZoomDisplay();
    });
    
    zoomOutBtn.addEventListener("click", () => {
        canvasZoomFactor /= 1.1;
        renderCanvas();
        updateZoomDisplay();
    });
    
    zoomResetBtn.addEventListener("click", () => {
        canvasZoomFactor = 1;
        //canvasOffsetX = 0;
        //canvasOffsetY = 0;
        renderCanvas();
        updateZoomDisplay();
    });

    // INIZIO: Collapse/expand sezioni
    document.querySelectorAll(".palette-section .section-header").forEach(header => {
        header.addEventListener("click", () => {
        const section = header.parentElement;
        section.classList.toggle("collapsed");
        });
    });
    // FINE: Collapse/expand sezioni

    makePaletteDraggable();
}
  
// === Fine sezione: Inizializzazione interazioni della palette ===


  
function initPalette() {
    //bindZoomControls();
    makePaletteDraggable();
}

// Controlli zoom + - 1:1
/*
function bindZoomControls() {
    const zoomInBtn = document.getElementById("zoomIn");
    const zoomOutBtn = document.getElementById("zoomOut");
    const zoomResetBtn = document.getElementById("zoomReset");
    
    zoomInBtn.addEventListener("click", () => {
        canvasZoomFactor *= 1.1;
        renderCanvas();
        updateZoomDisplay();
    });
    
    zoomOutBtn.addEventListener("click", () => {
        canvasZoomFactor /= 1.1;
        renderCanvas();
        updateZoomDisplay();
    });
    
    zoomResetBtn.addEventListener("click", () => {
        canvasZoomFactor = 1;
        //canvasOffsetX = 0;
        //canvasOffsetY = 0;
        renderCanvas();
        updateZoomDisplay();
    });
}
    */
    
  
  // Gestione lista oggetti disegnati (array shapes)
  function renderObjectList() {
    const listContainer = document.getElementById("objectList");
    console.warn(listContainer);
    if(listContainer){
        listContainer.innerHTML = ""; // svuota lista
    
        shapes.forEach((shape, idx) => {
        const li = document.createElement("li");
        li.textContent = `${shape.type} - id: ${idx}`;
        li.dataset.idx = idx;
        li.className = (idx === selectedShapeIndex) ? "selected" : "";
    
        li.addEventListener("click", () => {
            selectedShapeIndex = idx;
            renderObjectList();
            renderSelectedShapeProperties();
        });
    
        listContainer.appendChild(li);
        });

    }
  }
  
  // Mostra/modifica proprietà forma selezionata
  function renderSelectedShapeProperties() {
    const propContainer = document.getElementById("shapeProperties");
    propContainer.innerHTML = "";
  
    if (selectedShapeIndex === null || !shapes[selectedShapeIndex]) {
      propContainer.textContent = "Nessuna forma selezionata";
      return;
    }
  
    const shape = shapes[selectedShapeIndex];
  
    // Per esempio proprietà comuni: colore, spessore
    const props = [];
  
    if (shape.type === "line") {
      props.push({ name: "x1", value: shape.x1 });
      props.push({ name: "y1", value: shape.y1 });
      props.push({ name: "x2", value: shape.x2 });
      props.push({ name: "y2", value: shape.y2 });
    } else if (shape.type === "circle") {
      props.push({ name: "cx", value: shape.cx });
      props.push({ name: "cy", value: shape.cy });
      props.push({ name: "r", value: shape.r });
    }
    // Aggiungi proprietà per altre forme...
  
    props.push({ name: "stroke", value: shape.stroke || "#000000" });
    props.push({ name: "strokeWidth", value: shape.strokeWidth || 1 });
  
    props.forEach((prop) => {
      const label = document.createElement("label");
      label.textContent = prop.name;
      const input = document.createElement("input");
      input.type = "number";
      input.value = prop.value;
      input.step = "any";
      input.dataset.prop = prop.name;
  
      input.addEventListener("change", (e) => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val)) {
          shape[e.target.dataset.prop] = val;
          renderCanvas();
          renderObjectList(); // aggiorna lista nel caso cambino proprietà visibili
        }
      });
  
      label.appendChild(input);
      propContainer.appendChild(label);
      propContainer.appendChild(document.createElement("br"));
    });
  }
  

 

function makePaletteDraggable() {
    const palette = document.getElementById("palette");
    const header = palette.querySelector(".palette-header");
  
    let offsetX = 0, offsetY = 0, isDragging = false;
  
    header.addEventListener("mousedown", (e) => {
      isDragging = true;
      offsetX = e.clientX - palette.offsetLeft;
      offsetY = e.clientY - palette.offsetTop;
      document.body.style.userSelect = "none";
    });
  
    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      palette.style.left = `${e.clientX - offsetX}px`;
      palette.style.top = `${e.clientY - offsetY}px`;
    });
  
    document.addEventListener("mouseup", () => {
      isDragging = false;
      document.body.style.userSelect = "";
    });
}

function updateZoomDisplay() {
    const display = document.getElementById("zoomFactorDisplay");
    if (display) {
        display.textContent = `${Math.round(canvasZoomFactor * 100)}%`;
    }
}
// ====================
// FINE PALETTE.JS
// ====================