const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");

router.post("/register", studentController.registerStudent); // Naya Sign Up Route
router.get("/my-courses", studentController.getStudentCourses);
router.post("/login", studentController.loginStudent);

module.exports = router;