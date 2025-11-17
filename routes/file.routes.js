import { Router } from "express";
import fileController from "../controllers/file.controller.js";

const fileRouter = Router();

const { renameFile, downloadFiles } = fileController;

fileRouter.put("/:fileID", renameFile);
fileRouter.post("/download", downloadFiles)

export default fileRouter;
