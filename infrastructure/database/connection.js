import mongoose from "mongoose";

const connectDB = async (mongoUri) => {
    try {
        await mongoose.connect(mongoUri);
        console.log("MongoDB connected");
    } catch (err) {
        console.error("MongoDB connection failed:", err);
        process.exit(1);
    }
};

export default connectDB;
