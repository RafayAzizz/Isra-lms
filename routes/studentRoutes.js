const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");

router.post("/register", studentController.registerStudent); // Naya Sign Up Route
router.get("/my-courses", studentController.getStudentCourses);

module.exports = router;