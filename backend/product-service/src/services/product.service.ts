import Product, { IProduct } from '../models/product.model';
import mongoose, { Types } from 'mongoose';

class ProductService {
  static async createProduct(productData: Partial<IProduct>) {
    try {
      console.log('Creating product with data:', JSON.stringify(productData, null, 2));

      // Validate required fields
      const requiredFields = ['companyId', 'name', 'description', 'category', 'price', 'costPrice', 'sku', 'unit'];
      const missingFields = requiredFields.filter(field => !productData[field as keyof IProduct]);
      
      if (missingFields.length > 0) {
        console.error('Missing required fields:', missingFields);
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Convert companyId string to ObjectId
      if (typeof productData.companyId === 'string') {
        try {
          console.log('Converting companyId to ObjectId:', productData.companyId);
          productData.companyId = new Types.ObjectId(productData.companyId);
          console.log('Converted companyId:', productData.companyId);
        } catch (error) {
          console.error('Error converting companyId:', error);
          throw new Error('Invalid company ID format');
        }
      }

      // Validate numeric fields
      if (typeof productData.price !== 'number' || productData.price < 0) {
        console.error('Invalid price:', productData.price);
        throw new Error('Price must be a positive number');
      }
      if (typeof productData.costPrice !== 'number' || productData.costPrice < 0) {
        console.error('Invalid costPrice:', productData.costPrice);
        throw new Error('Cost price must be a positive number');
      }

      console.log('Creating new product with validated data:', JSON.stringify(productData, null, 2));
      const product = new Product(productData);
      console.log('Product instance created, saving to database...');
      await product.save();
      console.log('Product saved successfully:', product);
      return product;
    } catch (error) {
      console.error('Error in createProduct:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to create product');
    }
  }

  static async getAllProducts() {
    try {
      return await Product.find().sort({ createdAt: -1 });
    } catch (error) {
      throw new Error('Failed to fetch products');
    }
  }

  static async getProductById(id: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid product ID format');
      }
      return await Product.findById(id);
    } catch (error) {
      throw new Error('Failed to fetch product');
    }
  }

  static async getProductsByCompanyId(companyId: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(companyId)) {
        throw new Error('Invalid company ID format');
      }
      return await Product.find({ companyId }).sort({ createdAt: -1 });
    } catch (error) {
      throw new Error('Failed to fetch company products');
    }
  }

  static async updateProduct(id: string, productData: any) {
    try {
      const product = await Product.findByIdAndUpdate(
        id,
        { $set: productData },
        { new: true, runValidators: true }
      );
      
      if (!product) {
        throw { status: 404, message: 'Product not found' };
      }
      
      return product;
    } catch (error: any) {
      console.error('Error updating product:', error);
      throw {
        status: error.status || 500,
        message: error.message || 'Error updating product',
        details: error
      };
    }
  }
}

export default ProductService;
