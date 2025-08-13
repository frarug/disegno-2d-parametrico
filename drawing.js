// drawing.js

let svg, g;

// === Inizio definizione classe Line ===
class Line {
    constructor( x1, y1, x2, y2, strokeStyle, visible = true, selected) {
        this.id = generateElementId();
        this.name = "line"+this.id;
        this.type = "line";
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        if (strokeStyle === null || strokeStyle === undefined) this.strokeStyle = defaultStrokeStyle;
        else this.strokeStyle = strokeStyle;
        this.visible = visible;
        this.selected = selected ?? false; 
    }
  
     render(svg) {
      if(!this.visible) return;
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", this.x1);
      line.setAttribute("y1", this.y1); 
      line.setAttribute("x2", this.x2);
      line.setAttribute("y2", this.y2);
      // Applica lo stile del bordo
      applyStrokeStyle(line, this.strokeStyle);
      svg.appendChild(line);
    }

    drawHandlers(svg){
        if(!this.visible || !this.selected) return;
        let handler = null;
        handler = new Handler(
            Math.min(this.x1, this.x2),
            Math.min(this.y1, this.y2),  
            Math.abs(this.x1-this.x2),
            Math.abs(this.y1-this.y2), 
            svg, this);    
    }
    containsPoint(x, y) {
        const tolerance = 2 / canvasZoomFactor; // click tolleranza
        const dx = this.x2 - this.x1;
        const dy = this.y2 - this.y1;
        const lengthSq = dx * dx + dy * dy;
        const t = ((x - this.x1) * dx + (y - this.y1) * dy) / lengthSq;
        if (t < 0 || t > 1) return false;
        const px = this.x1 + t * dx;
        const py = this.y1 + t * dy;
        const distSq = (x - px) * (x - px) + (y - py) * (y - py);
        return distSq <= tolerance * tolerance;
    }
  }
// === Inizio definizione classe Rect ===
class Rect {
    constructor(x, y, width, height, fillStyle, strokeStyle, visible = true, selected) {
        console.log(fillStyle);
        this.id = generateElementId();
        this.name = "rect"+this.id;
        this.type = "rect";
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        if (fillStyle === null || fillStyle === undefined) this.fillStyle = defaultFillStyle;
        else this.fillStyle = fillStyle;
        if (strokeStyle === null || strokeStyle === undefined) this.strokeStyle = defaultFillStyle;
        else this.strokeStyle = strokeStyle;

        this.visible = visible;
        this.selected = selected ?? false; 
    }
  
