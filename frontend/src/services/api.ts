import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Service URLs
const SERVICE_URLS = {
  auth: process.env.REACT_APP_AUTH_SERVICE_URL || 'http://localhost:5000',
  products: process.env.REACT_APP_PRODUCT_SERVICE_URL || 'http://localhost:5002',
  inventory: process.env.REACT_APP_STOCK_SERVICE_URL || 'http://localhost:5002',
  orders: process.env.REACT_APP_SALES_SERVICE_URL || 'http://localhost:5006',
  company: process.env.REACT_APP_COMPANY_SERVICE_URL || 'http://localhost:5001',
  warehouse: process.env.REACT_APP_WAREHOUSE_SERVICE_URL || 'http://localhost:5003',
  branch: process.env.REACT_APP_BRANCH_SERVICE_URL || 'http://localhost:5004',
};

// Debug logging
const logRequest = (config: InternalAxiosRequestConfig) => {
  console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, {
    headers: config.headers,
    data: config.data,
  });
};

const logResponse = (response: any) => {
  console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
    status: response.status,
    data: response.data,
  });
};

const logError = (error: AxiosError) => {
  console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
    status: error.response?.status,
    data: error.response?.data,
    message: error.message,
  });
};

// Create axios instances for each service
const createService = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      logRequest(config);
      return config;
    },
    (error: AxiosError) => {
      logError(error);
      return Promise.reject(error);
    }
  );

  // Response interceptor
  instance.interceptors.response.use(
    (response) => {
      logResponse(response);
      return response;
    },
    (error: AxiosError) => {
      logError(error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

// Create service instances
const authService = createService(SERVICE_URLS.auth);
const productService = createService(SERVICE_URLS.products);
const inventoryService = createService(SERVICE_URLS.inventory);
const orderService = createService(SERVICE_URLS.orders);
const companyService = createService(SERVICE_URLS.company);
const warehouseService = createService(SERVICE_URLS.warehouse);
const branchService = createService(SERVICE_URLS.branch);

interface ReportParams {
  timeRange: string;
  startDate?: string;
  endDate?: string;
}

interface ReportData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

interface Product {
  _id: string;
  companyId: string;
  name: string;
  description: string;
  category: string;
  price: number;
  costPrice: number;
  sku: string;
  unit: string;
  status: 'active' | 'inactive';
  quantity: number;
  tagName?: string;
}

interface CreateProductData {
  companyId: string;
  name: string;
  description: string;
  category: string;
  price: number;
  costPrice: number;
  sku: string;
  unit: string;
  status: 'active' | 'inactive';
  quantity: number;
  tagName?: string;
}

interface Company {
  _id: string;
  name: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  status: 'Active' | 'Inactive';
  registeredAt: string;
}

interface CreateCompanyData {
  name: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  status: 'Active' | 'Inactive';
}

interface Warehouse {
  _id: string;
  name: string;
  location: string;
  managerId: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateWarehouseData {
  name: string;
  location: string;
  managerId: string;
}

interface User {
  _id: string;
  email: string;
  name: string;
  role: string;
  status: string;
}

// API endpoints
export const endpoints = {
  // Auth
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
  },
  // Users
  users: {
    list: '/api/auth/users',
    create: '/api/auth/users',
    update: (id: string) => `/api/auth/users/${id}`,
    delete: (id: string) => `/api/auth/users/${id}`,
    getById: (id: string) => `/api/auth/users/${id}`,
  },
  // Products
  products: {
    list: '/api/products',
    create: '/api/products',
    update: (id: string) => `/api/products/${id}`,
    delete: (id: string) => `/api/products/${id}`,
    getById: (id: string) => `/api/products/${id}`,
  },
  // Warehouses
  warehouses: {
    list: '/api/warehouses',
    create: '/api/warehouses',
    update: (id: string) => `/api/warehouses/${id}`,
    delete: (id: string) => `/api/warehouses/${id}`,
    getById: (id: string) => `/api/warehouses/${id}`,
    products: (id: string) => `/api/warehouses/${id}/products`,
    assignProduct: (id: string) => `/api/warehouses/${id}/products`,
  },
  // Branches
  branches: {
    list: '/api/branches',
    create: '/api/branches',
    update: (id: string) => `/api/branches/${id}`,
    delete: (id: string) => `/api/branches/${id}`,
    getById: (id: string) => `/api/branches/${id}`,
    getProducts: (id: string) => `/api/branches/${id}/products`,
    assignProduct: (id: string) => `/api/branches/${id}/products`,
    removeProduct: (branchId: string, productId: string) => `/api/branches/${branchId}/products/${productId}`,
  },
  // Orders (Sales)
  orders: {
    list: '/api/sales',
    create: '/api/sales',
    update: (id: string) => `/api/sales/${id}`,
    getById: (id: string) => `/api/sales/${id}`,
    updateStatus: (id: string) => `/api/sales/${id}/status`,
    analytics: '/api/sales/analytics',
    data: '/api/sales/data',
  },
  // Reports (use sales analytics/data endpoints)
  reports: {
    sales: '/api/sales/analytics',
    inventory: '/api/inventory/analytics',
    customers: '/api/sales/customers',
    export: (type: string) => `/api/sales/export/${type}`,
  },
  // Dashboard
  dashboard: {
    data: '/api/dashboard', // You may need to implement this in your backend
  },
  // Companies
  companies: {
    list: '/api/company',
    create: '/api/company',
    update: (id: string) => `/api/company/${id}`,
    delete: (id: string) => `/api/company/${id}`,
    getById: (id: string) => `/api/company/${id}`,
  },
};

// API service functions
export const apiService = {
  // Auth
  login: async (credentials: { email: string; password: string }) => {
    try {
      const response = await authService.post(endpoints.auth.login, credentials);
      return response.data;
    } catch (error) {
      console.error('[Auth Service] Login error:', error);
      throw error;
    }
  },
  register: async (userData: any) => {
    try {
      const response = await authService.post(endpoints.auth.register, userData);
      return response.data;
    } catch (error) {
      console.error('[Auth Service] Register error:', error);
      throw error;
    }
  },
  logout: async () => {
    try {
      const response = await authService.post(endpoints.auth.logout);
      return response.data;
    } catch (error) {
      console.error('[Auth Service] Logout error:', error);
      throw error;
    }
  },

  // Users
  getUsers: async () => {
    try {
      console.log('[Auth Service] Fetching users...');
      const response = await authService.get(endpoints.users.list);
      console.log('[Auth Service] Users response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[Auth Service] Get users error:', error);
      throw error;
    }
  },
  createUser: async (userData: any) => {
    try {
      const response = await authService.post(endpoints.users.create, userData);
      return response.data;
    } catch (error) {
      console.error('[Auth Service] Create user error:', error);
      throw error;
    }
  },
  updateUser: async (id: string, userData: any) => {
    try {
      const response = await authService.put(endpoints.users.update(id), userData);
      return response.data;
    } catch (error) {
      console.error('[Auth Service] Update user error:', error);
      throw error;
    }
  },
  deleteUser: async (id: string) => {
    try {
      const response = await authService.delete(endpoints.users.delete(id));
      return response.data;
    } catch (error) {
      console.error('[Auth Service] Delete user error:', error);
      throw error;
    }
  },
  getWarehouseManagers: async () => {
    try {
      console.log('[Auth Service] Fetching warehouse managers...');
      const response = await authService.get(endpoints.users.list);
      console.log('[Auth Service] Warehouse managers response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[Auth Service] Get warehouse managers error:', error);
      throw error;
    }
  },

  // Products
  getProducts: async () => {
    try {
      console.log('[Product Service] Fetching products...');
      const response = await productService.get(endpoints.products.list);
      console.log('[Product Service] Products response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[Product Service] Get products error:', error);
      throw error;
    }
  },
  createProduct: async (productData: CreateProductData) => {
    try {
      console.log('[Product Service] Creating product:', JSON.stringify(productData, null, 2));
      const response = await productService.post(endpoints.products.create, productData);
      console.log('[Product Service] Create product response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[Product Service] Create product error:', error);
      throw error;
    }
  },
  updateProduct: async (id: string, productData: Partial<CreateProductData>) => {
    try {
      console.log('[Product Service] Updating product:', { id, productData });
      const response = await productService.put(endpoints.products.update(id), productData);
      console.log('[Product Service] Update product response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[Product Service] Update product error:', error);
      throw error;
    }
  },
  deleteProduct: async (id: string) => {
    try {
      console.log('[Product Service] Deleting product:', id);
      const response = await productService.delete(endpoints.products.delete(id));
      console.log('[Product Service] Delete product response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[Product Service] Delete product error:', error);
      throw error;
    }
  },

  // Inventory
  getInventory: async () => {
    try {
      const response = await inventoryService.get(endpoints.warehouses.list);
      return response.data;
    } catch (error) {
      console.error('[Inventory Service] Get inventory error:', error);
      throw error;
    }
  },
  updateInventory: async (id: string, inventoryData: any) => {
    try {
      const response = await inventoryService.put(endpoints.warehouses.update(id), inventoryData);
      return response.data;
    } catch (error) {
      console.error('[Inventory Service] Update inventory error:', error);
      throw error;
    }
  },
  requestStock: async (requestData: any) => {
    try {
      const response = await inventoryService.post(endpoints.warehouses.create, requestData);
      return response.data;
    } catch (error) {
      console.error('[Inventory Service] Request stock error:', error);
      throw error;
    }
  },
  approveStockRequest: async (id: string, approvalData: any) => {
    try {
      const response = await inventoryService.post(endpoints.warehouses.update(id), approvalData);
      return response.data;
    } catch (error) {
      console.error('[Inventory Service] Approve stock request error:', error);
      throw error;
    }
  },

  // Orders
  getOrders: async () => {
    try {
      const response = await orderService.get(endpoints.orders.list);
      return response.data;
    } catch (error) {
      console.error('[Order Service] Get orders error:', error);
      throw error;
    }
  },
  createOrder: async (orderData: any) => {
    try {
      const response = await orderService.post(endpoints.orders.create, orderData);
      return response.data;
    } catch (error) {
      console.error('[Order Service] Create order error:', error);
      throw error;
    }
  },
  updateOrder: async (id: string, orderData: any) => {
    try {
      const response = await orderService.put(endpoints.orders.update(id), orderData);
      return response.data;
    } catch (error) {
      console.error('[Order Service] Update order error:', error);
      throw error;
    }
  },
  updateOrderStatus: async (id: string, status: string) => {
    try {
      const response = await orderService.put(endpoints.orders.updateStatus(id), { status });
      return response.data;
    } catch (error) {
      console.error('[Order Service] Update order status error:', error);
      throw error;
    }
  },

  // Reports
  getSalesReport: async (params: ReportParams): Promise<ReportData> => {
    try {
      const response = await orderService.get(endpoints.reports.sales, { params });
      return response.data?.data || {
        labels: [],
        datasets: [{
          label: 'Sales',
          data: [],
          borderColor: 'rgb(75, 192, 192)'
        }]
      };
    } catch (error) {
      console.error('[Report Service] Get sales report error:', error);
      return {
        labels: [],
        datasets: [{
          label: 'Sales',
          data: [],
          borderColor: 'rgb(75, 192, 192)'
        }]
      };
    }
  },
  getInventoryReport: async (params: ReportParams): Promise<ReportData> => {
    try {
      const response = await inventoryService.get(endpoints.reports.inventory, { params });
      return response.data?.data || {
        labels: [],
        datasets: [{
          label: 'Inventory',
          data: [],
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 1
        }]
      };
    } catch (error) {
      console.error('[Report Service] Get inventory report error:', error);
      return {
        labels: [],
        datasets: [{
          label: 'Inventory',
          data: [],
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 1
        }]
      };
    }
  },
  getCustomersReport: async (params: ReportParams): Promise<ReportData> => {
    try {
      const response = await orderService.get(endpoints.reports.customers, { params });
      return response.data?.data || {
        labels: [],
        datasets: [{
          label: 'Customers',
          data: [],
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)'
          ],
          borderColor: [
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)',
            'rgb(255, 206, 86)',
            'rgb(75, 192, 192)',
            'rgb(153, 102, 255)'
          ],
          borderWidth: 1
        }]
      };
    } catch (error) {
      console.error('[Report Service] Get customers report error:', error);
      return {
        labels: [],
        datasets: [{
          label: 'Customers',
          data: [],
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)'
          ],
          borderColor: [
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)',
            'rgb(255, 206, 86)',
            'rgb(75, 192, 192)',
            'rgb(153, 102, 255)'
          ],
          borderWidth: 1
        }]
      };
    }
  },
  exportReport: async (type: string, params: ReportParams): Promise<Blob> => {
    try {
      const response = await orderService.get(endpoints.reports.export(type), {
        params,
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('[Report Service] Export report error:', error);
      throw error;
    }
  },

  // Dashboard
  getDashboardData: async () => {
    try {
      const [usersResponse, productsResponse, branchesResponse, warehousesResponse] = await Promise.all([
        authService.get(endpoints.users.list),
        productService.get(endpoints.products.list),
        branchService.get(endpoints.branches.list),
        warehouseService.get(endpoints.warehouses.list),
      ]);

      // Try to get sales data, but don't fail if it's not available
      let salesData = {
        labels: ['Total Sales', 'Total Orders', 'Average Order Value'],
        datasets: [{
          label: 'Sales Overview',
          data: [0, 0, 0],
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
        }],
      };

      try {
        const salesResponse = await orderService.get(endpoints.orders.analytics, {
          params: {
            timeRange: 'monthly',
          },
        });
        
        if (salesResponse.data?.data?.summary) {
          salesData.datasets[0].data = [
            salesResponse.data.data.summary.totalSales || 0,
            salesResponse.data.data.summary.totalOrders || 0,
            salesResponse.data.data.summary.averageOrderValue || 0
          ];
        }
      } catch (salesError) {
        console.warn('[Dashboard] Sales analytics not available:', salesError);
      }

      return {
        totalUsers: usersResponse.data.length,
        totalProducts: productsResponse.data.length,
        totalBranches: branchesResponse.data?.data?.length || 0,
        totalWarehouses: warehousesResponse.data.length,
        salesData,
      };
    } catch (error) {
      console.error('[Dashboard] Get dashboard data error:', error);
      throw error;
    }
  },

  // Companies
  getCompanies: async () => {
    try {
      console.log('[Company Service] Fetching companies...');
      const response = await companyService.get(endpoints.companies.list);
      console.log('[Company Service] Companies response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[Company Service] Get companies error:', error);
      throw error;
    }
  },
  createCompany: async (companyData: CreateCompanyData) => {
    try {
      console.log('[Company Service] Creating company:', companyData);
      const response = await companyService.post(endpoints.companies.create, companyData);
      console.log('[Company Service] Create company response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[Company Service] Create company error:', error);
      throw error;
    }
  },
  updateCompany: async (id: string, companyData: Partial<CreateCompanyData>) => {
    try {
      console.log('[Company Service] Updating company:', { id, companyData });
      const response = await companyService.put(endpoints.companies.update(id), companyData);
      console.log('[Company Service] Update company response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[Company Service] Update company error:', error);
      throw error;
    }
  },
  deleteCompany: async (id: string) => {
    try {
      console.log('[Company Service] Deleting company:', id);
      const response = await companyService.delete(endpoints.companies.delete(id));
      console.log('[Company Service] Delete company response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[Company Service] Delete company error:', error);
      throw error;
    }
  },
  getCompanyById: async (id: string) => {
    try {
      const response = await companyService.get(endpoints.companies.getById(id));
      return response.data;
    } catch (error) {
      console.error('[Company Service] Get company by ID error:', error);
      throw error;
    }
  },

  // Branch Management
  getBranches: async () => {
    try {
      const response = await branchService.get(endpoints.branches.list);
      // Ensure we return an array even if the response is wrapped in a data property
      return Array.isArray(response.data) ? response.data : 
             (response.data?.data && Array.isArray(response.data.data)) ? response.data.data : [];
    } catch (error) {
      console.error('[Branch Service] Get branches error:', error);
      return [];
    }
  },

  getBranchById: async (id: string) => {
    try {
      const response = await branchService.get(endpoints.branches.getById(id));
      return response.data;
    } catch (error) {
      console.error('[Branch Service] Get branch by ID error:', error);
      throw error;
    }
  },

  createBranch: async (branchData: any) => {
    try {
      const response = await branchService.post(endpoints.branches.create, branchData);
      return response.data;
    } catch (error) {
      console.error('[Branch Service] Create branch error:', error);
      throw error;
    }
  },

  updateBranch: async (id: string, branchData: any) => {
    try {
      const response = await branchService.put(endpoints.branches.update(id), branchData);
      return response.data;
    } catch (error) {
      console.error('[Branch Service] Update branch error:', error);
      throw error;
    }
  },

  deleteBranch: async (id: string) => {
    try {
      const response = await branchService.delete(endpoints.branches.delete(id));
      return response.data;
    } catch (error) {
      console.error('[Branch Service] Delete branch error:', error);
      throw error;
    }
  },

  getBranchProducts: async (branchId: string) => {
    try {
      const response = await branchService.get(endpoints.branches.getProducts(branchId));
      return response.data;
    } catch (error) {
      console.error('[Branch Service] Get branch products error:', error);
      throw error;
    }
  },

  assignProductToBranch: async (productId: string, branchId: string, quantity: number) => {
    try {
      const response = await branchService.post(endpoints.branches.assignProduct(branchId), { 
        productId,
        quantity
      });
      return response.data;
    } catch (error) {
      console.error('[Branch Service] Assign product to branch error:', error);
      throw error;
    }
  },

  removeProductFromBranch: async (branchId: string, productId: string) => {
    try {
      const response = await branchService.delete(endpoints.branches.removeProduct(branchId, productId));
      return response.data;
    } catch (error) {
      console.error('[Branch Service] Remove product from branch error:', error);
      throw error;
    }
  },

  // Warehouse Management
  getWarehouses: async () => {
    try {
      const response = await warehouseService.get(endpoints.warehouses.list);
      return response.data;
    } catch (error) {
      console.error('[Warehouse Service] Get warehouses error:', error);
      throw error;
    }
  },

  createWarehouse: async (warehouseData: CreateWarehouseData) => {
    try {
      const response = await warehouseService.post(endpoints.warehouses.create, warehouseData);
      return response.data;
    } catch (error) {
      console.error('[Warehouse Service] Create warehouse error:', error);
      throw error;
    }
  },

  updateWarehouse: async (id: string, warehouseData: Partial<CreateWarehouseData>) => {
    try {
      const response = await warehouseService.put(endpoints.warehouses.update(id), warehouseData);
      return response.data;
    } catch (error) {
      console.error('[Warehouse Service] Update warehouse error:', error);
      throw error;
    }
  },

  deleteWarehouse: async (id: string) => {
    try {
      const response = await warehouseService.delete(endpoints.warehouses.delete(id));
      return response.data;
    } catch (error) {
      console.error('[Warehouse Service] Delete warehouse error:', error);
      throw error;
    }
  },

  getWarehouseProducts: async (warehouseId: string) => {
    try {
      const response = await warehouseService.get(endpoints.warehouses.products(warehouseId));
      return response.data;
    } catch (error) {
      console.error('[Warehouse Service] Get warehouse products error:', error);
      throw error;
    }
  },

  assignProductToWarehouse: async (productId: string, warehouseId: string, quantity: number) => {
    try {
      const response = await warehouseService.post(endpoints.warehouses.assignProduct(warehouseId), {
        productId,
        quantity
      });
      return response.data;
    } catch (error) {
      console.error('[Warehouse Service] Assign product to warehouse error:', error);
      throw error;
    }
  },

  // Sales Management
  getSalesAnalytics: async (timeRange: string) => {
    try {
      const response = await orderService.get(`/api/sales/analytics?timeRange=${timeRange}`);
      return response.data;
    } catch (error) {
      console.error('[Sales Service] Get sales analytics error:', error);
      throw error;
    }
  },
};

export default apiService; 