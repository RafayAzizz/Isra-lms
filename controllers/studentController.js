const Course = require("../models/Course");

// Get Courses by Dept & Semester
exports.getStudentCourses = async (req, res) => {
  try {
    // Student URL main bhejega: ?dept=CS&sem=3rd
    const { dept, sem } = req.query;

    // Database main dhoondo jahan Dept aur Sem dono match hon
    const courses = await Course.find({ 
      department: dept, 
      semester: sem 
    }).populate("teacherId", "name"); // Teacher ka naam bhi sath layen

    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch courses" });
  }
};