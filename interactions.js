// ====================
// INTERACTIONS: Pan e Zoom ecc
// ====================
if (svg === null) console.warn("Canvas non trovato:", svg);

// listener per gli stati della app comandati da tastiera
document.addEventListener("keydown", (e) => {
  console.log("---------------------:");
  if (e.altKey) {
    if (currentState !== AppStates.PAN) {
      previousState = currentState;
      currentState = AppStates.PAN;
      svg.style.cursor = "grab"; // cursore pan
    }
  } else if (e.key === "m") {
    currentState = AppStates.MOVE;
    svg.style.cursor = "move";
  } else if (e.key === "r") {
    currentState = AppStates.ROTATE;
    svg.style.cursor = "crosshair";
  }else if (e.key === "s") {
    currentState = AppStates.SCALE;
    svg.style.cursor = "pointer";
  } else if (e.key === " " || e.key === "Escape") {
    currentState = AppStates.DEFAULT;
    svg.style.cursor = "default";
    stickyMode = false;
  }
  console.log("keydown! currentState:",currentState);
});

// listener per tornare allo stato precedente qundo si 
// rilascia il tasto alt (option -> PAN)
document.addEventListener("keyup", (e) => {
  if (e.altKey === false && currentState === AppStates.PAN) {
    console.log("keyup!, previousState:", previousState);
    currentState = previousState;
    svg.style.cursor = "default";
    if (currentState === AppStates.MOVE) svg.style.cursor = "move";
    else if (currentState === AppStates.ROTATE) svg.style.cursor = "crosshair";
    else if (currentState === AppStates.SCALE) svg.style.cursor = "pointer";
    else if (currentState === AppStates.DEFAULT) svg.style.cursor = "default";
  }
});



//  currentState, previousState e startPan {x, y} sono variabili globali definite in globals.js
// aggiungo il listener per il mousedown alla canvas
svg.addEventListener("mousedown", mousedownHandler);
svg.addEventListener("mousemove", mouseMove);

function mouseMove(e) {
  updatePointerPosition(e.clientX, e.clientY);
}

function mousedownHandler(e) {
  //console.log("mousedownHandler! AppStatus: ", currentState, ", stickyMode:", stickyMode);
  //prendo il momento del mousedown e la posizione del mouse
  mouseDownTime = Date.now();
  lastX = e.clientX;
  lastY = e.clientY;

  // gestisce il Pan della canvas
  if (currentState === AppStates.PAN) {
    console.log("mousedown! currentState: ", AppStates.PAN, ", stickyMode:", stickyMode);
    //svg.style.cursor = "grabbing";
    startPan.x = e.clientX;
    startPan.y = e.clientY;
    // Attacco mousemove e mouseup a livello globale per continuare 
    // il pan anche col mouse al di fuori della finestra
    document.addEventListener("mousemove", panDrag);
    document.addEventListener("mouseup", panEnd);
  }
  // gestisce lo spostamento di oggetti sulla canvas
  else if (currentState === AppStates.MOVE) {
    //console.log("mousedown! currentState: ", AppStates.MOVE, ", stickyMode:", stickyMode);
    if (selectedElements.length === 0) return; // nessun oggetto selezionato
    //svg.style.cursor = "move";
    // Salva stato iniziale in base al tipo
    //const orig = { ...element };
    startMove.x = e.clientX;
    startMove.y = e.clientY;
    document.addEventListener("mousemove", moveDrag);
    document.addEventListener("mouseup", moveEnd);
  }
  // gestisco lo SCALE
  else if(currentState === AppStates.SCALE) {  
    //console.log("mousedown! currentState: ", AppStates.SCALE, ", stickyMode:", stickyMode);  
    if (selectedElements.length === 0) return; // nessun oggetto selezionato    
    let handleType = e.target && e.target.dataset && e.target.dataset.type;
    // gestione click su un handle
    if(!handleType) return;
    currentHandle = e.target;
    startScale.x = e.clientX;
    startScale.y = e.clientY;
  
    // copia gli stati iniziali degli elementi selezionati
    currentScaleOrig = selectedElements.map(el => ({ el, orig: { ...el } }));
    document.addEventListener("mousemove", scaleDrag);
    document.addEventListener("mouseup", scaleEnd);  
  }
  // gestisce la selezione di oggetti sulla canvas
  else if (currentState === AppStates.DEFAULT) {
    //console.log("mousedown! currentState: ", AppStates.DEFAULT, ", stickyMode:", stickyMode);
    const clickedElement = getElementAtPosition(e.clientX, e.clientY);
    selectElement(e, clickedElement);
    //if(clickedElement) clickedElement.handler.adjustPosition();
  }
};

