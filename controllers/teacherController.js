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

// --- NAYA FUNCTION: Update Teacher Details ---
exports.updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;

    let updateData = { name, email };

    // Agar admin ne naya password bheja hai tab hi update karo
    if (password) {
      updateData.password = password; 
    }

    const updatedTeacher = await Teacher.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedTeacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    res.status(200).json({ message: "Teacher Updated Successfully", data: updatedTeacher });
  } catch (error) {
    console.error("Update Teacher Error:", error);
    res.status(500).json({ error: "Failed to update teacher" });
  }
};

// 2. Assign Subject to Teacher (Admin karega)
exports.assignCourse = async (req, res) => {
  try {
    const { teacherId, courseTitle, department, semester } = req.body; 

    const newCourse = new Course({
      title: courseTitle,
      teacherId: teacherId,
      department: department, 
      semester: semester      
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
    const teachers = await Teacher.find().populate("assignedCourses");
    res.status(200).json(teachers);
  } catch (error) {
    res.status(500).json({ error: "Error fetching teachers" });
  }
};

// 4. Upload Lecture (Vercel Ready)
exports.uploadLecture = async (req, res) => {
  try {
    const { courseId } = req.params; 
    // req.file ki jagah frontend se pdfUrl / fileUrl ayega
    const { title, fileUrl } = req.body;

    if (!fileUrl) return res.status(400).json({ error: "File URL is required" });

    const course = await Course.findById(courseId);
    
    course.lectures.push({
      title: title,
      pdfUrl: fileUrl 
    });

    await course.save();
    res.status(200).json({ message: "Lecture Uploaded!", data: course });
  } catch (error) {
    res.status(500).json({ error: "Failed to upload lecture" });
  }
};

// 5. Upload Assignment (Vercel Ready)
exports.uploadAssignment = async (req, res) => {
  try {
    const { courseId } = req.params;
    // req.file ki jagah frontend se pdfUrl ayega
    const { title, deadline, fileUrl } = req.body; 

    if (!fileUrl) return res.status(400).json({ error: "File URL is required" });

    const course = await Course.findById(courseId);
    
    course.assignments.push({
      title: title,
      pdfUrl: fileUrl,
      deadline: deadline 
    });

    await course.save();
    res.status(200).json({ message: "Assignment Uploaded!", data: course });
  } catch (error) {
    res.status(500).json({ error: "Failed to upload assignment" });
  }
};

// 6. Delete Course
exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params; 
    const { teacherId } = req.body;  

    await Course.findByIdAndDelete(courseId);

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

// 7. Delete Teacher
exports.deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params; 
    
    const deletedTeacher = await Teacher.findByIdAndDelete(id);

    if (!deletedTeacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    res.status(200).json({ message: "Teacher Deleted Successfully" });
  } catch (error) {
    console.error("Error deleting teacher:", error);
    res.status(500).json({ error: "Failed to delete teacher" });
  }
};