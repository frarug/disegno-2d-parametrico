const SVG_NS = "http://www.w3.org/2000/svg";

function createCheckIcon(width, height) {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("width", width);
  svg.setAttribute("height", height);
  svg.setAttribute("viewBox", "0 0 24 24");

  const path = document.createElementNS(SVG_NS, "path");
  path.setAttribute("d", "M20 6L9 17l-5-5");
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", "green");
  path.setAttribute("stroke-width", "3");

  svg.appendChild(path);
  return svg;
}

function createCrossIcon(width, height) {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("width", width);
  svg.setAttribute("height", height);
  svg.setAttribute("viewBox", "0 0 24 24");

  const path = document.createElementNS(SVG_NS, "path");
  path.setAttribute("d", "M6 6l12 12M6 18L18 6");
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", "red");
  path.setAttribute("stroke-width", "3");

  svg.appendChild(path);
  return svg;
}

function createDragIcon(width, height, color = "white") {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("class", "drag-icon");
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);
    svg.setAttribute("viewBox", "0 0 20 20");
    svg.setAttribute("xmlns", SVG_NS);
  
    const rect1 = document.createElementNS(SVG_NS, "rect");
    rect1.setAttribute("y", "4");
    rect1.setAttribute("width", "20");
    rect1.setAttribute("height", "2");
    rect1.setAttribute("fill", color);
  
    const rect2 = document.createElementNS(SVG_NS, "rect");
    rect2.setAttribute("y", "9");
    rect2.setAttribute("width", "20");
    rect2.setAttribute("height", "2");
    rect2.setAttribute("fill", color);
  
    const rect3 = document.createElementNS(SVG_NS, "rect");
    rect3.setAttribute("y", "14");
    rect3.setAttribute("width", "20");
    rect3.setAttribute("height", "2");
    rect3.setAttribute("fill", color);
  
    svg.appendChild(rect1);
    svg.appendChild(rect2);
    svg.appendChild(rect3);
  
    return svg;
  }