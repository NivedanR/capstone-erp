import { Request, Response, NextFunction } from 'express';
import Company from '../models/company.model';
import axios from 'axios';

export const createCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, contactPerson, contactEmail, contactPhone, address } = req.body;

    // Check for existing company with same name (case-insensitive)
    const existingByName = await Company.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });
    if (existingByName) {
      res.status(400).json({ 
        message: 'Company already exists',
        details: 'A company with this name already exists'
      });
      return;
    }

    // Check for existing company with same email
    const existingByEmail = await Company.findOne({ contactEmail });
    if (existingByEmail) {
      res.status(400).json({ 
        message: 'Company already exists',
        details: 'A company with this email already exists'
      });
      return;
    }

    const newCompany = new Company({ 
      name: name.trim(),
      contactPerson, 
      contactEmail: contactEmail.toLowerCase(),
      contactPhone, 
      address 
    });
    await newCompany.save();

    res.status(201).json({ 
      message: 'Company created successfully', 
      company: newCompany 
    });
  } catch (err: any) {
    console.error('Error creating company:', err);
    next(err);
  }
};

export const getCompanies = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const companies = await Company.find();
    res.status(200).json(companies);
  } catch (err: any) {
    next(err);
  }
};

export const getCompanyById = async (
  req: Request,
  res: Response,
  next: NextFunction
  
): Promise<void> => {
  console.log('🌟 getCompanyWithProducts → hit!', req.method, req.originalUrl);
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      res.status(404).json({ message: 'Company not found' });
      return;
    }
    console.log('🌟 getCompanyWithProducts → hit!');
    res.status(200).json(company);
    
  } catch (err: any) {
    next(err);
  }
};
export const getCompanyWithProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.log('🌟 getCompanyWithProducts → START', req.method, req.originalUrl); // STEP 1
  try {
    const company = await Company.findById(req.params.id);
    console.log('🌟 getCompanyWithProducts → after Company.findById', { company }); // STEP 2
    if (!company) {
      console.log('🌟 getCompanyWithProducts → Company not found'); // STEP 3
      res.status(404).json({ message: 'Company not found' });
      return;
    }

    const productServiceUrl = process.env.PRODUCT_SERVICE_URL || 'http://localhost:5002';
    console.log('🌟 getCompanyWithProducts → productServiceUrl:', productServiceUrl); // STEP 4
    try {
        const { data: products } = await axios.get(
          `${productServiceUrl}/api/products/company/${company._id}`
        );
        console.log('🌟 getCompanyWithProducts → after axios.get', { products }); // STEP 5
         res.status(200).json({
        company,
        products,
      });
    }
    catch (axiosError: any) {
         console.error("Axios error", axiosError);
         next(axiosError);
    }

    console.log('🌟 getCompanyWithProducts → after res.status(200).json()'); // STEP 6

  } catch (error: any) {
    console.error('🌟 getCompanyWithProducts → ERROR', error); // STEP 7
    next(error);
  }
  console.log('🌟 getCompanyWithProducts → END'); // STEP 8
};

const escapeRegex = (str: string) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

//This method is not working------------------------------------
export const getCompaniesByNames = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const namesQuery = req.query.names as string | undefined;

    if (!namesQuery) {
      res.status(400).json({ message: 'No company names provided' });
      return;
    }

    // Split the names from the query parameter
    const nameArray = namesQuery
      .split(',')
      .map(name => name.trim())
      .filter(name => name.length > 0);

    console.log('🛠 Received names query:', namesQuery);
    console.log('🛠 Cleaned name array:', nameArray);

    // Generate regex pattern for each name (escape special characters)
    const regexArray = nameArray.map(
      name => new RegExp(`^${escapeRegex(name)}$`, 'i')  // case-insensitive, exact match
    );

    console.log('🛠 MongoDB RegExp array:', regexArray);

    
    const companies = await Company.find({
      name: { $in: regexArray }
    });

    if (companies.length === 0) {
      res.status(404).json({ message: 'No companies found matching the provided names' });
      return;
    }

    res.status(200).json(companies);
  } catch (err: any) {
    next(err);
  }
};

import ReplenishRequest from '../models/replenishRequest.model';

const STOCK_SERVICE_URL = process.env.STOCK_SERVICE_URL || 'http://localhost:5005';

// POST /api/companies/:companyId/replenish-requests
export const createReplenishRequest = (req: Request, res: Response) => {
  const { companyId } = req.params;
  const { warehouseId, productId, quantity } = req.body;

  const reqDoc = new ReplenishRequest({ companyId, warehouseId, productId, quantity });

  reqDoc.save()
    .then(savedDoc => {
      res.status(201).json({ message: 'Replenish request created', data: savedDoc });
    })
    .catch(err => {
      console.error('Error creating replenish request:', err);
      res.status(500).json({ message: 'Failed to create replenish request' });
    });
};

// POST /api/companies/replenish-requests/:requestId/approve
export const approveReplenishRequest = (req: Request, res: Response) => {
  const { requestId } = req.params;

  ReplenishRequest.findById(requestId)
    .then(reqDoc => {
      if (!reqDoc || reqDoc.status !== 'pending') {
        return Promise.reject({ status: 404, message: 'Not found or already processed' });
      }
      // 1) bump warehouse stock in Stock Service
      return axios.put(
        `${STOCK_SERVICE_URL}/api/stocks/warehouse/${reqDoc.warehouseId}/product/${reqDoc.productId}`,
        { quantityChange: reqDoc.quantity }
      )
      .then(() => reqDoc);
    })
    .then(reqDoc => {
      // 2) mark approved
      reqDoc.status = 'approved';
      return reqDoc.save();
    })
    .then(updatedDoc => {
      res.json({ message: 'Replenish request approved', data: updatedDoc });
    })
    .catch(err => {
      if (err && typeof err.status === 'number') {
        return res.status(err.status).json({ message: err.message });
      }
      console.error('Error approving replenish request:', err);
      res.status(500).json({ message: 'Failed to approve replenish request' });
    });
};

// POST /api/companies/replenish-requests/:requestId/reject
export const rejectReplenishRequest = (req: Request, res: Response) => {
  const { requestId } = req.params;

  ReplenishRequest.findByIdAndUpdate(
    requestId,
    { status: 'rejected' },
    { new: true }
  )
    .then(updatedDoc => {
      if (!updatedDoc) {
        return res.status(404).json({ message: 'Not found' });
      }
      res.json({ message: 'Replenish request rejected', data: updatedDoc });
    })
    .catch(err => {
      console.error('Error rejecting replenish request:', err);
      res.status(500).json({ message: 'Failed to reject replenish request' });
    });
};

export const handleReplenishRequest = async (req: Request, res: Response) => {
  const { companyId } = req.params;
  const { warehouseId, productId, quantity } = req.body;

  // You can add your actual replenish logic here.
  console.log(
    `Replenish request received for Company ${companyId}: Warehouse ${warehouseId}, Product ${productId}, Qty ${quantity}`
  );

  res.status(201).json({
    message: 'Replenish request received',
    data: {
      companyId,
      warehouseId,
      productId,
      quantity,
    },
  });
};
