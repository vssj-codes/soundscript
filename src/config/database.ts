import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("MongoDB connection error:", msg);
    process.exit(1);
  }
};

export default connectDB;
