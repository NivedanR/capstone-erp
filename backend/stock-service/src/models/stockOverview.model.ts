import mongoose, { Schema, Document } from 'mongoose';

export interface StockOverview extends Document {
  productId: mongoose.Types.ObjectId;
  warehouseId?: mongoose.Types.ObjectId | null;
  branchId?: mongoose.Types.ObjectId | null;
  quantity: number;
  reservedQuantity: number;
  lastUpdated: Date;
}

const stockOverviewSchema: Schema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', default: null },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', default: null },
    quantity: { type: Number, required: true },
    reservedQuantity: { type: Number, required: true, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

export default mongoose.model<StockOverview>('StockOverview', stockOverviewSchema);
