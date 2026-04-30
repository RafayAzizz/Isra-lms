const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const path = require("path");

// Routes Import
const timetableRoutes = require("./routes/timetableRoutes");
const noticeRoutes = require("./routes/noticeRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const studentRoutes = require("./routes/studentRoutes");
const alertRoutes = require('./routes/alertRoutes');
const departmentRoutes = require('./routes/departmentRoutes');

// Config
dotenv.config();
const app = express();
const PORT = 5000;

// Middleware (Zaroori settings)
app.use(cors()); // Frontend ko allow karega
app.use(express.json()); // JSON data samajhne ke liye
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Images ko public karne ke liye

// Database Connect
connectDB();

// --- ROUTES ---
app.use("/api/timetable", timetableRoutes);
app.use("/api/notice", noticeRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/student", studentRoutes);
app.use('/api/alert', alertRoutes);
app.use('/api/department', departmentRoutes);

// Server Start
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});