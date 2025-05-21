import OrderModel from '../models/order.model';
import { generateInvoicePDF } from '../utils/pdfGenerator';
import path from 'path';
import { Order } from '../models/order.model';

export const createOrder = async (orderData: any) => {
  const order = new OrderModel(orderData);
  await order.save();

  // Generate Invoice PDF
  const invoicePath = path.join(__dirname, `../../invoices/invoice-${order.orderNumber}.pdf`);
  await generateInvoicePDF(order, invoicePath);

  return { order, invoicePath };
};

export const getAllOrders = async () => {
  return await OrderModel.find();//.populate('branchId salesPersonId');
};

export const getOrderById = async (id: string) => {
  return await OrderModel.findById(id);//.populate('branchId salesPersonId');
};

export const updateOrder = async (id: string, data: any) => {
  return await OrderModel.findByIdAndUpdate(id, data, { new: true });
};

export const deleteOrder = async (id: string) => {
  return await OrderModel.findByIdAndDelete(id);
};

export const getSalesAnalytics = async (timeRange: string) => {
  try {
    const now = new Date();
    let startDate: Date;

    // Calculate start date based on timeRange
    switch (timeRange) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setDate(now.getDate() - 30));
        break;
      case 'year':
        startDate = new Date(now.setDate(now.getDate() - 365));
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 7)); // Default to week
    }

    // Get orders within the time range
    const orders = await OrderModel.find({
      createdAt: { $gte: startDate }
    }).populate('items.product');

    if (!orders || orders.length === 0) {
      return {
        summary: {
          totalSales: 0,
          totalOrders: 0,
          averageOrderValue: 0
        },
        productWiseSales: []
      };
    }

    // Calculate analytics
    const totalSales = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Calculate product-wise sales
    const productSales = orders.reduce((acc, order) => {
      if (!order.items || !Array.isArray(order.items)) return acc;
      
      order.items.forEach(item => {
        if (!item.product || !item.product._id) return;
        
        const productId = item.product._id.toString();
        if (!acc[productId]) {
          acc[productId] = {
            productId,
            productName: item.product.name || 'Unknown Product',
            totalQuantity: 0,
            totalRevenue: 0
          };
        }
        acc[productId].totalQuantity += item.quantity || 0;
        acc[productId].totalRevenue += (item.price || 0) * (item.quantity || 0);
      });
      return acc;
    }, {});

    return {
      summary: {
        totalSales,
        totalOrders,
        averageOrderValue
      },
      productWiseSales: Object.values(productSales)
    };
  } catch (error) {
    console.error('Error in getSalesAnalytics:', error);
    throw new Error(`Failed to fetch sales analytics: ${error.message}`);
  }
};
