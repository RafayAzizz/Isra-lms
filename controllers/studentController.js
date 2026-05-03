const Course = require("../models/Course");
const Student = require("../models/Student"); // Student Model import kiya

// Login Student
exports.loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Student email ya Roll Number dono se login kar sakta hai
    const student = await Student.findOne({
      $or: [{ email: email }, { rollNumber: email.toUpperCase() }]
    });

    if (!student || student.password !== password) {
      return res.status(400).json({ error: "Invalid Email/Roll Number or Password" });
    }

    res.status(200).json({ message: "Login Successful", data: student });
  } catch (error) {
    res.status(500).json({ error: "Server Error during login" });
  }
};
// 1. Register New Student (Sign Up)
exports.registerStudent = async (req, res) => {
  try {
    const { fullName, rollNumber, department, semester, email, password } = req.body;

    // Check if email or roll number already exists
    const existingStudent = await Student.findOne({ $or: [{ email }, { rollNumber }] });
    if (existingStudent) {
      return res.status(400).json({ error: "Email or Roll Number already exists!" });
    }

    const newStudent = new Student({
      fullName, rollNumber, department, semester, email, password
    });

    await newStudent.save();
    res.status(201).json({ message: "Student Registered Successfully", data: newStudent });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: "Failed to register student" });
  }
};

// 2. Get Courses by Dept & Semester (Aapka purana code)
exports.getStudentCourses = async (req, res) => {
  try {
    const { dept, sem } = req.query;
    const courses = await Course.find({ 
      department: dept, 
      semester: sem 
    }).populate("teacherId", "name");

    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch courses" });
  }
};