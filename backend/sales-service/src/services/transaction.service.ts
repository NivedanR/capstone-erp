import { ITransaction } from '../models/transaction.model';
import Transaction from '../models/transaction.model';

export class TransactionService {
  // Create a new transaction
  async createTransaction(transactionData: Partial<ITransaction>): Promise<ITransaction> {
    try {
      const transaction = new Transaction(transactionData);
      return await transaction.save();
    } catch (error: any) {
      throw new Error(`Error creating transaction: ${error.message}`);
    }
  }

  // Get all transactions with pagination and filters
  async getTransactions(
    page: number = 1,
    limit: number = 10,
    filters: any = {}
  ): Promise<{ transactions: ITransaction[]; total: number }> {
    try {
      const skip = (page - 1) * limit;
      const transactions = await Transaction.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      const total = await Transaction.countDocuments(filters);
      
      return { transactions, total };
    } catch (error: any) {
      throw new Error(`Error fetching transactions: ${error.message}`);
    }
  }

  // Get transaction by ID
  async getTransactionById(id: string): Promise<ITransaction> {
    try {
      const transaction = await Transaction.findById(id);
      if (!transaction) {
        throw new Error('Transaction not found');
      }
      return transaction;
    } catch (error: any) {
      throw new Error(`Error fetching transaction: ${error.message}`);
    }
  }

  // Get transactions by customer ID
  async getTransactionsByCustomerId(
    customerId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ transactions: ITransaction[]; total: number }> {
    try {
      const skip = (page - 1) * limit;
      const transactions = await Transaction.find({ customerId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      const total = await Transaction.countDocuments({ customerId });
      
      return { transactions, total };
    } catch (error: any) {
      throw new Error(`Error fetching customer transactions: ${error.message}`);
    }
  }

  // Get transactions by branch ID
  async getTransactionsByBranchId(
    branchId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ transactions: ITransaction[]; total: number }> {
    try {
      const skip = (page - 1) * limit;
      const transactions = await Transaction.find({ branchId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      const total = await Transaction.countDocuments({ branchId });
      
      return { transactions, total };
    } catch (error: any) {
      throw new Error(`Error fetching branch transactions: ${error.message}`);
    }
  }

  // Update transaction status
  async updateTransactionStatus(
    id: string,
    status: 'pending' | 'completed' | 'cancelled' | 'refunded'
  ): Promise<ITransaction> {
    try {
      const transaction = await Transaction.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );
      
      if (!transaction) {
        throw new Error('Transaction not found');
      }
      
      return transaction;
    } catch (error: any) {
      throw new Error(`Error updating transaction status: ${error.message}`);
    }
  }

  // Get sales statistics
  async getSalesStatistics(
    startDate: Date,
    endDate: Date,
    branchId?: string
  ): Promise<{
    totalSales: number;
    totalTransactions: number;
    averageTransactionValue: number;
  }> {
    try {
      const query: any = {
        createdAt: { $gte: startDate, $lte: endDate },
        status: 'completed'
      };

      if (branchId) {
        query.branchId = branchId;
      }

      const transactions = await Transaction.find(query);
      
      const totalSales = transactions.reduce((sum, t) => sum + t.totalAmount, 0);
      const totalTransactions = transactions.length;
      const averageTransactionValue = totalTransactions > 0 
        ? totalSales / totalTransactions 
        : 0;

      return {
        totalSales,
        totalTransactions,
        averageTransactionValue
      };
    } catch (error: any) {
      throw new Error(`Error calculating sales statistics: ${error.message}`);
    }
  }

  // Delete transaction (soft delete by marking as cancelled)
  async deleteTransaction(id: string): Promise<ITransaction> {
    try {
      const transaction = await Transaction.findByIdAndUpdate(
        id,
        { status: 'cancelled' },
        { new: true }
      );
      
      if (!transaction) {
        throw new Error('Transaction not found');
      }
      
      return transaction;
    } catch (error: any) {
      throw new Error(`Error deleting transaction: ${error.message}`);
    }
  }
} 