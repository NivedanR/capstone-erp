// src/models/StockRequest.model.ts
import mongoose from 'mongoose';

const stockRequestSchema = new mongoose.Schema({
  warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  branchId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Branch',   required: true },
  productId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Product',  required: true },
  quantity:    { type: Number, required: true },
  status:      { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
}, { timestamps: true });

export default mongoose.model('StockRequest', stockRequestSchema);
