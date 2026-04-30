const express = require("express");
const multer = require("multer");
const router = express.Router();
const noticeController = require("../controllers/noticeController");

// --- MULTER SETUP (Same as before) ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, '-'));
  },
});
const upload = multer({ storage: storage });

// --- ROUTES ---
router.post("/upload", upload.single("image"), noticeController.uploadNotice);
router.get("/all", noticeController.getNotices);
router.delete("/delete/:id", noticeController.deleteNotice);
router.put("/update/:id", upload.single("image"), noticeController.updateNotice);

module.exports = router;