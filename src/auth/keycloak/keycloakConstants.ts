import { type JwtPayload } from "jsonwebtoken";

export interface ISecret {
  KEY_CLOAK_PUBLIC_SECRET: string;
}

export interface KeycloakToken extends JwtPayload {
  groups: string[];
}

export const KcSecretRegion: string = process.env.AWS_REGION!;
export const KcSecretName: string = process.env.SECRET_NAME!;
export const KcSecretVersion: string = process.env.SECRET_VERSION_STAGE!;
