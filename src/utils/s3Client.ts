import {
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from "@aws-sdk/client-s3";
import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";

const bucketName: string = process.env.SIGNATURES_BUCKET_NAME ?? "";
const region: string = process.env.AWS_REGION ?? "";
const secretName: string = process.env.SECRET_NAME as string;
const secretVersion: string = process.env.SECRET_VERSION_STAGE as string;

export const saveImage = async (
  fileBuffer: Buffer,
  caption: string,
  fileMimetype: string
) => {
  const client = new SecretsManagerClient({
    region: region,
  });

  const response = await client.send(
    new GetSecretValueCommand({
      SecretId: secretName,
      VersionStage: secretVersion,
    })
  );

  if (!response.SecretString) throw new Error("Error retrieving secrets");

  const s3Client: S3Client = new S3Client({
    region,
  });

  const fileName: string = `${caption}-${Date.now()}`;

  const uploadParams: PutObjectCommandInput = {
    Bucket: bucketName,
    Body: fileBuffer,
    Key: fileName,
    ContentType: fileMimetype,
  };

  await s3Client.send(new PutObjectCommand(uploadParams));

  const fileUrl: string = `https://${bucketName}.s3.${region}.amazonaws.com/${fileName}`;
  return fileUrl;
};
