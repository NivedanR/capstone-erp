import mongoose, { Schema, Document } from 'mongoose';

export interface BranchStock extends Document {
  branchId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

const branchStockSchema: Schema = new Schema(
  {
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<BranchStock>('BranchStock', branchStockSchema);
