import joi from "joi";

export const userSchema = joi.object({
  username: joi.string().alphanum().min(3).max(30).required(),
  email: joi.string().email().required(),
  password: joi.string().min(6).required(),
  role: joi.string().valid("user", "admin").default("user"),
  isDeleted: joi.boolean().default(false),
  isActive: joi.boolean().default(true),
  lastLogin: joi.date().default(null),
  profileImage: joi.string().default(null),
});

export const loginSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().min(6).required(),
});
