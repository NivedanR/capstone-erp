import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useApi } from '../../hooks/useApi';
import apiService from '../../services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Management: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'branch' | 'warehouse' | 'product'>('branch');
  const [editItem, setEditItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  const { data: branches, loading: branchesLoading, error: branchesError, execute: fetchBranches } = useApi<any[]>();
  const { data: warehouses, loading: warehousesLoading, error: warehousesError, execute: fetchWarehouses } = useApi<any[]>();
  const { data: products, loading: productsLoading, error: productsError, execute: fetchProducts } = useApi<any[]>();

  useEffect(() => {
    fetchBranches(apiService.getBranches);
    fetchWarehouses(apiService.getWarehouses);
    fetchProducts(apiService.getProducts);
  }, [fetchBranches, fetchWarehouses, fetchProducts]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (type: 'branch' | 'warehouse' | 'product', item?: any) => {
    setDialogType(type);
    setEditItem(item);
    setFormData(item || {});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditItem(null);
    setFormData({});
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      if (editItem) {
        switch (dialogType) {
          case 'branch':
            await apiService.updateBranch(editItem._id, formData);
            break;
          case 'warehouse':
            await apiService.updateWarehouse(editItem._id, formData);
            break;
          case 'product':
            await apiService.updateProduct(editItem._id, formData);
            break;
        }
      } else {
        switch (dialogType) {
          case 'branch':
            await apiService.createBranch(formData);
            break;
          case 'warehouse':
            await apiService.createWarehouse(formData);
            break;
          case 'product':
            await apiService.createProduct(formData);
            break;
        }
      }
      handleCloseDialog();
      fetchBranches(apiService.getBranches);
      fetchWarehouses(apiService.getWarehouses);
      fetchProducts(apiService.getProducts);
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const handleDelete = async (type: 'branch' | 'warehouse' | 'product', id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        switch (type) {
          case 'branch':
            await apiService.deleteBranch(id);
            break;
          case 'warehouse':
            await apiService.deleteWarehouse(id);
            break;
          case 'product':
            await apiService.deleteProduct(id);
            break;
        }
        fetchBranches(apiService.getBranches);
        fetchWarehouses(apiService.getWarehouses);
        fetchProducts(apiService.getProducts);
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const renderDataTable = (type: 'branch' | 'warehouse' | 'product', data: any[], loading: boolean, error: any) => {
    if (loading) {
      return <CircularProgress />;
    }

    if (error) {
      return <Alert severity="error">{error}</Alert>;
    }

    if (!data || data.length === 0) {
      return <Alert severity="info">No {type}s found</Alert>;
    }

    const columns = type === 'branch' ? ['Name', 'Location', 'Manager'] :
                   type === 'warehouse' ? ['Name', 'Location', 'Capacity'] :
                   ['Name', 'Category', 'Price', 'Stock'];

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column}>{column}</TableCell>
              ))}
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item._id}>
                {type === 'branch' && (
                  <>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>{item.managerId}</TableCell>
                  </>
                )}
                {type === 'warehouse' && (
                  <>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>{item.capacity}</TableCell>
                  </>
                )}
                {type === 'product' && (
                  <>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>${item.price}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                  </>
                )}
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(type, item)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(type, item._id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Management Dashboard
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Branches" />
          <Tab label="Warehouses" />
          <Tab label="Products" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Box sx={{ mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog('branch')}
          >
            Add Branch
          </Button>
        </Box>
        {renderDataTable('branch', branches || [], branchesLoading, branchesError)}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog('warehouse')}
          >
            Add Warehouse
          </Button>
        </Box>
        {renderDataTable('warehouse', warehouses || [], warehousesLoading, warehousesError)}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Box sx={{ mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog('product')}
          >
            Add Product
          </Button>
        </Box>
        {renderDataTable('product', products || [], productsLoading, productsError)}
      </TabPanel>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {editItem ? `Edit ${dialogType}` : `Add ${dialogType}`}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {dialogType === 'branch' && (
              <>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleFormChange}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Location"
                  name="location"
                  value={formData.location || ''}
                  onChange={handleFormChange}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Manager ID"
                  name="managerId"
                  value={formData.managerId || ''}
                  onChange={handleFormChange}
                  margin="normal"
                />
              </>
            )}
            {dialogType === 'warehouse' && (
              <>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleFormChange}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Location"
                  name="location"
                  value={formData.location || ''}
                  onChange={handleFormChange}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Capacity"
                  name="capacity"
                  type="number"
                  value={formData.capacity || ''}
                  onChange={handleFormChange}
                  margin="normal"
                />
              </>
            )}
            {dialogType === 'product' && (
              <>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleFormChange}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Category"
                  name="category"
                  value={formData.category || ''}
                  onChange={handleFormChange}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Price"
                  name="price"
                  type="number"
                  value={formData.price || ''}
                  onChange={handleFormChange}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Stock"
                  name="quantity"
                  type="number"
                  value={formData.quantity || ''}
                  onChange={handleFormChange}
                  margin="normal"
                />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editItem ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Management; 