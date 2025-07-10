import JsBarcode from "jsbarcode";


export const generateBarcodeImage = (text) => {
  const canvas = document.createElement("canvas");
  JsBarcode(canvas, text, {
    // format: "EAN13",
    displayValue: false,
    height: 20,
  });
  return canvas.toDataURL("image/png");
};
