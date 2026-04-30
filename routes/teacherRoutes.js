const express = require("express");
const router = express.Router();
const multer = require("multer");
const teacherController = require("../controllers/teacherController");

// Multer Setup (Same as before)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage: storage });

// --- Admin Routes ---
router.post("/add", teacherController.addTeacher);
router.post("/assign-course", teacherController.assignCourse); // Subject dene ke liye
router.get("/all", teacherController.getAllTeachers);

// --- Teacher Routes (Content Upload) ---
// Note: :courseId wo ID hai jo teacher ke subject click karne par milegi
router.post("/upload-lecture/:courseId", upload.single("file"), teacherController.uploadLecture);
router.post("/upload-assignment/:courseId", upload.single("file"), teacherController.uploadAssignment);
router.delete("/delete-course/:courseId", teacherController.deleteCourse);
router.delete("/delete/:id", teacherController.deleteTeacher);

module.exports = router;