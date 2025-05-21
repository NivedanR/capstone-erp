import mongoose, { Schema, Document } from 'mongoose';

export interface Warehouse extends Document {
  name: string;
  location: string;
  managerId: mongoose.Types.ObjectId;
  products: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const warehouseSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    managerId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
  },
  { timestamps: true }
);

export default mongoose.model<Warehouse>('Warehouse', warehouseSchema);
