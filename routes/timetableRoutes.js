const express = require("express");
const router = express.Router();
const timetableController = require("../controllers/timetableController");

// Multer ka setup hata diya gaya hai kyunke ab Cloudinary use ho raha hai

// --- ROUTES ---

// 1. Upload Route (upload.single hata diya)
router.post("/upload", timetableController.uploadTimetable);

// 2. Get All Route
router.get("/all", timetableController.getTimetables);

// 3. Delete Route (ID ke sath)
router.delete("/delete/:id", timetableController.deleteTimetable);

// 4. Update Route (upload.single hata diya)
router.put("/update/:id", timetableController.updateTimetable);

module.exports = router;