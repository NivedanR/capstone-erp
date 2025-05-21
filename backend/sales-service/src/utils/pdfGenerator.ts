import PDFDocument from 'pdfkit';
import { Order } from '../models/order.model';
import fs from 'fs';
import path from 'path';

export const generateInvoicePDF = (order: Order, outputPath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // 1) Ensure parent directory exists
    const parentDir = path.dirname(outputPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    // 2) Create PDF and write stream
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // 3) Build the invoice content
    doc.fontSize(20).text(`Invoice: ${order.orderNumber}`, { align: 'center' });
    doc.moveDown();
    doc.text(`Customer: ${order.customerName}`);
    doc.text(`Phone: ${order.customerPhone}`);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`);
    doc.moveDown();

    doc.fontSize(16).text('Products:');
    order.products.forEach((p, index) => {
      doc.text(
        `${index + 1}. ProductID: ${p.productId} | Qty: ${p.quantity} | Price: ${p.priceAtSale} | Discount: ${p.discount} | Total: ${p.total}`
      );
    });

    doc.moveDown();
    doc.fontSize(16).text(`Total Amount: ${order.totalAmount}`);
    doc.text(`Payment Mode: ${order.paymentMode}`);
    doc.text(`Payment Status: ${order.paymentStatus}`);

    // 4) Finalize
    doc.end();

    // 5) Resolve/reject on stream events
    stream.on('finish', () => resolve());
    stream.on('error', (err) => reject(err));
  });
};
