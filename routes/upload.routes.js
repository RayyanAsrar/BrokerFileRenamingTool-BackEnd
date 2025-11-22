import uploadController from "../controllers/upload.controller.js";
import { Router } from "express";
import { uploadMulti } from "../middlewares/upload.middleware.js";

const uploadRouter = Router();

const { uploadFiles } = uploadController;

uploadRouter.post("/", uploadMulti, uploadFiles);

export default uploadRouter;
