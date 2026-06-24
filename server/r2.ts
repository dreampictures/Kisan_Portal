import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const R2_CONFIGURED =
  process.env.R2_ACCOUNT_ID &&
  process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_SECRET_ACCESS_KEY &&
  process.env.R2_BUCKET_NAME &&
  process.env.R2_PUBLIC_URL;

let r2Client: S3Client | null = null;
let BUCKET = "";
let PUBLIC_URL = "";

if (R2_CONFIGURED) {
  r2Client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
    requestHandler: {
      requestTimeout: 10000,
      connectionTimeout: 8000,
    } as any,
  });
  BUCKET = process.env.R2_BUCKET_NAME!;
  PUBLIC_URL = process.env.R2_PUBLIC_URL!.replace(/\/$/, "");
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`R2 upload timed out after ${ms}ms`)), ms)
    ),
  ]);
}

export async function uploadPhotoToR2(
  buffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<string> {
  if (!r2Client) {
    throw new Error("R2 storage is not configured — set R2_* environment variables to enable photo uploads.");
  }
  await withTimeout(
    r2Client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: fileName,
        Body: buffer,
        ContentType: mimeType,
      })
    ),
    10000
  );
  return `${PUBLIC_URL}/${fileName}`;
}

export async function deletePhotoFromR2(photoUrl: string): Promise<void> {
  if (!r2Client) return;
  try {
    const key = photoUrl.replace(`${PUBLIC_URL}/`, "");
    await r2Client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
  } catch (e) {
    console.error("R2 delete error:", e);
  }
}

export function isR2Configured(): boolean {
  return !!R2_CONFIGURED;
}
