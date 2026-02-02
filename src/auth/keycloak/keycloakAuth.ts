import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../authErrors.js";
import {
  ISecret,
  KcSecretName,
  KcSecretRegion,
  KcSecretVersion,
  KeycloakToken,
} from "./keycloakConstants.js";

const getSecret = async (): Promise<ISecret> => {
  const client = new SecretsManagerClient({ region: KcSecretRegion });
  const response = await client.send(
    new GetSecretValueCommand({
      SecretId: KcSecretName,
      VersionStage: KcSecretVersion,
    })
  );

  if (!response.SecretString) throw new Error("Error retrieving secrets");

  return JSON.parse(response.SecretString);
};

export const verifyKeycloakToken = async (
  token: string
): Promise<{
  userId: string;
  userGroups: string[];
}> => {
  const secret = await getSecret();

  const keyCloakKey: string = `-----BEGIN PUBLIC KEY-----\n${secret.KEY_CLOAK_PUBLIC_SECRET}\n-----END PUBLIC KEY-----`;
  const decodedToken = jwt.verify(token, keyCloakKey, {
    algorithms: ["RS256"],
  }) as KeycloakToken;

  if (!decodedToken.sub) {
    throw new UnauthorizedError("Invalid token: missing subject");
  }

  return {
    userId: decodedToken.sub,
    userGroups: decodedToken.groups ?? [],
  };
};
