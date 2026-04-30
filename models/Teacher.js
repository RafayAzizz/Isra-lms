const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Login ke liye
  // Yahan hum Courses ki IDs store karenge jo Admin assign karega
  assignedCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course"
  }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Teacher", teacherSchema);