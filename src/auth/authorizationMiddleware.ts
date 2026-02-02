import { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import {
  authErrorResponse,
  ForbiddenError,
  UnauthorizedError,
} from "./authErrors.js";
import { isEntraIdIssuer, verifyEntraIdToken } from "./entra/entraAuth.js";
import { verifyKeycloakToken } from "./keycloak/keycloakAuth.js";

const getBearerToken = (req: Request): string => {
  const authToken = req.headers["authorization"]?.split(" ")[1] || null;

  if (!authToken) {
    throw new UnauthorizedError(
      "Authentication is required to access this resource."
    );
  }

  return authToken;
};

const getUserFromToken = async (
  token: string
): Promise<{
  userId: string;
  userGroups: string[];
  user?: {
    name: string;
    username: string;
    badgeNumber: string;
  };
}> => {
  const decodedUnverified = jwt.decode(token) as JwtPayload;

  return isEntraIdIssuer(decodedUnverified.iss)
    ? await verifyEntraIdToken(token)
    : await verifyKeycloakToken(token);
};

const isUserAllowed = (
  userGroups: string[],
  allowedRoles: string[]
): boolean => {
  return !!userGroups.find((g) => allowedRoles.includes(g));
};

export const authorize = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authToken = getBearerToken(req);
      const { userId, userGroups, user } = await getUserFromToken(authToken);

      if (!isUserAllowed(userGroups, allowedRoles)) {
        throw new ForbiddenError(
          "You do not have permission to access this resource."
        );
      }

      req.headers.key_cloak_user_id = userId;
      req.headers.userGroups = userGroups;
      req.headers.user = user ? JSON.stringify(user) : undefined;

      next();
    } catch (error: unknown) {
      return authErrorResponse(res, error);
    }
  };
};
