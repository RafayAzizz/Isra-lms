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

/// Get Courses by Dept & Semester (Bulletproof Filter)
exports.getStudentCourses = async (req, res) => {
  try {
    const { dept, sem } = req.query;

    // 1. Pehle student ke department aur semester ke courses nikalen
    // .lean() lagana zaroori hai taake hum data main tabdeeli kar sakein
    const courses = await Course.find({ 
      department: { $regex: new RegExp(`^${dept.trim()}$`, 'i') }, 
      semester: { $regex: new RegExp(`^${sem.trim()}$`, 'i') } 
    }).populate("teacherId", "name").lean();

    // 2. Ab check karein ke is makhsoos Dept aur Sem main total kitne students hain
    const count = await Student.countDocuments({
      department: { $regex: new RegExp(`^${dept.trim()}$`, 'i') },
      semester: { $regex: new RegExp(`^${sem.trim()}$`, 'i') }
    });

    // 3. Har course ke data main wo ginti (count) add kar dein
    const coursesWithCount = courses.map(course => ({
      ...course,
      studentCount: count // Yeh wo ginti hai jo student ko nazar aayegi
    }));

    res.status(200).json(coursesWithCount);
  } catch (error) {
    console.error("Fetch Student Courses Error:", error);
    res.status(500).json({ error: "Failed to fetch student courses" });
  }
};


// --- GET ALL STUDENTS (Admin/React Panel ke liye) ---
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 }); // Naye students pehle aayenge
    res.status(200).json(students);
  } catch (error) {
    console.error("Fetch All Students Error:", error);
    res.status(500).json({ error: "Failed to fetch students" });
  }
};

// --- UPDATE STUDENT (Edit karne ke liye) ---
exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, rollNumber, department } = req.body;

    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      { fullName, email, rollNumber, department },
      { new: true } // Update hone ke baad naya data wapas karega
    );

    if (!updatedStudent) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.status(200).json({ message: "Student updated successfully", data: updatedStudent });
  } catch (error) {
    console.error("Update Student Error:", error);
    res.status(500).json({ error: "Failed to update student" });
  }
};

// --- DELETE STUDENT (Remove karne ke liye) ---
exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedStudent = await Student.findByIdAndDelete(id);
    if (!deletedStudent) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Delete Student Error:", error);
    res.status(500).json({ error: "Failed to delete student" });
  }
};