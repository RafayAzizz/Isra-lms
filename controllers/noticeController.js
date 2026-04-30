const Notice = require("../models/Notice");

// 1. Upload Notice
exports.uploadNotice = async (req, res) => {
  try {
    const { title } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "Please upload an image" });
    }

    const newNotice = new Notice({
      title,
      imageUrl: req.file.path,
    });

    await newNotice.save();
    res.status(201).json({ message: "Notice Uploaded Successfully!", data: newNotice });
  } catch (error) {
    res.status(500).json({ error: "Failed to upload notice" });
  }
};

// 2. Get All Notices
exports.getNotices = async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 }); // Latest pehle
    res.status(200).json(notices);
  } catch (error) {
    res.status(500).json({ error: "Error fetching notices" });
  }
};

// 3. Delete Notice
exports.deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log("Delete Request Aayi hai ID ke liye:", id); // Ye line terminal main print karegi

    const deletedNotice = await Notice.findByIdAndDelete(id);

    if (!deletedNotice) {
      console.log("Notice Database main nahi mila!");
      return res.status(404).json({ error: "Notice not found" });
    }

    console.log("Notice Delete ho gaya!");
    res.status(200).json({ message: "Notice Deleted Successfully" });
  } catch (error) {
    console.error("Delete Error:", error); // Error print karega
    res.status(500).json({ error: "Failed to delete notice" });
  }
};

// 4. Update Notice
exports.updateNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    let updateData = { title };

    if (req.file) {
      updateData.imageUrl = req.file.path;
    }

    const updatedNotice = await Notice.findByIdAndUpdate(id, updateData, { new: true });
    res.status(200).json({ message: "Notice Updated", data: updatedNotice });
  } catch (error) {
    res.status(500).json({ error: "Failed to update notice" });
  }
};