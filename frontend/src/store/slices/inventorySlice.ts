import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  location: string;
  minStock: number;
  maxStock: number;
  lastUpdated: string;
}

interface StockRequest {
  id: string;
  productId: string;
  productName: string;
  requestedQuantity: number;
  currentStock: number;
  status: 'pending' | 'approved' | 'rejected';
  requestedBy: string;
  requestedAt: string;
}

interface InventoryState {
  items: InventoryItem[];
  stockRequests: StockRequest[];
  loading: boolean;
  error: string | null;
}

const initialState: InventoryState = {
  items: [],
  stockRequests: [],
  loading: false,
  error: null,
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    fetchInventoryStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchInventorySuccess: (state, action: PayloadAction<InventoryItem[]>) => {
      state.loading = false;
      state.items = action.payload;
    },
    fetchInventoryFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateInventoryItem: (state, action: PayloadAction<InventoryItem>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    fetchStockRequestsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchStockRequestsSuccess: (state, action: PayloadAction<StockRequest[]>) => {
      state.loading = false;
      state.stockRequests = action.payload;
    },
    fetchStockRequestsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateStockRequest: (state, action: PayloadAction<StockRequest>) => {
      const index = state.stockRequests.findIndex(req => req.id === action.payload.id);
      if (index !== -1) {
        state.stockRequests[index] = action.payload;
      }
    },
  },
});

export const {
  fetchInventoryStart,
  fetchInventorySuccess,
  fetchInventoryFailure,
  updateInventoryItem,
  fetchStockRequestsStart,
  fetchStockRequestsSuccess,
  fetchStockRequestsFailure,
  updateStockRequest,
} = inventorySlice.actions;

export default inventorySlice.reducer; 