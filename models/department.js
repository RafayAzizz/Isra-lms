const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Ek naam ka ek hi department hoga
  },
  code: {
    type: String,
    required: true,
    unique: true, // Jaise "CS", "BBA"
    uppercase: true, // Hamesha capital letters main save hoga
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Department", departmentSchema);