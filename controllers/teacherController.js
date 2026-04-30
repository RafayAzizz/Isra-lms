const Teacher = require("../models/Teacher");
const Course = require("../models/Course");

// 1. Add New Teacher (Admin karega)
exports.addTeacher = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const newTeacher = new Teacher({ name, email, password });
    await newTeacher.save();
    res.status(201).json({ message: "Teacher Added Successfully", teacher: newTeacher });
  } catch (error) {
    res.status(500).json({ error: "Failed to add teacher" });
  }
};

// 2. Assign Subject to Teacher (Admin karega - Edit Logic)
exports.assignCourse = async (req, res) => {
  try {
    // Ab hum department aur semester bhi receive karenge
    const { teacherId, courseTitle, department, semester } = req.body; 

    const newCourse = new Course({
      title: courseTitle,
      teacherId: teacherId,
      department: department, // Save kiya
      semester: semester      // Save kiya
    });
    
    await newCourse.save();

    const teacher = await Teacher.findById(teacherId);
    teacher.assignedCourses.push(newCourse._id);
    await teacher.save();

    res.status(200).json({ message: "Course Assigned Successfully", course: newCourse });
  } catch (error) {
    res.status(500).json({ error: "Failed to assign course" });
  }
};

// 3. Get All Teachers (Admin View)
exports.getAllTeachers = async (req, res) => {
  try {
    // .populate() use karenge taake assignedCourses ki details bhi ajayen
    const teachers = await Teacher.find().populate("assignedCourses");
    res.status(200).json(teachers);
  } catch (error) {
    res.status(500).json({ error: "Error fetching teachers" });
  }
};

// 4. Upload Lecture (Teacher karega)
// Iske liye hum Course ki ID URL main bhejenge
exports.uploadLecture = async (req, res) => {
  try {
    const { courseId } = req.params; // Jis subject main upload karna hai
    const { title } = req.body;

    if (!req.file) return res.status(400).json({ error: "File is required" });

    // Course dhoondo aur lecture push karo
    const course = await Course.findById(courseId);
    
    course.lectures.push({
      title: title,
      pdfUrl: req.file.path // Image/PDF path
    });

    await course.save();
    res.status(200).json({ message: "Lecture Uploaded!", data: course });
  } catch (error) {
    res.status(500).json({ error: "Failed to upload lecture" });
  }
};


// 5. Upload Assignment
exports.uploadAssignment = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, deadline } = req.body; // Assignment main Deadline bhi hoti hai

    if (!req.file) return res.status(400).json({ error: "File is required" });

    const course = await Course.findById(courseId);
    
    // Assignment array main push karenge
    course.assignments.push({
      title: title,
      pdfUrl: req.file.path,
      deadline: deadline // User deadline bhej sakta hai (Optional)
    });

    await course.save();
    res.status(200).json({ message: "Assignment Uploaded!", data: course });
  } catch (error) {
    res.status(500).json({ error: "Failed to upload assignment" });
  }
};

// 6. Delete Course (Assigned Subject ko delete karne ke liye)
exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params; // URL se courseId aayegi
    const { teacherId } = req.body;  // Body se teacherId aayegi

    // 1. Course Database se us subject ko hamesha ke liye delete karo
    await Course.findByIdAndDelete(courseId);

    // 2. Teacher ke "assignedCourses" array main se us course ki ID ko nikal do ($pull method use hota hai iske liye)
    if (teacherId) {
      await Teacher.findByIdAndUpdate(teacherId, {
        $pull: { assignedCourses: courseId }
      });
    }

    res.status(200).json({ message: "Course Deleted Successfully" });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({ error: "Failed to delete course" });
  }
};

// 6. Delete Teacher (Admin karega)
exports.deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params; // URL se teacher ki ID milegi
    
    // Database se teacher ko delete karo
    const deletedTeacher = await Teacher.findByIdAndDelete(id);

    if (!deletedTeacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    // Note: Agar aap chahte hain ke teacher delete hone par uske courses bhi delete ho jayen, 
    // tou yahan await Course.deleteMany({ teacherId: id }); laga sakte hain.

    res.status(200).json({ message: "Teacher Deleted Successfully" });
  } catch (error) {
    console.error("Error deleting teacher:", error);
    res.status(500).json({ error: "Failed to delete teacher" });
  }
};