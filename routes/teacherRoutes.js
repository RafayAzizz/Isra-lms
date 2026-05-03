const express = require("express");
const router = express.Router();
const teacherController = require("../controllers/teacherController");

// --- Admin Routes ---
router.post("/add", teacherController.addTeacher);
router.post("/assign-course", teacherController.assignCourse); 
router.get("/all", teacherController.getAllTeachers);

// NAYA ROUTE: Teacher Update Karne Ke Liye
router.put("/update/:id", teacherController.updateTeacher);

// --- Teacher Routes (Content Upload - Vercel Ready) ---
// Multer hata diya kyunke ab frontend direct Cloudinary par bhej kar sirf URL dega
router.post("/upload-lecture/:courseId", teacherController.uploadLecture);
router.post("/upload-assignment/:courseId", teacherController.uploadAssignment);

// Delete Routes
router.delete("/delete-course/:courseId", teacherController.deleteCourse);
router.delete("/delete/:id", teacherController.deleteTeacher);
router.post("/login", teacherController.loginTeacher);

module.exports = router;