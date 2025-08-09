// drawing.js

let svg, g;

// === Inizio definizione classe Line ===
class Line {
    constructor( x1, y1, x2, y2, stroke = defaultStrokeStyle, visible = true) {
        this.id = generateElementId();
        this.name = "line"+this.id;
      this.type = "line";
      this.x1 = x1;
      this.y1 = y1;
      this.x2 = x2;
      this.y2 = y2;
      this.strokeStyle = { ...stroke };
      this.visible = visible;
    }
  
    render(svg) {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", this.x1);
      line.setAttribute("y1", this.y1); 
      line.setAttribute("x2", this.x2);
      line.setAttribute("y2", this.y2);
  
      // Applica lo stile del bordo
      applyStrokeStyle(line, this.strokeStyle);
  
      svg.appendChild(line);
    }
  }
// === Inizio definizione classe Rect ===
class Rect {
    constructor(x, y, width, height, fillStyle = defaultFillStyle, strokeStyle = defaultStrokeStyle, visible = true) {
        this.id = generateElementId();
        this.name = "rect"+this.id;
        this.type = "rect";
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.fillStyle = { ...fillStyle };
      this.strokeStyle = { ...strokeStyle };
      this.visible = visible;
    }
  
    render(svg) {
        console.log(this);
      if (!this.visible) return;
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", this.x);
      rect.setAttribute("y", this.y); 
      rect.setAttribute("width", this.width);
      rect.setAttribute("height", this.height);
      //fill
      rect.setAttribute("fill", this.fillStyle.fill || "none");
      rect.setAttribute("fill-opacity", this.fillStyle.fillOpacity ?? 1);
      
      //stroke
      applyStrokeStyle(rect, this.strokeStyle);
      svg.appendChild(rect);
    }
  }
  // === Fine definizione classe Rect ===

// INIZIO funzioni di utility ===
  function applyStrokeStyle(el, strokeStyle = {}) {
    el.setAttribute("stroke", strokeStyle.stroke || "none");
    el.setAttribute("stroke-width", strokeStyle.strokeWidth ?? 1);
    el.setAttribute("stroke-opacity", strokeStyle.strokeOpacity ?? 1);
    el.setAttribute("stroke-dasharray", strokeStyle.strokeDasharray || "none");
    el.setAttribute("stroke-linecap", strokeStyle.strokeLinecap || "butt");
    el.setAttribute("stroke-linejoin", strokeStyle.strokeLinejoin || "miter");
  }
// FINE funzioni di utility



