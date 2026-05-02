const Notice = require("../models/Notice");
const cloudinary = require("cloudinary").v2;

// --- Cloudinary Configuration ---
// Controller main delete karne ke liye bhi keys zaroori hain
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- HELPER FUNCTION: Cloudinary se file delete karne ke liye ---
const deleteFromCloudinary = async (fileUrl) => {
  try {
    if (!fileUrl) return;

    // 1. URL se file ka naam (public_id) nikalna
    const parts = fileUrl.split('/upload/');
    if (parts.length < 2) return;

    let path = parts[1];
    // Agar URL main version (jaise v17123456/) hai tou usay hatao
    if (path.match(/^v\d+\//)) {
      path = path.replace(/^v\d+\//, ''); 
    }
    // Extension (.jpg, .pdf) hata kar asal naam nikalna
    const publicId = path.substring(0, path.lastIndexOf('.'));

    // 2. Check karna ke file PDF hai (raw) ya Image
    const resourceType = fileUrl.toLowerCase().endsWith('.pdf') ? 'raw' : 'image';

    // 3. Cloudinary se hamesha ke liye delete karna
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    console.log(`Deleted from Cloudinary: ${publicId}`);

  } catch (error) {
    console.error("Cloudinary Delete Error:", error);
  }
};

// ==========================================
// 1. Upload Notice (No change)
// ==========================================
exports.uploadNotice = async (req, res) => {
  try {
    const { title, imageUrl } = req.body;

    if (!title || !imageUrl) {
      return res.status(400).json({ error: "Please provide both title and image URL" });
    }

    const newNotice = new Notice({ title, imageUrl });
    await newNotice.save();
    
    res.status(201).json({ message: "Notice Uploaded Successfully!", data: newNotice });
  } catch (error) {
    res.status(500).json({ error: "Failed to upload notice" });
  }
};

// ==========================================
// 2. Get All Notices (No change)
// ==========================================
exports.getNotices = async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });
    res.status(200).json(notices);
  } catch (error) {
    res.status(500).json({ error: "Error fetching notices" });
  }
};

// ==========================================
// 3. Delete Notice (ADVANCED - With Cloudinary Delete)
// ==========================================
exports.deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Pehle database se notice dhoondo
    const notice = await Notice.findById(id);

    if (!notice) {
      return res.status(404).json({ error: "Notice not found" });
    }

    // Step A: Database se delete karne se pehle Cloudinary se image delete karo
    if (notice.imageUrl) {
      await deleteFromCloudinary(notice.imageUrl);
    }

    // Step B: Ab database se Notice delete kar do
    await Notice.findByIdAndDelete(id);

    res.status(200).json({ message: "Notice and Image Deleted Successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ error: "Failed to delete notice" });
  }
};

// ==========================================
// 4. Update Notice (ADVANCED - Replace Old Image)
// ==========================================
exports.updateNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, imageUrl } = req.body;

    // Pehle purana notice dhoondo
    const notice = await Notice.findById(id);
    if (!notice) {
      return res.status(404).json({ error: "Notice not found" });
    }

    let updateData = { title };

    // Agar Admin ne nayi image upload ki hai (imageUrl mojood hai)
    // Aur wo purani image se mukhtalif (different) hai
    if (imageUrl && imageUrl !== notice.imageUrl) {
      
      // Step A: Purani image ko Cloudinary se delete karo
      if (notice.imageUrl) {
        await deleteFromCloudinary(notice.imageUrl);
      }
      
      // Step B: Nayi image ka URL database ke liye set karo
      updateData.imageUrl = imageUrl;
    }

    // Ab database ko update kar do
    const updatedNotice = await Notice.findByIdAndUpdate(id, updateData, { new: true });
    
    res.status(200).json({ message: "Notice Updated Successfully", data: updatedNotice });
  } catch (error) {
    console.error("Update Notice Error:", error);
    res.status(500).json({ error: "Failed to update notice" });
  }
};