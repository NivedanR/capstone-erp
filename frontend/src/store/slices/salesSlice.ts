import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Order {
  id: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface SalesState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  stats: {
    totalSales: number;
    totalOrders: number;
    averageOrderValue: number;
    salesByCategory: Record<string, number>;
    salesByDate: Record<string, number>;
  };
}

const initialState: SalesState = {
  orders: [],
  loading: false,
  error: null,
  stats: {
    totalSales: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    salesByCategory: {},
    salesByDate: {},
  },
};

const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    fetchOrdersStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchOrdersSuccess: (state, action: PayloadAction<Order[]>) => {
      state.loading = false;
      state.orders = action.payload;
    },
    fetchOrdersFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateOrderStatus: (state, action: PayloadAction<{ id: string; status: Order['status'] }>) => {
      const order = state.orders.find(o => o.id === action.payload.id);
      if (order) {
        order.status = action.payload.status;
        order.updatedAt = new Date().toISOString();
      }
    },
    updateSalesStats: (state, action: PayloadAction<SalesState['stats']>) => {
      state.stats = action.payload;
    },
  },
});

export const {
  fetchOrdersStart,
  fetchOrdersSuccess,
  fetchOrdersFailure,
  updateOrderStatus,
  updateSalesStats,
} = salesSlice.actions;

export default salesSlice.reducer; 