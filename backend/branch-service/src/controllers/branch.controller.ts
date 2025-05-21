// src/controllers/branch.controller.ts
import { Request, Response } from 'express';
import Branch from '../models/branch.model';
import mongoose from 'mongoose';
import axios from 'axios';

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:5002';
const WAREHOUSE_SERVICE_URL = 'http://localhost:5003/api';
const STOCK_SERVICE_URL = process.env.STOCK_SERVICE_URL || 'http://localhost:5005/api';

export const createBranch = (req: Request, res: Response) => {
  const { name, location, warehouseId, managerId } = req.body;
  const newBranch = new Branch({ name, location, warehouseId, managerId });

  newBranch.save()
    .then((savedBranch) => {
      res.status(201).json({
        message: 'Branch created successfully',
        data: savedBranch,
      });
    })
    .catch((error) => {
      res.status(500).json({ message: 'Server error', error });
    });
};

export const getAllBranches = (req: Request, res: Response) => {
  Branch.find()
    .then((branches) => {
      res.status(200).json({
        message: 'Branches fetched successfully',
        data: branches,
      });
    })
    .catch((error) => {
      res.status(500).json({ message: 'Server error', error });
    });
};

export const getBranchesByWarehouseId = (req: Request, res: Response) => {
  const { warehouseId } = req.params;

  Branch.find({ warehouseId })
    .then((branches) => {
      if (branches.length === 0) {
        return res.status(404).json({
          message: 'No branches found for this warehouse',
          data: [],
        });
      }
      res.status(200).json({
        message: 'Branches fetched successfully',
        data: branches,
      });
    })
    .catch((error) => {
      console.error('Error fetching branches by warehouseId:', error);
      res.status(500).json({ message: 'Server error', error });
    });
};

export const getBranchWithWarehouseInfo = (req: Request, res: Response) => {
  const { branchId } = req.params;

  Branch.findById(branchId)
    .then(branch => {
      if (!branch) {
        res.status(404).json({ message: 'Branch not found' });
        return;  // ✅ Add this return to stop further execution
      }

      return axios
        .get(`${WAREHOUSE_SERVICE_URL}/warehouses/${branch.warehouseId}`)
        .then(warehouseResponse => {
          res.status(200).json({
            message: 'Branch with warehouse info fetched successfully',
            data: {
              branch,
              warehouse: warehouseResponse.data.data,
            },
          });
        });
    })
    .catch(error => {
      console.error('Error fetching branch with warehouse info:', error);
      res.status(500).json({ message: 'Server error', error });
    });
};

export const getBranchStock = async (req: Request, res: Response) => {
  const { id: branchId } = req.params;

  try {
    const response = await axios.get(`${STOCK_SERVICE_URL}/branch/${branchId}`);
    res.status(200).json({
      message: 'Branch stock fetched successfully',
      data: response.data.data,
    });
  } catch (error: any) {
    console.error('Error fetching branch stock:', error.message);
    res.status(500).json({ message: 'Failed to fetch branch stock' });
  }
};

export const adjustBranchStock = (req: Request, res: Response): void => {
  const { id: branchId } = req.params;
  const { productId, quantityChange } = req.body;

  // 1) fetch existing stock record
  axios
    .get(`${STOCK_SERVICE_URL}/branch/${branchId}/product/${productId}`)
    .then(response => {
      const records = response.data.data;
      if (!records || records.length === 0) {
        return Promise.reject({ status: 404, message: 'Stock record not found for this product in branch' });
      }
      const stockRecord = records[0];
      const newQuantity = stockRecord.quantity + quantityChange;
      const stockId = stockRecord._id;

      // 2) update it with the new quantity
      return axios.put(`${STOCK_SERVICE_URL}/${stockId}`, { quantity: newQuantity });
    })
    .then(updatedResponse => {
      res.status(200).json({
        message: 'Stock adjusted successfully',
        data: updatedResponse.data,
      });
    })
    .catch(err => {
      if (err.status === 404) {
        return res.status(404).json({ message: err.message });
      }
      console.error('Error adjusting stock:', err.message || err);
      res.status(500).json({ message: 'Failed to adjust stock' });
    });
};

