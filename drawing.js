// drawing.js


// INIZIO: Inizializzazione della canvas SVG
function initDrawingCanvas() {
  // Calcola larghezza e altezza della canvas in pixel
  canvasWidth = window.innerWidth;
  canvasHeight = window.innerHeight;

  // Imposta dimensione SVG in pixel
  svg.setAttribute("width", canvasWidth);
  svg.setAttribute("height", canvasHeight);
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  svg.setAttribute("transform", `scale(1, -1)`); // inverte il verso dell'asse Y
}
// FINE: Inizializzazione della canvas SVG

  
  
// INIZIO: Funzione principale di disegno
function renderCanvas() {
  //console.log(svg);
  if (!svg) return;
  /*nuovo paradigma retain & update
  svg.replaceChildren(); // Pulisce eventuali elementi precedenti
  */
  gridLayer.replaceChildren(); // Pulisce il layer della griglia
  axesLayer.replaceChildren(); // Pulisce il layer degli assi

  // Imposto l'origine della viewBox 
  const viewBoxX = -canvasOffsetX/ pxPerMM /canvasZoomFactor; 
  const viewBoxY = -canvasOffsetY/ pxPerMM /canvasZoomFactor; 
  // Dimensioni della viewBox in unità logiche (tenendo conto dello zoom)
  const viewWidth = (canvasWidth / pxPerMM) / canvasZoomFactor;
  const viewHeight = (canvasHeight / pxPerMM) / canvasZoomFactor;

  // Applica la viewBox con coordinate logiche
  svg.setAttribute("viewBox", `${viewBoxX} ${viewBoxY} ${viewWidth} ${viewHeight}`);
  //console.log(svg.getAttribute("viewBox"));

  if (showGrid) drawGrid();    
  drawElements(svg);
  if (showAxes) drawAxes();
}

// drawElements è la routine che si occupa di iterare l'array elements[]
// e ordina agli elementi di disegnarsi
function drawElements(svg) {
  for (const el of elements) {
    el.render(svg);
  }
  for (const el of elements) {
      el.drawHandlers(svg);
  }
}
// FINE: Funzione principale di disegno

// INIZIO: Disegno della griglia
function drawGrid() {
  //console.log("dentro drawGrid(svg)");
  // translateX è la misura in mm di quanto è traslata a destra l'origine rispetto al margine sx della finestra
  const translateX = canvasOffsetX/ pxPerMM /canvasZoomFactor;
  // translateY è la misura in mm di quanto è traslata in alto l'origine rispetto al margine inferiore della finestra
  const translateY = canvasOffsetY/ pxPerMM /canvasZoomFactor;
  // viewWidth è la misura in mm della larghezza della fiestra
  const viewWidth = (canvasWidth / pxPerMM)/canvasZoomFactor;
  // viewHeight è la misura in mm dell'altezza della finestra
  const viewHeight = (canvasHeight / pxPerMM) /canvasZoomFactor;
  // quindi il rettangolo visibile nella finestra (viewport) va da
  //  -translateX a viewWidth - translateX (in orizzontale) e 
  // -translateY a viewHeight - translateY (in verticale)
  for (let x = -translateX+(translateX%gridSpacing); x <= (viewWidth - translateX); x += gridSpacing) {
      const grr = document.createElementNS("http://www.w3.org/2000/svg", "line");
      grr.setAttribute("x1", x);
      grr.setAttribute("y1", -translateY);
      grr.setAttribute("x2", x);
      grr.setAttribute("y2", viewHeight - translateY);
      grr.setAttribute("stroke", "darkgray");
      grr.setAttribute("stroke-width", 1);
      grr.setAttribute("vector-effect", "non-scaling-stroke");
      gridLayer.appendChild(grr);
  }
  for (let y = -translateY+(translateY%gridSpacing); y <= (viewWidth - translateY); y += gridSpacing) {
      const grr = document.createElementNS("http://www.w3.org/2000/svg", "line");
      grr.setAttribute("x1", -translateX);
      grr.setAttribute("y1", y);
      grr.setAttribute("x2", viewWidth-translateX);
      grr.setAttribute("y2", y);
      grr.setAttribute("stroke", "darkgray");
      grr.setAttribute("stroke-width", 1);
      grr.setAttribute("vector-effect", "non-scaling-stroke");
      gridLayer.appendChild(grr);
  }
}
// FINE: Disegno della griglia

