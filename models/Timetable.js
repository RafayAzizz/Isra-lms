const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema({
  // title yahan se remove kar ke semester add kar diya
  semester: {
    type: String,
    required: true, // e.g., "3rd Semester"
  },
  department: {
    type: String, // e.g., "CS", "IT", "AI"
    required: true,
  },
  imageUrl: {
    type: String, // Image ka path yahan save hoga
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Timetable", timetableSchema);