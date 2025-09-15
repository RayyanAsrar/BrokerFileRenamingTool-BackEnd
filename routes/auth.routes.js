import authController from "../controllers/auth.controller.js";
import { Router } from "express";

const authRouter = Router();

const { login, register } = authController;

authRouter.post("/register", register);
authRouter.post("/login", login);

export default authRouter;
