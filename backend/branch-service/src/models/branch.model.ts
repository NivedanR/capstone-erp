import mongoose, { Schema, Document } from 'mongoose';

export interface Branch extends Document {
  name: string;
  location: string;
  warehouseId: mongoose.Types.ObjectId;
  managerId: mongoose.Types.ObjectId;
  products: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const branchSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    managerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  },
  { timestamps: true }
);

export default mongoose.model<Branch>('Branch', branchSchema);
