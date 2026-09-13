import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.MINIO_REGION || "us-east-1",
  endpoint: process.env.MINIO_ENDPOINT || "http://localhost:9000",
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || "minioadmin",
    secretAccessKey: process.env.MINIO_SECRET_KEY || "minioadmin",
  },
  forcePathStyle: true, // Required for self-hosted MinIO path-based routing
});

const BUCKET_NAME = process.env.MINIO_BUCKET || "cryptid-certs";

export const generatePresignedPut = async (fileKey: string, mimeType: string): Promise<string> => {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileKey,
    ContentType: mimeType,
  });
  
  // URL expires in 15 minutes
  return getSignedUrl(s3Client, command, { expiresIn: 900 });
};

export const deleteFile = async (fileKey: string): Promise<void> => {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileKey,
  });
  await s3Client.send(command);
};

export const fetchFileHeaderBytes = async (fileKey: string): Promise<Buffer> => {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileKey,
    Range: "bytes=0-4100", // Sniff only the first 4KB to save API bandwidth
  });
  
  const response = await s3Client.send(command);
  const byteArray = await response.Body?.transformToByteArray();
  
  if (!byteArray) throw new Error("Failed to read file bytes from MinIO");
  
  return Buffer.from(byteArray);
};
