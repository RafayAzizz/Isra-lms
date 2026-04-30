const Timetable = require("../models/Timetable");

// Logic 1: Upload Timetable
exports.uploadTimetable = async (req, res) => {
  try {
    // req.body se title hata kar semester le liya
    const { semester, department } = req.body;
    
    // Check agar image nahi ayi
    if (!req.file) {
      return res.status(400).json({ error: "Please upload an image" });
    }

    const imageUrl = req.file.path; // Image path

    const newTimetable = new Timetable({
      semester, // Yahan bhi semester save hoga
      department,
      imageUrl,
    });

    await newTimetable.save();
    res.status(201).json({ message: "Timetable Uploaded Successfully!", data: newTimetable });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to upload timetable" });
  }
};

// Logic 2: Get All Timetables
exports.getTimetables = async (req, res) => {
  try {
    const timetables = await Timetable.find().sort({ createdAt: -1 });
    res.status(200).json(timetables);
  } catch (error) {
    res.status(500).json({ error: "Error fetching timetables" });
  }
};

// Logic 3: Delete Timetable
exports.deleteTimetable = async (req, res) => {
  try {
    const { id } = req.params; // URL se ID milegi
    await Timetable.findByIdAndDelete(id);
    res.status(200).json({ message: "Timetable Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete timetable" });
  }
};

// Logic 4: Update Timetable
exports.updateTimetable = async (req, res) => {
  try {
    const { id } = req.params;
    // req.body se title hata kar semester le liya
    const { semester, department } = req.body;
    
    // Purana data update karne ke liye object banaya (semester add kiya)
    let updateData = { semester, department };

    // Agar user ne nayi image bhi bheji hai, to use bhi update karo
    if (req.file) {
      updateData.imageUrl = req.file.path;
    }

    // Database mein update karo
    const updatedItem = await Timetable.findByIdAndUpdate(id, updateData, { new: true });
    
    res.status(200).json({ message: "Timetable Updated Successfully", data: updatedItem });
  } catch (error) {
    res.status(500).json({ error: "Failed to update timetable" });
  }
};