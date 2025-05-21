import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import ProductManagement from './pages/admin/ProductManagement';
import Management from './pages/admin/Reports';
import CompanyDashboard from './pages/company/Dashboard';
import CompanyManagement from './pages/company/CompanyManagement';
import WarehouseDashboard from './pages/warehouse/Dashboard';
import BranchDashboard from './pages/branch/Dashboard';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import AdminOverview from './pages/admin/Overview';
import BranchManagement from './pages/company/BranchManagement';
import WarehouseManagement from './pages/company/WarehouseManagement';

// Protected Route component
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) => {
  const { token, user } = useSelector((state: RootState) => state.auth);
  
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Public Route component (redirects authenticated users)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { token, user } = useSelector((state: RootState) => state.auth);
  
  if (token && user) {
    // Redirect based on role
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'company':
        return <Navigate to="/company" replace />;
      case 'warehouse-manager':
        return <Navigate to="/warehouse" replace />;
      case 'branch-manager':
        return <Navigate to="/branch" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<AdminOverview />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="reports" element={<Management />} />
          </Route>

          {/* Company Routes */}
          <Route path="/company/*" element={
            <ProtectedRoute allowedRoles={['company']}>
              <CompanyDashboard />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<CompanyManagement />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="branches" element={<BranchManagement />} />
            <Route path="warehouses" element={<WarehouseManagement />} />
            <Route path="sales" element={<div>Sales Management</div>} />
          </Route>

          {/* Warehouse Routes */}
          <Route path="/warehouse/*" element={
            <ProtectedRoute allowedRoles={['warehouse-manager']}>
              <WarehouseDashboard />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<WarehouseDashboard />} />
          </Route>

          {/* Branch Routes */}
          <Route path="/branch/*" element={<BranchDashboard />} />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
