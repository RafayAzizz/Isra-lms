const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Ab ye URL .env file se lega
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    console.log(`MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB Connection Failed:", error);
    process.exit(1);
  }
};

module.exports = connectDB;