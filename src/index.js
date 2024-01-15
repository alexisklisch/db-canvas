const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const tables = [];
const hoveredTables = [];

function drawTable(x, y, tableName, columns) {
  ctx.strokeStyle = '#242424';
  ctx.fillStyle = '#1F2937';
  ctx.fillRect(x, y, 200, 30 + (columns.length) * 30);
  ctx.strokeRect(x, y, 200, 30 + (columns.length) * 30);

  ctx.fillStyle = 'whitesmoke';
  ctx.font = '16px "Segoe UI", Tahoma, Geneva, Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'ideographic';
  ctx.fillText(tableName, x + 100, y + 25);
  ctx.textAlign = 'left';

  columns.forEach((column, index) => {
    const columnY = y + 30 + index * 30;
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = index % 2 === 0 ? '#374151' : '#1F2937';
    ctx.font = 'normal 14px "Segoe UI", Tahoma, Geneva, Verdana, sans-serif';
    ctx.fillRect(x, columnY, 200, 30);
    ctx.fillStyle = '#D1D5DB';
    ctx.fillText(column.name, x + 10, columnY + 20);

    ctx.textAlign = 'right';
    ctx.fillText(column.type, x + 190, columnY + 20);
    ctx.textAlign = 'left';
  });
}

function handleMouseDown(event) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  hoveredTables.forEach((table) => (table.isDragging = false)); // Detener cualquier arrastre existente

  for (let i = tables.length - 1; i >= 0; i--) {
    const table = tables[i];
    if (
      mouseX >= table.x &&
      mouseX <= table.x + 200 &&
      mouseY >= table.y &&
      mouseY <= table.y + 30
    ) {
      table.isDragging = true;
      table.offset = { x: mouseX - table.x, y: mouseY - table.y };
      canvas.style.cursor = 'grabbing';
      break;
    }
  }
}

function handleMouseMove(event) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  hoveredTables.length = 0; // Limpiar el arreglo de tablas bajo el puntero

  for (const table of tables) {
    const isHovered =
      mouseX >= table.x &&
      mouseX <= table.x + 200 &&
      mouseY >= table.y &&
      mouseY <= table.y + 30;

    if (isHovered) {
      hoveredTables.push(table);
    }

    if (table.isDragging) {
      table.x = mouseX - table.offset.x;
      table.y = mouseY - table.offset.y;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const t of tables) {
        drawTable(t.x, t.y, t.name, t.columns);
      }
      break;
    }
  }

  canvas.style.cursor = hoveredTables.length > 0 ? 'grab' : 'auto'; // Cambiar cursor según si hay tablas bajo el puntero
}

function handleMouseUp() {
  for (const table of tables) {
    table.isDragging = false;
  }
  canvas.style.cursor = 'auto';
}

canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('mouseup', handleMouseUp);
canvas.addEventListener('mouseleave', handleMouseUp);

export function createTable(x, y, tableName, columns) {
  const newTable = { x, y, name: tableName, columns, isDragging: false, offset: { x: 0, y: 0 } };
  tables.push(newTable);
  drawTable(x, y, tableName, columns);
}