export const endpoints = {
  branches: {
    list: '/api/branches',
    create: '/api/branches',
    update: (id: string) => `/api/branches/${id}`,
    delete: (id: string) => `/api/branches/${id}`,
    getById: (id: string) => `/api/branches/${id}`,
    getProducts: (id: string) => `/api/branches/${id}/products`,
    assignProduct: (id: string) => `/api/branches/${id}/products`,
    removeProduct: (id: string, productId: string) => `/api/branches/${id}/products/${productId}`,
  },
} 