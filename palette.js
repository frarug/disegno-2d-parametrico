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

      /*
      row.addEventListener("click", function() {
        selectedElementIndex = i; // imposti l'indice
        document.querySelectorAll("#element-list tbody tr")
                .forEach(tr => tr.classList.remove("selected")); // rimuovi dai precedenti
        this.classList.add("selected"); // evidenzia questa riga
        showElementProperties2(elements[i].id); // mostra proprietà
      });
      */

      // Icona visibilità
      const visCell = document.createElement("td");
      const icon = el.visible ? createCheckIcon(16, 16) : createCrossIcon(16, 16);
      icon.style.cursor = "pointer";
      icon.addEventListener("click", function(event) {
        event.stopPropagation(); // blocca il click dal raggiungere la <tr>
        el.visible = !el.visible;
        updateElements(); // refresh tabella
        renderCanvas();
        // eventuale refresh del disegno
        // drawElements(svgContainer);
      });
      

      visCell.appendChild(icon);
      row.appendChild(visCell);

      // --- SELEZIONE ---
      if (el.selected) {
        row.classList.add("selected");
      }

      row.addEventListener("click", (e) => {
        if (e.shiftKey) {
            // Toggle selezione multipla
            el.selected = !el.selected;
        } else {
            // Selezione singola
            elements.forEach(obj => obj.selected = false);
            el.selected = true;
        }
        updateElements();
        showElementProperties2(elements[i].id); // mostra proprietà
        renderCanvas();
      });
      tbody.appendChild(row);
    }
}


function selectElementById(id) {
    const selected = elements.find(el => el.id === id);
    if (selected) {
      console.log("Elemento selezionato:", selected);
      showElementProperties2(id);
    }
}
  
