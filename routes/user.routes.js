import userController from "../controllers/user.controller.js";
import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";

const userRouter = Router();

const { getCurrentUser } = userController;

userRouter.use(protect);

userRouter.get("/current", getCurrentUser);

export default userRouter;