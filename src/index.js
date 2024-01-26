const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const tables = [];
const hoveredTables = [];

function drawTable(x, y, tableName, columns, config = {
  theme: {
    color: {
      border: '#E6E6E6',
      title: '#8E3F86',
      titleBg: '#EDB7E7',
      colEven: '#F3F3F3',
      colOdd: '#F3F3F3',
      colName: '#585858',
      colType: '#808080',
    }
  }
}) {
  const { theme: { color }} =  config

  ctx.shadowColor = "#EEEAEA"
  ctx.shadowBlur = 12
  ctx.strokeStyle = color.border;
  ctx.fillStyle = color.titleBg

  // Redondear bordes
  ctx.beginPath();
  ctx.moveTo(x + 10, y);
  // Redondear 6px izquierda superior
  ctx.arcTo(x, y, x, y + 10, 6);
  ctx.lineTo(x, y + 30 + (columns.length) * 30);
  ctx.arcTo(x, y + 30 + (columns.length) * 30, x + 10, y + 30 + (columns.length) * 30, 10);
  ctx.lineTo(x + 190, y + 30 + (columns.length) * 30 );
  ctx.arcTo(x + 200, y + 30 + (columns.length) * 30 + 10, x + 200, y + 30 + (columns.length) * 30, 10);
  ctx.lineTo(x + 200, y + 10);
  // Redondear 6px derecha superior
  ctx.arcTo(x + 200, y, x + 190, y, 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = color.title;
  ctx.font = 'bold 16px Arial, Tahoma, Geneva, Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'ideographic';
  ctx.fillText(tableName, x + 100, y + 25);
  ctx.textAlign = 'left';

  columns.forEach((column, index) => {
    const columnY = y + 30 + index * 30;
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = index % 2 === 0 ? color.colOdd : color.colEven;
    ctx.font = 'normal 14px Arial, Tahoma, Geneva, Verdana, sans-serif';
    ctx.fillRect(x, columnY, 200, 30);
    ctx.fillStyle = color.colName;
    ctx.fillText(column.name, x + 10, columnY + 20);

    ctx.textAlign = 'right';
    ctx.fillStyle = color.colType;
    ctx.fillText(column.type, x + 190, columnY + 20);
    ctx.textAlign = 'left';

    // Agregar flecha si hay una referencia
    if (column.ref) {
      const refTable = tables.find((table) => table.columns.some((col) => col.id === column.ref));
      if (refTable) {
        const refColumn = refTable.columns.find((col) => col.id === column.ref);
        drawArrow(
          x + 200, // x del extremo derecho de la columna actual
          columnY + 15, // y del centro de la columna actual
          refTable.x, // x del extremo izquierdo de la columna referenciada
          refTable.y + 15 // y del centro de la columna referenciada
        );
      }
    }
  });
}

function drawArrow(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = 'darkgrey';
  ctx.lineWidth = 2;

  const angle = Math.atan2(y2 - y1, x2 - x1);
  const arrowSize = 10;
  ctx.lineTo(x2 - arrowSize * Math.cos(angle - Math.PI / 6), y2 - arrowSize * Math.sin(angle - Math.PI / 6));
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - arrowSize * Math.cos(angle + Math.PI / 6), y2 - arrowSize * Math.sin(angle + Math.PI / 6));

  ctx.stroke();
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
