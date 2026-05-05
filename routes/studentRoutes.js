const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");

// --- Auth & Course Routes ---
router.post("/register", studentController.registerStudent); 
router.get("/my-courses", studentController.getStudentCourses);
router.post("/login", studentController.loginStudent);

// --- NAYE ROUTES (Admin Panel ke liye) ---
router.get("/all", studentController.getAllStudents); // Saare students mangwane ke liye
router.put("/update/:id", studentController.updateStudent); // Student update karne ke liye
router.delete("/delete/:id", studentController.deleteStudent); // Student delete karne ke liye

module.exports = router;