function doNothing(e) {

}


// seleziona un oggetto della canvas
function selectElement(e, el){
  if(el){
    if (e.shiftKey) {  // Toggle selezione multipla
      el.select(!el.selected);
      if (el.selected) selectedElements.push(el);
      else selectedElements.splice(selectedElements.findIndex(obj  => obj.id === el.id), 1);
    } else {   // Selezione singola       
        elements.forEach(obj => obj.select(false));
        el.select(true);
        selectedElements.length = 0;
        selectedElements.push(el);
    }
  }else{ // selezione nulla
    elements.forEach(obj => obj.select(false));
    selectedElements.length = 0;
  }
  console.log(selectedElements);
  loadElementPropertyControls(); // carica il file delle proprietà dell'elemento el
  updatePaletteElmentListSelection(); // colora le righe degli oggetti selezionati 
  renderCanvas();
}

function panDrag(e) {
  if (currentState !== AppStates.PAN) return;
  const dx = e.clientX - startPan.x;
  const dy = e.clientY - startPan.y;
  canvasOffsetX += dx;
  canvasOffsetY -= dy;
  startPan.x = e.clientX;
  startPan.y = e.clientY;
  renderCanvas();
}
function panEnd() {
  if (currentState === AppStates.PAN) {
    svg.style.cursor = "grab"; // mantengo il grab quando rilascio, finché lo Shift è premuto
    document.removeEventListener("mousemove", panDrag);
    document.removeEventListener("mouseup", panEnd);
  }
}

function moveDrag(e) {
  if (currentState !== AppStates.MOVE) return;
  //console.log(" moveDrag...  currentState:", AppStates.MOVE, ", stickyMode:", stickyMode);
  const dxScreen = e.clientX - startMove.x;
  const dyScreen = e.clientY - startMove.y;
  // Conversione da pixel a unità mondo
  const dx = dxScreen / (canvasZoomFactor * pxPerMM);
  const dy = -dyScreen / (canvasZoomFactor * pxPerMM); // attenzione segno Y
  // Muovo tutti gli elementi selezionati
  for (let el of selectedElements) {
      el.moveBy(dx, dy);
  }
  startMove.x = e.clientX;
  startMove.y = e.clientY;
  renderCanvas();
  // aggiorno le info di posizione e 
  // dimensione nella palette di controllo
  updateElementPropertyControls(selectedElements[selectedElements.length-1]);
}
function moveEnd() {
  //console.log("dentro handleMoveEnd.. (interaction.js)");
  if((mouseDownTime +300) < Date.now() || stickyMode){
    document.removeEventListener("mousemove", moveDrag);
    document.removeEventListener("mouseup", moveEnd);
    for (let el of selectedElements) {
      el.applyPrecision();
    }
    updateElementPropertyControls(selectedElements[selectedElements.length-1]);
    stickyMode = false;
  }else{
    stickyMode = true;
  }
  //console.log("stickyMode:", stickyMode);
}

// variabili per la scala
let currentScaleOrig = null;


function scaleDrag(e) {
  if (currentState !== AppStates.SCALE) return;
  if (!currentScaleOrig) return;
  //console.log(" scaleDrag...  currentState:", AppStates.MOVE, ", stickyMode:", stickyMode);

  handleType = currentHandle.dataset.type;
  //console.log("drag su un handle:", handleType);
  const dx = (e.clientX - startScale.x) / (canvasZoomFactor * pxPerMM);
  const dy = -(e.clientY - startScale.y) / (canvasZoomFactor * pxPerMM);

  //for (let el of selectedElements) {
  for (let { el, orig } of currentScaleOrig) {
    //resizeElement(element, dx, dy, handleType);
    //console.log("--> scaleDrag: element.type:", el.type, ", orig:",orig, ", dx:",dx, ", dy:",dy );
    switch (el.type) {
      case "line": resizeLine(el, orig, dx, dy, handleType); break;
      case "rect": resizeRect(el, orig, dx, dy, handleType); break;
      case "circle": resizeCircle(el, orig, dx, dy, handleType); break;
      case "ellipse": resizeEllipse(el, orig, dx, dy, handleType); break;
      case "arc": resizeArc(el, orig, dx, dy, handleType); break;
      // Qui in futuro possiamo aggiungere poligoni, archi ecc.
    }
    
  }    
  renderCanvas();
  // aggiorno le info di posizione e 
  // dimensione nella palette di controllo
  updateElementPropertyControls(selectedElements[selectedElements.length-1]);
}