// INIZIO: Disegno degli assi cartesiani
function drawAxes() {
  if (!showAxes) return;

  const translateX = canvasOffsetX/ pxPerMM /canvasZoomFactor;;
  const translateY = canvasOffsetY/ pxPerMM /canvasZoomFactor;;

  const arrowSize = 3/canvasZoomFactor;
  const viewWidth = (canvasWidth / pxPerMM)/canvasZoomFactor;
  const viewHeight = (canvasHeight / pxPerMM) /canvasZoomFactor;

  // Asse X
  const Xnegative = document.createElementNS("http://www.w3.org/2000/svg", "line");
  Xnegative.setAttribute("x2", -translateX);
  Xnegative.setAttribute("stroke", "#00ff00");
  Xnegative.setAttribute("stroke-width", 1.5);
  Xnegative.setAttribute("vector-effect", "non-scaling-stroke");
  Xnegative.setAttribute("stroke-dasharray", "2,2");
  axesLayer.appendChild(Xnegative);
  const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
  //xAxis.setAttribute("x1", 0);
  //xAxis.setAttribute("y1", 0);
  xAxis.setAttribute("x2", viewWidth - translateX - arrowSize * 2);
  //xAxis.setAttribute("y2", 0);
  xAxis.setAttribute("stroke", "#00ff00");
  xAxis.setAttribute("stroke-width", 1.5);
  xAxis.setAttribute("vector-effect", "non-scaling-stroke");
  axesLayer.appendChild(xAxis);
  //console.log("viewWidth:"+viewWidth+" translateX:"+translateX);
  //console.log(xAxis.getAttribute("x2"));

  // Freccia X
  const xTip = viewWidth - translateX - arrowSize * 2;
  const xArrow = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  xArrow.setAttribute("points", `
    ${xTip},${-arrowSize / 2}
    ${xTip + arrowSize},0
    ${xTip},${arrowSize / 2}
  `);
  xArrow.setAttribute("fill", "#00ff00");
  //xArrow.setAttribute("stroke", "#00ff00");
  //xArrow.setAttribute("stroke-width", "1");
  //xArrow.setAttribute("vector-effect", "non-scaling-stroke");
  axesLayer.appendChild(xArrow);

  // Asse Y
  const Ynegative = document.createElementNS("http://www.w3.org/2000/svg", "line");
  Ynegative.setAttribute("y2", -translateY);
  Ynegative.setAttribute("stroke", "blue");
  Ynegative.setAttribute("stroke-width", 1);
  Ynegative.setAttribute("vector-effect", "non-scaling-stroke");
  Ynegative.setAttribute("stroke-dasharray", "2,2");
  axesLayer.appendChild(Ynegative);
  const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
  yAxis.setAttribute("x1", 0);
  yAxis.setAttribute("y1", 0);
  yAxis.setAttribute("x2", 0);
  yAxis.setAttribute("y2", viewHeight - translateY - arrowSize * 2);
  yAxis.setAttribute("stroke", "blue");
  yAxis.setAttribute("stroke-width", 1);
  yAxis.setAttribute("vector-effect", "non-scaling-stroke");
  axesLayer.appendChild(yAxis);

  // Freccia Y
  const yTip = viewHeight - translateY - arrowSize * 2;
  const yArrow = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  yArrow.setAttribute("points", `
    ${-arrowSize / 2},${yTip}
    0,${yTip + arrowSize}
    ${arrowSize / 2},${yTip}
  `);
  yArrow.setAttribute("fill", "blue");
  axesLayer.appendChild(yArrow);
}
// FINE: Disegno degli assi cartesiani


