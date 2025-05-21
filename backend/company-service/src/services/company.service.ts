// const { Company } = require('../models/company.model');

// const createCompany = async (data) => {
//   const existing = await Company.findOne({ contactEmail: data.contactEmail });
//   if (existing) throw new Error('Company already exists');
//   return Company.create(data);
// };

// const getAllCompanies = () => Company.find();

// const getCompanyById = (id) => Company.findById(id);

// const updateCompany = (id, data) => 
//   Company.findByIdAndUpdate(id, data, { new: true });

// const deleteCompany = (id) => Company.findByIdAndDelete(id);

// module.exports = {
//   createCompany,
//   getAllCompanies,
//   getCompanyById,
//   updateCompany,
//   deleteCompany,
// };
