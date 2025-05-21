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
  CircularProgress,
} from '@mui/material';
import { useApi } from '../../hooks/useApi';
import apiService from '../../services/api';

interface Transaction {
  _id: string;
  branchId: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

const Transactions: React.FC = () => {
  const {
    data: transactions,
    loading,
    error,
    execute: fetchTransactions,
  } = useApi<Transaction[]>();

  useEffect(() => {
    const loadTransactions = async () => {
      const branchId = localStorage.getItem('branchId');
      if (branchId) {
        // Load transactions from localStorage
        const storedTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        // Filter transactions for current branch
        const branchTransactions = storedTransactions.filter(
          (t: Transaction) => t.branchId === branchId
        );
        fetchTransactions(() => Promise.resolve(branchTransactions));
      }
    };

    loadTransactions();
  }, [fetchTransactions]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">
          Error loading transactions: {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Transaction History
      </Typography>

      {transactions?.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            No transactions found
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Items</TableCell>
                <TableCell align="right">Total Amount</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions?.map((transaction) => (
                <TableRow key={transaction._id}>
                  <TableCell>
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {transaction.items.map((item) => (
                      <Typography key={item.productId}>
                        {item.productName} x {item.quantity}
                      </Typography>
                    ))}
                  </TableCell>
                  <TableCell align="right">
                    ${transaction.totalAmount.toFixed(2)}
                  </TableCell>
                  <TableCell>{transaction.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default Transactions; 