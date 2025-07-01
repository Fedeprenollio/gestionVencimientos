
// // models/Product.js
// import mongoose from 'mongoose';

// const productSchema = new mongoose.Schema({
//   barcode: { type: String, required: true, unique: true },
//   name: { type: String, required: true },
//   type: { type: String, enum: ['medicamento', 'perfumeria'] },
// });

// export default mongoose.model('Product', productSchema);


// models/Product.js
import mongoose from 'mongoose';

// const priceHistorySchema = new mongoose.Schema({
//   price: { type: Number, required: true },
//   date: { type: Date, default: Date.now },
//   operator: { type: String }, // optional: who updated it
// });

const productSchema = new mongoose.Schema({
  barcode: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['medicamento', 'perfumeria'] },
  currentPrice: { type: Number, default: 0 },
  // priceHistory: [priceHistorySchema],
});

export default mongoose.model('Product', productSchema);
