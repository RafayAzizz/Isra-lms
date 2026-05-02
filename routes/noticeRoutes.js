const express = require("express");
const router = express.Router();
const noticeController = require("../controllers/noticeController");

// Multer ka sara setup yahan se hata diya gaya hai kyunke 
// ab image/PDF upload ka kaam index.js (Cloudinary) kar raha hai.

// --- ROUTES ---

// 1. Add Notice (upload.single hata diya gaya hai)
router.post("/upload", noticeController.uploadNotice);

// 2. Get All Notices
router.get("/all", noticeController.getNotices);

// 3. Delete Notice
router.delete("/delete/:id", noticeController.deleteNotice);

// 4. Update Notice (Yahan se bhi upload.single hata diya gaya hai)
router.put("/update/:id", noticeController.updateNotice);

module.exports = router;