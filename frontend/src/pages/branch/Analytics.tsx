import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  Inventory,
  LocalShipping,
  AttachMoney,
  Info as InfoIcon,
  CalendarToday,
  LocationOn,
  Business,
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import apiService from '../../services/api';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend
);

interface Transaction {
  _id: string;
  branchId: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    warehouseId?: string;
  }[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface Branch {
  _id: string;
  name: string;
  location: string;
  managerId: string;
  warehouseId: string;
  createdAt: string;
}

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [branchDetails, setBranchDetails] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const branchId = localStorage.getItem('branchId');
        if (!branchId) return;

        // Load branch details from API
        const branches = await apiService.getBranches();
        const branch = branches.find((b: Branch) => b._id === branchId);
        setBranchDetails(branch);

        // Load transactions
        const storedTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const branchTransactions = storedTransactions.filter(
          (t: Transaction) => t.branchId === branchId
        );
        setTransactions(branchTransactions);
      } catch (error) {
        console.error('Error loading analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getFilteredTransactions = () => {
    const now = new Date();
    const filtered = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.createdAt);
      switch (timeRange) {
        case 'week':
          return now.getTime() - transactionDate.getTime() <= 7 * 24 * 60 * 60 * 1000;
        case 'month':
          return now.getTime() - transactionDate.getTime() <= 30 * 24 * 60 * 60 * 1000;
        case 'year':
          return now.getTime() - transactionDate.getTime() <= 365 * 24 * 60 * 60 * 1000;
        default:
          return true;
      }
    });
    return filtered;
  };

  const calculateStats = () => {
    const filteredTransactions = getFilteredTransactions();
    const totalSales = filteredTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
    const totalOrders = filteredTransactions.length;
    const totalItems = filteredTransactions.reduce((sum, t) => 
      sum + t.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    );

    // Get unique warehouses from branch details and transactions
    const warehouses = new Set<string>();
    
    // Add branch's warehouse
    if (branchDetails?.warehouseId) {
      warehouses.add(branchDetails.warehouseId);
    }

    // Add warehouses from transactions
    filteredTransactions.forEach(transaction => {
      transaction.items.forEach(item => {
        if (item.warehouseId) {
          warehouses.add(item.warehouseId);
        }
      });
    });

    const uniqueWarehouses = warehouses.size;

    // Calculate average order value
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Calculate most common warehouse
    const warehouseCounts = filteredTransactions.reduce((acc: Record<string, number>, transaction) => {
      transaction.items.forEach(item => {
        const warehouseId = item.warehouseId || 'Unknown';
        acc[warehouseId] = (acc[warehouseId] || 0) + item.quantity;
      });
      return acc;
    }, {});

    const mostCommonWarehouse = Object.entries(warehouseCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    // Calculate sales by date for trend analysis
    const salesByDate = filteredTransactions.reduce((acc: Record<string, number>, transaction) => {
      const date = new Date(transaction.createdAt).toLocaleDateString();
      acc[date] = (acc[date] || 0) + transaction.totalAmount;
      return acc;
    }, {});

    // Calculate top products
    const productSales = filteredTransactions.reduce((acc: Record<string, { quantity: number; revenue: number }>, transaction) => {
      transaction.items.forEach(item => {
        if (!acc[item.productName]) {
          acc[item.productName] = { quantity: 0, revenue: 0 };
        }
        acc[item.productName].quantity += item.quantity;
        acc[item.productName].revenue += item.price * item.quantity;
      });
      return acc;
    }, {});

    const topProducts = Object.entries(productSales)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 5);

    return {
      totalSales,
      totalOrders,
      totalItems,
      uniqueWarehouses,
      averageOrderValue,
      mostCommonWarehouse,
      salesByDate,
      topProducts,
      warehouseCounts
    };
  };

  const stats = calculateStats();

  // Prepare chart data
  const salesTrendData = {
    labels: Object.keys(stats.salesByDate),
    datasets: [
      {
        label: 'Daily Sales',
        data: Object.values(stats.salesByDate),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1,
      },
    ],
  };

  const warehouseDistributionData = {
    labels: Object.keys(stats.warehouseCounts),
    datasets: [
      {
        data: Object.values(stats.warehouseCounts),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const topProductsData = {
    labels: stats.topProducts.map(([product]) => product),
    datasets: [
      {
        label: 'Revenue',
        data: stats.topProducts.map(([, data]) => data.revenue),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Branch Analytics
      </Typography>

      {/* Branch Details */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <Business sx={{ mr: 1 }} />
          Branch Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Business sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="subtitle1">Branch Name</Typography>
            </Box>
            <Typography variant="body1" sx={{ pl: 4 }}>
              {branchDetails?.name || 'Loading...'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationOn sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="subtitle1">Location</Typography>
            </Box>
            <Typography variant="body1" sx={{ pl: 4 }}>
              {branchDetails?.location || 'Loading...'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocalShipping sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="subtitle1">Warehouse ID</Typography>
            </Box>
            <Typography variant="body1" sx={{ pl: 4 }}>
              {branchDetails?.warehouseId || 'Loading...'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Time Range Selector */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <CalendarToday sx={{ mr: 1, color: 'primary.main' }} />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <MenuItem value="week">Last Week</MenuItem>
            <MenuItem value="month">Last Month</MenuItem>
            <MenuItem value="year">Last Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AttachMoney sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6">Total Sales</Typography>
                <Tooltip title="Total revenue from all transactions">
                  <IconButton size="small">
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography variant="h4" color="success.main">
                ${stats.totalSales.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Average Order: ${stats.averageOrderValue.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Total Orders</Typography>
                <Tooltip title="Number of completed transactions">
                  <IconButton size="small">
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography variant="h4" color="primary.main">
                {stats.totalOrders}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {timeRange === 'week' ? 'This Week' : timeRange === 'month' ? 'This Month' : 'This Year'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Inventory sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="h6">Items Sold</Typography>
                <Tooltip title="Total quantity of items sold">
                  <IconButton size="small">
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography variant="h4" color="warning.main">
                {stats.totalItems}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Across {stats.uniqueWarehouses} Warehouses
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocalShipping sx={{ mr: 1, color: 'info.main' }} />
                <Typography variant="h6">Warehouses</Typography>
                <Tooltip title="Number of unique warehouses supplying products">
                  <IconButton size="small">
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography variant="h4" color="info.main">
                {stats.uniqueWarehouses}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Most Active: {stats.mostCommonWarehouse}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Sales Trend Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Sales Trend
            </Typography>
            <Box sx={{ height: 300 }}>
              <Line
                data={salesTrendData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                    title: {
                      display: true,
                      text: 'Daily Sales Trend',
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (value) => `$${value}`,
                      },
                    },
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Warehouse Distribution Chart */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Warehouse Distribution
            </Typography>
            <Box sx={{ height: 300 }}>
              <Pie
                data={warehouseDistributionData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right' as const,
                    },
                    title: {
                      display: true,
                      text: 'Items by Warehouse',
                    },
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Top Products Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Top Products Revenue
            </Typography>
            <Box sx={{ height: 300 }}>
              <Bar
                data={topProductsData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                    title: {
                      display: true,
                      text: 'Top Products by Revenue',
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (value) => `$${value}`,
                      },
                    },
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Top Products Table */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Top Products
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell align="right">Quantity Sold</TableCell>
                <TableCell align="right">Revenue</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stats.topProducts.map(([product, data]) => (
                <TableRow key={product}>
                  <TableCell>{product}</TableCell>
                  <TableCell align="right">{data.quantity}</TableCell>
                  <TableCell align="right">${data.revenue.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Recent Transactions */}
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <TrendingUp sx={{ mr: 1 }} />
        Recent Transactions
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Items</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getFilteredTransactions().slice(0, 5).map((transaction) => (
              <TableRow 
                key={transaction._id}
                hover
                onClick={() => setSelectedTransaction(transaction)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>
                  {new Date(transaction.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {transaction.items.map((item) => (
                    <Typography key={`${transaction._id}-${item.productId}`}>
                      {item.productName} x {item.quantity}
                    </Typography>
                  ))}
                </TableCell>
                <TableCell align="right">
                  ${transaction.totalAmount.toFixed(2)}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={transaction.status}
                    color={transaction.status === 'completed' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Transaction Details Dialog */}
      {selectedTransaction && (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Transaction Details
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2">Date</Typography>
              <Typography variant="body1">
                {new Date(selectedTransaction.createdAt).toLocaleString()}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2">Total Amount</Typography>
              <Typography variant="body1">
                ${selectedTransaction.totalAmount.toFixed(2)}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2">Items</Typography>
              {selectedTransaction.items.map((item) => (
                <Box key={item.productId} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">
                    {item.productName} x {item.quantity}
                  </Typography>
                  <Typography variant="body1">
                    ${(item.price * item.quantity).toFixed(2)}
                  </Typography>
                </Box>
              ))}
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default Analytics; 