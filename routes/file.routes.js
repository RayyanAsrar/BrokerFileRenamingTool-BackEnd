import { Router } from "express";
import fileController from "../controllers/file.controller.js";

const fileRouter = Router();

const { renameFile } = fileController;

fileRouter.put("/:fileID", renameFile);

export default fileRouter;
