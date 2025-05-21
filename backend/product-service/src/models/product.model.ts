import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProduct extends Document {
  companyId: Types.ObjectId;
  name: string;
  description: string;
  category: string;
  price: number;
  costPrice: number;
  sku: string;
  unit: string;
  status: 'active' | 'inactive';
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
  tagName?: string;
}

const productSchema = new Schema<IProduct>({
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'Company ID is required'],
    validate: {
      validator: function(v: any) {
        return mongoose.Types.ObjectId.isValid(v);
      },
      message: 'Invalid company ID format'
    }
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required']
  },
  category: {
    type: String,
    required: [true, 'Product category is required']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  costPrice: {
    type: Number,
    required: [true, 'Product cost price is required'],
    min: [0, 'Cost price cannot be negative']
  },
  sku: {
    type: String,
    required: [true, 'Product SKU is required'],
    unique: true,
    trim: true
  },
  unit: {
    type: String,
    required: [true, 'Product unit is required']
  },
  status: {
    type: String,
    enum: {
      values: ['active', 'inactive'],
      message: 'Status must be either active or inactive'
    },
    default: 'active'
  },
  quantity: {
    type: Number,
    required: [true, 'Product quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    default: 0
  },
  tagName: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Create indexes
productSchema.index({ companyId: 1 });
productSchema.index({ sku: 1 }, { unique: true });
productSchema.index({ name: 'text', description: 'text' });

// Add pre-save middleware for validation
productSchema.pre('save', function(next) {
  console.log('Validating product before save:', this.toObject());
  next();
});

const Product = mongoose.model<IProduct>('Product', productSchema);

export default Product;
