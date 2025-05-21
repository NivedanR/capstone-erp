import React, { useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Store as StoreIcon,
  LocalShipping as ShippingIcon,
} from '@mui/icons-material';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useApi } from '../../hooks/useApi';
import apiService from '../../services/api';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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

const AdminOverview: React.FC = () => {
  const {
    data: dashboardData,
    loading,
    error,
    execute: fetchDashboardData,
  } = useApi<{
    totalUsers: number;
    totalProducts: number;
    totalBranches: number;
    totalWarehouses: number;
    salesData: {
      labels: string[];
      datasets: {
        label: string;
        data: number[];
        borderColor: string;
        tension: number;
      }[];
    };
  }>();

  useEffect(() => {
    fetchDashboardData(apiService.getDashboardData);
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      
      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <OverviewCard
            title="Total Users"
            value={dashboardData?.totalUsers || 0}
            icon={<PeopleIcon />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <OverviewCard
            title="Total Products"
            value={dashboardData?.totalProducts || 0}
            icon={<InventoryIcon />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <OverviewCard
            title="Total Branches"
            value={dashboardData?.totalBranches || 0}
            icon={<StoreIcon />}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <OverviewCard
            title="Total Warehouses"
            value={dashboardData?.totalWarehouses || 0}
            icon={<ShippingIcon />}
            color="#9c27b0"
          />
        </Grid>
      </Grid>

      {/* Sales Overview Chart */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Sales Overview
        </Typography>
        <Box sx={{ height: 300 }}>
          {dashboardData?.salesData && (
            <Bar
              data={dashboardData.salesData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                          label += ': ';
                        }
                        if (context.parsed.y !== null) {
                          if (context.dataIndex === 0) {
                            label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
                          } else if (context.dataIndex === 2) {
                            label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
                          } else {
                            label += context.parsed.y;
                          }
                        }
                        return label;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        if (typeof value === 'number') {
                          return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
                        }
                        return value;
                      }
                    }
                  }
                }
              }}
            />
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default AdminOverview; 