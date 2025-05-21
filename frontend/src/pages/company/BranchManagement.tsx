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
  IconButton,
  Alert,
  CircularProgress,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Collapse,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { useApi } from '../../hooks/useApi';
import apiService from '../../services/api';

interface Branch {
  _id: string;
  name: string;
  location: string;
  warehouseId: string;
  managerId: string;
  createdAt: string;
  updatedAt: string;
}

interface BranchFormData {
  name: string;
  location: string;
  warehouseId: string;
  managerId: string;
}

interface Warehouse {
  _id: string;
  name: string;
}

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
}

interface Product {
  _id: string;
  name: string;
  sku: string;
  price: number;
  unit: string;
  quantity: number;
}

const BranchManagement: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState<BranchFormData>({
    name: '',
    location: '',
    warehouseId: '',
    managerId: '',
  });
  const [managers, setManagers] = useState<User[]>([]);
  const [expandedBranch, setExpandedBranch] = useState<string | null>(null);
  const [branchProducts, setBranchProducts] = useState<Record<string, Product[]>>({});

  const {
    data: branches,
    loading,
    error,
    execute: fetchBranches,
  } = useApi<Branch[]>();

  const {
    data: warehouses,
    loading: loadingWarehouses,
    execute: fetchWarehouses,
  } = useApi<Warehouse[]>();

  const {
    execute: createBranch,
    loading: creating,
    error: createError,
  } = useApi<Branch>();

  const {
    execute: updateBranch,
    loading: updating,
    error: updateError,
  } = useApi<Branch>();

  const {
    execute: deleteBranch,
    loading: deleting,
    error: deleteError,
  } = useApi<void>();

  useEffect(() => {
    console.log('Initializing branch management...');
    fetchBranches(apiService.getBranches);
    fetchWarehouses(apiService.getWarehouses);
    fetchManagers();
  }, [fetchBranches, fetchWarehouses]);

  const fetchManagers = async () => {
    try {
      console.log('Fetching branch managers...');
      const response = await apiService.getWarehouseManagers();
      console.log('Branch managers response:', response);
      if (response && Array.isArray(response)) {
        setManagers(response);
      } else {
        console.error('Invalid response format:', response);
        setManagers([]);
      }
    } catch (err) {
      console.error('Failed to fetch branch managers:', err);
      setManagers([]);
    }
  };

  const handleOpenDialog = (branch?: Branch) => {
    console.log('Opening dialog with managers:', managers);
    setSelectedBranch(branch || null);
    setFormData({
      name: branch?.name || '',
      location: branch?.location || '',
      warehouseId: branch?.warehouseId || '',
      managerId: branch?.managerId || '',
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBranch(null);
    setFormData({
      name: '',
      location: '',
      warehouseId: '',
      managerId: '',
    });
  };

  const handleSubmit = async () => {
    try {
      const branchData: BranchFormData = {
        name: formData.name,
        location: formData.location,
        warehouseId: formData.warehouseId,
        managerId: formData.managerId,
      };

      if (selectedBranch) {
        await updateBranch(apiService.updateBranch, selectedBranch._id, branchData);
      } else {
        await createBranch(apiService.createBranch, branchData);
      }
      handleCloseDialog();
      fetchBranches(apiService.getBranches);
    } catch (error) {
      console.error('Error submitting branch:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this branch?')) {
      try {
        await deleteBranch(apiService.deleteBranch, id);
        fetchBranches(apiService.getBranches);
      } catch (error) {
        console.error('Error deleting branch:', error);
      }
    }
  };

  const fetchBranchProducts = async (branchId: string) => {
    try {
      const response = await apiService.getBranchProducts(branchId);
      setBranchProducts(prev => ({
        ...prev,
        [branchId]: response
      }));
    } catch (err) {
      console.error('Failed to fetch branch products:', err);
      setBranchProducts(prev => ({
        ...prev,
        [branchId]: []
      }));
    }
  };

  const handleToggleExpand = async (branchId: string) => {
    if (expandedBranch === branchId) {
      setExpandedBranch(null);
    } else {
      setExpandedBranch(branchId);
      await fetchBranchProducts(branchId);
    }
  };

  const handleRemoveProduct = async (branchId: string, productId: string) => {
    try {
      await apiService.removeProductFromBranch(branchId, productId);
      await fetchBranchProducts(branchId);
    } catch (error) {
      console.error('Error removing product from branch:', error);
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
        <Typography variant="h4">Branch Management</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
        >
          Add Branch
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
              <TableCell>Location</TableCell>
              <TableCell>Warehouse</TableCell>
              <TableCell>Manager</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(branches || []).map((branch) => (
              <React.Fragment key={branch._id}>
                <TableRow>
                  <TableCell>{branch.name}</TableCell>
                  <TableCell>{branch.location}</TableCell>
                  <TableCell>
                    {warehouses?.find(w => w._id === branch.warehouseId)?.name || branch.warehouseId}
                  </TableCell>
                  <TableCell>
                    {managers.find(m => m._id === branch.managerId)?.username || 'Not assigned'}
                  </TableCell>
                  <TableCell>{new Date(branch.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog(branch)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(branch._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleToggleExpand(branch._id)}
                    >
                      {expandedBranch === branch._id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={4} sx={{ p: 0 }}>
                    <Collapse in={expandedBranch === branch._id}>
                      <Box sx={{ p: 2, bgcolor: 'background.default' }}>
                        <Typography variant="h6" gutterBottom>
                          Products in {branch.name}
                        </Typography>
                        {branchProducts[branch._id] ? (
                          branchProducts[branch._id].length > 0 ? (
                            <TableContainer component={Paper} variant="outlined">
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>SKU</TableCell>
                                    <TableCell>Price</TableCell>
                                    <TableCell>Unit</TableCell>
                                    <TableCell>Quantity</TableCell>
                                    <TableCell>Actions</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {branchProducts[branch._id].map((product) => (
                                    <TableRow key={product._id}>
                                      <TableCell>{product.name}</TableCell>
                                      <TableCell>{product.sku}</TableCell>
                                      <TableCell>${product.price.toFixed(2)}</TableCell>
                                      <TableCell>{product.unit}</TableCell>
                                      <TableCell>{product.quantity}</TableCell>
                                      <TableCell>
                                        <IconButton
                                          color="error"
                                          onClick={() => handleRemoveProduct(branch._id, product._id)}
                                        >
                                          <RemoveIcon />
                                        </IconButton>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          ) : (
                            <Typography color="text.secondary">
                              No products assigned to this branch
                            </Typography>
                          )
                        ) : (
                          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                            <CircularProgress size={24} />
                          </Box>
                        )}
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedBranch ? 'Edit Branch' : 'Add Branch'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                error={!formData.name}
                helperText={!formData.name ? 'Name is required' : ''}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
                error={!formData.location}
                helperText={!formData.location ? 'Location is required' : ''}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Warehouse"
                value={formData.warehouseId}
                onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
                required
                error={!formData.warehouseId}
                helperText={!formData.warehouseId ? 'Warehouse is required' : ''}
              >
                {warehouses?.map((warehouse) => (
                  <MenuItem key={warehouse._id} value={warehouse._id}>
                    {warehouse.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required error={!formData.managerId}>
                <InputLabel>Manager</InputLabel>
                <Select
                  value={formData.managerId}
                  onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                  label="Manager"
                >
                  {managers.map((manager) => (
                    <MenuItem key={manager._id} value={manager._id}>
                      {manager.username} ({manager.email})
                    </MenuItem>
                  ))}
                </Select>
                {!formData.managerId && (
                  <Typography color="error" variant="caption">
                    Manager is required
                  </Typography>
                )}
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            color="primary" 
            disabled={creating || updating || !formData.name || !formData.location || !formData.warehouseId || !formData.managerId}
          >
            {selectedBranch ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BranchManagement; 