    render(svg) {
        //console.log(this);
      if (!this.visible) return;
      const shape = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      shape.setAttribute("x", this.x);
      shape.setAttribute("y", this.y); 
      shape.setAttribute("width", this.width);
      shape.setAttribute("height", this.height);
      // applica lo stile del riempimento
      shape.setAttribute("fill", this.fillStyle.fill || "none");
      shape.setAttribute("fill-opacity", this.fillStyle.fillOpacity ?? 1);
      //applica lo stile del bordo
      applyStrokeStyle(shape, this.strokeStyle);
      svg.appendChild(shape);
    }
    // disegna gli handlers se è selezionato
    drawHandlers(svg){
        if(!this.visible || !this.selected) return;
        let handler = null;
        handler = new Handler(this.x, this.y, this.width, this.height, svg, this);
    }
    containsPoint(x, y) {
        return (
            x >= this.x &&
            x <= this.x + this.width &&
            y >= this.y &&
            y <= this.y + this.height
        );
    }
  }
  // === Fine definizione classe Rect ===
  // === Inizio definizione classe Circle ===
  class Circle {
    constructor(cx, cy, r, fillStyle, strokeStyle, visible = true, selected) {
        this.id = generateElementId();
        this.name = "circle"+this.id;
        this.type = "circle";
      this.cx = cx;
      this.cy = cy;
      this.r = r;
      this.fillStyle = fillStyle ?? defaultFillStyle;
      console.log("costruttore", this.fillStyle);
      this.strokeStyle = strokeStyle ?? defaultStrokeStyle;
      this.visible = visible;
      this.selected = selected ?? false;
    }
  
    render(svg) {
        //console.log(this);
      if (!this.visible) return;
      const shape = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      shape.setAttribute("cx", this.cx);
      shape.setAttribute("cy", this.cy); 
      shape.setAttribute("r", this.r);
      //applica lo stile del bordo
      shape.setAttribute("fill", this.fillStyle.fill || "none");
      shape.setAttribute("fill-opacity", this.fillStyle.fillOpacity ?? 1);
      //applica lo stile del bordo
      applyStrokeStyle(shape, this.strokeStyle);
      svg.appendChild(shape);        
    }
    // disegna gli handlers se è selezionato
    drawHandlers(svg){
        if(!this.visible || !this.selected) return;
        let handler = null;
        handler = new Handler(this.cx-this.r, this.cy-this.r, this.r*2, this.r*2, svg, this);
    }

    containsPoint(x, y) {
        const dx = x - this.cx;
        const dy = y - this.cy;
        return (dx * dx + dy * dy) <= (this.r * this.r);
    }
  }

  class Ellipse {
    containsPoint(x, y) {
        const dx = (x - this.cx) / this.rx;
        const dy = (y - this.cy) / this.ry;
        return (dx * dx + dy * dy) <= 1;
    }
  }

  class Arc {
    containsPoint(x, y) {
        const dx = x - this.cx;
        const dy = y - this.cy;
        const distSq = dx * dx + dy * dy;
        const rSq = this.r * this.r;
        if (distSq > rSq) return false;
        let angle = Math.atan2(dy, dx);
        if (angle < 0) angle += 2 * Math.PI;
        return angle >= this.startAngle && angle <= this.endAngle;
    }
  }

  // === Inizio definizione classe Handler ===
  class Handler {
    constructor(x, y, width, height, svg, element) {
      this.element = element;
      this.handles = [];
      //boundingBox

      let bbox = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      bbox.setAttribute("x", x);// - 3/canvasZoomFactor);
      bbox.setAttribute("y", y);// - 3/canvasZoomFactor);
      bbox.setAttribute("width", width);// + 6/canvasZoomFactor);
      bbox.setAttribute("height", height);// + 6/canvasZoomFactor);
      bbox.setAttribute("fill", "none");
      bbox.setAttribute("stroke", "#00ffff");
      bbox.setAttribute("stroke-width", "1");
      bbox.setAttribute("stroke-dasharray", "4,2");
      bbox.setAttribute("vector-effect", "non-scaling-stroke");
      svg.appendChild(bbox);

      // Dimensione dei quadratini handler
      const size = 4/canvasZoomFactor;

      // Definizione posizioni handler
      const points = [
          { type: "nw", px: x,         py: y },
          { type: "n",  px: x + width/2, py: y },
          { type: "ne", px: x + width, py: y },
          { type: "w",  px: x,         py: y + height/2 },
          { type: "c",  px: x + width/2, py: y + height/2 },
          { type: "e",  px: x + width, py: y + height/2 },
          { type: "sw", px: x,         py: y + height },
          { type: "s",  px: x + width/2, py: y + height },
          { type: "se", px: x + width, py: y + height }
      ];
      for (let p of points) {
          let handle = document.createElementNS("http://www.w3.org/2000/svg", "rect");
          handle.setAttribute("x", p.px - size / 2);
          handle.setAttribute("y", p.py - size / 2);
          handle.setAttribute("width", size);
          handle.setAttribute("height", size);
          handle.setAttribute("fill", "#00ffff");
          handle.setAttribute("stroke", "#000");
          handle.setAttribute("stroke-width", "1");
          handle.setAttribute("vector-effect", "non-scaling-stroke");
          handle.dataset.type = p.type; // salva il tipo
          handle.style.cursor = this.getCursorForType(p.type);
          svg.appendChild(handle);
          this.handles.push(handle);
      }
      
    }

    getCursorForType(type) {
        switch(type) {
            case "nw": case "se": return "nwse-resize";
            case "ne": case "sw": return "nesw-resize";
            case "n": case "s":  return "ns-resize";
            case "w": case "e":  return "ew-resize";
            case "c": return "move";
            default: return "default";
        }
    }
      
  }
    

