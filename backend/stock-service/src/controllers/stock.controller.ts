import { Request, Response, NextFunction } from 'express';
import StockOverview from '../models/stockOverview.model';
import StockRequest from '../models/StockRequest.model';

// Create stock
export const createStock = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stock = new StockOverview(req.body);
    await stock.save();
    res.status(201).json({ message: 'Stock created', data: stock });
  } catch (err: any) {
    next(err);
  }
};

// Get all stocks
export const getAllStocks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stocks = await StockOverview.find();
    res.json({ data: stocks });
  } catch (err: any) {
    next(err);
  }
};

// Get stock by ID
export const getStockById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stock = await StockOverview.findById(req.params.id);
    if (!stock) {
      res.status(404).json({ message: 'Stock not found' });
      return;
    }
    res.json({ data: stock });
  } catch (err: any) {
    next(err);
  }
};

// Update stock
export const updateStock = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stock = await StockOverview.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!stock) {
      res.status(404).json({ message: 'Stock not found' });
      return;
    }
    res.json({ message: 'Stock updated', data: stock });
  } catch (err: any) {
    next(err);
  }
};

// Delete stock
export const deleteStock = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stock = await StockOverview.findByIdAndDelete(req.params.id);
    if (!stock) {
      res.status(404).json({ message: 'Stock not found' });
      return;
    }
    res.json({ message: 'Stock deleted' });
  } catch (err: any) {
    next(err);
  }
};

// Get stock by warehouseId
export const getStockByWarehouseId = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { warehouseId } = req.params;
    if (!warehouseId) {
      res.status(400).json({ message: 'warehouseId is required' });
      return;
    }
    const stocks = await StockOverview.find({ warehouseId });
    if (!stocks.length) {
      res.status(404).json({ message: 'No stock found for the warehouse' });
      return;
    }
    res.status(200).json({ data: stocks });
  } catch (err: any) {
    console.error('Error fetching stock by warehouse:', err.message);
    next(err);
  }
};

// Get stock by branchId
export const getStockByBranchId = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { branchId } = req.params;
    if (!branchId) {
      res.status(400).json({ message: 'branchId is required' });
      return;
    }
    const stocks = await StockOverview.find({ branchId });
    if (!stocks.length) {
      res.status(404).json({ message: 'No stock found for the branch' });
      return;
    }
    res.status(200).json({ data: stocks });
  } catch (err: any) {
    console.error('Error fetching stock by branch:', err.message);
    next(err);
  }
};

// Get stock by branchId and productId
export const getStockByBranchAndProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { branchId, productId } = req.params;

    if (!branchId || !productId) {
      res.status(400).json({ message: 'branchId and productId are required' });
      return;
    }

    const stock = await StockOverview.findOne({ branchId, productId });

    if (!stock) {
      res.status(404).json({ message: 'No stock found for this branch and product' });
      return;
    }

    res.status(200).json({ data: stock });
  } catch (err: any) {
    console.error('Error fetching stock by branch and product:', err.message);
    next(err);
  }
};

// Create stock request
export const createStockRequest = (req: Request, res: Response): void => {
  const { warehouseId, branchId, productId, quantity } = req.body;

  StockRequest.create({ warehouseId, branchId, productId, quantity })
    .then(request => {
      res.status(201).json({
        message: 'Request created',
        data: request,
      });
    })
    .catch(err => {
      console.error('Failed to create request:', err);
      res.status(500).json({ message: 'Failed to create request' });
    });
};

// Approve stock request
export const approveStockRequest = (req: Request, res: Response): void => {
  const { requestId } = req.params;

  StockRequest.findById(requestId)
    .then(reqDoc => {
      if (!reqDoc || reqDoc.status !== 'pending') {
        return Promise.reject({ status: 404, message: 'Not found or already processed' });
      }

      return StockOverview.updateOne(
        { warehouseId: reqDoc.warehouseId, productId: reqDoc.productId },
        { $inc: { quantity: reqDoc.quantity } },
        { upsert: true }
      ).then(() => {
        reqDoc.status = 'approved';
        return reqDoc.save();
      });
    })
    .then(updatedReqDoc => {
      res.json({
        message: 'Approved',
        data: updatedReqDoc,
      });
    })
    .catch(err => {
      if (err.status === 404) {
        return res.status(404).json({ message: err.message });
      }
      console.error('Failed to approve request:', err);
      res.status(500).json({ message: 'Failed to approve' });
    });
};

// Reject stock request
export const rejectStockRequest = (req: Request, res: Response): void => {
  const { requestId } = req.params;

  StockRequest.findByIdAndUpdate(
    requestId,
    { status: 'rejected' },
    { new: true }
  )
    .then(reqDoc => {
      if (!reqDoc) {
        return Promise.reject({ status: 404, message: 'Not found' });
      }
      res.json({
        message: 'Rejected',
        data: reqDoc,
      });
    })
    .catch(err => {
      if (err.status === 404) {
        return res.status(404).json({ message: err.message });
      }
      console.error('Failed to reject request:', err);
      res.status(500).json({ message: 'Failed to reject' });
    });
};

// bump a warehouse's stock for a single product
export const updateStockForWarehouseProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { warehouseId, productId } = req.params;
  const { quantityChange } = req.body;
  try {
    // upsert a StockOverview doc
    const stock = await StockOverview.findOneAndUpdate(
      { warehouseId, productId },
      { $inc: { quantity: quantityChange } },
      { upsert: true, new: true }
    );
    res.json({ message: 'Stock updated', data: stock });
  } catch (err: any) {
    next(err);
  }
};

// Get stock by warehouseId and productId
export const getStockByWarehouseAndProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { warehouseId, productId } = req.params;

    if (!warehouseId || !productId) {
      res.status(400).json({ message: 'warehouseId and productId are required' });
      return;
    }

    const stock = await StockOverview.findOne({ warehouseId, productId });

    if (!stock) {
      res.status(404).json({ message: 'No stock found for this warehouse and product' });
      return;
    }

    res.status(200).json(stock);
  } catch (err: any) {
    console.error('Error fetching stock by warehouse and product:', err.message);
    next(err);
  }
};

// Update stock for branch product
export const updateStockForBranchProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { branchId, productId } = req.params;
  const { quantityChange } = req.body;
  try {
    // upsert a StockOverview doc
    const stock = await StockOverview.findOneAndUpdate(
      { branchId, productId },
      { $inc: { quantity: quantityChange } },
      { upsert: true, new: true }
    );
    res.json({ message: 'Stock updated', data: stock });
  } catch (err: any) {
    next(err);
  }
};
