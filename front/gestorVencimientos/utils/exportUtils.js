import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc)
export const formatDate = (isoString) => {
  return dayjs.utc(isoString).format('MM/YYYY');
};
export const formatDateWhitDay = (isoString) => {
    return dayjs.utc(isoString).format('DD/MM/YYYY');
  };


  
export function exportToExcel(products) {
    console.log("products to excel",products)
  const rows = [];

  products.forEach((prod) => {
    prod.lots.forEach((lot) => {
      rows.push({
        Codigo: prod.barcode,
        Producto: prod.name,
        Tipo: prod.type,
        Sucursal: lot.branch,
        Cantidad: lot.quantity,
        Vencimiento: formatDate(lot.expirationDate),
        Carga: formatDateWhitDay(lot.createdAt),
        SobreStock: lot.overstock ? "Sí" : "No", // ✅ nueva columna
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


  // export function exportToExcelLots(lots) {
  //   console.log("Lote a exportar,", lots)
  //   const rows = lots.map((lot) => ({
  //     Codigo: lot.barcode,  
  //     Producto: lot.name,
  //     Tipo: lot.type || "-", // por si no viene en esta estructura
  //     Sucursal: lot.branch,
  //     Cantidad: lot.quantity,
  //     Vencimiento: formatDate(lot.expirationDate),
  //     Carga: formatDateWhitDay(lot.createdAt || new Date()), // usá fecha actual si no hay
  //   }));
  
  //   const worksheet = XLSX.utils.json_to_sheet(rows);
  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, "Productos");
  
  //   const excelBuffer = XLSX.write(workbook, {
  //     bookType: "xlsx",
  //     type: "array",
  //   });
  
  //   const blob = new Blob([excelBuffer], {
  //     type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  //   });
  
  //   saveAs(blob, "productos_por_vencer.xlsx");
  // }

export function exportToExcelLots(lots) {
  console.log("Lote a exportar,", lots);

  const rows = lots.map((lot) => ({
    Codigo: lot.product?.barcode || lot.barcode || "-",
    Producto: lot.product?.name || lot.name || "-",
    Tipo: lot.product?.type || lot.type || "-",
    Sucursal: lot.branch,
    Cantidad: lot.quantity,
    Vencimiento: formatDate(lot.expirationDate),
    Carga: formatDateWhitDay(lot.createdAt || new Date()),
    SobreStock: lot.overstock ? "Sí" : "No",
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Productos");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, "productos_por_vencer.xlsx");
}
