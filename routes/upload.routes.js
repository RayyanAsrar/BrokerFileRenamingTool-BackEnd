import uploadController from "../controllers/upload.controller.js";
import { Router } from "express";
import { uploadMulti } from "../middlewares/upload.middleware.js";

const uploadRouter = Router();

const { uploadFiles } = uploadController;

uploadRouter.use(uploadMulti);

uploadRouter.post("/", uploadFiles);

export default uploadRouter;
