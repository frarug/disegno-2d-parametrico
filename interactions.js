// ====================
// INTERACTIONS: Pan e Zoom
// ====================

//let isPanning = false;
//let startPan = { x: 0, y: 0 };

// Eventi mouse sulla canvas
const canvas = document.getElementById("canvas");
if(canvas === null) console.warn(canvas);
canvas.addEventListener("mousedown", (e) => {
  isPanning = true;
  startPan.x = e.clientX;
  startPan.y = e.clientY;
  //console.warn(e);
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
/*
canvas.addEventListenerOld("wheel", (e) => {
  e.preventDefault();

  const zoomFactor = 1.01;
  const direction = e.deltaY > 0 ? 1 / zoomFactor : zoomFactor;

  // Zoom centrato nel punto del mouse
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  const worldX = (mx - canvasOffsetX) / canvasZoomFactor;
  const worldY = (my - canvasOffsetY) / canvasZoomFactor;

  canvasZoomFactor *= direction;

  canvasOffsetX = mx - worldX * canvasZoomFactor;
  canvasOffsetY = my - worldY * canvasZoomFactor;

  //console.warn(canvasZoomFactor);
  renderCanvas();
  updateZoomDisplay();
}, { passive: false });
*/
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

  //console.log("direction:"+direction+" canvasZoomFactor:"+canvasZoomFactor);
  //console.log("mx:"+mx+" my:"+my+" canvasHeight - my:"+(canvasHeight - my));
  //console.log("worldX:"+worldX+" worldY:"+worldY);
  //console.log("canvasOffsetX:"+canvasOffsetX+" canvasOffsetY:"+canvasOffsetY);

  renderCanvas();
  updateZoomDisplay();
}, { passive: false });

// ====================
// FINE INTERACTIONS
// ====================
