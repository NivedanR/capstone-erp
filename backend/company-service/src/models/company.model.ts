import mongoose, { Schema, Document } from 'mongoose';

interface ICompany extends Document {
  name: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  registeredAt: Date;
  status: string;
}

const companySchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    contactPerson: { type: String, required: true },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, required: true },
    address: { type: String, required: true },
    registeredAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  },
  { timestamps: true }
);

const Company = mongoose.model<ICompany>('Company', companySchema);

export default Company;
