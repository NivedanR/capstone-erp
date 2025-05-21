import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { useApi } from '../../hooks/useApi';
import apiService from '../../services/api';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface SalesData {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  salesByCategory: Record<string, number>;
  salesByDate: Record<string, number>;
  productWiseSales: Array<{
    productId: string;
    productName: string;
    totalQuantity: number;
    totalRevenue: number;
  }>;
}

interface WarehouseData {
  _id: string;
  name: string;
  totalSales: number;
  totalOrders: number;
}

interface BranchData {
  _id: string;
  name: string;
  totalSales: number;
  totalOrders: number;
}

const SalesManagement: React.FC = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [warehouseData, setWarehouseData] = useState<WarehouseData[]>([]);
  const [branchData, setBranchData] = useState<BranchData[]>([]);

  const {
    data: sales,
    loading: salesLoading,
    error: salesError,
    execute: fetchSales,
  } = useApi<SalesData>();

  const {
    data: warehouses,
    loading: warehousesLoading,
    error: warehousesError,
    execute: fetchWarehouses,
  } = useApi<WarehouseData[]>();

  const {
    data: branches,
    loading: branchesLoading,
    error: branchesError,
    execute: fetchBranches,
  } = useApi<BranchData[]>();

  useEffect(() => {
    fetchSales(() => apiService.getSalesAnalytics(timeRange));
    fetchWarehouses(apiService.getWarehouses);
    fetchBranches(apiService.getBranches);
  }, [timeRange, fetchSales, fetchWarehouses, fetchBranches]);

  if (salesLoading || warehousesLoading || branchesLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Prepare chart data
  const salesChartData = {
    labels: Object.keys(sales?.salesByDate || {}),
    datasets: [
      {
        label: 'Sales',
        data: Object.values(sales?.salesByDate || {}),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const categoryChartData = {
    labels: Object.keys(sales?.salesByCategory || {}),
    datasets: [
      {
        data: Object.values(sales?.salesByCategory || {}),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
          'rgba(255, 159, 64, 0.5)',
        ],
      },
    ],
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Sales Management</Typography>
        <FormControl sx={{ minWidth: 120 }}>
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

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Sales
              </Typography>
              <Typography variant="h4">
                ${(sales?.totalSales || 0).toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Orders
              </Typography>
              <Typography variant="h4">
                {sales?.totalOrders || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average Order Value
              </Typography>
              <Typography variant="h4">
                ${(sales?.averageOrderValue || 0).toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Sales Trend
            </Typography>
            <Box sx={{ height: 300 }}>
              <Line
                data={salesChartData}
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
              Sales by Category
            </Typography>
            <Box sx={{ height: 300 }}>
              <Doughnut
                data={categoryChartData}
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

      {/* Warehouse Performance */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Warehouse Performance
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Warehouse</TableCell>
                <TableCell align="right">Total Sales</TableCell>
                <TableCell align="right">Total Orders</TableCell>
                <TableCell align="right">Average Order Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {warehouses?.map((warehouse) => (
                <TableRow key={warehouse._id}>
                  <TableCell>{warehouse.name}</TableCell>
                  <TableCell align="right">${(warehouse.totalSales || 0).toFixed(2)}</TableCell>
                  <TableCell align="right">{warehouse.totalOrders || 0}</TableCell>
                  <TableCell align="right">
                    ${((warehouse.totalSales || 0) / (warehouse.totalOrders || 1)).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Branch Performance */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Branch Performance
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Branch</TableCell>
                <TableCell align="right">Total Sales</TableCell>
                <TableCell align="right">Total Orders</TableCell>
                <TableCell align="right">Average Order Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {branches?.map((branch) => (
                <TableRow key={branch._id}>
                  <TableCell>{branch.name}</TableCell>
                  <TableCell align="right">${(branch.totalSales || 0).toFixed(2)}</TableCell>
                  <TableCell align="right">{branch.totalOrders || 0}</TableCell>
                  <TableCell align="right">
                    ${((branch.totalSales || 0) / (branch.totalOrders || 1)).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Top Products */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Top Products
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell align="right">Total Quantity Sold</TableCell>
                <TableCell align="right">Total Revenue</TableCell>
                <TableCell align="right">Average Price</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sales?.productWiseSales.map((product) => (
                <TableRow key={product.productId}>
                  <TableCell>{product.productName}</TableCell>
                  <TableCell align="right">{product.totalQuantity || 0}</TableCell>
                  <TableCell align="right">${(product.totalRevenue || 0).toFixed(2)}</TableCell>
                  <TableCell align="right">
                    ${((product.totalRevenue || 0) / (product.totalQuantity || 1)).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default SalesManagement; 