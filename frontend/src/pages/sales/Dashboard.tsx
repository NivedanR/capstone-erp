import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  ShoppingCart as CartIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Overview Card Component
const OverviewCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, icon, color }) => (
  <Paper
    sx={{
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      height: 140,
    }}
  >
    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <Typography color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Box sx={{ color }}>{icon}</Box>
    </Box>
    <Typography component="p" variant="h4">
      {value}
    </Typography>
  </Paper>
);

// Sales Data
const salesData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Sales',
      data: [12000, 19000, 15000, 25000, 22000, 30000],
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1,
    },
  ],
};

// Product Category Distribution
const categoryData = {
  labels: ['Shirts', 'Pants', 'Accessories', 'Shoes'],
  datasets: [
    {
      data: [40, 30, 20, 10],
      backgroundColor: [
        'rgba(255, 99, 132, 0.5)',
        'rgba(54, 162, 235, 0.5)',
        'rgba(255, 206, 86, 0.5)',
        'rgba(75, 192, 192, 0.5)',
      ],
    },
  ],
};

// Recent Orders
const recentOrders = [
  {
    id: 1,
    customer: 'John Doe',
    products: ['Shirt', 'Pants'],
    total: 199.98,
    status: 'completed',
    date: '2024-02-20',
  },
  {
    id: 2,
    customer: 'Jane Smith',
    products: ['Shoes', 'Accessories'],
    total: 299.99,
    status: 'processing',
    date: '2024-02-20',
  },
  {
    id: 3,
    customer: 'Mike Johnson',
    products: ['Shirt'],
    total: 49.99,
    status: 'pending',
    date: '2024-02-19',
  },
];

// Top Customers
const topCustomers = [
  { id: 1, name: 'John Doe', totalSpent: 1500, orders: 5 },
  { id: 2, name: 'Jane Smith', totalSpent: 1200, orders: 4 },
  { id: 3, name: 'Mike Johnson', totalSpent: 900, orders: 3 },
];

const SalesDashboard: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [status, setStatus] = useState('');

  const handleUpdateStatus = (order: any) => {
    setSelectedOrder(order);
    setStatus(order.status);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedOrder(null);
    setStatus('');
  };

  const handleConfirmStatus = () => {
    // TODO: Implement API call to update order status
    handleCloseDialog();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'warning';
      case 'pending':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Box>
            <Typography variant="h4" gutterBottom>
              Sales Dashboard
            </Typography>
            
            {/* Overview Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <OverviewCard
                  title="Today's Sales"
                  value="$1,234"
                  icon={<MoneyIcon />}
                  color="#2e7d32"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <OverviewCard
                  title="Total Customers"
                  value="150"
                  icon={<PeopleIcon />}
                  color="#1976d2"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <OverviewCard
                  title="Pending Orders"
                  value="8"
                  icon={<CartIcon />}
                  color="#ed6c02"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <OverviewCard
                  title="Sales Growth"
                  value="+15%"
                  icon={<TrendingUpIcon />}
                  color="#9c27b0"
                />
              </Grid>
            </Grid>

            {/* Sales Charts */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Sales Trend
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <Line
                      data={salesData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top' as const,
                          },
                        },
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Product Categories
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <Doughnut
                      data={categoryData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom' as const,
                          },
                        },
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>
            </Grid>

            {/* Recent Orders and Top Customers */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Recent Orders
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Customer</TableCell>
                          <TableCell>Products</TableCell>
                          <TableCell>Total</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {recentOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell>{order.customer}</TableCell>
                            <TableCell>{order.products.join(', ')}</TableCell>
                            <TableCell>${order.total}</TableCell>
                            <TableCell>{order.date}</TableCell>
                            <TableCell>
                              <Chip
                                label={order.status}
                                color={getStatusColor(order.status) as any}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleUpdateStatus(order)}
                              >
                                Update Status
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Top Customers
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Customer</TableCell>
                          <TableCell>Orders</TableCell>
                          <TableCell>Total Spent</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {topCustomers.map((customer) => (
                          <TableRow key={customer.id}>
                            <TableCell>{customer.name}</TableCell>
                            <TableCell>{customer.orders}</TableCell>
                            <TableCell>${customer.totalSpent}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            </Grid>

            {/* Status Update Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog}>
              <DialogTitle>Update Order Status</DialogTitle>
              <DialogContent>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body1" gutterBottom>
                    Order ID: {selectedOrder?.id}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    Customer: {selectedOrder?.customer}
                  </Typography>
                  <TextField
                    fullWidth
                    select
                    label="Status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    margin="normal"
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="processing">Processing</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                  </TextField>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>Cancel</Button>
                <Button onClick={handleConfirmStatus} variant="contained">
                  Update
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        }
      />
      {/* Add more routes for other sales pages */}
    </Routes>
  );
};

export default SalesDashboard; 