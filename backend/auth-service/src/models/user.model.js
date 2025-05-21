// const mongoose = require("mongoose");

// const UserSchema = new mongoose.Schema({
//   username: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   role: {
//     type: String,
//     enum: ["admin", "company", "warehouse-manager", "branch-manager", "sales"],
//     default: "sales"
//   },
// });

// module.exports = mongoose.model("User", UserSchema);


const mongoose = require('mongoose');
const { ROLES } = require('../config/constants');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: Object.values(ROLES),
    default: ROLES.SALES
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
