import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  TextField,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

const Orders: React.FC = () => {
  const navigate = useNavigate();
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    // Load order items from localStorage
    const storedItems = JSON.parse(localStorage.getItem('orderItems') || '[]') as OrderItem[];
    setOrderItems(storedItems);
  }, []);

  const handleQuantityChange = (productId: string, change: number) => {
    setOrderItems(prevItems => {
      const newItems = prevItems.map(item => {
        if (item.productId === productId) {
          const newQuantity = Math.max(0, item.quantity + change);
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(item => item.quantity > 0);

      // Update localStorage
      localStorage.setItem('orderItems', JSON.stringify(newItems));
      return newItems;
    });
  };

  const handleRemoveItem = (productId: string) => {
    setOrderItems(prevItems => {
      const newItems = prevItems.filter(item => item.productId !== productId);
      localStorage.setItem('orderItems', JSON.stringify(newItems));
      return newItems;
    });
  };

  const handlePlaceOrder = async () => {
    if (orderItems.length === 0) {
      setSnackbar({
        open: true,
        message: 'Please add items to your order',
        severity: 'error'
      });
      return;
    }

    try {
      const branchId = localStorage.getItem('branchId');
      if (!branchId) {
        throw new Error('Branch ID not found');
      }

      // Create transaction record
      const transaction = {
        _id: Date.now().toString(), // Temporary ID generation
        branchId,
        items: orderItems,
        totalAmount: calculateTotal(),
        status: 'completed',
        createdAt: new Date().toISOString()
      };

      // Store transaction in localStorage
      const storedTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
      storedTransactions.push(transaction);
      localStorage.setItem('transactions', JSON.stringify(storedTransactions));

      // Update product quantities in localStorage
      const storedProducts = JSON.parse(localStorage.getItem('branchProducts') || '[]');
      const updatedProducts = storedProducts.map((product: any) => {
        const orderItem = orderItems.find(item => item.productId === product._id);
        if (orderItem) {
          return {
            ...product,
            quantity: Math.max(0, product.quantity - orderItem.quantity)
          };
        }
        return product;
      });

      // Update products in localStorage and trigger storage event
      localStorage.setItem('branchProducts', JSON.stringify(updatedProducts));
      // Manually dispatch storage event since localStorage.setItem doesn't trigger it in the same window
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'branchProducts',
        newValue: JSON.stringify(updatedProducts),
        storageArea: localStorage
      }));

      // Clear order items after successful order placement
      localStorage.removeItem('orderItems');
      setOrderItems([]);

      setSnackbar({
        open: true,
        message: 'Order placed successfully',
        severity: 'success'
      });

      // Navigate to transactions page
      navigate('/branch/transactions');
    } catch (error) {
      console.error('Error placing order:', error);
      setSnackbar({
        open: true,
        message: 'Failed to place order. Please try again.',
        severity: 'error'
      });
    }
  };

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Current Order
      </Typography>

      {orderItems.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            No items in your order
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/branch/products')}
            sx={{ mt: 2 }}
          >
            Add Products
          </Button>
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="center">Quantity</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orderItems.map((item) => (
                  <TableRow key={item.productId}>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell align="right">${item.price.toFixed(2)}</TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IconButton
                          size="small"
                          onClick={() => handleQuantityChange(item.productId, -1)}
                        >
                          <RemoveIcon />
                        </IconButton>
                        <TextField
                          value={item.quantity}
                          size="small"
                          sx={{ width: '60px', mx: 1 }}
                          inputProps={{ readOnly: true }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleQuantityChange(item.productId, 1)}
                        >
                          <AddIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      ${(item.price * item.quantity).toFixed(2)}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveItem(item.productId)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} align="right">
                    <Typography variant="h6">Total:</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="h6">${calculateTotal().toFixed(2)}</Typography>
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/branch/products')}
            >
              Add More Products
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handlePlaceOrder}
            >
              Place Order
            </Button>
          </Box>
        </>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Orders; 