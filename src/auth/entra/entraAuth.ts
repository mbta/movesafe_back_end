import jwt, { type JwtPayload } from "jsonwebtoken";
import {
  getAttributeValues,
  getEverbridgeName,
  getEverbridgeUserByEmail,
} from "../../utils/everbridge.js";
import {
  EVERBRIDGE_ATTR_NAMES,
  EverbridgeContact,
} from "../../utils/everbridgeConstants.js";
import { UnauthorizedError } from "../authErrors.js";
import { ENTRA_ISSUERS } from "./entraConstants.js";

const getEmailFromPayload = (payload: JwtPayload): string => {
  const email = payload.email || payload.upn;

  if (!email || typeof email !== "string") {
    throw new UnauthorizedError("Invalid token: missing email");
  }

  return email;
};

const getUserId = (payload: JwtPayload): string => {
  const userId = payload.oid || payload.sub;

  if (!userId || typeof userId !== "string") {
    throw new UnauthorizedError("Invalid token: missing user ID");
  }

  return userId;
};

const getEverbridgeUserGroups = (contact: EverbridgeContact): string[] => {
  const jobCodes = getAttributeValues(contact, EVERBRIDGE_ATTR_NAMES.JOB_CODE);
  const areas = getAttributeValues(contact, EVERBRIDGE_ATTR_NAMES.AREA);

  if (jobCodes.length === 0 || areas.length === 0) {
    throw new UnauthorizedError(
      `User does not have any assigned roles in Everbridge, Contact: ${JSON.stringify(
        contact
      )}`
    );
  }

  const userGroups: string[] = [];
  for (const jobCode of jobCodes) {
    for (const area of areas) {
      userGroups.push(`/${jobCode} ${area}`);
    }
  }

  return userGroups;
};

export const isEntraIdIssuer = (iss?: unknown): boolean => {
  if (typeof iss !== "string") return false;

  return ENTRA_ISSUERS.some((entraIssuer) => iss.includes(entraIssuer));
};

export const verifyEntraIdToken = async (
  token: string
): Promise<{
  userId: string;
  userGroups: string[];
  user: {
    name: string;
    username: string;
    badgeNumber: string;
  };
}> => {
  const decodedToken = jwt.decode(token) as JwtPayload;
  const email = getEmailFromPayload(decodedToken);
  const everbridgeUser = await getEverbridgeUserByEmail(email);

  if (!everbridgeUser) {
    throw new UnauthorizedError("User not found in Everbridge");
  }

  const userId = getUserId(decodedToken);
  const userGroups = getEverbridgeUserGroups(everbridgeUser);
  const user = {
    name: getEverbridgeName(everbridgeUser),
    username: everbridgeUser.ssoUserId || email,
    badgeNumber: everbridgeUser.externalId || "000000",
  };

  return {
    userId: userId,
    userGroups: userGroups,
    user: user,
  };
};
