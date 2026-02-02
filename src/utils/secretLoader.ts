import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";

export interface ISecret {
  KEY_CLOAK_PUBLIC_SECRET: string;
  KEY_CLOAK_CLIENT_ID: string;
  KEY_CLOAK_CLIENT_SECRET: string;
  EVERBRIDGE_ORG_ID: string;
  EVERBRIDGE_AUTH: string;
  ENTRA_TENANT_ID: string;
  host: string;
  engine: string;
}

export interface IDbSecret {
  username: string;
  password: string;
}

const SECRET_REGION: string = process.env.AWS_REGION!;
const SECRET_NAME: string = process.env.SECRET_NAME!;
const SECRET_VERSION_STAGE: string = process.env.SECRET_VERSION_STAGE!;

const DB_SECRET_NAME: string = process.env.SECRET_NAME_DB!;
const DB_SECRET_VERSION_STAGE: string = process.env.SECRET_VERSION_STAGE!;

let cachedSecret: ISecret | null = null;
let cachedDbSecret: IDbSecret | null = null;

export const getAppSecret = async (): Promise<ISecret> => {
  if (cachedSecret) return cachedSecret;

  const client = new SecretsManagerClient({ region: SECRET_REGION });
  const response = await client.send(
    new GetSecretValueCommand({
      SecretId: SECRET_NAME,
      VersionStage: SECRET_VERSION_STAGE,
    })
  );

  if (!response.SecretString) throw new Error("Error retrieving secrets");

  cachedSecret = JSON.parse(response.SecretString);
  return cachedSecret!;
};

export const getDbSecret = async (): Promise<IDbSecret> => {
  if (cachedDbSecret) return cachedDbSecret;

  const client = new SecretsManagerClient({ region: SECRET_REGION });
  const response = await client.send(
    new GetSecretValueCommand({
      SecretId: DB_SECRET_NAME,
      VersionStage: DB_SECRET_VERSION_STAGE,
    })
  );

  if (!response.SecretString) throw new Error("Error retrieving DB secrets");

  cachedDbSecret = JSON.parse(response.SecretString);
  return cachedDbSecret!;
};
