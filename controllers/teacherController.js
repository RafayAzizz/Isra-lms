const Teacher = require("../models/Teacher");
const Course = require("../models/Course");
const cloudinary = require("cloudinary").v2;
const Student = require("../models/Student");

// Cloudinary URL se File ID nikalne ka helper function (Delete karne ke liye)
const extractPublicId = (url) => {
  try {
    return url.split(/v\d+\//)[1].split('.')[0];
  } catch (error) {
    return null;
  }
};

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

// --- Update Teacher Details ---
exports.updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;
    let updateData = { name, email };
    if (password) updateData.password = password; 

    const updatedTeacher = await Teacher.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedTeacher) return res.status(404).json({ error: "Teacher not found" });

    res.status(200).json({ message: "Teacher Updated Successfully", data: updatedTeacher });
  } catch (error) {
    res.status(500).json({ error: "Failed to update teacher" });
  }
};

// 2. Assign Subject to Teacher
exports.assignCourse = async (req, res) => {
  try {
    const { teacherId, courseTitle, department, semester } = req.body; 
    const newCourse = new Course({ title: courseTitle, teacherId, department, semester });
    await newCourse.save();

    const teacher = await Teacher.findById(teacherId);
    teacher.assignedCourses.push(newCourse._id);
    await teacher.save();

    res.status(200).json({ message: "Course Assigned Successfully", course: newCourse });
  } catch (error) {
    res.status(500).json({ error: "Failed to assign course" });
  }
};

// 3. Get All Teachers
exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find().populate("assignedCourses");
    res.status(200).json(teachers);
  } catch (error) {
    res.status(500).json({ error: "Error fetching teachers" });
  }
};

// 4. Upload Lecture
exports.uploadLecture = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title } = req.body;
    if (!req.file) return res.status(400).json({ error: "PDF File is required" });

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "isra_lms/materials", resource_type: "auto"
    });

    const course = await Course.findById(courseId);
    course.lectures.push({ title, pdfUrl: result.secure_url });
    await course.save();

    res.status(200).json({ message: "Lecture Uploaded Successfully!", data: course });
  } catch (error) {
    res.status(500).json({ error: "Failed to upload lecture" });
  }
};

// 5. Upload Assignment
exports.uploadAssignment = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, deadline } = req.body;
    if (!req.file) return res.status(400).json({ error: "PDF File is required" });

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "isra_lms/materials", resource_type: "auto"
    });

    const course = await Course.findById(courseId);
    course.assignments.push({ title, deadline, pdfUrl: result.secure_url });
    await course.save();

    res.status(200).json({ message: "Assignment Uploaded Successfully!", data: course });
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
      await Teacher.findByIdAndUpdate(teacherId, { $pull: { assignedCourses: courseId } });
    }
    res.status(200).json({ message: "Course Deleted Successfully" });
  } catch (error) {
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

// 7. Delete Teacher (with Cascading Delete for Courses)
exports.deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params; 
    const deletedTeacher = await Teacher.findByIdAndDelete(id);

    if (!deletedTeacher) return res.status(404).json({ error: "Teacher not found" });
    await Course.deleteMany({ teacherId: id });

    res.status(200).json({ message: "Teacher and all their assigned courses deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete teacher" });
  }
};

// --- Get Specific Teacher's Courses ---
// --- NAYA FUNCTION: Get Specific Teacher's Courses (with Student Count) ---
exports.getTeacherCourses = async (req, res) => {
  try {
    const { teacherId } = req.params;
    
    // .lean() lagana zaroori hai taake hum mongoose object main naya data add kar sakein
    let courses = await Course.find({ teacherId: teacherId }).populate("teacherId", "name").lean();
    
    // Har course ke andar loop chala kar check karein ke us department/semester main kitne students hain
    for (let i = 0; i < courses.length; i++) {
      const studentCount = await Student.countDocuments({ 
        department: courses[i].department, 
        semester: courses[i].semester 
      });
      
      // Course ke data main 'studentCount' add kar do
      courses[i].studentCount = studentCount; 
    }
    
    res.status(200).json(courses);
  } catch (error) {
    console.error("Fetch Teacher Courses Error:", error);
    res.status(500).json({ error: "Failed to fetch teacher courses" });
  }
};

// --- GET SINGLE COURSE DETAILS ---
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

// --- DELETE LECTURE (Cloudinary + DB) ---
exports.deleteLecture = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    
    const course = await Course.findById(courseId);
    const lecture = course.lectures.find(l => l._id.toString() === lectureId);

    if (lecture && lecture.pdfUrl) {
      const publicId = extractPublicId(lecture.pdfUrl);
      if (publicId) await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    }

    await Course.findByIdAndUpdate(courseId, { $pull: { lectures: { _id: lectureId } } });
    res.status(200).json({ message: "Lecture deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete lecture" });
  }
};

// --- DELETE ASSIGNMENT (Cloudinary + DB) ---
exports.deleteAssignment = async (req, res) => {
  try {
    const { courseId, assignmentId } = req.params;
    
    const course = await Course.findById(courseId);
    const assignment = course.assignments.find(a => a._id.toString() === assignmentId);

    if (assignment && assignment.pdfUrl) {
      const publicId = extractPublicId(assignment.pdfUrl);
      if (publicId) await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    }

    await Course.findByIdAndUpdate(courseId, { $pull: { assignments: { _id: assignmentId } } });
    res.status(200).json({ message: "Assignment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete assignment" });
  }
};

// --- EDIT LECTURE (Replace PDF if new one is uploaded) ---
exports.editLecture = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    const { title } = req.body;

    const course = await Course.findById(courseId);
    const lecture = course.lectures.find(l => l._id.toString() === lectureId);

    let newPdfUrl = lecture.pdfUrl;

    if (req.file) {
      if (lecture.pdfUrl) {
        const publicId = extractPublicId(lecture.pdfUrl);
        if (publicId) await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
      }
      const result = await cloudinary.uploader.upload(req.file.path, { folder: "isra_lms/materials", resource_type: "auto" });
      newPdfUrl = result.secure_url;
    }

    await Course.findOneAndUpdate(
      { _id: courseId, "lectures._id": lectureId },
      { $set: { "lectures.$.title": title, "lectures.$.pdfUrl": newPdfUrl } }
    );
    res.status(200).json({ message: "Lecture updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update lecture" });
  }
};

// --- EDIT ASSIGNMENT (Replace PDF if new one is uploaded) ---
exports.editAssignment = async (req, res) => {
  try {
    const { courseId, assignmentId } = req.params;
    const { title, deadline } = req.body;

    const course = await Course.findById(courseId);
    const assignment = course.assignments.find(a => a._id.toString() === assignmentId);

    let newPdfUrl = assignment.pdfUrl;

    if (req.file) {
      if (assignment.pdfUrl) {
        const publicId = extractPublicId(assignment.pdfUrl);
        if (publicId) await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
      }
      const result = await cloudinary.uploader.upload(req.file.path, { folder: "isra_lms/materials", resource_type: "auto" });
      newPdfUrl = result.secure_url;
    }

    await Course.findOneAndUpdate(
      { _id: courseId, "assignments._id": assignmentId },
      { $set: { "assignments.$.title": title, "assignments.$.deadline": deadline, "assignments.$.pdfUrl": newPdfUrl } }
    );
    res.status(200).json({ message: "Assignment updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update assignment" });
  }
};