const Alert = require("../models/alert");

// Logic 1: Add New Alert (Aur purana auto-delete)
exports.addAlert = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // MAGIC TRICK: Pehle database main mojood saare alerts delete kar do
    await Alert.deleteMany({});

    // Ab naya alert save karo (Is tarah hamesha sirf 1 hi alert rahega)
    const newAlert = new Alert({
      message,
    });

    await newAlert.save();
    
    res.status(201).json({ 
      success: "Alert Added Successfully!", 
      data: newAlert 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add alert message" });
  }
};

// Logic 2: Get Current Alert Message
exports.getAlert = async (req, res) => {
  try {
    // findOne() is liye use kiya kyunke humein sirf 1 hi object chahiye, array nahi
    const alert = await Alert.findOne(); 
    
    // Agar koi alert nahi hai tou null bhej do
    res.status(200).json({ data: alert || null });
  } catch (error) {
    res.status(500).json({ error: "Error fetching alert message" });
  }
};

// Logic 3: Delete Alert (Agar manual delete karna ho kisi waqt)
exports.deleteAlert = async (req, res) => {
  try {
    await Alert.deleteMany({});
    res.status(200).json({ success: "Alert Message Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete alert" });
  }
};