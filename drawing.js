// drawing.js

let svg, g;

// INIZIO: Inizializzazione della canvas SVG
function initDrawingCanvas() {
    svg = document.getElementById("canvas");
    if (!svg) {
      console.error("Canvas SVG non trovato");
      return;
    }
  
    // Assicura che SVG riempia lo schermo
    svg.setAttribute("width", canvasWidth);
    svg.setAttribute("height", canvasHeight);
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  
    // Pulisce SVG (elimina anche il gruppo <g> se già presente)
    svg.innerHTML = "";
  
    // Crea il gruppo g
    g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("transform", `translate(${canvasOffsetX}, ${canvasOffsetY}) scale(${canvasZoomFactor})`);
    console.log("canvasOffsetX:"+canvasOffsetX+" canvasOffsetY"+canvasOffsetX+" canvasZoomFactor:"+canvasZoomFactor);
    svg.appendChild(g);
  }
  // FINE: Inizializzazione della canvas SVG

  /*
  function updateCanvas() {
    const svg = document.getElementById("canvas");
    svg.innerHTML = ""; // Pulisci tutto
  
    // Crea un gruppo trasformato
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const scale = canvasZoomFactor;
    const translateX = canvasOffsetX;
    const translateY = canvasOffsetY;
  
    // Trasformazione: pan + zoom + inverti asse Y
    g.setAttribute("transform", `translate(${translateX}, ${translateY}) scale(${scale}, -${scale})`);
    svg.appendChild(g); // Aggiungi il gruppo alla canvas
  
    // Disegna tutto dentro g
    if (showGrid) drawGrid(g);
    if (showAxes) drawAxes(g);
    drawElements(g); // Tutti gli oggetti disegnati

  }
  */
  // INIZIO: Funzione principale di disegno
  

  
  // FINE: Funzione principale di disegno
  
  // INIZIO: Disegno della griglia
  
  /*
  function drawGrid(group) {
    if (!showGrid || gridSpacing < 0) return;
  
    const step = gridSpacing;
  
    const svg = document.getElementById("canvas");
    const widthPx = svg.clientWidth;
    const heightPx = svg.clientHeight;
  
    const widthUnits = widthPx ;
    const heightUnits = heightPx ;
  
    const left = -canvasOffsetX - widthUnits ;
    const right = -canvasOffsetX + widthUnits ;
    const bottom = -canvasOffsetY - heightUnits ;
    const top = -canvasOffsetY + heightUnits ;
  
    const startX = Math.floor(left / step) * step;
    const endX = Math.ceil(right / step) * step;
  
    const startY = Math.floor(bottom / step) * step;
    const endY = Math.ceil(top / step) * step;

    console.log("----- wH:"+widthPx +" wH:"+heightPx+"  left:"+left+"  right:"+right+"  top:"+top+"  bottom:"+bottom);
  
    //disegno le linee orizzontali
    for (let x = startX; x <= endX; x += step) {
      const line = createGridLine(x, bottom, x, top);
      group.appendChild(line);
    }
  
    //disegno le linee verticali
    for (let y = startY; y <= endY; y += step) {
      const line = createGridLine(left, y, right, y);
      group.appendChild(line);
    }
  }
  
  function createGridLine(x1, y1, x2, y2) {
    console.log("x1:"+x1+" y1:"+y1+" x2:"+x2+" y2:"+y2);
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.setAttribute("stroke", "#ccc");
    line.setAttribute("stroke-width", 0.5); // Costante nelle unità logiche
    return line;
  }

  */

  function drawGrid4(g) {
    if (!showGrid || gridSpacing <= 0) return;
  
    // Dimensioni viewport
    const width = window.innerWidth;
    const height = window.innerHeight;
  
    // Coordinate logiche agli estremi della viewport
    const logicalLeft   = -canvasOffsetX / canvasZoomFactor - width  / (2 * canvasZoomFactor);
    const logicalRight  = -canvasOffsetX / canvasZoomFactor + width  / (2 * canvasZoomFactor);
    const logicalBottom = -canvasOffsetY / canvasZoomFactor - height / (2 * canvasZoomFactor);
    const logicalTop    = -canvasOffsetY / canvasZoomFactor + height / (2 * canvasZoomFactor);
    
  
    // Inizio allineato alla griglia (orizzontale)
    const startX = Math.floor(logicalLeft / gridSpacing) * gridSpacing;
    const endX = Math.ceil(logicalRight / gridSpacing) * gridSpacing;
  
    const startY = Math.floor(logicalTop / gridSpacing) * gridSpacing;
    const endY = Math.ceil(logicalBottom / gridSpacing) * gridSpacing;
  
    // Stile griglia
    const gridColor = "#aaa";
    const gridWidth = 0.5;
  
    // Linee verticali
    for (let x = startX; x <= endX; x += gridSpacing) {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", x);
      line.setAttribute("y1", startY);
      line.setAttribute("x2", x);
      line.setAttribute("y2", endY);
      line.setAttribute("stroke", gridColor);
      line.setAttribute("stroke-width", gridWidth);
      g.appendChild(line);
    }
  
    // Linee orizzontali
    for (let y = startY; y <= endY; y += gridSpacing) {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", startX);
      line.setAttribute("y1", y);
      line.setAttribute("x2", endX);
      line.setAttribute("y2", y);
      line.setAttribute("stroke", gridColor);
      line.setAttribute("stroke-width", gridWidth);
      g.appendChild(line);
    }
  }

  function drawGrid(g) {
    const spacing = gridSpacing;
    if (spacing <= 0) return;
  
    const viewWidth = canvasWidth / canvasZoomFactor;
    const viewHeight = canvasHeight / canvasZoomFactor;
  
    const logicalLeft = -canvasOffsetX / canvasZoomFactor;
    const logicalBottom = canvasOffsetY / canvasZoomFactor;
  
    const startX = Math.floor(logicalLeft / spacing) * spacing;
    const endX = Math.ceil((logicalLeft + viewWidth) / spacing) * spacing;
    const startY = Math.floor(logicalBottom / spacing) * spacing;
    const endY = Math.ceil((logicalBottom + viewHeight) / spacing) * spacing;

    const gridColor = "#aaa";
    const gridWidth = 0.5;
    console.log("------- canvasOffsetX:"+canvasOffsetX+" canvasOffsetY"+canvasOffsetX+" canvasZoomFactor:"+canvasZoomFactor);

    console.log("logicalLeft:"+logicalLeft+" logicalBottom"+logicalBottom+" canvasZoomFactor:"+canvasZoomFactor);

  
    for (let x = startX; x <= endX; x += spacing) {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", x);
      line.setAttribute("y1", startY);
      line.setAttribute("x2", x);
      line.setAttribute("y2", endY);
      line.setAttribute("stroke", gridColor);
      line.setAttribute("stroke-width", gridWidth);
      g.appendChild(line);
    }
  
    for (let y = startY; y <= endY; y += spacing) {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", startX);
      line.setAttribute("y1", y);
      line.setAttribute("x2", endX);
      line.setAttribute("y2", y);
      line.setAttribute("stroke", gridColor);
      line.setAttribute("stroke-width", gridWidth);
      g.appendChild(line);
    }
  }
  // FINE: Disegno della griglia
  
  // INIZIO: Disegno degli assi cartesiani
  
  function drawAxes(g) {
    const svg = document.getElementById("canvas");
    //const { canvasWidth, canvasHeight, showAxes } = state;
    if (!showAxes) return;
  
    //const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  
    // Applichiamo pan, zoom e asse Y invertito (per avere l'origine in basso)
    const scale = canvasZoomFactor;
    const translateX = canvasOffsetX;
    const translateY = canvasOffsetY + canvasHeight * scale; // sposta l'origine in basso
  
    g.setAttribute("transform", `translate(${translateX}, ${translateY}) scale(${scale}, -${scale})`);
  
    // Lunghezza freccia
    const arrowSize = 10;
  
    // Asse X
    const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    xAxis.setAttribute("x1", 0);
    xAxis.setAttribute("y1", 0);
    xAxis.setAttribute("x2", canvasWidth - arrowSize * 2);
    xAxis.setAttribute("y2", 0);
    xAxis.setAttribute("stroke", "green");
    xAxis.setAttribute("stroke-width", 1 / scale); // per restare sottile a ogni zoom
    g.appendChild(xAxis);
  
    // Freccia X
    const xArrow = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    const xTip = canvasWidth - arrowSize * 2;
    xArrow.setAttribute("points", `
      ${xTip},${-arrowSize / 2}
      ${xTip + arrowSize},0
      ${xTip},${arrowSize / 2}
    `);
    xArrow.setAttribute("fill", "green");
    g.appendChild(xArrow);
  
    // Asse Y
    const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    yAxis.setAttribute("x1", 0);
    yAxis.setAttribute("y1", 0);
    yAxis.setAttribute("x2", 0);
    yAxis.setAttribute("y2", canvasHeight - arrowSize * 2);
    yAxis.setAttribute("stroke", "blue");
    yAxis.setAttribute("stroke-width", 1 / scale);
    g.appendChild(yAxis);
  
    // Freccia Y
    const yTip = canvasHeight - arrowSize * 2;
    const yArrow = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    yArrow.setAttribute("points", `
      ${-arrowSize / 2},${yTip}
      0,${yTip + arrowSize}
      ${arrowSize / 2},${yTip}
    `);
    yArrow.setAttribute("fill", "blue");
    g.appendChild(yArrow);
  }
  // FINE: Disegno degli assi cartesiani
  
  // INIZIO: Disegno delle forme utente

  function drawElements(g) {
    for (const element of elements) {
      if (!element.visible) continue;
  
      switch (element.type) {
        case "line":
          drawLine(element, g);
          break;
        case "circle":
        case "ellipse":
          drawEllipseOrCircle(element, g);
          break;
        // aggiungi altri tipi se ne hai
        default:
          console.warn("Tipo di elemento non riconosciuto:", element.type);
      }
    }
  }

  function drawLine(line, g) {
    const { x1, y1, x2, y2, stroke = "black", strokeWidth = 1 } = line;
    const zoom = zoomFactor || 1;
  
    const lineElement = document.createElementNS("http://www.w3.org/2000/svg", "line");
    lineElement.setAttribute("x1", (x1 * zoom + canvasOffsetX).toFixed(2));
    lineElement.setAttribute("y1", (-y1 * zoom + canvasOffsetY).toFixed(2));
    lineElement.setAttribute("x2", (x2 * zoom + canvasOffsetX).toFixed(2));
    lineElement.setAttribute("y2", (-y2 * zoom + canvasOffsetY).toFixed(2));
    lineElement.setAttribute("stroke", stroke);
    lineElement.setAttribute("stroke-width", strokeWidth);
  
    g.appendChild(lineElement);
  }

  function drawEllipseOrCircle(obj, g) {
    const {
      cx, cy,
      rx, ry, // se mancano, possiamo usare "r"
      r,
      stroke = "black",
      strokeWidth = 1,
      fill = "none"
    } = obj;
  
    const zoom = zoomFactor || 1;
    const offsetX = canvasOffsetX || 0;
    const offsetY = canvasOffsetY || 0;
  
    const ellipse = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
  
    ellipse.setAttribute("cx", (cx * zoom + offsetX).toFixed(2));
    ellipse.setAttribute("cy", ((-cy) * zoom + offsetY).toFixed(2));
  
    // Usa rx/ry se specificati, altrimenti r
    const finalRx = (rx !== undefined ? rx : r) * zoom;
    const finalRy = (ry !== undefined ? ry : r) * zoom;
  
    ellipse.setAttribute("rx", finalRx.toFixed(2));
    ellipse.setAttribute("ry", finalRy.toFixed(2));
    ellipse.setAttribute("stroke", stroke);
    ellipse.setAttribute("stroke-width", strokeWidth);
    ellipse.setAttribute("fill", fill);
  
    g.appendChild(ellipse);
  }

  function drawArc(arc, g) {
    const {
      cx, cy, r,
      startAngle, endAngle,
      stroke = "black",
      strokeWidth = 1
    } = arc;
  
    const zoom = zoomFactor || 1;
    const offsetX = canvasOffsetX || 0;
    const offsetY = canvasOffsetY || 0;
  
    const angleToRad = angle => (angle * Math.PI) / 180;
  
    const x1 = cx + r * Math.cos(angleToRad(startAngle));
    const y1 = cy + r * Math.sin(angleToRad(startAngle));
    const x2 = cx + r * Math.cos(angleToRad(endAngle));
    const y2 = cy + r * Math.sin(angleToRad(endAngle));
  
    const largeArcFlag = (Math.abs(endAngle - startAngle) % 360) > 180 ? 1 : 0;
    const sweepFlag = 1;
  
    const pathData = [
      "M",
      (x1 * zoom + offsetX).toFixed(2),
      ((-y1) * zoom + offsetY).toFixed(2),
      "A",
      (r * zoom).toFixed(2),
      (r * zoom).toFixed(2),
      0,
      largeArcFlag,
      sweepFlag,
      (x2 * zoom + offsetX).toFixed(2),
      ((-y2) * zoom + offsetY).toFixed(2)
    ].join(" ");
  
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathData);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", stroke);
    path.setAttribute("stroke-width", strokeWidth);
  
    g.appendChild(path);
  }

  // FINE: Disegno delle forme utente

  

  
  function renderCanvas2() {
    //const svg = document.getElementById("canvas");
  
    // 1. Imposta dimensioni fisiche della canvas
    svg.setAttribute("width", canvasWidth);
    svg.setAttribute("height", canvasHeight);
    svg.style.width = canvasWidth + "px";
    svg.style.height = canvasHeight + "px";
  
    // 2. Pulisci il contenuto della canvas (svg)
    svg.innerHTML = "";
  
    // 3. Crea un gruppo trasformato che tenga conto di pan e zoom
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const scale = canvasZoomFactor;
    const translateX = canvasOffsetX;
    const translateY = canvasOffsetY;
  
    // 4. Applica trasformazioni (pan + zoom + inverti Y)
    g.setAttribute("transform", `translate(${translateX}, ${translateY}) scale(${scale}, -${scale})`);
    svg.appendChild(g);
  
    // 5. Ridisegna griglia, assi e oggetti dentro g
    if (showGrid) {
      drawGrid(g);
    }
    if (showAxes) {
      drawAxes(g);
    }
  
    drawElements(g);
  }

  function renderCanvas() {
    if (!svg || !g) return;
  
    // Pulisce il gruppo trasformabile
    g.innerHTML = "";
  
    // Imposta la trasformazione globale per pan e zoom
    g.setAttribute("transform", `translate(${canvasOffsetX}, ${canvasOffsetY}) scale(${canvasZoomFactor})`);
  
    // Disegna la griglia, assi e oggetti utente
    if (showGrid) drawGrid(g);
    if (showAxes) drawAxes(g);
    drawElements(g);
  }