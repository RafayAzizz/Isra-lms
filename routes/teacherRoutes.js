const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const teacherController = require("../controllers/teacherController");

// Vercel ke liye /tmp folder ka setup (Kyunke Vercel serverless hai)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/tmp'); 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// --- Admin Routes ---
router.post("/add", teacherController.addTeacher);
router.post("/assign-course", teacherController.assignCourse); 
router.get("/all", teacherController.getAllTeachers);
router.put("/update/:id", teacherController.updateTeacher);
router.delete("/delete/:id", teacherController.deleteTeacher);

// --- Teacher Authentication ---
router.post("/login", teacherController.loginTeacher);

// --- Teacher Dashboard Routes ---
router.get("/course/:courseId", teacherController.getCourseDetails);
router.get("/my-courses/:teacherId", teacherController.getTeacherCourses);
router.delete("/delete-course/:courseId", teacherController.deleteCourse);

// --- Content Upload Routes (Multer ke sath taake PDF catch ho sakay) ---
router.post("/upload-lecture/:courseId", upload.single("file"), teacherController.uploadLecture);
router.post("/upload-assignment/:courseId", upload.single("file"), teacherController.uploadAssignment);

// --- Edit & Delete Material Routes ---
router.delete("/delete-lecture/:courseId/:lectureId", teacherController.deleteLecture);
router.put("/edit-lecture/:courseId/:lectureId", teacherController.editLecture);
router.delete("/delete-assignment/:courseId/:assignmentId", teacherController.deleteAssignment);
router.put("/edit-assignment/:courseId/:assignmentId", teacherController.editAssignment);

module.exports = router;