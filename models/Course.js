const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  
  // --- YE 2 NEW FIELDS HAIN ---
  department: { type: String, required: true }, // e.g., "CS", "BBA"
  semester: { type: String, required: true },   // e.g., "1st", "3rd"
  
  teacherId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Teacher" 
  },
  lectures: [{
    title: String,
    videoUrl: String,
    pdfUrl: String,
    createdAt: { type: Date, default: Date.now }
  }],
  assignments: [{
    title: String,
    pdfUrl: String,
    deadline: Date,
    createdAt: { type: Date, default: Date.now }
  }]
});

module.exports = mongoose.model("Course", courseSchema);