// Mostra/modifica proprietà forma selezionata
async function showElementProperties2(elementId) {
  const element = elements.find(el => el.id === elementId);
  if (!element) return;

  // Determina il file HTML da caricare
  let htmlFile = "";
  switch(element.type) {
    case "rect": htmlFile = "palette-dim-rect.html"; break;
    case "circle": htmlFile = "palette-dim-circle.html"; break;
    case "arc": htmlFile = "palette-dim-arc.html"; break;
    case "line": htmlFile = "palette-dim-line.html"; break;
    case "ellipse": htmlFile = "palette-dim-ellipse.html"; break;
    // altri tipi...
  }

  // Carica file HTML nel container pos&dim
  const container = document.getElementById("pos&dim-subsection");
  let response = await fetch(htmlFile);
  let htmlText = await response.text();
  container.innerHTML = htmlText;
  

  // Ora valorizza gli input in base al tipo e all'elemento
  if (element.type === "rect") {  //rect
    container.querySelector("#rect-x").value = element.x;
    container.querySelector("#rect-y").value = element.y;
    container.querySelector("#rect-width").value = element.width;
    container.querySelector("#rect-height").value = element.height;
    // event listener per aggiornare element
    container.querySelector("#rect-x").addEventListener("input", e => {element.x = parseFloat(e.target.value);renderCanvas();});
    container.querySelector("#rect-y").addEventListener("input", e => {element.y = parseFloat(e.target.value);renderCanvas();});
    container.querySelector("#rect-width").addEventListener("input", e => {element.width = parseFloat(e.target.value); renderCanvas();});
    container.querySelector("#rect-height").addEventListener("input", e => {element.height = parseFloat(e.target.value); renderCanvas();});
  } else if (element.type === "circle") { //circle
    container.querySelector("#circle-cx").value = element.cx;
    container.querySelector("#circle-cy").value = element.cy;
    container.querySelector("#circle-r").value = element.r;
    // event listener per aggiornare element
    container.querySelector("#circle-cx").addEventListener("input", e => {element.cx = parseFloat(e.target.value);renderCanvas();});
    container.querySelector("#circle-cy").addEventListener("input", e => {element.cy = parseFloat(e.target.value);renderCanvas();});
    container.querySelector("#circle-r").addEventListener("input", e => {element.r = parseFloat(e.target.value);renderCanvas();});
  }if (element.type === "line") { //line
    container.querySelector("#line-x1").value = element.x1;
    container.querySelector("#line-y1").value = element.y1;
    container.querySelector("#line-x2").value = element.x2;
    container.querySelector("#line-y2").value = element.y2;
    // event listener per aggiornare element
    container.querySelector("#line-x1").addEventListener("input", e => {element.x1 = parseFloat(e.target.value);renderCanvas();});
    container.querySelector("#line-y1").addEventListener("input", e => {element.y1 = parseFloat(e.target.value);renderCanvas();});
    container.querySelector("#line-x2").addEventListener("input", e => {element.x2 = parseFloat(e.target.value); renderCanvas();});
    container.querySelector("#line-y2").addEventListener("input", e => {element.y2 = parseFloat(e.target.value); renderCanvas();});
  }if (element.type === "ellipse") { //ellipse
    container.querySelector("#ellipse-cx").value = element.cx;
    container.querySelector("#ellipse-cy").value = element.cy;
    container.querySelector("#ellipse-rx").value = element.rx;
    container.querySelector("#ellipse-ry").value = element.ry;
    // event listener per aggiornare element
    container.querySelector("#ellipse-cx").addEventListener("input", e => {element.cx = parseFloat(e.target.value);renderCanvas();});
    container.querySelector("#ellipse-cy").addEventListener("input", e => {element.cy = parseFloat(e.target.value);renderCanvas();});
    container.querySelector("#ellipse-rx").addEventListener("input", e => {element.rx = parseFloat(e.target.value); renderCanvas();});
    container.querySelector("#ellipse-ry").addEventListener("input", e => {element.ry = parseFloat(e.target.value); renderCanvas();});
  }if (element.type === "arc") { //arc
    container.querySelector("#arc-cx").value = element.cx;
    container.querySelector("#arc-cy").value = element.cy;
    container.querySelector("#arc-rx").value = element.rx;
    container.querySelector("#arc-ry").value = element.ry;
    container.querySelector("#arc-start").value = element.start;
    container.querySelector("#arc-end").value = element.end;
    // event listener per aggiornare element
    container.querySelector("#arc-cx").addEventListener("input", e => {element.cx = parseFloat(e.target.value);renderCanvas();});
    container.querySelector("#arc-cy").addEventListener("input", e => {element.cy = parseFloat(e.target.value);renderCanvas();});
    container.querySelector("#arc-rx").addEventListener("input", e => {element.rx = parseFloat(e.target.value); renderCanvas();});
    container.querySelector("#arc-ry").addEventListener("input", e => {element.ry = parseFloat(e.target.value); renderCanvas();});
    container.querySelector("#arc-start").addEventListener("input", e => {element.start = parseFloat(e.target.value); renderCanvas();});
    container.querySelector("#arc-end").addEventListener("input", e => {element.end = parseFloat(e.target.value); renderCanvas();});
  }

  // Altre sezioni della palette potresti caricarle con la stessa logica
  const container2 = document.getElementById("fill-subsection");
  if(element.type !== "line"){
    response = await fetch("palette-fill.html");
    htmlText = await response.text();
    container2.innerHTML = htmlText;

    container2.querySelector("#fill").value = element.fillStyle.fill  || "#000000";
    container2.querySelector("#fill").addEventListener("input", e => {element.fillStyle.fill = e.target.value;renderCanvas();});
    container2.querySelector("#opacity").value = element.fillStyle.fillOpacity  || 1;
    container2.querySelector("#opacity").addEventListener("input", e => {element.fillStyle.fillOpacity = parseFloat(e.target.value);renderCanvas();});
  }else{
    container2.innerHTML = "";
  }
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