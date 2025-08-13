// ====================
// INTERACTIONS: Pan e Zoom
// ====================
/*
//isPanning e startPan {x, y} sono variabili globali che sono definite in state.js;

// Eventi mouse sulla canvas
const canvas = document.getElementById("canvas");
if(canvas === null) console.warn(canvas);
canvas.addEventListener("mousedown", (e) => {
  if (e.shiftKey) { // Pan solo con Shift
    isPanning = true;
    canvas.style.cursor = "grabbing"; // cambia il cursore quando premi
    startPan.x = e.clientX;
    startPan.y = e.clientY;
    //console.warn(e);
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (!isPanning) return;
  const dx = (e.clientX - startPan.x) ;
  const dy = (e.clientY - startPan.y) ;
  canvasOffsetX += dx;
  canvasOffsetY -= dy;
  //console.log("canvasOffsetX:"+canvasOffsetX+" canvasOffsetY:"+canvasOffsetY);
  startPan.x = e.clientX;
  startPan.y = e.clientY;
  renderCanvas();
});

canvas.addEventListener("mouseup", () => {
  isPanning = false;
});

canvas.addEventListener("mouseleave", () => {
  isPanning = false;
});

// Zoom con rotella del mouse

canvas.addEventListener("wheel", (e) => {
  e.preventDefault();
  const zoomFactor = 1.01;
  const direction = e.deltaY > 0 ? 1 / zoomFactor : zoomFactor;

  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  const worldX = (mx - canvasOffsetX) / (canvasZoomFactor * pxPerMM);
  const worldY = ((canvasHeight - my) - canvasOffsetY) / (canvasZoomFactor * pxPerMM); 

  canvasZoomFactor *= direction;
  canvasOffsetX = mx - (worldX * canvasZoomFactor * pxPerMM);
  canvasOffsetY = canvasHeight - my - (worldY * canvasZoomFactor * pxPerMM);
  renderCanvas();
  updateZoomDisplay();
}, { passive: false });

// ====================
// FINE INTERACTIONS
// ====================

*/

// ====================
// INTERACTIONS: Pan e Zoom ecc
// ====================

// listener per gli stati della app
document.addEventListener("keydown", (e) => {
  if (e.altKey) {
    if (currentState !== AppStates.PAN) {
      previousState = currentState;
      currentState = AppStates.PAN;
      canvas.style.cursor = "grab"; // cursore pan
    }
  } else if (e.key === "m") {
    currentState = AppStates.MOVE;
    canvas.style.cursor = "move";
  } else if (e.key === "r") {
    currentState = AppStates.ROTATE;
    canvas.style.cursor = "crosshair";
  } else if (e.key === " ") {
    currentState = AppStates.DEFAULT;
    canvas.style.cursor = "default";
  }
});

document.addEventListener("keyup", (e) => {
  if (e.altKey === false && currentState === AppStates.PAN) {
    console.log(previousState);
    currentState = previousState;
    canvas.style.cursor = "default";
    if (currentState === AppStates.MOVE) canvas.style.cursor = "move";
    else if (currentState === AppStates.ROTATE) canvas.style.cursor = "crosshair";
    else if (currentState === AppStates.DEFAULT) canvas.style.cursor = "default";
  }
});


const canvas = document.getElementById("canvas");
if (canvas === null) console.warn("Canvas non trovato:", canvas);

