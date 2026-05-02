const Timetable = require("../models/Timetable");
const cloudinary = require("cloudinary").v2;

// --- Cloudinary Configuration ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- HELPER FUNCTION: Cloudinary se file delete karne ke liye ---
const deleteFromCloudinary = async (fileUrl) => {
  try {
    if (!fileUrl) return;

    const parts = fileUrl.split('/upload/');
    if (parts.length < 2) return;

    let path = parts[1];
    if (path.match(/^v\d+\//)) {
      path = path.replace(/^v\d+\//, ''); 
    }
    const publicId = path.substring(0, path.lastIndexOf('.'));

    const resourceType = fileUrl.toLowerCase().endsWith('.pdf') ? 'raw' : 'image';

    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    console.log(`Deleted Timetable File from Cloudinary: ${publicId}`);
  } catch (error) {
    console.error("Cloudinary Delete Error:", error);
  }
};

// Logic 1: Upload Timetable
exports.uploadTimetable = async (req, res) => {
  try {
    // Ab 'imageUrl' frontend se body main aayega (Cloudinary API call ke baad)
    const { semester, department, imageUrl } = req.body;
    
    // Check agar data nahi aaya
    if (!semester || !department || !imageUrl) {
      return res.status(400).json({ error: "Please provide semester, department, and image URL" });
    }

    const newTimetable = new Timetable({
      semester,
      department,
      imageUrl, // Cloudinary link save kar liya
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

// Logic 3: Delete Timetable (Advanced)
exports.deleteTimetable = async (req, res) => {
  try {
    const { id } = req.params; 
    
    const timetable = await Timetable.findById(id);
    if (!timetable) {
      return res.status(404).json({ error: "Timetable not found" });
    }

    // Pehle Cloudinary se image/pdf delete karo
    if (timetable.imageUrl) {
      await deleteFromCloudinary(timetable.imageUrl);
    }

    // Phir database se delete karo
    await Timetable.findByIdAndDelete(id);
    res.status(200).json({ message: "Timetable and File Deleted Successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ error: "Failed to delete timetable" });
  }
};

// Logic 4: Update Timetable (Advanced)
exports.updateTimetable = async (req, res) => {
  try {
    const { id } = req.params;
    const { semester, department, imageUrl } = req.body;
    
    const timetable = await Timetable.findById(id);
    if (!timetable) {
      return res.status(404).json({ error: "Timetable not found" });
    }

    let updateData = { semester, department };

    // Agar nayi image aayi hai aur wo purani image se different hai
    if (imageUrl && imageUrl !== timetable.imageUrl) {
      
      // Purani image ko Cloudinary se hamesha ke liye ura do
      if (timetable.imageUrl) {
        await deleteFromCloudinary(timetable.imageUrl);
      }
      
      // Nayi image ka URL database ke liye set kar do
      updateData.imageUrl = imageUrl;
    }

    // Database update karo
    const updatedItem = await Timetable.findByIdAndUpdate(id, updateData, { new: true });
    
    res.status(200).json({ message: "Timetable Updated Successfully", data: updatedItem });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ error: "Failed to update timetable" });
  }
};