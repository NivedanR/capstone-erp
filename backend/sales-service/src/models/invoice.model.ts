// You can skip if invoices are just PDFs generated on the fly.
// Or use this to store invoice paths or metadata.

import mongoose, { Schema, Document } from 'mongoose';

export interface Invoice extends Document {
  orderId: mongoose.Types.ObjectId;
  invoiceNumber: string;
  filePath: string;
  generatedAt: Date;
}

const invoiceSchema: Schema = new Schema({
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  invoiceNumber: { type: String, required: true },
  filePath: { type: String, required: true },
  generatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<Invoice>('Invoice', invoiceSchema);
