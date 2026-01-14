import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";
import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";

interface ISecret {
  KEY_CLOAK_PUBLIC_SECRET: string;
}

interface KeycloakToken extends jwt.JwtPayload {
  groups: string[];
}

const secretRegion: string = process.env.AWS_REGION as string;
const secretName: string = process.env.SECRET_NAME as string;
const secretVersion: string = process.env.SECRET_VERSION_STAGE as string;

export const authorize = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authToken: string | undefined =
        req.headers["authorization"]?.split(" ")[1];

      if (!authToken)
        return res.status(401).json({
          error: "Unauthorized",
          message: "Authentication is required to access this resource.",
        });

      const client = new SecretsManagerClient({
        region: secretRegion,
      });

      const response = await client.send(
        new GetSecretValueCommand({
          SecretId: secretName,
          VersionStage: secretVersion,
        })
      );

      if (!response.SecretString) throw new Error("Error retrieving secrets");

      const secret: ISecret = JSON.parse(response.SecretString);

      const keyCloakKey: string = `-----BEGIN PUBLIC KEY-----\n${secret.KEY_CLOAK_PUBLIC_SECRET}\n-----END PUBLIC KEY-----`;

      const decodedToken = jwt.verify(authToken, keyCloakKey, {
        algorithms: ["RS256"],
      }) as KeycloakToken;

      if (!decodedToken.sub) {
        return res.status(401).json({
          error: "Unauthorized",
          message: "Invalid token: missing subject",
        });
      }

      const userGroups: string[] = decodedToken.groups;

      const isUserAllowed: boolean = !!userGroups.find((g) =>
        allowedRoles.includes(g)
      );

      if (!isUserAllowed) {
        return res.status(403).json({
          error: "Forbidden",
          message:
            "You do not have the required permissions to access this resource.",
        });
      }

      req.headers.key_cloak_user_id = decodedToken.sub;
      req.headers.userGroups = userGroups;
      next();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";

      return res.status(500).json({
        error: "Internal Server Error",
        message: errorMessage,
      });
    }
  };
};
