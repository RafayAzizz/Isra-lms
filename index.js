const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const path = require("path");

// --- NEW: Cloudinary Packages Import ---
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

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
// Vercel ke liye process.env.PORT zaroori hota hai
const PORT = process.env.PORT || 5000;

// --- NEW: Cloudinary Configuration ---
// Yeh values aapki .env file se aayengi taake secure rahein
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- NEW: Multer & Cloudinary Storage Setup ---
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = 'isra_lms/images';
    let resource_type = 'image';

    // Agar upload hone wali file PDF hai tou settings change karein
    if (file.mimetype === 'application/pdf') {
      folder = 'isra_lms/documents';
      resource_type = 'raw'; // Cloudinary PDFs ko 'raw' manta hai
    }

    return {
      folder: folder,
      resource_type: resource_type,
      allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'], // Jo formats allowed hain
    };
  },
});

const upload = multer({ storage: storage });

// Middleware (Zaroori settings)
app.use(cors()); // Frontend ko allow karega
app.use(express.json()); // JSON data samajhne ke liye

// Purana local upload system band kar diya hai kyunke ab Cloudinary use ho raha hai
// app.use("/uploads", express.static(path.join(__dirname, "uploads"))); 

// Database Connect
connectDB();

// --- NEW: Upload API Route ---
// Yeh API admin panel se hit hogi
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    
    // Agar upload kamyab ho gaya tou Cloudinary ka permanent link wapas bhejein
    res.status(200).json({
      success: true,
      url: req.file.path, // <--- YEH WOH PERMANENT LINK HAI
      message: "File uploaded successfully to Cloudinary"
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, message: "Upload failed" });
  }
});

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

module.exports = app;