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
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
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
  tagName: string;
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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    category: '',
    price: '',
    costPrice: '',
    sku: '',
    unit: 'pcs',
    status: 'active',
    tagName: '',
  });

  const {
    data: products,
    loading,
    error,
    execute: fetchProducts,
  } = useApi<Product[]>();

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
  }, [fetchProducts]);

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
      tagName: product?.tagName || '',
    });
    setOpenDialog(true);
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
      tagName: '',
    });
  };

  const handleSubmit = async () => {
    try {
      const productData = {
        companyId: "65f1a2b3c4d5e6f7g8h9i0j1", // TODO: Get this from user context
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        costPrice: parseFloat(formData.costPrice),
        sku: formData.sku,
        unit: formData.unit,
        status: formData.status,
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

  if (loading) {
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

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
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
                <TableCell>${product.price.toFixed(2)}</TableCell>
                <TableCell>${product.costPrice.toFixed(2)}</TableCell>
                <TableCell>{product.unit}</TableCell>
                <TableCell>{product.status}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenDialog(product)}
                  >
                    <EditIcon />
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
          {selectedProduct ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="SKU"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={3}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                required
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
                label="Price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cost Price"
                type="number"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                required
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </TextField>
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
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={creating || updating}
          >
            {creating || updating ? (
              <CircularProgress size={24} />
            ) : selectedProduct ? (
              'Update'
            ) : (
              'Create'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductManagement; 