// INIZIO: Inizializzazione della canvas SVG
  function initDrawingCanvas() {
    svg = document.getElementById("canvas");
    if (!svg) {
      console.error("Canvas SVG non trovato");
      return;
    }
    // Pulisce il contenuto precedente
    svg.innerHTML = "";

    // Calcola larghezza e altezza della canvas in pixel
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
  
    // Imposta dimensione SVG in pixel
    svg.setAttribute("width", canvasWidth);
    svg.setAttribute("height", canvasHeight);
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.setAttribute("transform", `scale(1, -1)`); // inverte il verso dell'asse Y
  
    // Dimensioni visibili in millimetri, considerando il dpi del monitor
    /*
    const mmPerInch = 25.4;  
    const viewBoxX = canvasOffsetX/canvasZoomFactor;//
    const viewBoxY = -canvasOffsetY/canvasZoomFactor;//
    const viewBoxWidth = (canvasWidth / dpiMonitor) * mmPerInch;
    const viewBoxHeight = (canvasHeight / dpiMonitor) * mmPerInch;
  
    svg.setAttribute("viewBox", `${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`);
    */
    //svg.setAttribute("transform", "rotate(-5, 0, 0)"); // questa non funziona.
    
    //console.log("initDrawingCanvas-> canvasOffsetX:"+canvasOffsetX+" canvasOffsetY:"+canvasOffsetY);
  }
  // FINE: Inizializzazione della canvas SVG

  
  
  // INIZIO: Funzione principale di disegno
  function renderCanvas() {
    //console.log(svg);
    if (!svg) return;

    svg.innerHTML = ""; // Pulisce eventuali elementi precedenti
   
    // Imposto l'origine della viewBox 
    const viewBoxX = -canvasOffsetX/ pxPerMM /canvasZoomFactor; 
    const viewBoxY = -canvasOffsetY/ pxPerMM /canvasZoomFactor; 
    // Dimensioni della viewBox in unità logiche (tenendo conto dello zoom)
    const viewWidth = (canvasWidth / pxPerMM) / canvasZoomFactor;
    const viewHeight = (canvasHeight / pxPerMM) / canvasZoomFactor;
  
    // Applica la viewBox con coordinate logiche
    svg.setAttribute("viewBox", `${viewBoxX} ${viewBoxY} ${viewWidth} ${viewHeight}`);
    //console.log(svg.getAttribute("viewBox"));

    if (showGrid) drawGrid(svg);    
    if (showAxes) drawAxes(svg);
    drawElements(svg);
  }
  // FINE: Funzione principale di disegno


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

  // INIZIO: Disegno della griglia
  function drawGridOld(g) {
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
    console.log("------- canvasOffsetX:"+canvasOffsetX+" canvasOffsetY:"+canvasOffsetY+" canvasZoomFactor:"+canvasZoomFactor);

    console.log("logicalLeft:"+logicalLeft+" logicalBottom:"+logicalBottom+" canvasZoomFactor:"+canvasZoomFactor);

  
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

  function drawGrid(svg) {
    return;
  }
  // FINE: Disegno della griglia
  
  // INIZIO: Disegno degli assi cartesiani
  function drawAxes(svg) {
    if (!showAxes) return;
  
    const translateX = canvasOffsetX/ pxPerMM /canvasZoomFactor;;
    const translateY = canvasOffsetY/ pxPerMM /canvasZoomFactor;;

    const arrowSize = 3/canvasZoomFactor;
    const viewWidth = (canvasWidth / pxPerMM)/canvasZoomFactor;
    const viewHeight = (canvasHeight / pxPerMM) /canvasZoomFactor;
  
    // Asse X
    const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    xAxis.setAttribute("x1", 0);
    xAxis.setAttribute("y1", 0);
    xAxis.setAttribute("x2", viewWidth - translateX - arrowSize * 2);
    xAxis.setAttribute("y2", 0);
    xAxis.setAttribute("stroke", "green");
    xAxis.setAttribute("stroke-width", 1);
    xAxis.setAttribute("vector-effect", "non-scaling-stroke");
    svg.appendChild(xAxis);
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
    xArrow.setAttribute("fill", "transparent");
    xArrow.setAttribute("stroke", "green");
    xArrow.setAttribute("stroke-width", "1");
    xArrow.setAttribute("vector-effect", "non-scaling-stroke");
    svg.appendChild(xArrow);
  
    // Asse Y
    const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    yAxis.setAttribute("x1", 0);
    yAxis.setAttribute("y1", 0);
    yAxis.setAttribute("x2", 0);
    yAxis.setAttribute("y2", viewHeight - translateY - arrowSize * 2);
    yAxis.setAttribute("stroke", "blue");
    yAxis.setAttribute("stroke-width", 1);
    yAxis.setAttribute("vector-effect", "non-scaling-stroke");
    svg.appendChild(yAxis);
  
    // Freccia Y
    const yTip = viewHeight - translateY - arrowSize * 2;
    const yArrow = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    yArrow.setAttribute("points", `
      ${-arrowSize / 2},${yTip}
      0,${yTip + arrowSize}
      ${arrowSize / 2},${yTip}
    `);
    yArrow.setAttribute("fill", "blue");
    svg.appendChild(yArrow);
  }
  // FINE: Disegno degli assi cartesiani


  // INIZIO: aggiungi una forma al disegno
  function addShapeToCanvas(elementType) {
    const svg = document.querySelector("svg");
    const paramsContainer = document.getElementById("shape-params");
    const inputs = paramsContainer.querySelectorAll("input, select");
    const paramValues = {};
  
    inputs.forEach(input => {
      paramValues[input.name] = input.type === "number" ? parseFloat(input.value) : input.value;
    });
  
    let newElement = null;
  
    switch (elementType) {
      case "line":
        console.log("paramValues:", paramValues);
        newElement = new Line(
            parseFloat(paramValues.x1) || 0,
            parseFloat(paramValues.y1) || 0,
            parseFloat(paramValues.x2) || 10,
            parseFloat(paramValues.y2) || 10,
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
      case "rect":
        //console.log("paramValues:", paramValues);
        newElement = new Rect(
            parseFloat(paramValues.x) || 0,
            parseFloat(paramValues.y) || 0,
            parseFloat(paramValues.width) || 10,
            parseFloat(paramValues.height) || 10,
            {
              fill: paramValues.fill || defaultFillStyle.fill,
              fillOpacity: 1
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
  
      // Altri tipi: case "line", "circle", ecc. (li aggiungerai in seguito)
  
      default:
        console.warn(`Tipo di elemento non supportato: ${elementType}`);
        return;
    }
  
    if (newElement) {
      elements.push(newElement);
      updateElements();
      newElement.render(svg);
    }
  }
  
  // INIZIO: Disegno delle forme utente

  function drawElementsOld(svg) {
    for (const element of elements) {
      if (!element.visible) continue;
  
      switch (element.type) {
        case "line":
          drawLine(element, g);
          break;
        case "circle":
        case "ellipse":
          drawEllipseOrCircle(element, svg);
          break;
        case "rect":
            element.render(svg);
        // aggiungi altri tipi se ne hai
        default:
          console.warn("Tipo di elemento non riconosciuto:", element.type);
      }
    }
  }

  function drawElements(svg) {
    for (const element of elements) {
      if (element.visible) {
        element.render(svg);
      }
    }
  }

  function drawLine(line, svg) {
    const { x1, y1, x2, y2, stroke = "black", strokeWidth = 1 } = line;
    const zoom = canvasZoomFactor || 1;
  
    const lineElement = document.createElementNS("http://www.w3.org/2000/svg", "line");
    lineElement.setAttribute("x1", (x1 * zoom + canvasOffsetX).toFixed(2));
    lineElement.setAttribute("y1", (-y1 * zoom + canvasOffsetY).toFixed(2));
    lineElement.setAttribute("x2", (x2 * zoom + canvasOffsetX).toFixed(2));
    lineElement.setAttribute("y2", (-y2 * zoom + canvasOffsetY).toFixed(2));
    lineElement.setAttribute("stroke", stroke);
    lineElement.setAttribute("stroke-width", strokeWidth);
  
    svg.appendChild(lineElement);
  }

  function drawEllipseOrCircle(obj, svg) {
    const {
      cx, cy,
      rx, ry, // se mancano, possiamo usare "r"
      r,
      stroke = "black",
      strokeWidth = 1,
      fill = "none"
    } = obj;
  
    const zoom = canvasZoomFactor || 1;
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
  
    svg.appendChild(ellipse);
  }

  function drawArc(arc, svg) {
    const {
      cx, cy, r,
      startAngle, endAngle,
      stroke = "black",
      strokeWidth = 1
    } = arc;
  
    const zoom = canvasZoomFactor || 1;
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
  
    svg.appendChild(path);
  }
  // FINE: Disegno delle forme utente

  

  
