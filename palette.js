// ====================
// PALETTE.JS
// Gestione controlli UI della palette e lista oggetti
// ====================

// Importante: si assume che lo state sia in variabili globali o importate
// Per semplicità accediamo direttamente a "globals.js" come globali

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
    // Unità di misura
    const unitSelect = document.getElementById("unitSelect");
    if (unitSelect) {
      unitSelect.addEventListener("change", (e) => {
        currentUnit = e.target.value;
        console.log("now unit is: ",currentUnit );
      });
    } else {
        console.warn("L'unità di misura non è stata caricata cotrettamente.");
    }
    // Precisione di misura
    const precisionSelect = document.getElementById("precisionSelect");
    if (precisionSelect) {
      canvasPrecision = parseFloat(precisionSelect.value);
      console.log(canvasPrecision);
      precisionSelect.addEventListener("change", (e) => {
        canvasPrecision = parseFloat(e.target.value);
        console.log("now precision is: ",canvasPrecision );
      });
    } else {
        console.warn("I valori di precisione non sono stati caricati cotrettamente.");
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

/*
function initPalette() {
    makePaletteDraggable();
}
*/
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


// ======== aggiornamento dei controlli della palette


// Aggiornamento della percentuale dello zoom
function updateZoomDisplay() {
  const display = document.getElementById("zoomFactorDisplay");
  if (display) {
      display.textContent = `${Math.round(canvasZoomFactor * 100)}%`;
  }
}

// aggiornamento della selezione della lista degli elementi
function updatePaletteElmentListSelection() {
  const rows = document.querySelector("#element-list").rows;
  count = elements.length;
  for (let i = 0 ; i < count;  i++) {
    rows[i].classList.remove("selected");
    if(elements[(count -i -1)].selected) rows[i].classList.add("selected");
  }
  
}

// Costruzione della lista <table> di oggetti disegnati (anche quelli che non sono visibili)
let listController;
 
function rebuildPaletteElementList() {
  //annullo tutti i listener associati a listController
  if(listController) listController.abort();
  listController = new AbortController();

  const tbody = document.querySelector("#element-list tbody");
  tbody.innerHTML = ""; // Svuota

  for (let i = elements.length - 1; i >= 0; i--) {
    const el = elements[i];
    const row = document.createElement("tr");

    // Nome elemento
    const nameCell = document.createElement("td");
    nameCell.textContent = el.name || `${el.type} ${el.id}`;
    row.appendChild(nameCell);

    // Icona visibilità
    const visCell = document.createElement("td");
    const icon = el.visible ? createCheckIcon(16, 16) : createCrossIcon(16, 16);
    icon.style.cursor = "pointer";
    icon.addEventListener("click", function(event) {
      event.stopPropagation(); // blocca il click dal raggiungere la <tr>
      el.visible = !el.visible;
      rebuildPaletteElementList(); // refresh tabella
      renderCanvas();
    }, {signal: listController.signal});
    visCell.appendChild(icon);
    row.appendChild(visCell);

    // --- SELEZIONE DEGLI OGGETTI---

    // selezione della riga della tabella dell'oggetto selezionato
    if (el.selected) {
      row.classList.add("selected");
    }
    row.addEventListener("click", e => selectElement(e, el), {signal: listController.signal}); 
    tbody.appendChild(row);
  }
}

// aggiornamento delle proprietà dell'elemento
function updateElementPropertyControls(element) {
  // prendo i riferimenti dei container delle proprietà
  const container = document.getElementById("pos&dim-subsection");
  const container2 = document.getElementById("fill-subsection");
  const container3 = document.getElementById("stroke-subsection");

  if (element.type === "rect") {  //rect
    container.querySelector("#rect-x").value = element.x;
    container.querySelector("#rect-y").value = element.y;
    container.querySelector("#rect-width").value = element.width;
    container.querySelector("#rect-height").value = element.height;
  } else if (element.type === "circle") { //circle
    container.querySelector("#circle-cx").value = element.cx;
    container.querySelector("#circle-cy").value = element.cy;
    container.querySelector("#circle-r").value = element.r;
  } else if (element.type === "line") { //line
    container.querySelector("#line-x1").value = element.x1;
    container.querySelector("#line-y1").value = element.y1;
    container.querySelector("#line-x2").value = element.x2;
    container.querySelector("#line-y2").value = element.y2;
  } else if (element.type === "ellipse") { //ellipse
    container.querySelector("#ellipse-cx").value = element.cx;
    container.querySelector("#ellipse-cy").value = element.cy;
    container.querySelector("#ellipse-rx").value = element.rx;
    container.querySelector("#ellipse-ry").value = element.ry;
  } else if (element.type === "arc" || element.type === "ellipse-arc") { //arc o ellipse-arc
    container.querySelector("#arc-cx").value = element.cx;
    container.querySelector("#arc-cy").value = element.cy;
    container.querySelector("#arc-rx").value = element.rx ?? element.r;
    container.querySelector("#arc-ry").value = element.ry ?? element.r;
    container.querySelector("#arc-start").value = element.startAngle;
    container.querySelector("#arc-end").value = element.endAngle;
    container.querySelector("#largeArcFlagSelect").value = element.getArcFlag();
    container.querySelector("#arc-rot").value = element.rotation;
  }

  if(element.type !== "line"){
    container2.querySelector("#fill").value = element.fillStyle.fill  || "#000000";
    container2.querySelector("#opacity").value = element.fillStyle.fillOpacity  || 1;
  }

  container3.querySelector("#strokeColor").value = element.strokeStyle.stroke  || "#000000";
  container3.querySelector("#strokeOpacity").value = element.strokeStyle.strokeOpacity || 1;
  container3.querySelector("#strokeWidth2").value = element.strokeStyle.strokeWidth || 1;
  container3.querySelector("#strokeDasharray").value = element.strokeStyle.strokeDasharray || "";
  container3.querySelector("#strokeLinecap").value = element.strokeStyle.strokeLinecap || "";
  container3.querySelector("#strokeLinejoin").value = element.strokeStyle.strokeLinejoin || "";

}

/*
function selectElementById(id) {
    const selected = elements.find(el => el.id === id);
    if (selected) {
      console.log("Elemento selezionato:", selected);
      showElementProperties2(id);
    }
}
    */
  
// Mostra/modifica proprietà forma selezionata
let inputController;
async function loadElementPropertyControls() {
  let element;
  if(selectedElements.length == 0) element = null;
  else element = selectedElements[selectedElements.length - 1];
  //console.log(element);
  //const element = elements.find(el => el.id === elementId);
  // prendo i riferimenti dei container delle proprietà
  const container = document.getElementById("pos&dim-subsection");
  const container2 = document.getElementById("fill-subsection");
  const container3 = document.getElementById("stroke-subsection");

  if(inputController) inputController.abort();
  inputController = new AbortController();
  // Determina il file HTML da caricare
  let htmlFile = "";
  if (!element) {
    container.innerHTML = "";
    container2.innerHTML = "";
    container3.innerHTML = "";
    return;
  }
  switch(element.type) {
    case "rect": htmlFile = "palette-dim-rect.html"; break;
    case "circle": htmlFile = "palette-dim-circle.html"; break;
    case "arc": htmlFile = "palette-dim-arc.html"; break;
    case "line": htmlFile = "palette-dim-line.html"; break;
    case "ellipse": htmlFile = "palette-dim-ellipse.html"; break;
    case "ellipse-arc": htmlFile = "palette-dim-arc.html"; break;
    // altri tipi...
  }
  // Carica file HTML nel container pos&dim
  let response = await fetch(htmlFile);
  let htmlText = await response.text();
  container.innerHTML = htmlText;
  
  // Ora aggiungo i listener agli input
  if (element.type === "rect") {  //rect
    container.querySelector("#rect-x").addEventListener("change", e => {element.moveTo(parseFloat(e.target.value), element.y);renderCanvas();},{signal:inputController.signal});
    container.querySelector("#rect-y").addEventListener("change", e => {element.moveTo(element.x, parseFloat(e.target.value));renderCanvas();},{signal:inputController.signal});
    container.querySelector("#rect-width").addEventListener("change", e => {element.resize(parseFloat(e.target.value), element.height); renderCanvas();},{signal:inputController.signal});
    container.querySelector("#rect-height").addEventListener("change", e => {element.resize(element.width, parseFloat(e.target.value)); renderCanvas();},{signal:inputController.signal});
  } else if (element.type === "circle") { //circle
    container.querySelector("#circle-cx").addEventListener("change", e => {element.moveTo(parseFloat(e.target.value), element.cy);renderCanvas();},{signal:inputController.signal});
    container.querySelector("#circle-cy").addEventListener("change", e => {element.moveTo(element.cx, parseFloat(e.target.value));renderCanvas();},{signal:inputController.signal});
    container.querySelector("#circle-r").addEventListener("change", e => {element.resize(parseFloat(e.target.value));renderCanvas();},{signal:inputController.signal});
  } else if (element.type === "line") { //line
    container.querySelector("#line-x1").addEventListener("change", e => {element.movePointTo("start", parseFloat(e.target.value), element.y1);renderCanvas();},{signal:inputController.signal});
    container.querySelector("#line-y1").addEventListener("change", e => {element.movePointTo("start", element.x1, parseFloat(e.target.value));renderCanvas();},{signal:inputController.signal});
    container.querySelector("#line-x2").addEventListener("change", e => {element.movePointTo("end", parseFloat(e.target.value), element.y2); renderCanvas();},{signal:inputController.signal});
    container.querySelector("#line-y2").addEventListener("change", e => {element.movePointTo("end", element.x2, parseFloat(e.target.value)); renderCanvas();},{signal:inputController.signal});
  } else if (element.type === "ellipse") { //ellipse
    container.querySelector("#ellipse-cx").addEventListener("change", e => {element.moveTo(parseFloat(e.target.value), element.cy);renderCanvas();},{signal:inputController.signal});
    container.querySelector("#ellipse-cy").addEventListener("change", e => {element.moveTo(element.cx, parseFloat(e.target.value));renderCanvas();},{signal:inputController.signal});
    container.querySelector("#ellipse-rx").addEventListener("change", e => {element.resize(parseFloat(e.target.value), element.ry); renderCanvas();},{signal:inputController.signal});
    container.querySelector("#ellipse-ry").addEventListener("change", e => {element.resize(element.rx, parseFloat(e.target.value)); renderCanvas();},{signal:inputController.signal});
  } else if (element.type === "arc" || element.type === "ellipse-arc") { //arc o ellipse-arc
    container.querySelector("#arc-cx").addEventListener("change", e => {element.moveCenterToX(parseFloat(e.target.value));renderCanvas();},{signal:inputController.signal});
    container.querySelector("#arc-cy").addEventListener("change", e => {element.moveCenterToY(parseFloat(e.target.value));renderCanvas();},{signal:inputController.signal});
    container.querySelector("#arc-rx").addEventListener("change", e => {element.r = parseFloat(e.target.value); renderCanvas();},{signal:inputController.signal});
    container.querySelector("#arc-rx").addEventListener("change", e => {element.setRxAxis(parseFloat(e.target.value)); renderCanvas();},{signal:inputController.signal});
    container.querySelector("#arc-ry").addEventListener("change", e => {element.setRyAxis(parseFloat(e.target.value)); renderCanvas();},{signal:inputController.signal});
    container.querySelector("#arc-start").addEventListener("change", e => {element.setStartAngle(parseFloat(e.target.value)); renderCanvas();},{signal:inputController.signal});
    container.querySelector("#arc-end").addEventListener("change", e => {element.setEndAngle(parseFloat(e.target.value)); renderCanvas();},{signal:inputController.signal});
    container.querySelector("#largeArcFlagSelect").addEventListener("change", e => {element.setArcFlag(e.target.value); renderCanvas();},{signal:inputController.signal});
    container.querySelector("#arc-rot").addEventListener("change", e => {element.setRotation(parseFloat(e.target.value)); renderCanvas();},{signal:inputController.signal});
  }

  // Carico la sottosezione riempimento
  if(element.type !== "line"){
    response = await fetch("palette-fill.html");
    htmlText = await response.text();
    container2.innerHTML = htmlText;

    container2.querySelector("#fill").addEventListener("input", e => {element.fillStyle.fill = e.target.value;applyFillStyle(element.svgElement, element.fillStyle);renderCanvas();},{signal:inputController.signal});
    container2.querySelector("#opacity").addEventListener("input", e => {element.fillStyle.fillOpacity = parseFloat(e.target.value);applyFillStyle(element.svgElement, element.fillStyle);renderCanvas();},{signal:inputController.signal});
  }else{
    container2.innerHTML = "";
  }

  response = await fetch("palette-stroke.html");
  htmlText = await response.text();
  container3.innerHTML = htmlText;
  container3.querySelector("#strokeColor").addEventListener("input", e => {element.strokeStyle.stroke = e.target.value;applyStrokeStyle(element.svgElement, element.strokeStyle);renderCanvas();},{signal:inputController.signal});
  container3.querySelector("#strokeOpacity").addEventListener("input", e => {element.strokeStyle.strokeOpacity = parseFloat(e.target.value);applyStrokeStyle(element.svgElement, element.strokeStyle);renderCanvas();},{signal:inputController.signal});
  container3.querySelector("#strokeWidth2").addEventListener("input", e => {element.strokeStyle.strokeWidth = parseFloat(e.target.value);applyStrokeStyle(element.svgElement, element.strokeStyle);renderCanvas();},{signal:inputController.signal});
  container3.querySelector("#strokeDasharray").addEventListener("input", e => {element.strokeStyle.strokeDasharray = e.target.value;applyStrokeStyle(element.svgElement, element.strokeStyle);renderCanvas();},{signal:inputController.signal});
  container3.querySelector("#strokeLinecap").addEventListener("input", e => {element.strokeStyle.strokeLinecap = e.target.value;applyStrokeStyle(element.svgElement, element.strokeStyle);renderCanvas();},{signal:inputController.signal});
  container3.querySelector("#strokeLinejoin").addEventListener("input", e => {element.strokeStyle.strokeLinejoin = e.target.value;applyStrokeStyle(element.svgElement, element.strokeStyle);renderCanvas();},{signal:inputController.signal});

  
  renderCanvas();
  
  updateElementPropertyControls(element);
}  

 

// ====================
// FINE PALETTE.JS
// ====================