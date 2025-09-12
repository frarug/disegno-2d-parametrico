// la classe padre di tutte le forme
class Shape {
  constructor() {
    this.selected = false;
    this.visible = true;
    this.svgElement = null;
  }

  getBoundingBox() {
    return {x:0, y:0, width:100, height:100};
  }

  // Arrotonda un singolo valore alla precisione corrente
  applyPrecision(value) {
    return roundToPrecision(value, canvasPrecision);
  }

  // Arrotonda più proprietà di questa istanza
  applyPrecisionToProps(...props) {
    for (let prop of props) {
      if (this[prop] !== undefined) {
        this[prop] = this.applyPrecision(this[prop]);
      }
    }
  }
}

// === definizione classe Line ===
class Line extends Shape {
  constructor(x1, y1, x2, y2, strokeStyle, visible = true, selected) {
    super();
    this.id = generateElementId();
    this.name = "line"+this.id;
    this.type = "line";

    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;

    // Applica precisione iniziale
    this.applyPrecisionToProps("x1", "y1", "x2", "y2");

    // associo lo stile del bordo
    if (strokeStyle === null || strokeStyle === undefined) this.strokeStyle = structuredClone(defaultStrokeStyle);
    else this.strokeStyle = strokeStyle;

    this.visible = visible;
    this.selected = selected ?? false; 

    // creo l'aggetto svg
    this.svgElement = document.createElementNS("http://www.w3.org/2000/svg", "line");
    this.updateSvg();

    // Applico all'oggetto svg lo stile del bordo
    applyStrokeStyle(this.svgElement, this.strokeStyle);

    // creo l'handler
    this.handler = new Handler(
      Math.min(this.x1, this.x2),
      Math.min(this.y1, this.y2),  
      Math.abs(this.x1-this.x2),
      Math.abs(this.y1-this.y2), 
      overlayLayer, this);   

    // preparo per la visualizzazione
    this.render(null);
    // attacco l'oggetto svg al layer degli elementi
    elementsLayer.appendChild(this.svgElement);
    // attacco l'handler al layer "ovelay" (sopra a tutti)
    this.handler.attach(overlayLayer);
  }

  render(layer) {
    if(!this.visible) this.svgElement.style.display = "none";
    else this.svgElement.style.display = "inline";

    if(!this.visible || !this.selected) this.handler.hide();
    else this.handler.show();
  }

  drawHandlers(svg){
    
  }

  // ritorna un bBox allargato se la linea è praticamente vericale o praticamente orizzontale
  getBoundingBox() {
    let dw =0, dh=0;
    let w = Math.abs(this.x2-this.x1);
    if(w < 2){
      w = 2;
      dw = w/2;
    }
    let h = Math.abs(this.y2-this.y1);
    if(h < 2){
      h = 2;
      dh = h/2;
    }
    return {x:Math.min(this.x1, this.x2)-dw, y:Math.min(this.y1, this.y2)-dh, w, h};
  }
  movePointTo(point, x, y) {
    x = roundToPrecision(x, canvasPrecision);
    y = roundToPrecision(y, canvasPrecision);
    if(point == "start") {
      this.x1 = x;
      this.y1 = y;
    } else if(point == "end"){
      this.x2 = x;
      this.y2 = y;
    }
    this.updateSvg();
    this.handler.adjustPosition();
  }
  movePointBy(point, dx, dy) {
    dx = roundToPrecision(dx, canvasPrecision);
    dy = roundToPrecision(dy, canvasPrecision);
    if(point == "start") {
      this.x1 += dx;
      this.y1 += dy;
    } else {
      this.x2 += dx;
      this.y2 += dy;
    }
    this.updateSvg();
    this.handler.adjustPosition();
  }
  
  moveBy(dx, dy) {
    this.x1 = roundToPrecision(this.x1 += dx, canvasPrecision);
    this.y1 = roundToPrecision(this.y1 += dy, canvasPrecision);
    this.x2 = roundToPrecision(this.x2 += dx, canvasPrecision);
    this.y2 = roundToPrecision(this.y2 += dy, canvasPrecision);
    this.updateSvg();
    this.handler.adjustPosition();
  }

