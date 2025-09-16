import { verifyToken } from "../utils/token.js";
import CustomError from "http-errors";

export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1] || req.cookies.token;

    if (!token) {
      throw CustomError(401, "Not authorized, token missing");
    }

    const decoded = verifyToken(token);

    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    throw CustomError(403, "Access denied, admin only");
  }
  next();
};

export const isUser = (req, res, next) => {
  if (!req.user || req.user.role !== "user") {
    throw CustomError(403, "Access denied, user only");
  }
  next();
};
