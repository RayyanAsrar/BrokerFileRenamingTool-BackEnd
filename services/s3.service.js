import { PutObjectCommand } from "@aws-sdk/client-s3";
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

    return {key, ...response};
  } catch (error) {
    throw CustomError(500, error.message);
  }
};