/*
function zoomAtPointLogical(logicalX, logicalY, zoomDelta) {
  // Converti coordinate logiche in fisiche
  const focusX = logicalX * canvasZoomFactor + canvasOffsetX;
  const focusY = canvasHeight - (logicalY * canvasZoomFactor + canvasOffsetY);

  // Richiama zoomAtPoint originale con coordinate fisiche
  zoomAtPoint(focusX, focusY, zoomDelta);
}

function zoomAtPoint(focusX, focusY, zoomDelta) {
  const oldZoom = canvasZoomFactor;
  const newZoom = oldZoom * zoomDelta;

  canvasOffsetX = focusX - (focusX - canvasOffsetX) * (newZoom / oldZoom);
  canvasOffsetY = focusY - (focusY - canvasOffsetY) * (newZoom / oldZoom);

  canvasZoomFactor = newZoom;
  renderCanvas();
}
*/




// INIZIO: aggiungi una forma al disegno
function addShapeToCanvas(elementType, paramValues) {
  const svg = document.querySelector("svg");
  if(paramValues instanceof Shape){
    //console.log("dentro ..................")
    elements.push(paramValues);
    rebuildPaletteElementList();
    paramValues.render(svg);
    return;
  }
  // il codice che segue viene attivato dalla palette in basso
  // quando aggiunge una nuova forma.
  {
  const paramsContainer = document.getElementById("shape-params");
  const inputs = paramsContainer.querySelectorAll("input, select");
  if(paramValues === null || paramValues === undefined){
      paramValues = {};
      inputs.forEach(input => {
          console.log("sono dentro al forEach di addShapeToCanvas e input è:", input);
          paramValues[input.name] = input.type === "number" ? parseFloat(input.value) : input.value;
          // qui c'è un errore. paramValues viene riempito con fill e stroke (dagli input)
          //  ma il fill deve far parte di un fillStyle{fill, fillOpacity} e stroke 
          // di un strokeStyle{stroke, strokeWidth, ecc}
      });
      // per ovviare al problema... 
      paramValues.fillStyle = defaultFillStyle;
      paramValues.strokeStyle = defaultStrokeStyle;
  }
  let newElement = null;
  //console.log("addShapeToCanvas->elementType", elementType);
  //console.log("addShapeToCanvas->parametri passati", paramValues);
  paramValues.fillStyle == paramValues.fillStyle ?? defaultFillStyle;
  paramValues.strokeStyle = paramValues.strokeStyle ?? defaultStrokeStyle;

  switch (elementType) {
    case "line":
      //console.log("dentro switch:line-> paramValues:", paramValues);
      //console.log("strokeStyle:", paramValues.strokeStyle)
      newElement = new Line(
        parseFloat(paramValues.x1) || 0,
        parseFloat(paramValues.y1) || 0,
        parseFloat(paramValues.x2) || 10,
        parseFloat(paramValues.y2) || 10,
        {
          stroke: paramValues.strokeStyle.stroke || defaultStrokeStyle.stroke,
          strokeWidth: parseFloat(paramValues.strokeStyle.strokeWidth) || defaultStrokeStyle.strokeWidth,
          strokeOpacity: parseFloat(paramValues.strokeStyle.strokeOpacity) || defaultStrokeStyle.strokeOpacity,
          strokeDasharray: paramValues.strokeStyle.strokeDasharray || defaultStrokeStyle.strokeDasharray,
          strokeLinecap: paramValues.strokeStyle.strokeLinecap || defaultStrokeStyle.strokeLinecap
        },
        true
      );
      break;
    case "rect":
      //console.log("paramValues:", paramValues.strokeStyle.stroke);
      newElement = new Rect(
        parseFloat(paramValues.x) || 0,
        parseFloat(paramValues.y) || 0,
        parseFloat(paramValues.width) || 10,
        parseFloat(paramValues.height) || 10,
        {
          fill: paramValues.fillStyle.fill || defaultFillStyle.fill,
          fillOpacity: paramValues.fillStyle.fillOpacity || defaultFillStyle.fillOpacity
        },
        {
          stroke: paramValues.strokeStyle.stroke ?? defaultStrokeStyle.stroke,
          strokeWidth: parseFloat(paramValues.strokeStyle.strokeWidth) ?? defaultStrokeStyle.strokeWidth,
          strokeOpacity: 1,
          strokeDasharray: "none",
          strokeLinecap: "butt"
        },
        true
      );
      break;
    case "circle":
      //console.log("paramValues:", paramValues);
      newElement = new Circle(
        parseFloat(paramValues.cx) || 0,
        parseFloat(paramValues.cy) || 0,
        parseFloat(paramValues.r) || 10,
        {
          fill: paramValues.fillStyle.fill || defaultFillStyle.fill,
          fillOpacity: paramValues.fillStyle.fillOpacity || defaultFillStyle.fillOpacity
        },
        {
          stroke: paramValues.stroke || defaultStrokeStyle.stroke,
          strokeWidth: parseFloat(paramValues.strokeWidth) || defaultStrokeStyle.strokeWidth,
          strokeOpacity: 1,
          strokeDasharray: "none",
          strokeLinecap: "butt"
        },
        true
      );
      break;
    case "ellipse":
      //console.log("paramValues:", paramValues);
      newElement = new Ellipse(
        parseFloat(paramValues.cx) || 0,
        parseFloat(paramValues.cy) || 0,
        parseFloat(paramValues.rx) || 10,
        parseFloat(paramValues.ry) || 10,
        {
          fill: paramValues.fillStyle.fill || defaultFillStyle.fill,
          fillOpacity: paramValues.fillStyle.fillOpacity || defaultFillStyle.fillOpacity
        },
        {
          stroke: paramValues.stroke || defaultStrokeStyle.stroke,
          strokeWidth: parseFloat(paramValues.strokeWidth) || defaultStrokeStyle.strokeWidth,
          strokeOpacity: 1,
          strokeDasharray: "none",
          strokeLinecap: "butt"
        },
        true
      );
      break;
    case "arc":
      //console.log("paramValues:", paramValues);
      newElement = new Arc(
        parseFloat(paramValues.cx) || 0,
        parseFloat(paramValues.cy) || 0,
        parseFloat(paramValues.r) || 10,
        parseFloat(paramValues.startAngle) || 10,
        parseFloat(paramValues.endAngle) || 10,
        parseFloat(paramValues.sweepFlag) || 0,
        parseFloat(paramValues.largeArcFlag) || 1,
        {
          fill: paramValues.fillStyle.fill || defaultFillStyle.fill,
          fillOpacity: paramValues.fillStyle.fillOpacity || defaultFillStyle.fillOpacity
        },
        {
          stroke: paramValues.stroke || defaultStrokeStyle.stroke,
          strokeWidth: parseFloat(paramValues.strokeWidth) || defaultStrokeStyle.strokeWidth,
          strokeOpacity: 1,
          strokeDasharray: "none",
          strokeLinecap: "butt"
        },
        true
      );
      break;
    case "ellipse-arc":
      //console.log("paramValues:", paramValues);
      newElement = EllipseArc.fromCenter(
        parseFloat(paramValues.cx) || 0,
        parseFloat(paramValues.cy) || 0,
        parseFloat(paramValues.rx) || 10,
        parseFloat(paramValues.ry) || 10,
        parseFloat(paramValues.startAngle) || 10,
        parseFloat(paramValues.endAngle) || 10,
        parseFloat(paramValues.rotation) || 0,
        paramValues.largeArcFlag,
        {
          fill: paramValues.fillStyle.fill || defaultFillStyle.fill,
          fillOpacity: paramValues.fillStyle.fillOpacity || defaultFillStyle.fillOpacity
        },
        {
          stroke: paramValues.stroke || defaultStrokeStyle.stroke,
          strokeWidth: parseFloat(paramValues.strokeWidth) || defaultStrokeStyle.strokeWidth,
          strokeOpacity: 1,
          strokeDasharray: "none",
          strokeLinecap: "butt"
        },
        true
      );
      break;
    default:
      console.warn(`Tipo di elemento non supportato: ${elementType}`);
      return;
  }

  if (newElement) {
    elements.push(newElement);
    rebuildPaletteElementList();
    newElement.render(svg);
  }
  }
}




