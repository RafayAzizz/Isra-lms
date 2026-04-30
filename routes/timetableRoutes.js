const express = require("express");
const multer = require("multer");
const router = express.Router();
const timetableController = require("../controllers/timetableController"); // Controller import kiya

// --- MULTER SETUP (Image Uploading) ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    // Windows file name issue fix karne ke liye date use kar rahe hain
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, '-')); 
  },
});
const upload = multer({ storage: storage });

// --- ROUTES ---

// 1. Upload Route (Ab logic controller main hai)
router.post("/upload", upload.single("image"), timetableController.uploadTimetable);

// 2. Get All Route
router.get("/all", timetableController.getTimetables);

// 3. Delete Route (ID ke sath)
router.delete("/delete/:id", timetableController.deleteTimetable);

// 4. Update Route (ID aur Image ke sath)
router.put("/update/:id", upload.single("image"), timetableController.updateTimetable);

module.exports = router;