import RestockRequest from '../models/restockRequest.model';
// Create a new restock request using Promises
export const createRestockRequest = (req: Request, res: Response): void => {
  const { id: branchId } = req.params;
  const { productId, quantity } = req.body;

  const request = new RestockRequest({ branchId, productId, quantity });

  request
    .save()
    .then(savedRequest => {
      res.status(201).json({ message: 'Restock request created', data: savedRequest });
    })
    .catch(err => {
      console.error('Error creating restock request:', err.message || err);
      res.status(500).json({ message: 'Failed to create restock request' });
    });
};

// Approve a restock request using Promises
export const approveRestockRequest = (req: Request, res: Response): void => {
  const { restockId } = req.params;

  RestockRequest.findByIdAndUpdate(
    restockId,
    { status: 'approved' },
    { new: true }
  )
    .then(updatedRequest => {
      if (!updatedRequest) {
        return Promise.reject({ status: 404, message: 'Restock request not found' });
      }

      // OPTIONAL: If you want to bump the stock automatically, you could chain another promise here:
      // return axios.get(...)
      //   .then(...) // fetch current stock
      //   .then(...) // axios.put to adjust stock
      //   .then(() => updatedRequest);

      res.status(200).json({ message: 'Restock request approved', data: updatedRequest });
    })
    .catch(err => {
      if (err.status === 404) {
        return res.status(404).json({ message: err.message });
      }
      console.error('Error approving restock request:', err.message || err);
      res.status(500).json({ message: 'Failed to approve restock request' });
    });
};

// Reject a restock request using Promises
export const rejectRestockRequest = (req: Request, res: Response): void => {
  const { restockId } = req.params;

  RestockRequest.findByIdAndUpdate(
    restockId,
    { status: 'rejected' },
    { new: true }
  )
    .then(updatedRequest => {
      if (!updatedRequest) {
        return Promise.reject({ status: 404, message: 'Restock request not found' });
      }
      res.status(200).json({ message: 'Restock request rejected', data: updatedRequest });
    })
    .catch(err => {
      if (err.status === 404) {
        return res.status(404).json({ message: err.message });
      }
      console.error('Error rejecting restock request:', err.message || err);
      res.status(500).json({ message: 'Failed to reject restock request' });
    });
};

