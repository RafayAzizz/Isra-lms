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

// Login Teacher
exports.loginTeacher = async (req, res) => {
  try {
    const { email, password } = req.body;
    const teacher = await Teacher.findOne({ email });

    if (!teacher || teacher.password !== password) {
      return res.status(400).json({ error: "Invalid Email or Password" });
    }

    res.status(200).json({ message: "Login Successful", data: teacher });
  } catch (error) {
    res.status(500).json({ error: "Server Error during login" });
  }
};

// 7. Delete Teacher
// 7. Delete Teacher (with Cascading Delete for Courses)
exports.deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params; 
    
    // 1. Sab se pehle database se teacher ko delete karo
    const deletedTeacher = await Teacher.findByIdAndDelete(id);

    if (!deletedTeacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    // 2. YAHAN HAI ASAL JADOO: 
    // Ab Course collection main jao aur wo tamam courses ura do jinki teacherId is delete hone wale teacher ki id se match karti ho!
    await Course.deleteMany({ teacherId: id });

    res.status(200).json({ message: "Teacher and all their assigned courses deleted successfully!" });
  } catch (error) {
    console.error("Error deleting teacher:", error);
    res.status(500).json({ error: "Failed to delete teacher" });
  }
};

// --- NAYA FUNCTION: Get Specific Teacher's Courses ---
exports.getTeacherCourses = async (req, res) => {
  try {
    const { teacherId } = req.params;
    
    // Database main wo courses dhoondo jinki teacherId is teacher se match kare
    const courses = await Course.find({ teacherId: teacherId }).populate("teacherId", "name");
    
    res.status(200).json(courses);
  } catch (error) {
    console.error("Fetch Teacher Courses Error:", error);
    res.status(500).json({ error: "Failed to fetch teacher courses" });
  }
};

// --- GET SINGLE COURSE DETAILS (For both Teacher and Student) ---
exports.getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });
    
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch course details" });
  }
};

// --- DELETE LECTURE ---
exports.deleteLecture = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    // $pull se hum array ke andar se specific ID wala item nikal dete hain
    await Course.findByIdAndUpdate(courseId, {
      $pull: { lectures: { _id: lectureId } }
    });
    res.status(200).json({ message: "Lecture deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete lecture" });
  }
};

// --- DELETE ASSIGNMENT ---
exports.deleteAssignment = async (req, res) => {
  try {
    const { courseId, assignmentId } = req.params;
    await Course.findByIdAndUpdate(courseId, {
      $pull: { assignments: { _id: assignmentId } }
    });
    res.status(200).json({ message: "Assignment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete assignment" });
  }
};

// --- EDIT LECTURE ---
exports.editLecture = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    const { title, fileUrl } = req.body;

    // "lectures.$" ka matlab hai ke array main jo item match hua hai, sirf usi ko update karo
    await Course.findOneAndUpdate(
      { _id: courseId, "lectures._id": lectureId },
      { $set: { "lectures.$.title": title, "lectures.$.pdfUrl": fileUrl } }
    );
    res.status(200).json({ message: "Lecture updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update lecture" });
  }
};

// --- EDIT ASSIGNMENT ---
exports.editAssignment = async (req, res) => {
  try {
    const { courseId, assignmentId } = req.params;
    const { title, fileUrl, deadline } = req.body;

    await Course.findOneAndUpdate(
      { _id: courseId, "assignments._id": assignmentId },
      { $set: { 
          "assignments.$.title": title, 
          "assignments.$.pdfUrl": fileUrl,
          "assignments.$.deadline": deadline 
        } 
      }
    );
    res.status(200).json({ message: "Assignment updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update assignment" });
  }
};