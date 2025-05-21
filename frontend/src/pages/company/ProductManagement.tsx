import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Alert,
  CircularProgress,
  Grid,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useApi } from '../../hooks/useApi';
import apiService from '../../services/api';

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
  tagName?: string;
  quantity: number;
}

interface ProductFormData {
  name: string;
  description: string;
  category: string;
  price: string;
  costPrice: string;
  sku: string;
  unit: string;
  status: 'active' | 'inactive';
  quantity: string;
  tagName: string;
}

interface Warehouse {
  _id: string;
  name: string;
}

const categories = [
  'Shirts',
  'Pants',
  'Accessories',
  'Shoes',
  'Outerwear',
  'Underwear',
];

const units = ['pcs', 'pack', 'set', 'box', 'kg', 'g', 'l', 'ml'];

const ProductManagement: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [openWarehouseDialog, setOpenWarehouseDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
  const [assignQuantity, setAssignQuantity] = useState<string>('0');
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    category: '',
    price: '',
    costPrice: '',
    sku: '',
    unit: 'pcs',
    status: 'active',
    quantity: '0',
    tagName: '',
  });

  const {
    data: products,
    loading,
    error,
    execute: fetchProducts,
  } = useApi<Product[]>();

  const {
    data: warehouses,
    loading: loadingWarehouses,
    execute: fetchWarehouses,
  } = useApi<Warehouse[]>();

  const {
    execute: createProduct,
    loading: creating,
    error: createError,
  } = useApi<Product>();

  const {
    execute: updateProduct,
    loading: updating,
    error: updateError,
  } = useApi<Product>();

  const {
    execute: deleteProduct,
    loading: deleting,
    error: deleteError,
  } = useApi<void>();

  useEffect(() => {
    fetchProducts(apiService.getProducts);
    fetchWarehouses(apiService.getWarehouses);
  }, [fetchProducts, fetchWarehouses]);

  const handleOpenDialog = (product?: Product) => {
    setSelectedProduct(product || null);
    setFormData({
      name: product?.name || '',
      description: product?.description || '',
      category: product?.category || '',
      price: product?.price?.toString() || '0',
      costPrice: product?.costPrice?.toString() || '0',
      sku: product?.sku || '',
      unit: product?.unit || 'pcs',
      status: product?.status || 'active',
      quantity: product?.quantity?.toString() || '0',
      tagName: product?.tagName || '',
    });
    setOpenDialog(true);
  };

  const handleOpenWarehouseDialog = (product: Product) => {
    setSelectedProduct(product);
    setSelectedWarehouse('');
    setAssignQuantity('0');
    setOpenWarehouseDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProduct(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      price: '0',
      costPrice: '0',
      sku: '',
      unit: 'pcs',
      status: 'active',
      quantity: '0',
      tagName: '',
    });
  };

  const handleCloseWarehouseDialog = () => {
    setOpenWarehouseDialog(false);
    setSelectedProduct(null);
    setSelectedWarehouse('');
    setAssignQuantity('0');
  };

  const handleSubmit = async () => {
    try {
      const productData = {
        companyId: "68262d690239b80c629f6e21", // Using the correct company ID from MongoDB
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        costPrice: parseFloat(formData.costPrice),
        sku: formData.sku,
        unit: formData.unit,
        status: formData.status,
        quantity: parseInt(formData.quantity),
        tagName: formData.tagName || undefined
      };

      if (selectedProduct) {
        await updateProduct(apiService.updateProduct, selectedProduct._id, productData);
      } else {
        await createProduct(apiService.createProduct, productData);
      }
      handleCloseDialog();
      fetchProducts(apiService.getProducts);
    } catch (error) {
      console.error('Error submitting product:', error);
    }
  };

  const handleAssignWarehouse = async () => {
    if (!selectedProduct || !selectedWarehouse) return;

    try {
      // Call API to assign product to warehouse with quantity
      await apiService.assignProductToWarehouse(selectedProduct._id, selectedWarehouse, parseInt(assignQuantity));
      handleCloseWarehouseDialog();
      fetchProducts(apiService.getProducts);
    } catch (error) {
      console.error('Error assigning product to warehouse:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(apiService.deleteProduct, id);
        fetchProducts(apiService.getProducts);
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  if (loading || loadingWarehouses) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Product Management</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
        >
          Add Product
        </Button>
      </Box>

      {(error || createError || updateError || deleteError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || createError || updateError || deleteError}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Cost Price</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products?.map((product) => (
              <TableRow key={product._id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{product.sku}</TableCell>
                <TableCell>${(product.price || 0).toFixed(2)}</TableCell>
                <TableCell>${(product.costPrice || 0).toFixed(2)}</TableCell>
                <TableCell>{product.unit}</TableCell>
                <TableCell>{product.quantity}</TableCell>
                <TableCell>{product.status}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenDialog(product)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenWarehouseDialog(product)}
                  >
                    <AddIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(product._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedProduct ? 'Edit Product' : 'Add Product'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Category"
                select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cost Price"
                type="number"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="SKU"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Unit"
                select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              >
                {units.map((unit) => (
                  <MenuItem key={unit} value={unit}>
                    {unit}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Status"
                select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
                inputProps={{ min: 0, step: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tag Name"
                value={formData.tagName}
                onChange={(e) => setFormData({ ...formData, tagName: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} color="primary" disabled={creating || updating}>
            {selectedProduct ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openWarehouseDialog} onClose={handleCloseWarehouseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Product to Warehouse</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth required error={!selectedWarehouse}>
                <InputLabel>Warehouse</InputLabel>
                <Select
                  value={selectedWarehouse}
                  onChange={(e) => setSelectedWarehouse(e.target.value)}
                  label="Warehouse"
                >
                  {warehouses?.map((warehouse) => (
                    <MenuItem key={warehouse._id} value={warehouse._id}>
                      {warehouse.name}
                    </MenuItem>
                  ))}
                </Select>
                {!selectedWarehouse && (
                  <Typography color="error" variant="caption">
                    Warehouse is required
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Quantity to Assign"
                type="number"
                value={assignQuantity}
                onChange={(e) => setAssignQuantity(e.target.value)}
                required
                inputProps={{ min: 1, step: 1 }}
                error={parseInt(assignQuantity) <= 0}
                helperText={parseInt(assignQuantity) <= 0 ? "Quantity must be greater than 0" : ""}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseWarehouseDialog}>Cancel</Button>
          <Button 
            onClick={handleAssignWarehouse} 
            color="primary" 
            disabled={!selectedWarehouse || parseInt(assignQuantity) <= 0}
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductManagement; 