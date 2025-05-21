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
  Alert,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  LocalShipping as ShippingIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
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

// Inventory Data
const inventoryData = {
  labels: ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'],
  datasets: [
    {
      label: 'Current Stock',
      data: [500, 300, 200, 400, 250],
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
    },
  ],
};

// Stock Requests
const stockRequests = [
  { id: 1, branch: 'Branch A', product: 'Product X', quantity: 50, status: 'pending', date: '2024-02-20' },
  { id: 2, branch: 'Branch B', product: 'Product Y', quantity: 75, status: 'approved', date: '2024-02-19' },
  { id: 3, branch: 'Branch C', product: 'Product Z', quantity: 100, status: 'pending', date: '2024-02-18' },
];

// Low Stock Items
const lowStockItems = [
  { id: 1, product: 'Product A', currentStock: 10, threshold: 50 },
  { id: 2, product: 'Product B', currentStock: 5, threshold: 30 },
  { id: 3, product: 'Product C', currentStock: 15, threshold: 40 },
];

const WarehouseDashboard: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [quantity, setQuantity] = useState('');

  const handleApproveRequest = (request: any) => {
    setSelectedRequest(request);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRequest(null);
    setQuantity('');
  };

  const handleConfirmApproval = () => {
    // TODO: Implement API call to approve request
    handleCloseDialog();
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Box>
            <Typography variant="h4" gutterBottom>
              Warehouse Dashboard
            </Typography>
            
            {/* Overview Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <OverviewCard
                  title="Total Products"
                  value="250"
                  icon={<InventoryIcon />}
                  color="#2e7d32"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <OverviewCard
                  title="Pending Requests"
                  value="5"
                  icon={<ShippingIcon />}
                  color="#ed6c02"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <OverviewCard
                  title="Low Stock Items"
                  value="3"
                  icon={<WarningIcon />}
                  color="#d32f2f"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <OverviewCard
                  title="Completed Orders"
                  value="45"
                  icon={<CheckCircleIcon />}
                  color="#1976d2"
                />
              </Grid>
            </Grid>

            {/* Inventory Chart */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Inventory Overview
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <Bar
                      data={inventoryData}
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
                    Low Stock Alerts
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Product</TableCell>
                          <TableCell>Current Stock</TableCell>
                          <TableCell>Threshold</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {lowStockItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.product}</TableCell>
                            <TableCell>{item.currentStock}</TableCell>
                            <TableCell>{item.threshold}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            </Grid>

            {/* Stock Requests */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Stock Requests
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Branch</TableCell>
                      <TableCell>Product</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stockRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>{request.branch}</TableCell>
                        <TableCell>{request.product}</TableCell>
                        <TableCell>{request.quantity}</TableCell>
                        <TableCell>{request.date}</TableCell>
                        <TableCell>{request.status}</TableCell>
                        <TableCell>
                          {request.status === 'pending' && (
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => handleApproveRequest(request)}
                            >
                              Approve
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* Approval Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog}>
              <DialogTitle>Approve Stock Request</DialogTitle>
              <DialogContent>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body1" gutterBottom>
                    Branch: {selectedRequest?.branch}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    Product: {selectedRequest?.product}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    Requested Quantity: {selectedRequest?.quantity}
                  </Typography>
                  <TextField
                    fullWidth
                    label="Approved Quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    margin="normal"
                  />
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>Cancel</Button>
                <Button onClick={handleConfirmApproval} variant="contained">
                  Approve
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        }
      />
      {/* Add more routes for other warehouse pages */}
    </Routes>
  );
};

export default WarehouseDashboard; 