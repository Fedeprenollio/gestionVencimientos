import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import dayjs from 'dayjs';
export const formatDate = (isoString) => {
  return dayjs(isoString).format('MM/YYYY');
};
export const formatDateWhitDay = (isoString) => {
    return dayjs(isoString).format('DD/MM/YYYY');
  };
export function exportToExcel(products) {
  const rows = [];

  products.forEach((prod) => {
    prod.lots.forEach((lot) => {
      rows.push({
        Producto: prod.name,
        Tipo: prod.type,
        Sucursal: lot.branch,
        Cantidad: lot.quantity,
        Vencimiento: formatDate(lot.expirationDate),
        Carga: formatDate(lot.createdAt)
      });
    });
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Productos');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  saveAs(blob, 'productos_por_vencer.xlsx');
}

export const exportToPDF = (products, sortBy = "expiration") => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Productos por vencer", 14, 15);
  
    let rows = [];
  
    products.forEach((prod) => {
      prod.lots.forEach((lot) => {
        rows.push([
          prod.name,
          prod.type,
          lot.branch,
          lot.quantity,
          formatDate(lot.expirationDate),
          lot.expirationDate, // campo oculto para ordenar
        ]);
      });
    });
  
    // Ordenar
    switch (sortBy) {
      case "name":
        rows.sort((a, b) => a[0].localeCompare(b[0]));
        break;
      case "quantity":
        rows.sort((a, b) => a[3] - b[3]);
        break;
      case "expiration":
      default:
        rows.sort((a, b) => new Date(a[5]) - new Date(b[5]));
        break;
    }
  
    // Eliminar el campo oculto (ISO)
    rows = rows.map(([name, type, branch, qty, friendlyDate]) => [
      name,
      type,
      branch,
      qty,
      friendlyDate,
    ]);
  
    autoTable(doc, {
      startY: 20,
      head: [["Producto", "Tipo", "Sucursal", "Cantidad", "Vencimiento"]],
      body: rows,
    });
  
    doc.save("productos_vencimiento.pdf");
  };


 