import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME!;
const PUBLIC_URL = process.env.R2_PUBLIC_URL!.replace(/\/$/, "");

export async function uploadPhotoToR2(
  buffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<string> {
  const key = `photos/${fileName}`;
  await r2Client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    })
  );
  return `${PUBLIC_URL}/${key}`;
}

export async function deletePhotoFromR2(photoUrl: string): Promise<void> {
  try {
    const key = photoUrl.replace(`${PUBLIC_URL}/`, "");
    await r2Client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
  } catch (e) {
    console.error("R2 delete error:", e);
  }
}