// Pan con Shift
//  currentState, previousState e startPan {x, y} sono variabili globali definite in state.js
canvas.addEventListener("mousedown", (e) => {
  if (currentState === AppStates.PAN) {
    canvas.style.cursor = "grabbing";
    startPan.x = e.clientX;
    startPan.y = e.clientY;

    // Attacco mousemove e mouseup a livello globale per continuare 
    // il pan anche col mouse al di fuori della finestra
    document.addEventListener("mousemove", handlePanMove);
    document.addEventListener("mouseup", handlePanEnd);
  }
  else if (currentState === AppStates.MOVE) {
    if (selectedElements().length === 0) return; // nessun oggetto selezionato

    startMove.x = e.clientX;
    startMove.y = e.clientY;

    document.addEventListener("mousemove", handleMoveDrag);
    document.addEventListener("mouseup", handleMoveEnd);

    canvas.style.cursor = "move";
  }
  else if (currentState === AppStates.DEFAULT) {
    const clickedElement = getElementAtPosition(e.clientX, e.clientY);
    if (clickedElement) {
        if (e.shiftKey) {
            // Toggle selezione
            clickedElement.selected = !clickedElement.selected;
        } else {
            // Selezione singola
            elements.forEach(el => el.selected = false);
            clickedElement.selected = true;
        }
    } else {
        // click su vuoto: cancella selezione SOLO se non c'è Shift
        if (!e.shiftKey) {
          elements.forEach(o => o.selected = false);
        }
    }
    renderCanvas();
}
});


function handleMoveDrag(e) {
  const dxScreen = e.clientX - startMove.x;
  const dyScreen = e.clientY - startMove.y;

  // Conversione da pixel a unità mondo
  const dxWorld = dxScreen / (canvasZoomFactor * pxPerMM);
  const dyWorld = -dyScreen / (canvasZoomFactor * pxPerMM); // attenzione segno Y

  // Muovo tutti gli elementi selezionati
  for (let el of selectedElements()) {
      moveElement(el, dxWorld, dyWorld);
  }

  startMove.x = e.clientX;
  startMove.y = e.clientY;

  renderCanvas();
}

function handleMoveEnd() {
  document.removeEventListener("mousemove", handleMoveDrag);
  document.removeEventListener("mouseup", handleMoveEnd);
  //canvas.style.cursor = "default";
}

// Helper: restituisce array degli elementi selezionati
function selectedElements() {
  return elements.filter(el => el.selected);
}

function handlePanMove(e) {
  if (currentState !== AppStates.PAN) return;
  const dx = e.clientX - startPan.x;
  const dy = e.clientY - startPan.y;
  canvasOffsetX += dx;
  canvasOffsetY -= dy;
  startPan.x = e.clientX;
  startPan.y = e.clientY;
  renderCanvas();
}

function handlePanEnd() {
  if (currentState === AppStates.PAN) {
    canvas.style.cursor = "grab"; // mantengo il grab quando rilascio, finché lo Shift è premuto
    document.removeEventListener("mousemove", handlePanMove);
    document.removeEventListener("mouseup", handlePanEnd);
  }
}

function getElementAtPosition(screenX, screenY) {
  // Ottieni il bounding rect della canvas
  const rect = canvas.getBoundingClientRect();

  // Coordinate relative alla canvas
  const mx = screenX - rect.left;
  const my = screenY - rect.top;

  // Conversione in coordinate mondo
  const worldX = (mx - canvasOffsetX) / (canvasZoomFactor * pxPerMM);
  const worldY = ((canvasHeight - my) - canvasOffsetY) / (canvasZoomFactor * pxPerMM);

  // Scorri gli elementi dal più “sopra” al più “sotto”
  for (let i = elements.length - 1; i >= 0; i--) {
      if (elements[i].containsPoint(worldX, worldY)) {
          return elements[i];
      }
  }
  return null;
}


// Zoom con rotella
canvas.addEventListener("wheel", (e) => {
  e.preventDefault();
  const zoomFactor = 1.01;
  const direction = e.deltaY > 0 ? 1 / zoomFactor : zoomFactor;

  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  const worldX = (mx - canvasOffsetX) / (canvasZoomFactor * pxPerMM);
  const worldY = ((canvasHeight - my) - canvasOffsetY) / (canvasZoomFactor * pxPerMM);

  canvasZoomFactor *= direction;
  canvasOffsetX = mx - (worldX * canvasZoomFactor * pxPerMM);
  canvasOffsetY = canvasHeight - my - (worldY * canvasZoomFactor * pxPerMM);
  renderCanvas();
  updateZoomDisplay();
}, { passive: false });

// ====================
// FINE INTERACTIONS
// ====================