export const createStockRequest = async (req, res) => {
  const { warehouseId, productId, quantity } = req.body;
  const branchId = req.body.branchId; // or from auth
  
  try {
    const { data } = await axios.post(
      `${STOCK_SERVICE_URL}/stock-requests`,
      { warehouseId, branchId, productId, quantity }
    );
    res.status(201).json({ message: 'Stock request placed', data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to place stock request' });
  }
};

// Get products in a branch
export const getBranchProducts = async (req: Request, res: Response): Promise<void> => {
  const { branchId } = req.params;
  try {
    const branch = await Branch.findById(branchId);
    if (!branch) {
      res.status(404).json({ message: 'Branch not found' });
      return;
    }

    // Fetch product details from product service and stock information
    const productPromises = branch.products.map(async (productId) => {
      try {
        // Get product details
        const productResponse = await axios.get(`${PRODUCT_SERVICE_URL}/api/products/${productId}`);
        const product = productResponse.data;

        // Get stock information
        try {
          const stockResponse = await axios.get(`${STOCK_SERVICE_URL}/stocks/branch/${branchId}/product/${productId}`);
          const stockData = stockResponse.data;
          return {
            ...product,
            quantity: stockData && stockData.data && stockData.data.quantity ? stockData.data.quantity : 0
          };
        } catch (error) {
          console.error(`Error fetching stock for product ${productId}:`, error);
          return {
            ...product,
            quantity: 0
          };
        }
      } catch (error) {
        console.error(`Error fetching product ${productId}:`, error);
        return null;
      }
    });

    const products = (await Promise.all(productPromises)).filter(Boolean);
    res.status(200).json(products);
  } catch (err) {
    console.error('Error in getBranchProducts:', err);
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// Assign a product to a branch
export const assignProductToBranch = async (req: Request, res: Response): Promise<void> => {
  const { branchId } = req.params;
  const { productId, quantity } = req.body;

  if (!productId) {
    res.status(400).json({ message: 'Product ID is required' });
    return;
  }

  if (!quantity || quantity <= 0) {
    res.status(400).json({ message: 'Valid quantity is required' });
    return;
  }

  try {
    // Validate branch ID
    if (!mongoose.Types.ObjectId.isValid(branchId)) {
      res.status(400).json({ message: 'Invalid branch ID' });
      return;
    }

    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      res.status(400).json({ message: 'Invalid product ID' });
      return;
    }

    // First, verify the product exists
    try {
      await axios.get(`${PRODUCT_SERVICE_URL}/api/products/${productId}`);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        res.status(404).json({ message: 'Product not found' });
        return;
      }
      throw error;
    }

    const branch = await Branch.findById(branchId);
    if (!branch) {
      res.status(404).json({ message: 'Branch not found' });
      return;
    }

    // Convert productId to ObjectId for comparison
    const productObjectId = new mongoose.Types.ObjectId(productId);

    // Check if product is already assigned
    if (branch.products.some(id => id.equals(productObjectId))) {
      res.status(400).json({ message: 'Product is already assigned to this branch' });
      return;
    }

    // Add product to branch
    branch.products.push(productObjectId);
    await branch.save();

    // Update stock in stock service
    try {
      // First, check if warehouse has enough stock
      const warehouseStockResponse = await axios.get(`${STOCK_SERVICE_URL}/stocks/warehouse/${branch.warehouseId}/product/${productId}`);
      const warehouseStock = warehouseStockResponse.data;
      
      if (!warehouseStock || warehouseStock.quantity < quantity) {
        res.status(400).json({ message: 'Insufficient stock in warehouse' });
        return;
      }

      // Update branch stock
      await axios.put(`${STOCK_SERVICE_URL}/stocks/branch/${branchId}/product/${productId}`, {
        quantityChange: quantity
      });

      // Decrease warehouse stock
      await axios.put(`${STOCK_SERVICE_URL}/stocks/warehouse/${branch.warehouseId}/product/${productId}`, {
        quantityChange: -quantity
      });
    } catch (error) {
      console.error('Error updating stock:', error);
      // If stock update fails, remove the product from branch
      branch.products = branch.products.filter(id => !id.equals(productObjectId));
      await branch.save();
      throw error;
    }

    // Fetch the assigned product details
    const productResponse = await axios.get(`${PRODUCT_SERVICE_URL}/api/products/${productId}`);
    
    res.status(200).json({ 
      message: 'Product assigned successfully', 
      branch,
      product: productResponse.data,
      quantity
    });
  } catch (err) {
    console.error('Error in assignProductToBranch:', err);
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// Remove a product from a branch
export const removeProductFromBranch = async (req: Request, res: Response): Promise<void> => {
  const { branchId, productId } = req.params;

  if (!productId) {
    res.status(400).json({ message: 'Product ID is required' });
    return;
  }

  try {
    // Validate branch ID
    if (!mongoose.Types.ObjectId.isValid(branchId)) {
      res.status(400).json({ message: 'Invalid branch ID' });
      return;
    }

    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      res.status(400).json({ message: 'Invalid product ID' });
      return;
    }

    const branch = await Branch.findById(branchId);
    if (!branch) {
      res.status(404).json({ message: 'Branch not found' });
      return;
    }

    // Convert productId to ObjectId for comparison
    const productObjectId = new mongoose.Types.ObjectId(productId);

    // Check if product is assigned to branch
    if (!branch.products.some(id => id.equals(productObjectId))) {
      res.status(400).json({ message: 'Product is not assigned to this branch' });
      return;
    }

    // Remove product from branch
    branch.products = branch.products.filter(
      (id) => !id.equals(productObjectId)
    );
    await branch.save();

    res.status(200).json({ 
      message: 'Product removed successfully', 
      branch 
    });
  } catch (err) {
    console.error('Error in removeProductFromBranch:', err);
    res.status(500).json({ message: 'Failed to remove product from branch' });
  }
};