import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({ storage });

export const uploadMulti = upload.any("files");

export default upload;
