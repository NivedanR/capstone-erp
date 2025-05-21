import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Button,
  TextField,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  AddShoppingCart as AddToCartIcon,
  Receipt as ReceiptIcon,
  Refresh as RefreshIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import { useApi } from '../../hooks/useApi';
import apiService from '../../services/api';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import Orders from './Orders';
import Transactions from './Transactions';
import Analytics from './Analytics';

const drawerWidth = 240;

interface Product {
  _id: string;
  name: string;
  sku: string;
  price: number;
  unit: string;
  quantity: number;
}

interface Branch {
  _id: string;
  name: string;
  location: string;
  managerId: string;
  warehouseId: string;
  products: string[];
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

const BranchDashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const { user } = useSelector((state: RootState) => state.auth);

  const {
    data: products,
    loading,
    error,
    execute: fetchProducts,
  } = useApi<Product[]>();

  const refreshProducts = async () => {
    try {
      const branchId = localStorage.getItem('branchId');
      if (!branchId) return;

      // Fetch fresh products from API
      const branchProducts = await apiService.getBranchProducts(branchId);
      // Update localStorage with fresh data
      localStorage.setItem('branchProducts', JSON.stringify(branchProducts));
      // Update the products state
      fetchProducts(() => Promise.resolve(branchProducts));
    } catch (error) {
      console.error('Error refreshing products:', error);
    }
  };

  useEffect(() => {
    const fetchBranchAndProducts = async () => {
      try {
        // Check if we already have the branch ID in localStorage
        const storedBranchId = localStorage.getItem('branchId');
        let branchId = storedBranchId;

        if (!branchId) {
          // Get all branches
          const branches = await apiService.getBranches() as Branch[];
          // Find the branch where the current user is the manager
          const userBranch = branches.find((branch: Branch) => branch.managerId === (user as User)?.id);
          
          if (userBranch) {
            branchId = userBranch._id;
            // Store branch ID in localStorage for future use
            localStorage.setItem('branchId', branchId);
          } else {
            console.error('No branch found for this manager');
            return;
          }
        }

        // Always fetch fresh products from API
        const branchProducts = await apiService.getBranchProducts(branchId);
        // Store products in localStorage
        localStorage.setItem('branchProducts', JSON.stringify(branchProducts));
        fetchProducts(() => Promise.resolve(branchProducts));
      } catch (error) {
        console.error('Error fetching branch data:', error);
      }
    };

    if ((user as User)?.id) {
      fetchBranchAndProducts();
    }

    // Add event listener for localStorage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'branchProducts') {
        const updatedProducts = JSON.parse(e.newValue || '[]');
        fetchProducts(() => Promise.resolve(updatedProducts));
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [(user as User)?.id, fetchProducts]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleQuantityChange = (productId: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setQuantities(prev => ({
      ...prev,
      [productId]: numValue
    }));
  };

  const handleAddToOrder = (product: Product) => {
    const quantity = quantities[product._id] || 0;
    
    if (quantity <= 0) {
      setSnackbar({
        open: true,
        message: 'Please select a quantity greater than 0',
        severity: 'error'
      });
      return;
    }

    if (quantity > product.quantity) {
      setSnackbar({
        open: true,
        message: 'Selected quantity exceeds available stock',
        severity: 'error'
      });
      return;
    }

    // Get existing order items from localStorage
    const existingOrderItems = JSON.parse(localStorage.getItem('orderItems') || '[]') as OrderItem[];
    
    // Check if product already exists in order
    const existingItemIndex = existingOrderItems.findIndex(item => item.productId === product._id);
    
    if (existingItemIndex >= 0) {
      // Update existing item quantity
      existingOrderItems[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      existingOrderItems.push({
        productId: product._id,
        productName: product.name,
        quantity: quantity,
        price: product.price
      });
    }

    // Save updated order items
    localStorage.setItem('orderItems', JSON.stringify(existingOrderItems));
    
    setSnackbar({
      open: true,
      message: 'Product added to order',
      severity: 'success'
    });

    // Reset quantity
    setQuantities(prev => ({
      ...prev,
      [product._id]: 0
    }));

    // Navigate to orders page
    navigate('/branch/orders');
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/branch/dashboard' },
    { text: 'Products', icon: <InventoryIcon />, path: '/branch/products' },
    { text: 'Orders', icon: <ShoppingCartIcon />, path: '/branch/orders' },
    { text: 'Transactions', icon: <ReceiptIcon />, path: '/branch/transactions' },
    { text: 'Analytics', icon: <AnalyticsIcon />, path: '/branch/analytics' },
  ];

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Branch Portal
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text}
            onClick={() => handleNavigation(item.path)}
            selected={location.pathname === item.path}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem button onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </div>
  );

  const renderToolbar = () => (
    <Toolbar>
      <IconButton
        color="inherit"
        aria-label="open drawer"
        edge="start"
        onClick={handleDrawerToggle}
        sx={{ mr: 2, display: { sm: 'none' } }}
      >
        <MenuIcon />
      </IconButton>
      <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
        Branch Dashboard
      </Typography>
      <Button
        color="inherit"
        onClick={refreshProducts}
        startIcon={<RefreshIcon />}
      >
        Refresh Products
      </Button>
    </Toolbar>
  );

  const renderProductsTable = () => (
    <>
      <Typography variant="h4" gutterBottom>
        Branch Products
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">Available Quantity</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell align="center">Quantity</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products?.map((product) => (
              <TableRow key={product._id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.sku}</TableCell>
                <TableCell align="right">${product.price.toFixed(2)}</TableCell>
                <TableCell align="right">{product.quantity}</TableCell>
                <TableCell>{product.unit}</TableCell>
                <TableCell align="center">
                  <TextField
                    type="number"
                    size="small"
                    value={quantities[product._id] || 0}
                    onChange={(e) => handleQuantityChange(product._id, e.target.value)}
                    inputProps={{ min: 0, max: product.quantity }}
                    sx={{ width: '80px' }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddToCartIcon />}
                    onClick={() => handleAddToOrder(product)}
                    disabled={!quantities[product._id] || quantities[product._id] <= 0}
                  >
                    Add to Order
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">
          Error loading products: {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        {renderToolbar()}
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Routes>
          <Route path="/" element={<Navigate to="/branch/dashboard" replace />} />
          <Route path="/dashboard" element={renderProductsTable()} />
          <Route path="/products" element={renderProductsTable()} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default BranchDashboard; 