  updateSvg() {
    this.svgElement.setAttribute("x1", this.x1);
    this.svgElement.setAttribute("y1", this.y1); 
    this.svgElement.setAttribute("x2", this.x2);
    this.svgElement.setAttribute("y2", this.y2);
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
// === definizione classe Rect ===
class Rect extends Shape {
  constructor(x, y, width, height, fillStyle, strokeStyle, visible = true, selected) {
    super();
    //console.log(fillStyle);
    this.id = generateElementId();
    this.name = "rect"+this.id;
    this.type = "rect";

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    // Applica precisione iniziale
    this.applyPrecisionToProps("x", "y", "width", "height");

    // associo lo stile di riempimento e del bordo
    this.fillStyle = fillStyle ?? structuredClone(defaultFillStyle);
    this.strokeStyle = strokeStyle ?? structuredClone(defaultStrokeStyle);

    this.visible = visible;
    this.selected = selected ?? false; 

    // creo l'elemento svg
    this.svgElement = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    this.updateSvg();

    // applico lo stile del riempimento
    applyFillStyle(this.svgElement, this.fillStyle);
    //applico lo stile del bordo
    applyStrokeStyle(this.svgElement, this.strokeStyle);

    // creo l'handler
    this.handler = new Handler(this.x, this.y, this.width, this.height, overlayLayer, this);

    // preparo per la visualizzazione
    this.render(null);
    // attacco l'oggetto svg al layer degli elementi
    elementsLayer.appendChild(this.svgElement);
    // attacco l'handler al layer "ovelay" (sopra a tutti)
    this.handler.attach(overlayLayer);
  }
  
  render(svg) {

    if(!this.visible) this.svgElement.style.display = "none";
    else this.svgElement.style.display = "inline";

    if(!this.visible || !this.selected) this.handler.hide();
    else this.handler.show();
    /*
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
    */
  }

  // secondo me il nome giusto di questa funzione è "translate"
  moveBy(dx, dy) {
    this.x = roundToPrecision(this.x += dx, canvasPrecision);
    this.y = roundToPrecision(this.y += dy, canvasPrecision);
    this.updateSvg(); 
    this.handler.adjustPosition();
  }

  moveTo(x, y){
    this.x = roundToPrecision(this.x = x, canvasPrecision);
    this.y = roundToPrecision(this.y = y, canvasPrecision);
    this.updateSvg();
    this.handler.adjustPosition();
  }

  resize(w, h){
    this.width = roundToPrecision(this.width = w, canvasPrecision);
    this.height = roundToPrecision(this.height = h, canvasPrecision);
    this.updateSvg();
    this.handler.adjustPosition();
  }

  // disegna gli handlers se è selezionato
  drawHandlers(svg){
    /*
    if(!this.visible || !this.selected) return;
    let handler = null;
    handler = new Handler(this.x, this.y, this.width, this.height, svg, this);
    */
  }
  getBoundingBox() {
    return {x:this.x, y:this.y, width:this.width, height:this.height};
  }

  updateSvg(){
    this.svgElement.setAttribute("x", this.x);
    this.svgElement.setAttribute("y", this.y); 
    this.svgElement.setAttribute("width", this.width);
    this.svgElement.setAttribute("height", this.height);
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
// === definizione classe Circle ===
class Circle extends Shape {
  constructor(cx, cy, r, fillStyle, strokeStyle, visible = true, selected) {
    super();

    this.id = generateElementId();
    this.name = "circle"+this.id;
    this.type = "circle";

    this.cx = cx;
    this.cy = cy;
    this.r = r;
    // Applica precisione iniziale
    this.applyPrecisionToProps("cx", "cy", "r");

    // associo lo stile di riempimento e del bordo
    this.fillStyle = fillStyle ?? structuredClone(defaultFillStyle);
    this.strokeStyle = strokeStyle ?? structuredClone(defaultStrokeStyle);

    this.visible = visible;
    this.selected = selected ?? false;

    // creo l'elemento svg
    this.svgElement = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    this.updateSvg();

    // applico lo stile del riempimento
    applyFillStyle(this.svgElement, this.fillStyle);
    //applico lo stile del bordo
    applyStrokeStyle(this.svgElement, this.strokeStyle);

    // creo l'handler
    this.handler = new Handler(this.cx-this.r, this.cy-this.r, this.r*2, this.r*2, overlayLayer, this);

    // preparo per la visualizzazione
    this.render(null);
    // attacco l'oggetto svg al layer degli elementi
    elementsLayer.appendChild(this.svgElement);
    // attacco l'handler al layer "ovelay" (sopra a tutti)
    this.handler.attach(overlayLayer);
  }

  render(svg) {
    if(!this.visible) this.svgElement.style.display = "none";
    else this.svgElement.style.display = "inline";

    if(!this.visible || !this.selected) this.handler.hide();
    else this.handler.show();
    /*
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
    */      
  }

  // secondo me il nome giusto di questa funzione è "translate"
  moveBy(dx, dy) {
    this.cx = roundToPrecision(this.cx += dx, canvasPrecision);
    this.cy = roundToPrecision(this.cy += dy, canvasPrecision);
    this.updateSvg(); 
    this.handler.adjustPosition();
  }

  moveTo(x, y){
    this.cx = roundToPrecision(this.cx = x, canvasPrecision);
    this.cy = roundToPrecision(this.cy = y, canvasPrecision);
    this.updateSvg();
    this.handler.adjustPosition();
  }

  resize(r){
    this.r = roundToPrecision(this.r = r, canvasPrecision);
    this.updateSvg();
    this.handler.adjustPosition();
  }

  // disegna gli handlers se è selezionato
  drawHandlers(svg){
    /*
    if(!this.visible || !this.selected) return;
    let handler = null;
    handler = new Handler(this.cx-this.r, this.cy-this.r, this.r*2, this.r*2, svg, this);
    */
  }

  getBoundingBox() {
    return {x:this.cx-this.r, y:this.cy-this.r, width:this.r*2, height:this.r*2};
  }

  updateSvg(){
    this.svgElement.setAttribute("cx", this.cx);
    this.svgElement.setAttribute("cy", this.cy); 
    this.svgElement.setAttribute("r", this.r);
  }

  containsPoint(x, y) {
    const dx = x - this.cx;
    const dy = y - this.cy;
    return (dx * dx + dy * dy) <= (this.r * this.r);
  }
}
// === definizione classe Ellipse ===
class Ellipse extends Shape {
  constructor(cx, cy, rx, ry, fillStyle, strokeStyle, visible=true, selected){
    super();

    this.id = generateElementId();
    this.name = "ellipse"+this.id;
    this.type = "ellipse";

    this.cx = cx;
    this.cy = cy;
    this.rx = rx; 
    this.ry = ry;

    this.rotation = 0;
    // Applica precisione iniziale
    this.applyPrecisionToProps("cx", "cy", "rx", "ry");

    this.fillStyle = fillStyle ?? structuredClone(defaultFillStyle);
    this.strokeStyle = strokeStyle ?? structuredClone(defaultStrokeStyle);

    this.visible = visible;
    this.selected = selected ?? false;

    // creo l'elemento svg
    this.svgElement = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
    this.updateSvg();

    // applico lo stile del riempimento
    applyFillStyle(this.svgElement, this.fillStyle);
    //applico lo stile del bordo
    applyStrokeStyle(this.svgElement, this.strokeStyle);

    // creo l'handler
    //this.handler = new Handler(this.cx-this.rx, this.cy-this.ry, this.rx*2, this.ry*2, svg, this);
    this.handler = new EllipseHandlers(
      this,
      overlayLayer,
      { onHandlePointerDown: defaultHandleAdapter }
    );

    // creo i parametri geometrici
    //this.geoParams = 

    // preparo per la visualizzazione
    this.render(null);
    // attacco l'oggetto svg al layer degli elementi
    elementsLayer.appendChild(this.svgElement);
    // attacco l'handler al layer "ovelay" (sopra a tutti)
    //this.handler.attach(overlayLayer);
  }

  render(svg) {
    if(!this.visible) this.svgElement.style.display = "none";
    else this.svgElement.style.display = "inline";

    if(!this.visible || !this.selected) this.handler.hideAll();
    else {
      this.handler.update(); 
      this.handler.showAll();
    }
    /*
    if (!this.visible) return;
    const shape = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
  
    shape.setAttribute("cx", this.cx);
    shape.setAttribute("cy", this.cy);
    shape.setAttribute("rx", this.rx);
    shape.setAttribute("ry", this.ry);
  
    //applica lo stile del bordo
    shape.setAttribute("fill", this.fillStyle.fill || "none");
    shape.setAttribute("fill-opacity", this.fillStyle.fillOpacity ?? 1);
    //applica lo stile del bordo
    applyStrokeStyle(shape, this.strokeStyle);
    svg.appendChild(shape); 
    */
  }

  // secondo me il nome giusto di questa funzione è "translate"
  moveBy(dx, dy) {
    this.cx = roundToPrecision(this.cx += dx, canvasPrecision);
    this.cy = roundToPrecision(this.cy += dy, canvasPrecision);
    this.updateSvg(); 
    //this.handler.adjustPosition();
    this.handler.update();
  }

  moveTo(x, y){
    this.cx = roundToPrecision(this.cx = x, canvasPrecision);
    this.cy = roundToPrecision(this.cy = y, canvasPrecision);
    this.updateSvg();
    //this.handler.adjustPosition();
    this.handler.update();
  }

  resize(rx, ry){
    this.rx = roundToPrecision(this.rx = rx, canvasPrecision);
    this.ry = roundToPrecision(this.ry = ry, canvasPrecision);
    this.updateSvg();
    //this.handler.adjustPosition();
    this.handler.update();
  }

  // disegna gli handlers se è selezionato
  drawHandlers(overlayLayer){
    /*
    if(!this.visible || !this.selected) return;
    let handler = null;
    handler = new Handler(this.cx-this.rx, this.cy-this.ry, this.rx*2, this.ry*2, svg, this);
    */
    //this.drawParams(layer, true, true, true, true);
  }

  getBoundingBox() {
    return {x:this.cx-this.rx, y:this.cy-this.ry, width:this.rx*2, height:this.ry*2};
  }

  updateSvg(){
    this.svgElement.setAttribute("cx", this.cx);
    this.svgElement.setAttribute("cy", this.cy); 
    this.svgElement.setAttribute("rx", this.rx);
    this.svgElement.setAttribute("ry", this.ry);
  }

  
  containsPoint(x, y) {
      const dx = (x - this.cx) / this.rx;
      const dy = (y - this.cy) / this.ry;
      return (dx * dx + dy * dy) <= 1;
  }

  drawParams(layer, center=false, focusLoci=false, majorAxis=false, minorAxis=false, extremePoints=false, bbox=false){
    if(svg == null || svg == undefined){
      console.warn("svg null or undefined");
      return;
    }
    if(center) this.drawCenter(layer);
    if(focusLoci) this.drawFocusLoci(layer);
    if(majorAxis) this.drawMajorAxis(layer);
    if(minorAxis) this.drawMinorAxis(layer);
    if(extremePoints) this.drawCenter(layer);
    if(bbox) this.drawCenter(layer);    
  }

  drawCenter(layer) {
    const size = handlerRectSize/canvasZoomFactor;
    const centerPoint = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    centerPoint.setAttribute("x", this.cx-size/2);
    centerPoint.setAttribute("y", this.cy-size/2);
    centerPoint.setAttribute("width", size);
    centerPoint.setAttribute("height", size);
    centerPoint.setAttribute("fill", "#00ffff");
    centerPoint.setAttribute("stroke", "#000");
    centerPoint.setAttribute("stroke-width", "1");
    centerPoint.setAttribute("vector-effect", "non-scaling-stroke");

    layer.appendChild(centerPoint); 
  }
  getFocusLoci(){
    //trovo la distanza dei fuochi dal centro
    let dist = Math.sqrt(Math.abs(Math.pow(this.rx,2) - Math.pow(this.ry, 2)));
    // setto le distanze dal centro. 
    // Poichè i fuochi si trovano sull'asse maggiore...
    let dx = 0, dy = 0;
    if(this.rx >= this.ry) dx = dist;
    else dy = dist;

    const points = [
      { type: "focus1", x: this.cx+dx, y: this.cy+dy },
      { type: "focus2", x: this.cx-dx, y: this.cy-dy  }
    ];
    return points;
  }
  drawFocusLoci(layer) {
    const size = handlerRectSize/canvasZoomFactor;

    let fLoci = this.getFocusLoci();
    for (let p of fLoci) {
      let handle = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      handle.setAttribute("x", p.x - size / 2);
      handle.setAttribute("y", p.y - size / 2);
      handle.setAttribute("width", size);
      handle.setAttribute("height", size);
      handle.setAttribute("fill", "#00ffff");
      handle.setAttribute("stroke", "#000");
      handle.setAttribute("stroke-width", "1");
      handle.setAttribute("vector-effect", "non-scaling-stroke");

      layer.appendChild(handle);
    }  
  }
  drawMajorAxis(layer){
    let dx = 0, dy = 0;
    if(this.rx>=this.ry) dx = this.rx;
    else dy = this.ry;

    let points = [
      { type: "maxP1", px: this.cx+dx, py: this.cy+dy },
      { type: "maxP2", px: this.cx-dx, py: this.cy-dy  }
    ];
    let axis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    axis.setAttribute("x1", points[0].px);
    axis.setAttribute("y1", points[0].py);
    axis.setAttribute("x2", points[1].px);
    axis.setAttribute("y2", points[1].py);
    axis.setAttribute("stroke", "#00ffff");
    axis.setAttribute("stroke-width", "1");
    axis.setAttribute("stroke-dasharray", "4,2");
    axis.setAttribute("vector-effect", "non-scaling-stroke");

    layer.appendChild(axis);
  }
  drawMinorAxis(layer){
    let dx = 0,  dy = 0;
    if(this.rx<=this.ry) dx = this.rx;
    else dy = this.ry;

    let points = [
      { type: "minP1", px: this.cx+dx, py: this.cy+dy },
      { type: "minP2", px: this.cx-dx, py: this.cy-dy  }
    ];
    let axis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    axis.setAttribute("x1", points[0].px);
    axis.setAttribute("y1", points[0].py);
    axis.setAttribute("x2", points[1].px);
    axis.setAttribute("y2", points[1].py);
    axis.setAttribute("stroke", "#00ffff");
    axis.setAttribute("stroke-width", "1");
    axis.setAttribute("stroke-dasharray", "4,2");
    axis.setAttribute("vector-effect", "non-scaling-stroke");

    layer.appendChild(axis);
  }


}
// === definizione classe Arc (circular) ===
class Arc extends Shape {
  constructor(cx, cy, r, startAngle, endAngle, sweepFlag, largeArcFlag, fillStyle, strokeStyle, visible=true, selected){
    super();

    this.id = generateElementId();
    this.name = "arc"+this.id;
    this.type = "arc";
    this.cx = cx;
    this.cy = cy;
    this.r = r;
    this.startAngle = startAngle;
    this.endAngle = endAngle;
    this.sweepFlag = sweepFlag;
    this.largeArcFlag = largeArcFlag;
    // Applica precisione iniziale
    this.applyPrecisionToProps("cx", "cy", "r");
    this.fillStyle = fillStyle ?? structuredClone(defaultFillStyle);
    this.strokeStyle = strokeStyle ?? structuredClone(defaultStrokeStyle);
    this.visible = visible;
    this.selected = selected ?? false;

  }

  render(svg) {
    if (!this.visible) return;
  
    const angleToRad = angle => (angle * Math.PI) / 180;
  // Calcola i punti iniziale e finale in coordinate mondo
    const x1 = this.cx + this.r * Math.cos(angleToRad(this.startAngle));
    const y1 = this.cy + this.r * Math.sin(angleToRad(this.startAngle));
    const x2 = this.cx + this.r * Math.cos(angleToRad(this.endAngle));
    const y2 = this.cy + this.r * Math.sin(angleToRad(this.endAngle));
  
    //const largeArcFlag = (Math.abs(this.endAngle - this.startAngle) % 360) > 180 ? 1 : 0;
    //const sweepFlag = 1;
  
    //console.log("dalla render di Arc sweepFlag:",this.sweepFlag);
    //console.log("dalla render di Arc largeArcFlag:",this.largeArcFlag);
    const d = `M ${x1} ${y1} A ${this.r} ${this.r} 0 ${this.largeArcFlag} ${this.sweepFlag} ${x2} ${y2}`;
    //console.log("d:", d);
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

    path.setAttribute("d", d);

    //applica lo stile del bordo
    path.setAttribute("fill", this.fillStyle.fill || "none");
    path.setAttribute("fill-opacity", this.fillStyle.fillOpacity ?? 1);
    //applica lo stile del bordo
    applyStrokeStyle(path, this.strokeStyle);
    svg.appendChild(path);
  }

  drawHandlers(svg){
    if(!this.visible || !this.selected) return;
    let handler = null;
    const startRad = (Math.PI / 180) * this.startAngle;
    const endRad   = (Math.PI / 180) * this.endAngle;
    let x1 = this.cx + this.r*Math.cos(startRad);
    let y1 = this.cy + this.r*Math.sin(startRad);
    let x2 = this.cx + this.r*Math.cos(endRad);
    let y2 = this.cy + this.r*Math.sin(endRad);
    let w = Math.abs(x2-x1);
    let h = Math.abs(y2-y1);
    handler = new Handler(Math.min(x1, x2), Math.min(y1, y2), w, h, svg, this);
  }

  getBoundingBox() {
    const startRad = (Math.PI / 180) * this.startAngle;
    const endRad   = (Math.PI / 180) * this.endAngle;
    let x1 = this.cx + this.r*Math.cos(startRad);
    let y1 = this.cy + this.r*Math.sin(startRad);
    let x2 = this.cx + this.r*Math.cos(endRad);
    let y2 = this.cy + this.r*Math.sin(endRad);
    let w = Math.abs(x2-x1);
    let h = Math.abs(y2-y1);
    return {x:Math.min(x1, x2), y:Math.min(y1, y2), width:w, height:h};
  }

  containsPointOld(x, y) {
      const dx = x - this.cx;
      const dy = y - this.cy;
      const distSq = dx * dx + dy * dy;
      const rSq = this.r * this.r;
      if (distSq > rSq) return false;
      let angle = Math.atan2(dy, dx);
      if (angle < 0) angle += 2 * Math.PI;
      return angle >= this.startAngle && angle <= this.endAngle;
  }
  containsPoint(x, y) {
    // Trasla nelle coordinate locali
    let dx = x - this.cx;
    let dy = y - this.cy;

    // Distanza dal centro
    let dist = Math.sqrt(dx * dx + dy * dy);

    // Vicino alla circonferenza?
    const tol = 1; // tolleranza in unità mondo
    if (Math.abs(dist - this.r) > tol) return false;

    // Calcola angolo in radianti [0, 2π)
    let pointAngle = Math.atan2(dy, dx);
    if (pointAngle < 0) pointAngle += 2 * Math.PI;

    // Angoli dell'arco (già normalizzati in [0, 2π))
    let start = this.startAngle % (2 * Math.PI);
    if (start < 0) start += 2 * Math.PI;

    let end = this.endAngle % (2 * Math.PI);
    if (end < 0) end += 2 * Math.PI;

    if (this.sweepFlag === 1) {
        // Orario
        if (start < end) start += 2 * Math.PI;
        return pointAngle >= end && pointAngle <= start;
    } else {
        // Antiorario
        if (end < start) end += 2 * Math.PI;
        return pointAngle >= start && pointAngle <= end;
    }
  }
  getArcFlag(){
    return this.largeArcFlag;
  }
}
// === definizione classe EllipseArc (elliptical) ===
class EllipseArc extends Shape {
  constructor(x1, y1, x2, y2, rx, ry, rotation, largeArcFlag, sweepFlag,
    fillStyle, strokeStyle, visible = true, selected = false) {
    super();

    this.id = generateElementId();
    this.name = "ellipse-arc"+this.id;
    this.type = "ellipse-arc";
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;

    let p = computeEllipseArcCenter(x1, y1, x2, y2, rx, ry, rotation, largeArcFlag, sweepFlag);
    this.cx = p.x;                 // Centro ellisse
    this.cy = p.y;                 // Centro ellisse
    this.rx = rx;                   // Raggio orizzontale
    this.ry = ry;                   // Raggio verticale
    //this.applyPrecisionToProps("cx", "cy", "rx", "ry");
    this.startAngle = null;   // Angolo iniziale in radianti (o gradi, da standardizzare)
    this.endAngle = null;       // Angolo finale in radianti (o gradi)

    this.rotation = rotation;       // Rotazione dell'ellisse in gradi
    this.largeArcFlag = largeArcFlag; // 0 o 1
    this.sweepFlag = sweepFlag;       // 0 = antiorario, 1 = orario

    this.fillStyle = fillStyle ?? structuredClone(defaultFillStyle);
    this.strokeStyle = strokeStyle ?? structuredClone(defaultStrokeStyle);
    this.visible = visible;
    this.selected = selected ?? false;
  }
  
  // Factory: costruzione a partire dal centro
  // --- COSTRUTTORE STATICO ---
  static fromCenter(cx, cy, rx, ry, startAngle, endAngle, rotation, 
    fillStyle, strokeStyle, visible = true, selected = false) {
    
    // Normalizzo gli angoli
    startAngle = startAngle % 360;
    endAngle = endAngle % 360;
    // Calcola punti estremi
    const p1 = pointOnEllipse(cx, cy, rx, ry, rotation, startAngle);
    const p2 = pointOnEllipse(cx, cy, rx, ry, rotation, endAngle);

    // Differenza angolare normalizzata [0, 360)
    let delta = (endAngle - startAngle) % 360;
    if (delta < 0) delta += 360;
    //console.log("pseudocostruttore EllipseArc: ",startAngle, endAngle, delta);

    // Flags SVG
    const largeArcFlag = (delta > 180) ? 1 : 0;
    const sweepFlag = (endAngle > startAngle) ? 1 : 0;

    const arc = new EllipseArc(p1.x, p1.y, p2.x, p2.y, rx, ry, 
                              rotation,largeArcFlag, sweepFlag,
                              fillStyle, strokeStyle, visible, selected);

    // Metadati aggiuntivi
    arc.cx = cx;
    arc.cy = cy;
    arc.startAngle = startAngle;
    arc.endAngle = endAngle;
    //console.log(arc);
    return arc;
  }


  render(svg) {
    if (!this.visible) return;
    // Costruzione parametro d
    const d = `M ${this.x1} ${this.y1} A ${this.rx} ${this.ry} ${this.rotation} ${this.largeArcFlag} ${this.sweepFlag} ${this.x2} ${this.y2}`;

    //console.log("render di EllipseArc d:",d);
    // Creazione path SVG
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);

    //applica lo stile del bordo
    path.setAttribute("fill", this.fillStyle.fill || "none");
    path.setAttribute("fill-opacity", this.fillStyle.fillOpacity ?? 1);
    //applica lo stile del bordo
    applyStrokeStyle(path, this.strokeStyle);
    svg.appendChild(path);

    // Handlers se selezionato
    if (this.selected) {
        this.drawHandlers(svg);
    }
  } 

  drawCenterPoint(svg) {
    const size = handlerRectSize/canvasZoomFactor;
    const centerPoint = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    centerPoint.setAttribute("x", this.cx-size/2);
    centerPoint.setAttribute("y", this.cy-size/2);
    centerPoint.setAttribute("width", size);
    centerPoint.setAttribute("height", size);
    centerPoint.setAttribute("fill", "#ff0000");
    centerPoint.setAttribute("stroke", "#000");
    centerPoint.setAttribute("stroke-width", "1");
    centerPoint.setAttribute("vector-effect", "non-scaling-stroke");

    svg.appendChild(centerPoint); 
  }
  drawMajorAxis(svg){
    // definisco dx e dy come gli scostamenti dal centro 
    // dei punti estremali degli assi
    // Nel caso in cui l'asse maggiore sia lungo x -> dx > 0 e dy = 0
    // Nel caso in cui l'asse maggiore sia lungo y -> dy > 0 e dx = 0
    let dx = 0, dy = 0;
    if(this.rx >= this.ry) dx = this.rx;
    else dy = this.ry;

    // applico la rotazione 
    let rot = this.rotation / 180 * Math.PI;
    let dx_r = dx * Math.cos(rot) - dy * Math.sin(rot);
    let dy_r = dx * Math.sin(rot) + dy * Math.cos(rot);


    let points = [
      { type: "maxP1", px: this.cx+dx_r, py: this.cy+dy_r },
      { type: "maxP2", px: this.cx-dx_r, py: this.cy-dy_r  }
    ];
    let axis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    axis.setAttribute("x1", points[0].px);
    axis.setAttribute("y1", points[0].py);
    axis.setAttribute("x2", points[1].px);
    axis.setAttribute("y2", points[1].py);
    axis.setAttribute("stroke", "#00ffff");
    axis.setAttribute("stroke-width", "1");
    axis.setAttribute("stroke-dasharray", "4,2");
    axis.setAttribute("vector-effect", "non-scaling-stroke");

    svg.appendChild(axis);
  }
  drawMinorAxis(svg){
    // definisco dx e dy come gli scostamenti dal centro 
    // dei punti estremali degli assi
    // Nel caso in cui l'asse maggiore sia lungo x -> dx > 0 e dy = 0
    // Nel caso in cui l'asse maggiore sia lungo y -> dy > 0 e dx = 0
    let dx = 0, dy = 0;
    if(this.rx<=this.ry) dx = this.rx;
    else dy = this.ry;

    // applico la rotazione 
    let rot = this.rotation / 180 * Math.PI;
    let dx_r = dx * Math.cos(rot) - dy * Math.sin(rot);
    let dy_r = dx * Math.sin(rot) + dy * Math.cos(rot);

    let points = [
      { type: "minP1", px: this.cx+dx_r, py: this.cy+dy_r },
      { type: "minP2", px: this.cx-dx_r, py: this.cy-dy_r  }
    ];
    let axis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    axis.setAttribute("x1", points[0].px);
    axis.setAttribute("y1", points[0].py);
    axis.setAttribute("x2", points[1].px);
    axis.setAttribute("y2", points[1].py);
    axis.setAttribute("stroke", "#00ffff");
    axis.setAttribute("stroke-width", "1");
    axis.setAttribute("stroke-dasharray", "4,2");
    axis.setAttribute("vector-effect", "non-scaling-stroke");

    svg.appendChild(axis);
  }
  drawFocusLoci(svg) {
    const size = handlerRectSize/canvasZoomFactor;

    //trovo la distanza dei fuochi dal centro
    let dist = Math.sqrt(Math.abs(Math.pow(this.rx,2) - Math.pow(this.ry, 2)));
    // setto le distanze dal centro. 
    // Poichè i fuochi si trovano sull'asse maggiore...
    let dx = 0, dy = 0;
    if(this.rx >= this.ry) dx = dist;
    else dy = dist;

    // applico la rotazione 
    let rot = this.rotation / 180 * Math.PI;
    let dx_r = dx * Math.cos(rot) - dy * Math.sin(rot);
    let dy_r = dx * Math.sin(rot) + dy * Math.cos(rot);

    const points = [
      { type: "focus1", px: this.cx+dx_r, py: this.cy+dy_r },
      { type: "focus2", px: this.cx-dx_r, py: this.cy-dy_r  }
    ];
    for (let p of points) {
      let handle = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      handle.setAttribute("x", p.px - size / 2);
      handle.setAttribute("y", p.py - size / 2);
      handle.setAttribute("width", size);
      handle.setAttribute("height", size);
      handle.setAttribute("fill", "#ff0000");
      handle.setAttribute("stroke", "#000");
      handle.setAttribute("stroke-width", "1");
      handle.setAttribute("vector-effect", "non-scaling-stroke");

      svg.appendChild(handle);
    }  
  }
  drawHandlers(svg){
    if(!this.visible || !this.selected) return;
    let handler = null;
    let w = Math.abs(this.x2-this.x1);
    let h = Math.abs(this.y2-this.y1);
    //handler = new Handler(Math.min(x1, x2), Math.min(y1, y2), w, h, svg, this);
    handler = new Handler(Math.min(this.x1, this.x2), Math.min(this.y1, this.y2), w, h, svg, this);
    this.drawMajorAxis(svg);
    this.drawMinorAxis(svg);
    this.drawCenterPoint(svg);
    this.drawFocusLoci(svg);
  }

  getBoundingBox() {
    const startRad = (Math.PI / 180) * this.startAngle;
    const endRad   = (Math.PI / 180) * this.endAngle;
    let x1 = this.cx + this.r*Math.cos(startRad);
    let y1 = this.cy + this.r*Math.sin(startRad);
    let x2 = this.cx + this.r*Math.cos(endRad);
    let y2 = this.cy + this.r*Math.sin(endRad);
    let w = Math.abs(x2-x1);
    let h = Math.abs(y2-y1);
    return {x:Math.min(x1, x2), y:Math.min(y1, y2), width:w, height:h};
  }

  containsPoint(x, y) {
    const ddx = (x - this.cx) / this.rx;
    const ddy = (y - this.cy) / this.ry;
    if(true) return (ddx * ddx + ddy * ddy) <= 1;
    // Trasla nelle coordinate locali
    let dx = x - this.cx;
    let dy = y - this.cy;

    // Distanza dal centro
    let dist = Math.sqrt(dx * dx + dy * dy);
    console.log("distanza dal centro:",dist);

    // Vicino alla circonferenza?
    const tol = 1; // tolleranza in unità mondo
    if (Math.abs(dist - this.rx) > tol) return false;

    // Calcola angolo in radianti [0, 2π)
    let pointAngle = Math.atan2(dy, dx);
    if (pointAngle < 0) pointAngle += 2 * Math.PI;

    // Angoli dell'arco (già normalizzati in [0, 2π))
    let start = this.startAngle % (2 * Math.PI);
    if (start < 0) start += 2 * Math.PI;

    let end = this.endAngle % (2 * Math.PI);
    if (end < 0) end += 2 * Math.PI;

    if (this.sweepFlag === 1) {
        // Orario
        console.log("x:",x," , y:",y);
        if (start < end) start += 2 * Math.PI;
        return pointAngle >= end && pointAngle <= start;
    } else {
        // Antiorario
        console.log("x:",x," , y:",y);
        if (end < start) end += 2 * Math.PI;
        return pointAngle >= start && pointAngle <= end;
    }
  }
   
  setStartAngle(angle){
    // normalizzo l'angolo
    angle = angle%360;
    // per rimanere sempre sulla stessa ellisse devo controllare 
    // se angle (il nuovo valore di startAngle) si è scambiato di posizione con 
    // endAngle rispetto alla posizione di prima, e se si, cambiare lo sweepFlag
    if((this.endAngle - this.startAngle) / (this.endAngle - angle ) < 0) this.sweepFlag = (this.sweepFlag == 0)? 1: 0;

    // calcolo il nuovo punto intercettato dall'angolo "angle" uscente dal centro
    let p = pointOnEllipse(this.cx, this.cy, this.rx, this.ry, this.rotation, angle);
    this.x1 = p.x; this.y1 = p.y;
    // imposto l'angolo iniziale
    this.startAngle = angle;
    // imposto il largeArcFlag a seconda dell'arco intercettato da i nuovi valori
    this.largeArcFlag = (Math.abs(this.endAngle - this.startAngle) > 180)? 1 : 0;
  }
  setEndAngle(angle){
    // normalizzo l'angolo
    angle = angle%360;
    // per rimanere sempre sulla stessa ellisse devo controllare 
    // se angle (il nuovo valore di endAngle) si è scambiato di posizione con 
    // startAngle rispetto alla posizione di prima, e se si, cambiare lo sweepFlag
    if((this.endAngle - this.startAngle) / (angle - this.startAngle) < 0) this.sweepFlag = (this.sweepFlag == 0)? 1: 0;

    // calcolo il nuovo punto intercettato dall'angolo "angle" uscente dal centro
    let p = pointOnEllipse(this.cx, this.cy, this.rx, this.ry, this.rotation, angle);
    this.x2 = p.x; this.y2 = p.y;
    // imposto l'angolo finale
    this.endAngle = angle;
    // imposto il largeArcFlag a seconda dell'arco intercettato da i nuovi valori
    this.largeArcFlag = (Math.abs(this.endAngle - this.startAngle) > 180)? 1 : 0;
  }
  setRxAxis(lenght){
    this.rx = lenght;
    // calcolo i nuovi punti intercettati dagli angoli startAngle e endAngle
    let p1 = pointOnEllipse(this.cx, this.cy, this.rx, this.ry, this.rotation, this.startAngle);
    this.x1 = p1.x; this.y1 = p1.y;
    // calcolo il nuovo punto intercettato dall'angolo "angle" uscente dal centro
    let p2 = pointOnEllipse(this.cx, this.cy, this.rx, this.ry, this.rotation, this.endAngle);
    this.x2 = p2.x; this.y2 = p2.y;
  }
  setRyAxis(lenght){
    this.ry = lenght;
    // calcolo i nuovi punti intercettati dagli angoli startAngle e endAngle
    let p1 = pointOnEllipse(this.cx, this.cy, this.rx, this.ry, this.rotation, this.startAngle);
    this.x1 = p1.x; this.y1 = p1.y;
    // calcolo il nuovo punto intercettato dall'angolo "angle" uscente dal centro
    let p2 = pointOnEllipse(this.cx, this.cy, this.rx, this.ry, this.rotation, this.endAngle);
    this.x2 = p2.x; this.y2 = p2.y;
  }
  setArcFlag(arc){
    // conrtollo che arc non sia nullo, indefinito o uguale al valore già settato
    // console.log(this, "arc:", arc);
    if(arc == null || arc == undefined || arc == this.largeArcFlag) return;

    // se cambio arco da maggiore a minore o viceversa, devo cambiare lo 
    // sweepFlag per mantenere la stessa ellisse
    this.sweepFlag = (this.sweepFlag == 0)? 1: 0;
    this.largeArcFlag = (this.largeArcFlag == 0)? 1: 0;

    //let tempP1 = {x1: this.x1, y1: this.y1};
    //this.x1 = this.x2; this.y1 = this.y2;
    //this.x2 = tempP1.x1; this.y2 = tempP1.y1;
  }
  getArcFlag(){
    return this.largeArcFlag;
  }
  setRotation(rot) {
    // normalizzo rot
    rot = rot % 360;
    // Calcolo i nuovi punti estremi
    const p1 = pointOnEllipse(this.cx, this.cy, this.rx, this.ry, rot, this.startAngle);
    const p2 = pointOnEllipse(this.cx, this.cy, this.rx, this.ry, rot, this.endAngle);
    this.x1 = p1.x; this.y1 = p1.y;
    this.x2 = p2.x; this.y2 = p2.y;
    this.rotation = rot;
  }

  move(dx, dy){
    this.x1 += dx;
    this.y1 += dy;
    this.x2 += dx;
    this.y2 += dy;

    this.cx += dx;
    this.cy += dy; 
    //updateElementPropertyControls(this);
  }
  moveCenterToX (x) {
    let deltaX = x - this.cx;
    this.x1 += deltaX;
    this.x2 += deltaX;
    this.cx += deltaX;
  }
  moveCenterToY (y) {
    let deltaY = y - this.cy;
    this.y1 += deltaY;
    this.y2 += deltaY;
    this.cy += deltaY;
  }

  applyPrecision (){
    //console.log(canvasPrecision);
    /*
    this.x1 = this.applyPrecision(this.x1);
    this.y1 = this.applyPrecision(this.y1);
    this.x2 = this.applyPrecision(this.x2);
    this.y2 = this.applyPrecision(this.y2);
    */

    this.cx = super.applyPrecision(this.cx);
    this.cy = super.applyPrecision(this.cy); 

    updateElementPropertyControls(this);
  }

}

// === Inizio definizione classe Handler ===
class Handler {
  constructor(x, y, width, height, svg, element) {
    this.element = element;
    this.handles = [];
    this.bBox = null;
    //this.points = [];

    if(element.type !== "line") {
      this.bBox = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      this.bBox.setAttribute("x", x);
      this.bBox.setAttribute("y", y);
      this.bBox.setAttribute("width", width);
      this.bBox.setAttribute("height", height);
      this.bBox.setAttribute("fill", "none");
      this.bBox.setAttribute("stroke", "#00ffff");
      this.bBox.setAttribute("stroke-width", "1");
      this.bBox.setAttribute("stroke-dasharray", "4,2");
      this.bBox.setAttribute("vector-effect", "non-scaling-stroke");
      overlayLayer.appendChild(this.bBox);
    }
    // Dimensione dei quadratini handler
    const size = handlerRectSize/canvasZoomFactor;

    let points = [];
    // Definizione posizioni handler
    if (element.type === "line") {
      // Solo due punti: start e end
      points = [
          { type: "start", px: element.x1, py: element.y1 },
          { type: "middle", px: (element.x1+element.x2)/2, py: (element.y1+element.y2)/2},
          { type: "end",   px: element.x2, py: element.y2 }
      ];
    }else{
      points = [
        { type: "nw", px: x,           py: y + height },         // in alto a sinistra
        { type: "n",  px: x + width/2, py: y + height },         // in alto al centro
        { type: "ne", px: x + width,   py: y + height },         // in alto a destra
    
        { type: "w",  px: x,           py: y + height/2 },       // centro a sinistra
        { type: "c",  px: x + width/2, py: y + height/2 },       // centro
        { type: "e",  px: x + width,   py: y + height/2 },       // centro a destra
    
        { type: "sw", px: x,           py: y },                  // in basso a sinistra
        { type: "s",  px: x + width/2, py: y },                  // in basso al centro
        { type: "se", px: x + width,   py: y }                   // in basso a destra
      ];
    }
    for (let p of points) {
      let handle = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      handle.setAttribute("x", p.px - size/2);
      handle.setAttribute("y", p.py - size/2);
      handle.setAttribute("width", size);
      handle.setAttribute("height", size);
      handle.setAttribute("fill", "#00ffff");
      handle.setAttribute("stroke", "#000");
      handle.setAttribute("stroke-width", "1");
      handle.setAttribute("vector-effect", "non-scaling-stroke");
      handle.dataset.type = p.type; // salva il tipo
      handle.style.cursor = this.getCursorForType(p.type);
      /*
      handle.addEventListener("mousedown", (e) => {
        //e.stopPropagation(); // evita che scatti la selezione della riga o altro
        console.log("mousedown dentro handle.addEventListener('mousedown').. (Shapes.js)");
        onHandleMouseDown(e, p.type, this.element);
      });
      */
      handle.addEventListener("pointerdown", doNothing);

    
      //svg.appendChild(handle);
      this.handles.push(handle);
    }
  }

  // questa funzione viene chiamata per aggiornare la posizione 
  // dell'handler quando l'oggetto viene mosso o scalato o ruotato
  adjustPosition() {
    // riposiziono il bBox nel caso l'elemento sia stato spostato e/o scalato
    let box = this.element.getBoundingBox();
    if(this.element.type != "line"){
      this.bBox.setAttribute("x", box.x);
      this.bBox.setAttribute("y", box.y);
      this.bBox.setAttribute("width", box.width);
      this.bBox.setAttribute("height", box.height);
    }

    //console.log(this.handles[0].dataset);
    // riposiziono gli handles sul box fornito dall'elemento
    let size = handlerRectSize/canvasZoomFactor;
    for (let h of this.handles){
      // scalo la dimensione de quadratini degli handles per 
      // renderli indipendenti dal fattore di zoom
      h.setAttribute("width", size);
      h.setAttribute("height", size);

      if (this.element.type === "line") {
        switch(h.dataset.type){
          case "start": 
            h.setAttribute("x", this.element.x1 - size/2);
            h.setAttribute("y", this.element.y1 - size/2);
            break;
          case "middle":
            h.setAttribute("x", (this.element.x1+this.element.x2)/2 - size/2);
            h.setAttribute("y", (this.element.y1+this.element.y2)/2 - size/2);
            break;
          case "end":
            h.setAttribute("x", this.element.x2 - size/2);
            h.setAttribute("y", this.element.y2 - size/2);
            break;
        }
      } else {
        switch(h.dataset.type){
          case "nw": 
            h.setAttribute("x", (box.x)-size/2);
            h.setAttribute("y", (box.y+box.height)-size/2);
            break;
          case "n":
            h.setAttribute("x", box.x+box.width/2-size/2);
            h.setAttribute("y", (box.y+box.height)-size/2);
            break;
          case "ne":
            h.setAttribute("x", (box.x+box.width)-size/2);
            h.setAttribute("y", (box.y+box.height)-size/2);
            break;
          case "w":
            h.setAttribute("x", (box.x)-size/2);
            h.setAttribute("y", (box.y+box.height/2)-size/2);
            break;
          case "c":
            h.setAttribute("x", (box.x+box.width/2)-size/2);
            h.setAttribute("y", (box.y+box.height/2)-size/2);
            break;
          case "e":
            h.setAttribute("x", (box.x+box.width)-size/2);
            h.setAttribute("y", (box.y+box.height/2)-size/2);
            break;
          case "sw":
            h.setAttribute("x", (box.x)-size/2);
            h.setAttribute("y", (box.y)-size/2);
            break;
          case "s":
            h.setAttribute("x", (box.x+box.width/2)-size/2);
            h.setAttribute("y", (box.y)-size/2);
            break;
          case "se":
            h.setAttribute("x", (box.x+box.width)-size/2);
            h.setAttribute("y", (box.y)-size/2);
            break;
        }
      }
    }
  }

  adjustCanvasZoom() {
    this.adjustPosition();
    /*
    Non è sufficiente aggiornare la dimensione del quadrato perché modificando 
    solo quella il qaudrato non si troverà più centrato
    let size = handlerRectSize/canvasZoomFactor;
    for (let h of this.handles){
      h.setAttribute("width", size);
      h.setAttribute("height", size);
    }
      */
  }

  getCursorForType(type) {
    switch(type) {
      case "nw": case "se": return "nwse-resize";
      case "ne": case "sw": return "nesw-resize";
      case "n": case "s":  return "ns-resize";
      case "w": case "e":  return "ew-resize";
      case "c": return "move";
      case "start": return "pointer"; 
      case "middle": return "pointer";
      case "end": return "pointer";
      default: return "default";
    }
  }

  hide() {
    if(this.element.type !== "line") this.bBox.style.display = "none";
    for (let h of this.handles) {
      h.style.display = "none";
    }
  }

  show(){
    if(this.element.type !== "line") this.bBox.style.display = "inline";
    for (let h of this.handles) {
      h.style.display = "inline";
    }
  }

  attach(layer) {
    if(this.element.type !== "line") layer.appendChild(this.bBox);
    for (let h of this.handles) {
      layer.appendChild(h)
    }
  }
}
// === FINE definizione classe Handler ===

// === INIZIO definizioni nuovi handlers

// BaseHandlers.js
class BaseHandlers {
  /**
   * @param {Object} element     - l'oggetto del modello (Rect, Circle, Ellipse, ...)
   * @param {SVGGElement|SVGElement} overlayLayer - layer SVG su cui disegnare handlers/bbox
   * @param {Object} callbacks   - callback per eventi
   *   - onHandlePointerDown(ev, element, handleEl, type, handlers)
   *   - onHandlePointerEnter?(ev, element, handleEl, type, handlers)
   *   - onHandlePointerLeave?(ev, element, handleEl, type, handlers)
   */
  constructor(element, overlayLayer, callbacks = {}) {
    this.element = element;
    this.overlayLayer = overlayLayer;

    // Callbacks di default (no-op)... non fa nulla
    const noop = () => {console.log("faccio qualcosa");};
    this.callbacks = {
      onHandlePointerDown: callbacks.onHandlePointerDown || noop,
      onHandlePointerEnter: callbacks.onHandlePointerEnter || null,
      onHandlePointerLeave: callbacks.onHandlePointerLeave || null,
    };

    // Stato interno
    this.handles = [];           // tutti gli handle (standard + extra)
    this.defaultHandles = {};    // mappa type -> SVGRectElement per i 9 standard
    this.helperLines = [];       // array di SVGLineElement
    this.visible = true;

    // ============ Crea BBox ============
    this.bBox = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    this.bBox.setAttribute("fill", "none");
    this.bBox.setAttribute("stroke", "#000");
    this.bBox.setAttribute("stroke-width", "1");
    this.bBox.setAttribute("stroke-dasharray", "4,2");
    this.bBox.setAttribute("vector-effect", "non-scaling-stroke");
    this.overlayLayer.appendChild(this.bBox);

    // ============ Crea 9 handle standard ============
    const types = ["nw","n","ne","w","c","e","sw","s","se"];
    for (const t of types) {
      const h = this.#createRectHandle(t);
      this.defaultHandles[t] = h;
      this.handles.push(h);
    }

    // NB: le sottoclassi DEVONO chiamare update() per posizionare bbox+handles.
  }

  // ====== API pubblica ======

  /** Da sovrascrivere nelle sottoclassi */
  update() {
    throw new Error("BaseHandlers.update() deve essere implementato dalla sottoclasse.");
  }

  /** Crea un handle aggiuntivo (es. fuoco di ellisse) e lo registra. Ritorna l’elemento SVG. */
  createHandle(x, y, size, type, cursor = "default", color = "#00ffff") {
    const h = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    h.dataset.type = type;
    h.setAttribute("x", x - size / 2);
    h.setAttribute("y", y - size / 2);
    h.setAttribute("width", size);
    h.setAttribute("height", size);
    h.setAttribute("fill", color);
    h.setAttribute("stroke", "#000");
    h.setAttribute("stroke-width", "1");
    h.setAttribute("vector-effect", "non-scaling-stroke");
    h.style.cursor = cursor;

    this.#attachHandleListeners(h, type);
    this.overlayLayer.appendChild(h);
    this.handles.push(h);
    return h;
  }

  /** Crea (e registra) una helper line; ritorna l’elemento SVGLine. */
  createHelperLine(x1, y1, x2, y2, dashed = true, color = "#00ffff") {
    const ln = document.createElementNS("http://www.w3.org/2000/svg", "line");
    ln.setAttribute("x1", x1);
    ln.setAttribute("y1", y1);
    ln.setAttribute("x2", x2);
    ln.setAttribute("y2", y2);
    ln.setAttribute("stroke", color);
    ln.setAttribute("stroke-width", "1");
    if (dashed) ln.setAttribute("stroke-dasharray", "4,2");
    ln.setAttribute("vector-effect", "non-scaling-stroke");
    this.overlayLayer.appendChild(ln);
    this.helperLines.push(ln);
    return ln;
  }

  // --- Show/Hide granulari ---
  showBbox()        { this.#setDisplay(this.bBox, ""); }
  hideBbox()        { this.#setDisplay(this.bBox, "none"); }
  showHandles()     { this.handles.forEach(h => this.#setDisplay(h, "")); }
  hideHandles()     { this.handles.forEach(h => this.#setDisplay(h, "none")); }
  showHelperLines() { this.helperLines.forEach(l => this.#setDisplay(l, "")); }
  hideHelperLines() { this.helperLines.forEach(l => this.#setDisplay(l, "none")); }

  // --- Show/Hide globali ---
  showAll()  { this.visible = true;  this.showBbox(); this.showHandles(); this.showHelperLines(); }
  hideAll()  { this.visible = false; this.hideBbox(); this.hideHandles(); this.hideHelperLines(); }

  // --- Utility per le sottoclassi ---

  /** Aggiorna BBox (x,y,w,h in coordinate mondo) */
  updateBBox(x, y, w, h) {
    this.bBox.setAttribute("x", x);
    this.bBox.setAttribute("y", y);
    this.bBox.setAttribute("width", w);
    this.bBox.setAttribute("height", h);
  }

  /** Aggiorna posizioni dei 9 handle standard dati x,y,w,h */
  updateStandardHandles(x, y, w, h, size = this.getHandleSize()) {
    const midX = x + w / 2;
    const maxX = x + w;
    const midY = y + h / 2;
    const maxY = y + h;

    const pos = {
      sw: [x,    y],
      s:  [midX, y],
      se: [maxX, y],
      w:  [x,    midY],
      c:  [midX, midY],
      e:  [maxX, midY],
      nw: [x,    maxY],
      n:  [midX, maxY],
      ne: [maxX, maxY],
    };

    for (const [type, [hx, hy]] of Object.entries(pos)) {
      this.#positionRectHandle(this.defaultHandles[type], hx, hy, size);
    }
  }

  /** Stima dimensione handle in px “schermo” (non-scaling-stroke lo mantiene visibile) */
  getHandleSize() {
    //const z = (typeof window !== "undefined" && window.canvasZoomFactor) ? window.canvasZoomFactor : 1;
    // mantieni un minimo leggibile
    //return Math.max(4, 6 / z);
    return handlerRectSize / canvasZoomFactor;
  }

  /** Aggiorna uno specifico handle (utile nelle sottoclassi per extra handle) */
  updateHandleRect(handleEl, x, y, size = this.getHandleSize()) {
    this.#positionRectHandle(handleEl, x, y, size);
  }

  /** Cambia i callbacks a runtime (opzionale) */
  setHandleCallbacks(callbacks = {}) {
    // questo serve ad aggiungere e/o aggiornare le callback
    // tramite il merge delle callback comuni a this.callback 
    // e all'oggetto passato
    this.callbacks = { ...this.callbacks, ...callbacks,};
  }

  /** Rimuove tutti gli elementi dall’overlay (se devi distruggere l’istanza) */
  destroy() {
    const remove = el => el && el.parentNode && el.parentNode.removeChild(el);
    remove(this.bBox);
    this.handles.forEach(remove);
    this.helperLines.forEach(remove);
    this.handles = [];
    this.helperLines = [];
    this.defaultHandles = {};
  }

  // ====== privati ======

  #createRectHandle(type) {
    const h = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    h.dataset.type = type;
    h.setAttribute("fill", "#00ffff");
    h.setAttribute("stroke", "#000");
    h.setAttribute("stroke-width", "1");
    h.setAttribute("vector-effect", "non-scaling-stroke");
    h.style.cursor = this.#cursorForType(type);

    this.#attachHandleListeners(h, type);
    this.overlayLayer.appendChild(h);
    return h;
  }

  #attachHandleListeners(handle, type) {
    // pointerdown: decidiamo qui se "prendere" l'interazione o lasciarla passare
    handle.addEventListener("pointerdown", (ev) => {
      // Notare: non usiamo arrow->non-arrow per `this`? con arrow va bene perché siamo in classe.
      const shouldCapture = (currentState === AppStates.SCALE || currentState === AppStates.ROTATE);

      if (shouldCapture) {
        ev.stopPropagation();
        ev.preventDefault();

        // Catturiamo il puntatore così riceviamo pointermove/up anche se il mouse esce dall'handle
        try { handle.setPointerCapture(ev.pointerId); } catch (e) { /* fallback */ }

        // Notifica alla callback (se presente) che l'handle è stato premuto
        this.callbacks.onHandlePointerDown?.(ev, this.element, handle, type, this);

        // Aggiungiamo listener per rilasciare la capture e fare cleanup
        const onPointerUp = (upEv) => {
          try { handle.releasePointerCapture(upEv.pointerId); } catch (e) {}
          handle.removeEventListener("pointerup", onPointerUp);
          // eventualmente altre pulizie...
        };
        handle.addEventListener("pointerup", onPointerUp);
      } else {
        // NON fermiamo la propagazione: lasciamo che la canvas (o il listener globale) gestisca la selezione / move
        // Ma avvisiamo comunque la callback se vuole fare qualcosa "non intrusivo"
        this.callbacks.onHandlePointerDown?.(ev, this.element, handle, type, this);
      }
    }, false);

    if (this.callbacks.onHandlePointerEnter) {
      handle.addEventListener("pointerenter", (ev) => {
        this.callbacks.onHandlePointerEnter(ev, this.element, handle, type, this);
      });
    }
    if (this.callbacks.onHandlePointerLeave) {
      handle.addEventListener("pointerleave", (ev) => {
        this.callbacks.onHandlePointerLeave(ev, this.element, handle, type, this);
      });
    }
  }

  #positionRectHandle(handle, x, y, size) {
    handle.setAttribute("x", x - size / 2);
    handle.setAttribute("y", y - size / 2);
    handle.setAttribute("width", size);
    handle.setAttribute("height", size);
  }

  #cursorForType(type) {
    switch (type) {
      case "nw":
      case "se": return "nwse-resize";
      case "ne":
      case "sw": return "nesw-resize";
      case "n":
      case "s":  return "ns-resize";
      case "w":
      case "e":  return "ew-resize";
      case "c":  return "move";
      default:   return "default";
    }
  }

  #setDisplay(el, value) {
    if (!el) return;
    el.style.display = value;
  }
}

class EllipseHandlers1 extends BaseHandlers {
  /*
  constructor (element, layer) {
    super(element, layer);
    this.bBox = this.createBBox(this.element.cx-this.element.rx, 
                           this.element.cy-this.element.ry, 
                           this.element.rx*2, 
                           this.element.ry*2);

  }
  */
  update() {
    const { cx, cy, rx, ry, rotation } = this.element;
    const size = handlerRectSize / canvasZoomFactor;

    const cosφ = Math.cos(rotation);
    const sinφ = Math.sin(rotation);

    // se il bBox non esiste lo creo
    this.bBox = this.bBox || this.createBBox(cx-rx, cy-ry, rx*2, ry*2);
    this.adjustPosition();

    // Se il centro non c'è lo creo. Centro
    this.handles.c = this.handles.c || this.createHandle(cx, cy, size, "c", "move");
    this.setPos(this.handles.c, cx, cy, size);

    // Estremi asse maggiore
    /*
    const major1 = { x: cx + rx*cosφ, y: cy + rx*sinφ };
    const major2 = { x: cx - rx*cosφ, y: cy - rx*sinφ };
    [major1, major2].forEach((p, i) => {
      const t = "major" + (i+1);
      this.handles[t] = this.handles[t] || this.createHandle(p.x, p.y, size, t, "ew-resize");
      this.setPos(this.handles[t], p.x, p.y, size);
    });
    */
    // disegno l'asse maggiore
    const major1 = { x: cx + rx*cosφ, y: cy + rx*sinφ };
    const major2 = { x: cx - rx*cosφ, y: cy - rx*sinφ };
    this.helperLines[0] = this.helperLines[0] || this.createHelperLine(major1.x, major1.y, major2.x, major2.y);



    // Estremi asse minore
    const minor1 = { x: cx - ry*sinφ, y: cy + ry*cosφ };
    const minor2 = { x: cx + ry*sinφ, y: cy - ry*cosφ };
    [minor1, minor2].forEach((p, i) => {
      const t = "minor" + (i+1);
      this.handles[t] = this.handles[t] || this.createHandle(p.x, p.y, size, t, "ns-resize", "#ff00ff");
      this.setPos(this.handles[t], p.x, p.y, size);
    });

    // Fuochi
    const c = Math.sqrt(Math.abs(rx*rx - ry*ry));
    const fx = c*cosφ, fy = c*sinφ;
    const foci = [
      { type: "focus1", x: cx + fx, y: cy + fy },
      { type: "focus2", x: cx - fx, y: cy - fy }
    ];
    for (let f of foci) {
      this.handles[f.type] = this.handles[f.type] || this.createHandle(f.x, f.y, size, f.type, "crosshair", "orange");
      this.setPos(this.handles[f.type], f.x, f.y, size);
    }

    // Se visibile, assicurati che siano aggiunti allo svg
    if (this.visible) this.show();
  }
}

class EllipseHandlers0 {
  constructor(element, svg) {
    this.element = element;  // riferimento all'oggetto Ellipse
    this.svg = svg;          // canvas SVG
    this.handles = {};       // collezione di handle creati
    this.visible = false;    // stato visibilità
  }

  createHandle(x, y, size, type, cursor, color="#00ffff") {
    const h = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    h.setAttribute("x", x - size/2);
    h.setAttribute("y", y - size/2);
    h.setAttribute("width", size);
    h.setAttribute("height", size);
    h.setAttribute("fill", color);
    h.setAttribute("stroke", "#000");
    h.setAttribute("stroke-width", "1");
    h.setAttribute("vector-effect", "non-scaling-stroke");
    h.style.cursor = cursor;
    h.dataset.type = type;
    return h;
  }

  update() {
    const { cx, cy, rx, ry, rotation } = this.element;
    const size = handlerRectSize / canvasZoomFactor;

    // calcola cosφ e sinφ per rotazione
    const cosφ = Math.cos(rotation);
    const sinφ = Math.sin(rotation);

    // Centro
    this.handles.c = this.handles.c || this.createHandle(cx, cy, size, "c", "move");
    this.setPos(this.handles.c, cx, cy, size);

    // Vertici bbox NON ruotata
    const bboxPoints = [
      { type: "nw", x: cx - rx, y: cy - ry },
      { type: "ne", x: cx + rx, y: cy - ry },
      { type: "sw", x: cx - rx, y: cy + ry },
      { type: "se", x: cx + rx, y: cy + ry }
    ];
    for (let p of bboxPoints) {
      if (!this.handles[p.type]) {
        this.handles[p.type] = this.createHandle(p.x, p.y, size, p.type, "pointer");
        if (this.visible) this.svg.appendChild(this.handles[p.type]);
      }
      this.setPos(this.handles[p.type], p.x, p.y, size);
    }

    // Estremi asse maggiore (rispettano rotazione)
    const major1 = { x: cx + rx*cosφ, y: cy + rx*sinφ };
    const major2 = { x: cx - rx*cosφ, y: cy - rx*sinφ };
    ["major1","major2"].forEach((t, i) => {
      const p = i===0 ? major1 : major2;
      if (!this.handles[t]) {
        this.handles[t] = this.createHandle(p.x, p.y, size, t, "crosshair");
        if (this.visible) this.svg.appendChild(this.handles[t]);
      }
      this.setPos(this.handles[t], p.x, p.y, size);
    });

    // Fuochi
    const c = Math.sqrt(Math.abs(rx*rx - ry*ry));
    const fx = c*cosφ, fy = c*sinφ;
    const focus1 = { x: cx + fx, y: cy + fy };
    const focus2 = { x: cx - fx, y: cy - fy };
    ["focus1","focus2"].forEach((t, i) => {
      const p = i===0 ? focus1 : focus2;
      if (!this.handles[t]) {
        this.handles[t] = this.createHandle(p.x, p.y, size, t, "default", "orange");
        if (this.visible) this.svg.appendChild(this.handles[t]);
      }
      this.setPos(this.handles[t], p.x, p.y, size);
    });
  }

  setPos(handle, x, y, size) {
    handle.setAttribute("x", x - size/2);
    handle.setAttribute("y", y - size/2);
    handle.setAttribute("width", size);
    handle.setAttribute("height", size);
  }

  show() {
    this.visible = true;
    Object.values(this.handles).forEach(h => {
      if (!h.parentNode) this.svg.appendChild(h);
    });
  }

  hide() {
    this.visible = false;
    Object.values(this.handles).forEach(h => {
      if (h.parentNode) this.svg.removeChild(h);
    });
  }

  destroy() {
    this.hide();
    this.handles = {};
  }
}

class EllipseHandlers extends BaseHandlers {
  constructor(ellipse, overlayLayer, callbacks) {
    super(ellipse, overlayLayer, callbacks);
    // Eventuali helper lines/handles extra creati UNA SOLA VOLTA:
    this.majorAxis = this.createHelperLine(0,0,0,0, true, "#cccc00");
    this.minorAxis = this.createHelperLine(0,0,0,0, true, "#00cccc");
    
    this.focus1 = this.createHandle(0,0,0, "f1", "crosshair", "#ffa500");
    this.focus2 = this.createHandle(0,0,0, "f2", "crosshair", "#ffa500");
  }

  update() {
    const { cx, cy, rx, ry } = this.element;
    const x = cx - rx, y = cy - ry, w = 2 * rx, h = 2 * ry;

    // aggiorna bbox e i 9 handle standard
    this.updateBBox(x, y, w, h);
    this.updateStandardHandles(x, y, w, h);

    // aggiorna helper lines
    this.majorAxis.setAttribute("x1", cx - rx); this.majorAxis.setAttribute("y1", cy);
    this.majorAxis.setAttribute("x2", cx + rx); this.majorAxis.setAttribute("y2", cy);
    this.minorAxis.setAttribute("x1", cx); this.minorAxis.setAttribute("y1", cy - ry);
    this.minorAxis.setAttribute("x2", cx); this.minorAxis.setAttribute("y2", cy + ry);

    // se hai extra handle (fuochi, ecc.), posizionali con updateHandleRect(...)
    let f1 = this.element.getFocusLoci().find(f => f.type==='focus1');
    let f2 = this.element.getFocusLoci().find(f => f.type==='focus2');
    this.updateHandleRect(this.focus1, f1.x, f1.y);
    this.updateHandleRect(this.focus2, f2.x, f2.y);
  }
}

    
// INIZIO funzioni di utility ===
function applyStrokeStyle(shape, strokeStyle = {}) {
  strokeStyle = strokeStyle ?? structuredClone(defaultStrokeStyle);
  shape.setAttribute("stroke", strokeStyle.stroke || "none");
  shape.setAttribute("stroke-width", strokeStyle.strokeWidth ?? 1);
  shape.setAttribute("stroke-opacity", strokeStyle.strokeOpacity ?? 1);
  shape.setAttribute("stroke-dasharray", strokeStyle.strokeDasharray || "none");
  shape.setAttribute("stroke-linecap", strokeStyle.strokeLinecap || "butt");
  shape.setAttribute("stroke-linejoin", strokeStyle.strokeLinejoin || "miter");
}

function applyFillStyle(shape, fillStyle = {}) {
  fillStyle = fillStyle ?? structuredClone(defaultFillStyle);
  shape.setAttribute("fill", fillStyle.fill || "none");
  shape.setAttribute("fill-opacity", fillStyle.fillOpacity ?? 1);
}

// funzione per arrotondare i valori alla precisione scelta
function roundToPrecision(value, precision) {
  // per gestire la cattiva rappresentazione dei numeri in virgola mobile... 
  let roundedNum = Math.round((value / precision) + Number.EPSILON) * precision;
  factor = 1;
  if(precision == 0.01) factor = 2;
  else if (precision == 0.001) factor = 3;
  let toFix = new Number(roundedNum.toFixed(factor));
  //console.log("newValue (toFix): ",toFix);
  return toFix;
}

// ritorna il punto {x,y}  su un'ellisse ruotata di phi radianti 
// che sottende all'algolo alpha 
function pointOnEllipse(cx, cy, rx, ry, phi, alpha) {
  //riporto i gradi in radianti
  phi *= Math.PI/180;
  alpha *= Math.PI/180;
  // la funzione calcola prima le coordinate del punto P(x,y)
  // sotteso dall'angolo alpha sull'ellisse non ruotata e centrata nell'origine. 
  // Pertanto all'angolo alpha va momentaneamente sottratto phi
  const normalization = Math.sqrt( Math.pow(rx*Math.sin(alpha-phi), 2) + Math.pow(ry*Math.cos(alpha-phi), 2))
  const x0 = rx*ry* Math.cos(alpha-phi)/normalization;
  const y0 = rx*ry* Math.sin(alpha-phi)/normalization;
  // quindi devo applicare la rotazione di phi al punto P(x, y)
  const x1 = x0*Math.cos(phi) - y0*Math.sin(phi);
  const y1 = x0*Math.sin(phi) + y0*Math.cos(phi);
  // infine traslo le coordinate tenendo conto del vero centro dell'ellisse
  const x = cx + x1;
  const y = cy + y1;
  return { x, y };
}

/**
 * Calcola il centro di un arco di ellisse SVG
 * param {number} x1 - punto iniziale (world coords)
 * @param {number} y1 - punto iniziale
 * @param {number} x2 - punto finale
 * @param {number} y2 - punto finale
 * @param {number} rx - raggio x
 * @param {number} ry - raggio y
 * @param {number} phi - rotazione dell'ellisse in radianti
 * @param {number} largeArcFlag - 0 o 1
 * @param {number} sweepFlag - 0 o 1
 * @returns {{cx: number, cy: number}} centro dell’ellisse
 */
function computeEllipseArcCenter(x1, y1, x2, y2, rx, ry, phi, largeArcFlag, sweepFlag) {
  // 1. Prepara cos e sin della rotazione
  const cosφ = Math.cos(phi);
  const sinφ = Math.sin(phi);

  // 2. Traslazione dei punti al sistema medio
  const dx = (x1 - x2) / 2;
  const dy = (y1 - y2) / 2;

  // Coordinate primed (ruotate)
  const x1p = cosφ * dx + sinφ * dy;
  const y1p = -sinφ * dx + cosφ * dy;

  // 3. Controllo dei raggi (devono essere abbastanza grandi)
  let rxSq = rx * rx;
  let rySq = ry * ry;
  let x1pSq = x1p * x1p;
  let y1pSq = y1p * y1p;

  // Scala raggi se troppo piccoli
  let λ = (x1pSq / rxSq) + (y1pSq / rySq);
  if (λ > 1) {
    const scale = Math.sqrt(λ);
    rx *= scale;
    ry *= scale;
    rxSq = rx * rx;
    rySq = ry * ry;
  }

  // 4. Calcola il fattore comune
  let sign = (largeArcFlag === sweepFlag) ? -1 : 1;
  let num = rxSq * rySq - rxSq * y1pSq - rySq * x1pSq;
  let den = rxSq * y1pSq + rySq * x1pSq;
  let factor = Math.sqrt(Math.max(0, num / den)) * sign;

  // Coordinate del centro nel sistema ruotato
  const cxp = factor * (rx * y1p) / ry;
  const cyp = factor * (-ry * x1p) / rx;

  // 5. Riporta al sistema originale
  const cx = cosφ * cxp - sinφ * cyp + (x1 + x2) / 2;
  const cy = sinφ * cxp + cosφ * cyp + (y1 + y2) / 2;

  return { cx, cy };
}

// adapter.js
function defaultHandleAdapter(ev, element, handleEl, type, handlers) {
  ev.stopPropagation();
  ev.preventDefault();

  switch (type) {
    case "c": // handle centrale → move
      startMoveElement(element, ev, handlers);
      break;

    case "nw": case "n": case "ne":
    case "w":              case "e":
    case "sw": case "s": case "se":
      //startResizeElement(ev, element, type, handlers);
      break;

    // se decidi di avere handle per rotazione:
    case "rotate":
      startRotateElement(element, ev, handlers);
      break;

    default:
      console.warn("Handle type non gestito:", type);
  }
}
// FINE funzioni di utility