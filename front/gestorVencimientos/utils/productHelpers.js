// utils/productHelpers.js

export const getEAN = (product) => {
  const codes = Array.isArray(product?.alternateBarcodes)
    ? product.alternateBarcodes
        .map((code) => String(code).trim())
        .filter((code) => code && code !== "0")
    : [];

  if (codes.length === 0) return "";

  // En nuestro sistema, el EAN es el código más largo
  return codes.reduce((longest, code) =>
    code.length > longest.length ? code : longest
  );
};