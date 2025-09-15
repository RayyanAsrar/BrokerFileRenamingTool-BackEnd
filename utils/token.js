import jwt from "jsonwebtoken";
import CustomError from "http-errors";
import env from "../config/env.js";

const { JWT_SECRET } = env;

if (!JWT_SECRET) {
  throw CustomError(
    500,
    "JWT_SECRET is not defined in the environment variables"
  );
}

export const generateToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, {
    expiresIn: "24h",
  });
};

export const verifyToken = (token) => {
  try {
    const key = JWT_SECRET;

    return jwt.verify(token, key);
  } catch (error) {
    throw CustomError(401, "Expired or invalid token");
  }
};
