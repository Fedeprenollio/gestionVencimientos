export const isVenta = (op) =>
    op?.toLowerCase().includes("facturacion") ||
    op?.toLowerCase().includes("dispensacion al paciente");

 export const isCompraValida = (op, cantidad) => {
    const opNorm = (op || "").toLowerCase();

    const excluyeFrases = [
      "devolución fc",
      "devolucion por vencimiento a drogueria",
      "pedidos envio",
      "envio a sucursal",
      "baja",
      "vencido",
      "anulacion",
      "edicion",
    ];

    const contienePalabraClave =
      opNorm.includes("importación") ||
      opNorm.includes("recepcion de envio") ||
      opNorm.includes("recepción de envio") ||
      opNorm.includes("recepción desde eslabon anterior")||
      opNorm.includes("recepcion desde eslabon anterior") 

    const excluido = excluyeFrases.some((frase) => opNorm.includes(frase));

    return contienePalabraClave && !excluido && Number(cantidad) > 0;
  };