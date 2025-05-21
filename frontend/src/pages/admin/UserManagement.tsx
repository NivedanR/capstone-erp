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
  MenuItem,
  IconButton,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useApi } from '../../hooks/useApi';
import apiService from '../../services/api';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  status?: string;
}

const roles = [
  'admin',
  'company',
  'warehouse-manager',
  'branch-manager',
  'sales',
];

const UserManagement: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: '',
  });

  const {
    data: users,
    loading,
    error,
    execute: fetchUsers,
  } = useApi<User[]>();

  const {
    execute: createUser,
    loading: creating,
    error: createError,
  } = useApi<User>();

  const {
    execute: updateUser,
    loading: updating,
    error: updateError,
  } = useApi<User>();

  const {
    execute: deleteUser,
    loading: deleting,
    error: deleteError,
  } = useApi<void>();

  useEffect(() => {
    console.log('[UserManagement] Component mounted, fetching users...');
    fetchUsers(apiService.getUsers);
  }, [fetchUsers]);

  const handleOpenDialog = (user?: User) => {
    console.log('[UserManagement] Opening dialog for user:', user);
    setSelectedUser(user || null);
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
      password: '', // Always empty for existing users
      role: user?.role || '',
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    console.log('[UserManagement] Closing dialog');
    setOpenDialog(false);
    setSelectedUser(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      role: '',
    });
  };

  const handleSubmit = async () => {
    try {
      console.log('[UserManagement] Submitting form:', {
        isEdit: !!selectedUser,
        formData,
      });

      const userData = {
        ...formData,
        // Only include password if it's a new user or if it's been changed
        ...(selectedUser ? {} : { password: formData.password }),
      };

      if (selectedUser) {
        await updateUser(apiService.updateUser, selectedUser.id, userData);
      } else {
        await createUser(apiService.createUser, userData);
      }

      console.log('[UserManagement] User saved successfully');
      handleCloseDialog();
      fetchUsers(apiService.getUsers);
    } catch (error) {
      console.error('[UserManagement] Error submitting user:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        console.log('[UserManagement] Deleting user:', id);
        await deleteUser(apiService.deleteUser, id);
        console.log('[UserManagement] User deleted successfully');
        fetchUsers(apiService.getUsers);
      } catch (error) {
        console.error('[UserManagement] Error deleting user:', error);
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">User Management</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
        >
          Add User
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.status || 'Active'}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenDialog(user)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(user.id)}
                    disabled={deleting}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedUser ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {(createError || updateError) && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {createError || updateError}
              </Alert>
            )}
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  error={!!createError || !!updateError}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  error={!!createError || !!updateError}
                />
              </Grid>
              {!selectedUser && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    error={!!createError || !!updateError}
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Role"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  error={!!createError || !!updateError}
                >
                  {roles.map((role) => (
                    <MenuItem key={role} value={role}>
                      {role}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={creating || updating}
          >
            {creating || updating ? (
              <CircularProgress size={24} />
            ) : selectedUser ? (
              'Update'
            ) : (
              'Create'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement; 