// INIZIO funzioni di utility ===
  function applyStrokeStyle(shape, strokeStyle = {}) {
    shape.setAttribute("stroke", strokeStyle.stroke || "none");
    shape.setAttribute("stroke-width", strokeStyle.strokeWidth ?? 1);
    shape.setAttribute("stroke-opacity", strokeStyle.strokeOpacity ?? 1);
    shape.setAttribute("stroke-dasharray", strokeStyle.strokeDasharray || "none");
    shape.setAttribute("stroke-linecap", strokeStyle.strokeLinecap || "butt");
    shape.setAttribute("stroke-linejoin", strokeStyle.strokeLinejoin || "miter");
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
    svg.replaceChildren(); // Pulisce eventuali elementi precedenti
   
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
  function drawGrid(svg) {
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
        svg.appendChild(grr);
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
        svg.appendChild(grr);
    }
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
    const Xnegative = document.createElementNS("http://www.w3.org/2000/svg", "line");
    Xnegative.setAttribute("x2", -translateX);
    Xnegative.setAttribute("stroke", "#00ff00");
    Xnegative.setAttribute("stroke-width", 1.5);
    Xnegative.setAttribute("vector-effect", "non-scaling-stroke");
    Xnegative.setAttribute("stroke-dasharray", "2,2");
    svg.appendChild(Xnegative);
    const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    //xAxis.setAttribute("x1", 0);
    //xAxis.setAttribute("y1", 0);
    xAxis.setAttribute("x2", viewWidth - translateX - arrowSize * 2);
    //xAxis.setAttribute("y2", 0);
    xAxis.setAttribute("stroke", "#00ff00");
    xAxis.setAttribute("stroke-width", 1.5);
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
    xArrow.setAttribute("fill", "#00ff00");
    //xArrow.setAttribute("stroke", "#00ff00");
    //xArrow.setAttribute("stroke-width", "1");
    //xArrow.setAttribute("vector-effect", "non-scaling-stroke");
    svg.appendChild(xArrow);
  
    // Asse Y
    const Ynegative = document.createElementNS("http://www.w3.org/2000/svg", "line");
    Ynegative.setAttribute("y2", -translateY);
    Ynegative.setAttribute("stroke", "blue");
    Ynegative.setAttribute("stroke-width", 1);
    Ynegative.setAttribute("vector-effect", "non-scaling-stroke");
    Ynegative.setAttribute("stroke-dasharray", "2,2");
    svg.appendChild(Ynegative);
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
  function addShapeToCanvas(elementType, paramValues) {
    const svg = document.querySelector("svg");
    const paramsContainer = document.getElementById("shape-params");
    const inputs = paramsContainer.querySelectorAll("input, select");
    //const paramValues = {};
    if(paramValues === null || paramValues === undefined){
        paramValues = {};
        inputs.forEach(input => {
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
    console.log("addShapeToCanvas->elementType", elementType);
    console.log("addShapeToCanvas->parametri passati", paramValues);
    paramValues.fillStyle == paramValues.fillStyle ?? defaultFillStyle;
    paramValues.strokeStyle = paramValues.strokeStyle ?? defaultStrokeStyle;

    switch (elementType) {
        case "line":
            console.log("dentro switch:line-> paramValues:", paramValues);
            console.log("strokeStyle:", paramValues.strokeStyle)
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
    for (const el of elements) {
      el.render(svg);
    }
    for (const el of elements) {
        el.drawHandlers(svg);
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

// per muovere gli oggetti
  function moveElement(element, dx, dy) {
    if (!element) return;

    switch (element.type) {
        case "rect":
            element.x += dx;
            element.y += dy;
            break;

        case "circle":
            element.cx += dx;
            element.cy += dy;
            break;

        case "ellipse":
            element.cx += dx;
            element.cy += dy;
            break;

        case "line":
            element.x1 += dx;
            element.y1 += dy;
            element.x2 += dx;
            element.y2 += dy;
            break;

        case "arc":
            element.cx += dx;
            element.cy += dy;
            break;

        case "polygon":
            element.points = element.points.map(([px, py]) => [px + dx, py + dy]);
            break;

        default:
            console.warn("Tipo elemento non gestito in moveElement:", element.type);
    }
}

  

  
