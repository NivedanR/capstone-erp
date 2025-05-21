// src/controllers/sales.controller.ts
import { RequestHandler } from 'express';
import * as salesService from '../services/sales.service';
import OrderModel, { Order } from '../models/order.model';

export const createOrder: RequestHandler = async (req, res, next) => {
  try {
    const { order, invoicePath } = await salesService.createOrder(req.body);
    res.status(201).json({ message: 'Order created', data: order, invoicePath });
    return; // <— explicitly end the function with no value
  } catch (error: any) {
    console.error('Create order error:', error);
    next(error);
  }
};

export const getAllOrders: RequestHandler = async (_req, res, next) => {
  try {
    const orders = await salesService.getAllOrders();
    res.json({ data: orders });
    return;
  } catch (error: any) {
    console.error('Get all orders error:', error);
    next(error);
  }
};

export const getOrderById: RequestHandler = async (req, res, next) => {
  try {
    const order = await salesService.getOrderById(req.params.id);
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;  // <— drop the returned Response
    }
    res.json({ data: order });
    return;
  } catch (error: any) {
    console.error('Get order by id error:', error);
    next(error);
  }
};

export const updateOrder: RequestHandler = async (req, res, next) => {
  try {
    const order = await salesService.updateOrder(req.params.id, req.body);
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }
    res.json({ message: 'Order updated', data: order });
    return;
  } catch (error: any) {
    console.error('Update order error:', error);
    next(error);
  }
};

export const deleteOrder: RequestHandler = async (req, res, next) => {
  try {
    const order = await salesService.deleteOrder(req.params.id);
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }
    res.json({ message: 'Order deleted' });
    return;
  } catch (error: any) {
    console.error('Delete order error:', error);
    next(error);
  }
};

export const getSalesAnalytics: RequestHandler = async (req, res, next) => {
  try {
    const { timeRange } = req.query;
    const analytics = await salesService.getSalesAnalytics(timeRange as string);
    res.json({ 
      message: 'Sales analytics fetched successfully',
      data: analytics 
    });
    return;
  } catch (error: any) {
    console.error('Get sales analytics error:', error);
    next(error);
  }
};

export const getSalesData: RequestHandler = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query: any = {};
    if (startDate) {
      query.createdAt = { $gte: new Date(startDate as string) };
    }
    if (endDate) {
      query.createdAt = { ...query.createdAt, $lte: new Date(endDate as string) };
    }

    const orders = await OrderModel.find(query)
      .sort({ createdAt: 1 })
      .populate('items.product');

    // Group orders by date and calculate daily totals
    const dailySales = orders.reduce((acc: any[], order: Order) => {
      const date = order.createdAt.toISOString().split('T')[0];
      const existingDay = acc.find(day => day.date === date);
      
      if (existingDay) {
        existingDay.amount += order.totalAmount || 0;
      } else {
        acc.push({
          date,
          amount: order.totalAmount || 0
        });
      }
      
      return acc;
    }, []);

    res.json(dailySales);
  } catch (error: any) {
    console.error('Get sales data error:', error);
    next(error);
  }
};
