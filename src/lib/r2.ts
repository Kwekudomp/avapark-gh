import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

let _client: S3Client | null = null;

function client(): S3Client {
  if (!_client) {
    const accountId = process.env.R2_ACCOUNT_ID;
    if (!accountId) throw new Error("R2 env vars not configured");
    _client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  return _client;
}

/** Upload a file to R2 and return its public URL. */
export async function uploadToR2(
  key: string,
  body: Uint8Array,
  contentType: string
): Promise<string> {
  await client().send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
  return `${process.env.R2_PUBLIC_URL!.replace(/\/$/, "")}/${key}`;
}