// per muovere gli oggetti
/*
function dragElement(element, dx, dy) {
  if (!element) return;
  switch (element.type) {
    case "rect": element.moveBy(dx, dy); break;
    case "circle": element.moveBy(dx, dy); break;
    case "ellipse": element.moveBy(dx, dy); break;
    case "line": element.moveBy(dx, dy); break;
    case "arc":
      element.cx += dx; element.cy += dy;
      break;
    case "polygon":
      element.points = element.points.map(([px, py]) => [px + dx, py + dy]);
      break;
    case "ellipse-arc":
      element.move(dx, dy);
      break;
    default:
      console.warn("Tipo elemento non gestito in moveElement:", element.type);
  }
  // aggiorno le info di posizione e 
  // dimensione nella palette di controllo
  updateElementPropertyControls(element);
}
*/

// ===== funzione per scalare gli oggetti  
// la funzione è chiamata dal listener degli 
// handler (onHandleMouseDown) e conserva la 
// posizione iniziale del mousedown (starX, startY)
// e una copia dell'oggetto da scalare (orig)
// aggiunge due listener al documento per mousemove 
// e mouseup che chiamano altre due funzioni interne
// onMouseMove e onMouseUp.
// onMouseMove calcola i delta X e Y e chiama la 
// funzione resize dell'elemento.
// la funzione interna onMouseUp rimuove i listener 
// appena aggiunti perché non c'è più bisogno di loro
// 
/*
function startResizeElement(e, element, handleType) {
  e.preventDefault();
  const startX = e.clientX;
  const startY = e.clientY;
  // Salva stato iniziale in base al tipo
  const orig = { ...element };

  function onMouseMove(ev) {
    const dx = (ev.clientX - startX) / (canvasZoomFactor * pxPerMM);
    const dy = -(ev.clientY - startY) / (canvasZoomFactor * pxPerMM);
    switch (element.type) {
      case "line": resizeLine(element, orig, dx, dy, handleType); break;
      case "rect": resizeRect(element, orig, dx, dy, handleType); break;
      case "circle": resizeCircle(element, orig, dx, dy, handleType); break;
      case "ellipse": resizeEllipse(element, orig, dx, dy, handleType); break;
      // Qui in futuro possiamo aggiungere poligoni, archi ecc.
    }
    renderCanvas();
  }
  function onMouseUp() {
    //console.log("document.removeEventListener('mousemove' e 'mouseup)");
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  }

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
}

function endResizeElement(e, element, handleType) {

}
*/

