import { connect } from "mongoose";
import env from "./env.js";

const { MONGODB_URI } = env;

const connectDB = async () => {
  try {
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    const connection = await connect(MONGODB_URI);
    console.log(`MongoDB connected: ${connection.connection.host}`);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

export default connectDB;