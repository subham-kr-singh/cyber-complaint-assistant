import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error("MONGO_URI is not set in .env");
    }
    const conn = await mongoose.connect(uri);
    console.log("Connect to DB")
    console.log("DB host : ", conn.connection.host);
    console.log("DB Name : ", conn.connection.name);
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
}


export default connectDB;
