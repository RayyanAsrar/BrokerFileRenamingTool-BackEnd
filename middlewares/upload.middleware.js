import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({ storage });

export const uploadMulti = upload.array("files");

export default upload;
