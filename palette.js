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
        //zoomAtPointLogical(0, 0, 1.1);
        canvasZoomFactor *= 1.1;
        renderCanvas();
        updateZoomDisplay();
    });
    
    zoomOutBtn.addEventListener("click", () => {
      //zoomAtPointLogical(0, 0, 1/1.1);
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

function updateElementsOld() {
    const listContainer = document.getElementById("element-list");
    listContainer.innerHTML = ""; // svuota la lista
  
    // Ciclo inverso per mostrare l'ultimo elemento in cima
    for (let i = elements.length - 1; i >= 0; i--) {
      const el = elements[i];
      console.log(el);
      const listItem = document.createElement("li");
  
      listItem.textContent = el.name || `${el.type} ${el.id}`;
      listItem.dataset.id = el.id;
  
      // (opzionale) Aggiungi comportamento click per selezione
      listItem.addEventListener("click", () => {
        selectElementById(el.id); 
      });
  
      listContainer.appendChild(listItem);
    }
}
function updateElements() {
    const tbody = document.querySelector("#element-list tbody");
    tbody.innerHTML = ""; // Svuota
  
    for (let i = elements.length - 1; i >= 0; i--) {
      const el = elements[i];
      const row = document.createElement("tr");
  
      // Nome elemento
      const nameCell = document.createElement("td");
      nameCell.textContent = el.name || `${el.type} ${el.id}`;
      row.appendChild(nameCell);

      row.addEventListener("click", () => {
        selectElementById(el.id); 
      });
  
      // Icona visibilità
      const visCell = document.createElement("td");
      const icon = el.visible ? createCheckIcon(16, 16) : createCrossIcon(16, 16);
  
      icon.style.cursor = "pointer";
      icon.addEventListener("click", () => {
        el.visible = !el.visible;
        updateElements(); // refresh tabella
        renderCanvas();
        // eventuale refresh del disegno
        // drawElements(svgContainer);
      });
  
      visCell.appendChild(icon);
      row.appendChild(visCell);
  
      tbody.appendChild(row);
    }
}

function selectElementById(id) {
    const selected = elements.find(el => el.id === id);
    if (selected) {
      console.log("Elemento selezionato:", selected);
      showElementProperties(id);
    }
}
  
// Mostra/modifica proprietà forma selezionata

function showElementProperties(elementId) {
    const element = elements.find(el => el.id === elementId);
    if (!element) {
        console.warn("Elemento non trovato:", elementId);
        return;
    }
  
    const propertiesContainer = document.getElementById("properties-content");
    propertiesContainer.innerHTML = "";  // puliamo la sezione proprietà
  
    // Creiamo le sezioni base con solo i titoli per ora
    const sections = [
        { id: "position-size", title: "Posizione e Dimensioni" },
        { id: "fill", title: "Riempimento" },
        { id: "stroke", title: "Linea" }
    ];
  
    const elemsById = {};

    for (const sec of sections) {
        const sectionEl = document.createElement("div");
        sectionEl.id = sec.id;
        sectionEl.classList.add("property-section");
    
        const header = document.createElement("h4");
        header.textContent = sec.title;
        sectionEl.appendChild(header);
    
        propertiesContainer.appendChild(sectionEl);
        elemsById[sec.id] = sectionEl;  // <-- salva il riferimento nel dizionario
    }
    // --- Posizione e Dimensioni ---
    if (element.type === "rect") {
        // x
        const inputX = createNumberInput("X", element.x, val => {
            element.x = val; 
            renderCanvas();
        });
        elemsById["position-size"].appendChild(inputX);

        // y
        const inputY = createNumberInput("Y", element.y, val => {
          element.y = val;
          renderCanvas();
        });
        elemsById["position-size"].appendChild(inputY);

        // width
        const inputWidth = createNumberInput("Larghezza", element.width, val => {
          element.width = val;
          renderCanvas();
        });
        elemsById["position-size"].appendChild(inputWidth);

        // height
        const inputHeight = createNumberInput("Altezza", element.height, val => {
          element.height = val;
          renderCanvas();
        });
        elemsById["position-size"].appendChild(inputHeight);
    }
    // --- Riempimento ---
    if (element.type !== "line") {
        // Fill (colore)
        const inputFill = createColorInput("Riempimento", element.fillStyle.fill || element.fill, val => {
          if (typeof element.fillStyle === "object") {
              element.fillStyle.fill = val;
          } else {
              element.fill = val;
          }
          renderCanvas();
        });
        elemsById["fill"].appendChild(inputFill);

        // Fill (opacità)
        const inputFillOpacity = createNumberInput("Opacità", 
          (element.fillStyle.fillOpacity !== undefined ? element.fillStyle.fillOpacity : 1), 
          val => {
              val = Math.max(0, Math.min(1, val));
              if (typeof element.fillStyle === "object") {
                  element.fillStyle.fillOpacity = val;  // qui fillOpacity
              } else {
                  element.fillStyle = { fill: element.fillStyle, fillOpacity: val }; // qui anche
              }
              renderCanvas();
          }
        );
        const inputElement = inputFillOpacity.querySelector("input");
        inputElement.min = 0;
        inputElement.max = 1;
        inputElement.step = 0.05;
        elemsById["fill"].appendChild(inputFillOpacity);
    }

    // Stroke (colore)
    const inputStroke = createColorInput("Colore linea", element.strokeStyle.stroke || element.stroke, val => {
      if (typeof element.strokeStyle === "object") {
        element.strokeStyle.stroke = val;
      } else {
        element.stroke = val;
      }
      renderCanvas();
    });
    elemsById["stroke"].appendChild(inputStroke);

    // Stroke Width (numero)
    const inputStrokeWidth = createNumberInput("Spessore linea", element.strokeStyle.strokeWidth || element.strokeWidth, val => {
        if (typeof element.strokeStyle === "object") {
            element.strokeStyle.strokeWidth = val;
        } else {
            element.strokeWidth = val;
        }
        renderCanvas();
    });
    elemsById["stroke"].appendChild(inputStrokeWidth);

    // Qui in futuro puoi aggiungere altri tipi di elemento...

    // Funzioni helper per creare gli input
    function createNumberInput(labelText, initialValue, onChange) {
      const container = document.createElement("div");
      container.classList.add("property-input");

      const label = document.createElement("label");
      label.textContent = labelText;
      container.appendChild(label);

      const input = document.createElement("input");
      input.type = "number";
      input.value = initialValue;
     //input.step = "any";
      input.addEventListener("input", e => onChange(parseFloat(e.target.value)));
      container.appendChild(input);

      return container;
    }

    function createColorInput(labelText, initialValue, onChange) {
      const container = document.createElement("div");
      container.classList.add("property-input");

      const label = document.createElement("label");
      label.textContent = labelText;
      container.appendChild(label);

      const input = document.createElement("input");
      input.type = "color";
      input.value = initialValue || "#000000";
      input.addEventListener("input", e => onChange(e.target.value));
      container.appendChild(input);

      return container;
    }
}


function renderSelectedShapePropertiesOld() {
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
  
    // Aggiungi la dragIcon generata da graphics.js
    if (header) {
      header.prepend(createDragIcon(16, 16, "white"));
    }
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