function scaleEnd() {
  if((mouseDownTime +300) < Date.now() || stickyMode){
    document.removeEventListener("mousemove", scaleDrag);
    document.removeEventListener("mouseup", scaleEnd);
    for (let el of selectedElements) {
      el.applyPrecision();
    }
    stickyMode = false;
    currentScaleOrig = null;
    currentHandle = null;
    //console.log("listener rimossi!!!!!!!!  stickyMode:", stickyMode);
    updateElementPropertyControls(selectedElements[selectedElements.length-1]);
  }else {
    stickyMode = true;
  }
}

// Helper: restituisce array degli elementi selezionati
/*
function getSelectedElements() {
  //return elements.filter(el => el.selected);
  return selectedElements;
}


// funzioni chiamate dai listener degli handler

function onHandleMouseDown(e, handleType, element) {
  console.log("dentro onHandleMouseDown.. (interaction.js)");
  if (currentState === AppStates.MOVE) {
      //startMoveElement(e, element);
      startMove.x = e.clientX;
      startMove.y = e.clientY;
      handleMoveDrag(e);
  } else if (currentState === AppStates.SCALE) {
      //startMove.x = e.clientX;
      //startMove.y = e.clientY;
      startResizeElement(e, element, handleType);
  } else if (currentState === AppStates.ROTATE) {
      startRotateElement(e, element);
  }
}
  
function onHandleMouseMove(e, handleType, element) {
  console.log("dentro onHandleMouseMove.. (interaction.js)");
  if (currentState === AppStates.MOVE) {
      //endMoveElement(e, element);
      startMove.x = e.clientX;
      startMove.y = e.clientY;
      handleMoveDrag(e);
  } else if (currentState === AppStates.SCALE) {
      //handleResizeElement(e, element, handleType);
  } else if (currentState === AppStates.ROTATE) {
      //handleRotateElement(e, element);
  }
}
*/
function getElementAtPosition(screenX, screenY) {
  // Ottieni il bounding rect della canvas
  const rect = canvas.getBoundingClientRect();

  // Coordinate relative alla canvas
  const mx = screenX - rect.left;
  const my = screenY - rect.top;

  // Conversione in coordinate mondo
  const worldX = (mx - canvasOffsetX) / (canvasZoomFactor * pxPerMM);
  const worldY = ((canvasHeight - my) - canvasOffsetY) / (canvasZoomFactor * pxPerMM);

  // Scorri gli elementi dal più “sopra” al più “sotto” tra quelli visibili
  for (let i = elements.length - 1; i >= 0; i--) {
      if (elements[i].visible && elements[i].containsPoint(worldX, worldY)) {
          return elements[i];
      }
  }
  return null;
}


// Zoom con rotella
svg.addEventListener("wheel", (e) => {
  e.preventDefault();
  let zoomFactor  = 1.01;
  if(e.shiftKey) zoomFactor = 1.1;
  const direction = e.deltaY > 0 ? 1 / zoomFactor : zoomFactor;

  const rect = svg.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  const worldX = (mx - canvasOffsetX) / (canvasZoomFactor * pxPerMM);
  const worldY = ((canvasHeight - my) - canvasOffsetY) / (canvasZoomFactor * pxPerMM);

  canvasZoomFactor *= direction;
  canvasOffsetX = mx - (worldX * canvasZoomFactor * pxPerMM);
  canvasOffsetY = canvasHeight - my - (worldY * canvasZoomFactor * pxPerMM);
  renderCanvas();
  updateZoomDisplay();
  for(let e of selectedElements){
    e.handler.adjustCanvasZoom();
  }
}, { passive: false });

// ====================
// FINE INTERACTIONS
// ====================