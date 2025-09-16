import dotenv from "dotenv";

dotenv.config();

const env = {
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET,
  MONGODB_URI: process.env.MONGODB_URI
};

export default env;