/* ==== Funzioni di resize per ogni forma ==== */
function resizeLine(el, orig, dx, dy, handleType) {
  // dx, dy sono già in coordinate mondo, Y positiva verso l'alto
  let { x1, y1, x2, y2 } = orig;
  let x, y;

  switch (handleType) {
    case "start": x = x1 += dx; y = y1 += dy; break;
    case "end": x = x2 += dx; y = y2 += dy; break;
    case "middle": 
      el.movePointTo("start", x1+dx/2, y1+dy/2); 
      el.movePointTo("end", x2-dx/2, y2-dy/2); 
      break;
  }
  if(handleType != "middle") el.movePointTo(handleType, x, y); 
  
  //updateElementPropertyControls(el);
}

/* ==== Rettangoli ==== */
function resizeRect(el, orig, dx, dy, handleType) {
  // prendo una copia delle variabili di orig e le rinomino
  let {x: newX, y: newY, width: newW, height: newH} = orig;
  if (handleType === "c") {
      const scaleFactor = 1 + (dy / orig.height);
      newW = orig.width * scaleFactor;
      newH = orig.height * scaleFactor;
      newX = orig.x - (newW-orig.width) / 2;
      newY = orig.y - (newH-orig.height) / 2;
  }
  if (handleType.includes("n")) {newH = orig.height + dy;}
  if (handleType.includes("e")) {newW = orig.width + dx;}  
  if (handleType.includes("s")) {newH = orig.height - dy;     newY = orig.y + dy;}
  if (handleType.includes("w")) {newX = orig.x + dx;      newW = orig.width - dx;}
  el.moveTo(newX, newY);
  el.resize(newW, newH);
  //updateElementPropertyControls(el);
}


