import {
  DeleteObjectsCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import CustomError from "http-errors";
import env from "../config/env.js";
import s3 from "../config/s3.js";

const { S3_BUCKET } = env;

if (!S3_BUCKET) {
  throw CustomError(500, "S3 Bucket name is not provided");
}

export const uploadFile = async ({ name, body, contentType }) => {
  if (!name || !body || !contentType) {
    throw CustomError(
      500,
      "Name, body and contentType are required to upload file to S3"
    );
  }

  const key = `uploads/${Date.now()}-${name}`;

  const params = {
    Bucket: S3_BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
  };

  try {
    const response = await s3.send(new PutObjectCommand(params));
    console.log(`File uploaded successfully to S3: ${key}`);

    return { key, ...response };
  } catch (error) {
    console.error(`Error uploading file to S3:`, error);
    throw CustomError(500, error.message);
  }
};

export const getFileStream = async (key) => {
  if (!key) {
    throw CustomError(400, "S3 key is required to fetch file");
  }

  const params = {
    Bucket: S3_BUCKET,
    Key: key,
  };

  try {
    const response = await s3.send(new GetObjectCommand(params));
    return response.Body;
  } catch (error) {
    console.error(`Error fetching file from S3:`, error);
    throw CustomError(500, error.message);
  }
};

export const deleteFiles = async (keys) => {
  if (!keys || !Array.isArray(keys) || keys.length === 0) {
    throw CustomError(400, "Array of S3 keys is required to delete files");
  }

  const objects = keys.map((key) => ({ Key: key }));

  const deleteCommand = new DeleteObjectsCommand({
    Bucket: S3_BUCKET,
    Delete: { Objects: objects, Quiet: false },
  });

  try {
    const response = await s3.send(deleteCommand);
    console.log(`Deleted ${response.Deleted.length} files from S3`);
    return response;
  } catch (error) {
    console.error(`Error deleting files from S3:`, error);
    throw CustomError(500, error.message);
  }
};
