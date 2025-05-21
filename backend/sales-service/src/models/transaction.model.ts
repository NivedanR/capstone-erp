import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  orderId: string;
  customerId: string;
  branchId: string;
  products: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema = new Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    customerId: {
      type: String,
      required: true,
    },
    branchId: {
      type: String,
      required: true,
    },
    products: [{
      productId: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      price: {
        type: Number,
        required: true,
        min: 0,
      },
    }],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['cash', 'credit_card', 'debit_card', 'online'],
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'completed', 'cancelled', 'refunded'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
TransactionSchema.index({ orderId: 1 });
TransactionSchema.index({ customerId: 1 });
TransactionSchema.index({ branchId: 1 });
TransactionSchema.index({ status: 1 });
TransactionSchema.index({ createdAt: 1 });

export default mongoose.model<ITransaction>('Transaction', TransactionSchema); 