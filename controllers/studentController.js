const Course = require("../models/Course");
const Student = require("../models/Student"); // Student Model import kiya

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