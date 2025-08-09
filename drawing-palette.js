// --- VARIABILI GLOBALI PALETTE DISEGNO ---
let selectedShapeType = "line";
let drawFromLastPoint = false;

// --- TRASCINAMENTO DELLA PALETTE ---
{
const palette = document.getElementById("drawing-palette");
let isDragging = false;
let offsetX, offsetY;

palette.addEventListener("mousedown", (e) => {
  if (e.target.closest(".paletteH-header")) {
    isDragging = true;
    offsetX = e.clientX - palette.offsetLeft;
    offsetY = e.clientY - palette.offsetTop;
    palette.style.cursor = "grabbing";
  }
});

document.addEventListener("mousemove", (e) => {
  if (isDragging) {
    palette.style.left = e.clientX - offsetX + "px";
    palette.style.top = e.clientY - offsetY + "px";
  }
});

document.addEventListener("mouseup", () => {
  isDragging = false;
  palette.style.cursor = "default";
});
}
// --- FINE TRASCINAMENTO DELLA PALETTE ---

// --- SELEZIONE FORMA ---
const shapeSelect = document.getElementById("shape-select");
const shapeParamsContainer = document.getElementById("shape-params");

// --- SELETTORE: FORMA DA AGGIUNGERE ---
shapeSelect.addEventListener("change", (e) => {
  selectedShapeType = e.target.value;
  updateShapeParams(selectedShapeType);
});

// --- PULSANTE: AGGIUNGI FORMA ---
document.getElementById("add-shape-btn").addEventListener("click", function () {
    const selectedType = document.getElementById("shape-select").value;
    addShapeToCanvas(selectedType);
});

// --- CHECKBOX: DISEGNA DA ULTIMO PUNTO ---
document.getElementById("draw-from-last-point").addEventListener("change", (e) => {
    //console.log(e);
    drawFromLastPoint = e.target.checked;
});

// --- PULSANTE: CENTRA ORIGINE ---
document.getElementById("center-origin-btn").addEventListener("click", () => {
    //console.log("centra origine")
    canvasOffsetX = 0;
    canvasOffsetY = 0;
    renderCanvas();
});


// --- SCORCIATOIE DA TASTIERA ---
document.addEventListener("keydown", (e) => {
    // Ignora scorciatoie se il focus è su un input, textarea o select
  const tag = document.activeElement.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return;

  const map = { l: "line", c: "circle", a: "arc", r: "rect", e: "ellipse" };
  if (map[e.key]) {
    selectedShapeType = map[e.key];
    shapeSelect.value = selectedShapeType;
    updateShapeParams(selectedShapeType);
  }
});


// --- AGGIUNGI FORMA ---


// --- AGGIORNAMENTO PARAMETRI ---
function updateShapeParamsOld(shape) {
  shapeParamsContainer.innerHTML = "";

  const addInput = (label, id, value = "") => {
    const group = document.createElement("div");
    group.className = "input-group";
    group.innerHTML = `<label for="${id}">${label}</label><input type="number" id="${id}" value="${value}" />`;
    shapeParamsContainer.appendChild(group);
  };

  switch (shape) {
    case "line":
      addInput("x1", "line-x1");
      addInput("y1", "line-y1");
      addInput("x2", "line-x2");
      addInput("y2", "line-y2");
      break;
    case "circle":
      addInput("cx", "circle-cx");
      addInput("cy", "circle-cy");
      addInput("r", "circle-r");
      break;
    case "arc":
      addInput("cx", "arc-cx");
      addInput("cy", "arc-cy");
      addInput("r", "arc-r");
      addInput("startAngle", "arc-start");
      addInput("endAngle", "arc-end");
      break;
    case "rect":
      addInput("x", "rect-x");
      addInput("y", "rect-y");
      addInput("L", "rect-w");
      addInput("H", "rect-h");
      break;
    case "ellipse":
      addInput("cx", "ellipse-cx");
      addInput("cy", "ellipse-cy");
      addInput("rx", "ellipse-rx");
      addInput("ry", "ellipse-ry");
      break;
  }
}

function updateShapeParams(elementType) {
    const paramsContainer = document.getElementById("shape-params");
    paramsContainer.innerHTML = ""; // Pulisce i vecchi parametri
  
    let params = [];
  
    switch (elementType) {
      case "rect":
        params = [
          { label: "X", name: "x", type: "number", step: "1", value: 0 },
          { label: "Y", name: "y", type: "number", step: "1", value: 0 },
          { label: "Larghezza", name: "width", type: "number", step: "1", value: 10 },
          { label: "Altezza", name: "height", type: "number", step: "1", value: 10 },
          { label: "Colore Riempimento", name: "fill", type: "text", value: defaultFillStyle.fill },
          { label: "Colore Bordo", name: "stroke", type: "text", value: defaultStrokeStyle.stroke },
          { label: "Spessore Bordo", name: "strokeWidth", type: "number", step: "0.1", value: 1 }
        ];
        break;
      case "line":
            params = [
              { label: "X1", name: "x1", type: "number", step: "1", value: 0 },
              { label: "Y1", name: "y1", type: "number", step: "1", value: 0 },
              { label: "X2", name: "x2", type: "number", step: "1", value: 10 },
              { label: "Y2", name: "y2", type: "number", step: "1", value: 10 },
              { label: "Colore Linea", name: "stroke", type: "text", value: defaultStrokeStyle.stroke },
              { label: "Spessore Linea", name: "strokeWidth", type: "number", step: "0.1", value: 1 }
            ];
            break;
      // altri tipi: "line", "circle", ecc.
  
      default:
        return;
    }
  
    // Genera gli input dinamicamente
    for (const param of params) {
      const wrapper = document.createElement("div");
  
      const label = document.createElement("label");
      label.textContent = param.label;
      label.setAttribute("for", param.name);
  
      const input = document.createElement("input");
      input.type = param.type;
      input.name = param.name;
      input.value = param.value;
      input.id = param.name;
      if (param.step) input.step = param.step;
  
      wrapper.appendChild(label);
      wrapper.appendChild(input);
      paramsContainer.appendChild(wrapper);
    }
  }

// --- INIZIALIZZA ---
updateShapeParams(selectedShapeType);