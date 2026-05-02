const Notice = require("../models/Notice");

// 1. Upload Notice
exports.uploadNotice = async (req, res) => {
  try {
    // Ab 'imageUrl' (Cloudinary ka link) frontend se body main aayega
    const { title, imageUrl } = req.body;

    // Validation: Title aur Image dono zaroori hain
    if (!title || !imageUrl) {
      return res.status(400).json({ error: "Please provide both title and image URL" });
    }

    const newNotice = new Notice({
      title,
      imageUrl, // Seedha frontend se aaya hua Cloudinary URL save kar liya
    });

    await newNotice.save();
    res.status(201).json({ message: "Notice Uploaded Successfully!", data: newNotice });
  } catch (error) {
    console.error("Add Notice Error:", error);
    res.status(500).json({ error: "Failed to upload notice" });
  }
};

// 2. Get All Notices (Isme koi change nahi, yeh theek tha)
exports.getNotices = async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 }); // Latest pehle
    res.status(200).json(notices);
  } catch (error) {
    res.status(500).json({ error: "Error fetching notices" });
  }
};

// 3. Delete Notice (Isme koi change nahi, yeh theek tha)
exports.deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log("Delete Request Aayi hai ID ke liye:", id);

    const deletedNotice = await Notice.findByIdAndDelete(id);

    if (!deletedNotice) {
      console.log("Notice Database main nahi mila!");
      return res.status(404).json({ error: "Notice not found" });
    }

    console.log("Notice Delete ho gaya!");
    res.status(200).json({ message: "Notice Deleted Successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ error: "Failed to delete notice" });
  }
};

// 4. Update Notice
exports.updateNotice = async (req, res) => {
  try {
    const { id } = req.params;
    // Ab update ke waqt bhi 'imageUrl' body main aayega agar admin ne change ki hogi
    const { title, imageUrl } = req.body;

    let updateData = { title };

    // Agar nayi image upload ki gayi hai, tou naya URL set karo
    if (imageUrl) {
      updateData.imageUrl = imageUrl;
    }

    const updatedNotice = await Notice.findByIdAndUpdate(id, updateData, { new: true });
    res.status(200).json({ message: "Notice Updated", data: updatedNotice });
  } catch (error) {
    console.error("Update Notice Error:", error);
    res.status(500).json({ error: "Failed to update notice" });
  }
};