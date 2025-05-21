import mongoose, { Schema, Document } from 'mongoose';

export interface ProductItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
  discount: number;
  total: number;
}

export interface Order extends Document {
  orderNumber: string;
  branchId: mongoose.Types.ObjectId;
  salesPersonId: mongoose.Types.ObjectId;
  customerName: string;
  customerPhone: string;
  items: ProductItem[];
  totalAmount: number;
  paymentMode: 'Cash' | 'Card' | 'UPI' | 'Wallet';
  paymentStatus: 'Paid' | 'Pending';
  createdAt: Date;
}

const productItemSchema: Schema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true }
});

const orderSchema: Schema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    salesPersonId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    items: [productItemSchema],
    totalAmount: { type: Number, required: true },
    paymentMode: { type: String, enum: ['Cash', 'Card', 'UPI', 'Wallet'], required: true },
    paymentStatus: { type: String, enum: ['Paid', 'Pending'], required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: false }
);

export default mongoose.model<Order>('Order', orderSchema);
