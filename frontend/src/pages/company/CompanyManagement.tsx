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
  IconButton,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useApi } from '../../hooks/useApi';
import apiService from '../../services/api';

interface Company {
  _id: string;
  name: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  status: 'Active' | 'Inactive';
  registeredAt: string;
}

interface CompanyFormData {
  name: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  status: 'Active' | 'Inactive';
}

const CompanyManagement: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState<CompanyFormData>({
    name: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    status: 'Active',
  });

  const {
    data: companies,
    loading,
    error,
    execute: fetchCompanies,
  } = useApi<Company[]>();

  const {
    execute: createCompany,
    loading: creating,
    error: createError,
  } = useApi<Company>();

  const {
    execute: updateCompany,
    loading: updating,
    error: updateError,
  } = useApi<Company>();

  const {
    execute: deleteCompany,
    loading: deleting,
    error: deleteError,
  } = useApi<void>();

  useEffect(() => {
    fetchCompanies(apiService.getCompanies);
  }, [fetchCompanies]);

  const handleOpenDialog = (company?: Company) => {
    setSelectedCompany(company || null);
    setFormData({
      name: company?.name || '',
      contactPerson: company?.contactPerson || '',
      contactEmail: company?.contactEmail || '',
      contactPhone: company?.contactPhone || '',
      address: company?.address || '',
      status: company?.status || 'Active',
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCompany(null);
    setFormData({
      name: '',
      contactPerson: '',
      contactEmail: '',
      contactPhone: '',
      address: '',
      status: 'Active',
    });
  };

  const handleSubmit = async () => {
    try {
      if (selectedCompany) {
        await updateCompany(apiService.updateCompany, selectedCompany._id, formData);
      } else {
        await createCompany(apiService.createCompany, formData);
      }
      handleCloseDialog();
      fetchCompanies(apiService.getCompanies);
    } catch (error) {
      console.error('Error submitting company:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      try {
        await deleteCompany(apiService.deleteCompany, id);
        fetchCompanies(apiService.getCompanies);
      } catch (error) {
        console.error('Error deleting company:', error);
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
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Company Management</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
        >
          Add Company
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
              <TableCell>Name</TableCell>
              <TableCell>Contact Person</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {companies?.map((company) => (
              <TableRow key={company._id}>
                <TableCell>{company.name}</TableCell>
                <TableCell>{company.contactPerson}</TableCell>
                <TableCell>{company.contactEmail}</TableCell>
                <TableCell>{company.contactPhone}</TableCell>
                <TableCell>{company.status}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenDialog(company)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(company._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedCompany ? 'Edit Company' : 'Add New Company'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Person"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                multiline
                rows={3}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })}
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={creating || updating}
          >
            {creating || updating ? (
              <CircularProgress size={24} />
            ) : selectedCompany ? (
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

export default CompanyManagement; 