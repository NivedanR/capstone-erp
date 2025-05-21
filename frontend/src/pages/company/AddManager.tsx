import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import { useApi } from '../../hooks/useApi';
import apiService from '../../services/api';

interface ManagerFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const AddManager: React.FC = () => {
  const [formData, setFormData] = useState<ManagerFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const {
    execute: registerManager,
    loading,
    error,
  } = useApi();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registerManager(apiService.register, {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: 'warehouse-manager'
      });
      // Clear form after successful registration
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Error registering manager:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Add Warehouse Manager
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                error={!formData.username}
                helperText={!formData.username ? 'Username is required' : ''}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                error={!formData.email}
                helperText={!formData.email ? 'Email is required' : ''}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                error={!formData.password}
                helperText={!formData.password ? 'Password is required' : ''}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                error={!formData.confirmPassword || formData.password !== formData.confirmPassword}
                helperText={
                  !formData.confirmPassword
                    ? 'Please confirm your password'
                    : formData.password !== formData.confirmPassword
                    ? 'Passwords do not match'
                    : ''
                }
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading || !formData.username || !formData.email || !formData.password || !formData.confirmPassword || formData.password !== formData.confirmPassword}
              >
                {loading ? <CircularProgress size={24} /> : 'Add Manager'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default AddManager; 