/* ==== Cerchi ==== */
function resizeCircle(el, orig, dx, dy, handleType) {
  // dx e dy in coordinate mondo
  let cx = orig.cx;
  let cy = orig.cy;
  let r  = orig.r;

  // prendo una copia delle variabili di orig e le rinomino
  //let {cx: newCx, cy: newCy, r: newR} = orig;
  switch (handleType) {
      case "n": // lato nord, sud fisso
          r += dy / 2;
          cy += dy / 2;
          break;
      case "s": // lato sud, nord fisso
          r -= dy / 2;
          cy += dy / 2;
          break;
      case "e": // lato est, ovest fisso
          r += dx / 2;
          cx += dx / 2;
          break;
      case "w": // lato ovest, est fisso
          r -= dx / 2;
          cx += dx / 2;
          break;
      case "ne": // angolo nord-est, opposto sud-ovest fisso
          delta = Math.max(dx, dy);
          r += delta / 2;
          cx += delta / 2;
          cy += delta / 2;
          break;
      case "nw": // angolo nord-ovest, opposto sud-est fisso
          delta = Math.max(-dx, dy);
          r += delta / 2;
          cx -= delta / 2;
          cy += delta / 2;
          break;
      case "se": // angolo sud-est, opposto nord-ovest fisso
          delta = Math.max(dx, -dy);
          r += delta / 2;
          cx += delta / 2;
          cy -= delta / 2;
          break;
      case "sw": // angolo sud-ovest, opposto nord-est fisso
          delta = Math.max(-dx, -dy);
          r += delta / 2;
          cx -= delta / 2;
          cy -= delta / 2;
          break;
      case "c": // handle centrale → scala dal centro
          r += dy; // verso l’alto aumenta, verso il basso diminuisce
          break;
  }

  // Evita valori negativi
  if (r < 0) r = 0;

  // Aggiorna oggetto
  el.moveTo(cx, cy);
  el.resize(r);
  //updateElementPropertyControls(el);
}

/* ==== Ellissi ==== */  
function resizeEllipse(el, orig, dx, dy, handleType) {
  // dx, dy sono già in coordinate mondo (Y positiva verso l'alto)
  let cx = orig.cx;
  let cy = orig.cy;
  let rx = orig.rx;
  let ry = orig.ry;

  const halfDx = dx / 2;
  const halfDy = dy / 2;

  switch (handleType) {
    // BORDI
    case "n": // nord - sud fisso  => (cy - ry) costante
      ry += halfDy;
      cy += halfDy;
      break;

    case "s": // sud - nord fisso  => (cy + ry) costante
      ry -= halfDy;
      cy += halfDy;
      break;

    case "e": // est - ovest fisso => (cx - rx) costante
      rx += halfDx;
      cx += halfDx;
      break;

    case "w": // ovest - est fisso => (cx + rx) costante
      rx -= halfDx;
      cx += halfDx;
      break;

    // ANGOLI
    case "ne": // opposto SW fisso => (cx - rx) e (cy - ry) costanti
      rx += halfDx;  cx += halfDx;
      ry += halfDy;  cy += halfDy;
      break;

    case "nw": // opposto SE fisso => (cx + rx) e (cy - ry) costanti
      rx -= halfDx;  cx += halfDx;
      ry += halfDy;  cy += halfDy;
      break;

    case "se": // opposto NW fisso => (cx - rx) e (cy + ry) costanti
      rx += halfDx;  cx += halfDx;
      ry -= halfDy;  cy += halfDy;
      break;

    case "sw": // opposto NE fisso => (cx + rx) e (cy + ry) costanti
      rx -= halfDx;  cx += halfDx;
      ry -= halfDy;  cy += halfDy;
      break;

    // CENTRO
    case "c": // scala uniforme dal centro (come il cerchio: uso dy come driver)
      ry += dy;
      rx *= ry/orig.ry;
      break;
  }

  // Clamp per evitare valori negativi
  if (rx < 0) rx = 0;
  if (ry < 0) ry = 0;

  // Aggiorna l'oggetto
  // Aggiorna oggetto
  el.moveTo(cx, cy);
  el.resize(rx, ry);
  //updateElementPropertyControls(el);
}