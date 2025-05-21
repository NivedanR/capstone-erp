import mongoose, { Schema, Document } from 'mongoose';

export interface ReplenishRequest extends Document {
  warehouseId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  quantity: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const replenishRequestSchema = new Schema(
  {
    warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    companyId:   { type: Schema.Types.ObjectId, ref: 'Company',   required: true },
    productId:   { type: Schema.Types.ObjectId, ref: 'Product',   required: true },
    quantity:    { type: Number, required: true },
    status:      { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
  },
  { timestamps: true }
);

export default mongoose.model<ReplenishRequest>(
  'ReplenishRequest',
  replenishRequestSchema
);
