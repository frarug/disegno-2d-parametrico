let currentUnit = 'mm';
let scaleFactor = 1; // 1 SVG unit = 1mm by default

const unitSelect = document.getElementById('unitSelect');
const widthInput = document.getElementById('width');
const heightInput = document.getElementById('height');
const applyBtn = document.getElementById('applySettings');
const canvas = document.getElementById('drawing-canvas');

unitSelect.addEventListener('change', () => {
  currentUnit = unitSelect.value;
  updateScale();
});

applyBtn.addEventListener('click', () => {
  const width = parseFloat(widthInput.value);
  const height = parseFloat(heightInput.value);
  updateCanvasSize(width, height);
});

function updateScale() {
  switch (currentUnit) {
    case 'mm':
      scaleFactor = 1;
      break;
    case 'cm':
      scaleFactor = 1/10;
      break;
    case 'in':
      scaleFactor = 1/25.4;
      break;
  }
}

function updateCanvasSize(width, height) {
  canvas.setAttribute('width', width * scaleFactor);
  canvas.setAttribute('height', height * scaleFactor);
  canvas.setAttribute('viewBox', `0 0 ${width * scaleFactor} ${height * scaleFactor}`);
}

// inizializzazione iniziale
updateScale();
updateCanvasSize(parseFloat(widthInput.value), parseFloat(heightInput.value));