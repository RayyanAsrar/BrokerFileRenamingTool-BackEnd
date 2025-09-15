import User from "../models/user.model.js";
import { APIResponse } from "../utils/response.js";
import validate from "../utils/validation.js";
import CustomError from "http-errors";
import { generateToken } from "../utils/token.js";
import { loginSchema, userSchema } from "../schemas/user.schema.js";
import bcrypt from "bcrypt";

const authController = {
  register: async (req, res) => {
    const { error, value } = validate(userSchema, req.body);

    if (error) {
      throw CustomError(400, error.details[0].message);
    }

    const { email, password } = value;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw CustomError(409, "User with this email already exists");
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create({
      ...value,
      password: hashedPassword,
    });

    return res.status(201).json(
      APIResponse("User registered successfully", {
        userId: newUser._id,
      })
    );
  },
  login: async (req, res) => {
    const { error, value } = validate(loginSchema, req.body);

    if (error) {
      throw CustomError(400, error.details[0].message);
    }

    const { email, password } = value;

    const user = await User.findOne({ email });

    if (!user) {
      throw CustomError(401, "Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw CustomError(401, "Invalid email or password");
    }

    if (!user.isActive || user.isDeleted) {
      throw CustomError(403, "User account is inactive or deleted");
    }

    const token = generateToken({ userId: user._id, role: user.role });

    user.lastLogin = new Date();
    await user.save();

    const userData = {
      username: user.username,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      lastLogin: user.lastLogin,
    };

    return res.status(200).json(
      APIResponse("Login successful", {
        token,
        user: userData,
      })
    );
  },
};

export default authController;
