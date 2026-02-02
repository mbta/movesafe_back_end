import axios, { AxiosResponse } from "axios";
import { Request, Response } from "express";
import {
  EVERBRIDGE_ATTR_NAMES,
  EVERBRIDGE_TO_DB_JOB_MAP,
  EVERBRIDGE_TO_DB_LINE_MAP,
  EverbridgeContact,
  EverbridgeContactAttribute,
  EverbridgeContactResponse,
} from "./everbridgeConstants.js";
import { getAppSecret } from "./secretLoader.js";

const EVERBRIDGE_BASE_URL: string = "https://api.everbridge.net/rest";

const fetchEverbridgeContacts =
  async (): Promise<EverbridgeContactResponse> => {
    const secrets = await getAppSecret();

    const response: AxiosResponse<EverbridgeContactResponse> = await axios.get(
      `${EVERBRIDGE_BASE_URL}/contacts/${secrets.EVERBRIDGE_ORG_ID}`,
      {
        headers: {
          accept: "application/json",
          authorization: secrets.EVERBRIDGE_AUTH,
        },
      }
    );

    return response.data;
  };

const getContactFromEmail = (
  contacts: EverbridgeContact[],
  email: string
): EverbridgeContact => {
  const lowerEmail = email.toLowerCase();

  return (
    contacts.find(
      (c) =>
        typeof c.ssoUserId === "string" &&
        c.ssoUserId.toLowerCase() === lowerEmail
    ) || ({} as EverbridgeContact)
  );
};

const convertEverbridgeAttributesToRecord = (
  attributes: EverbridgeContactAttribute[]
) => {
  for (const attr of attributes) {
    if (attr.name === EVERBRIDGE_ATTR_NAMES.JOB_CODE) {
      attr.values = attr.values.map((v) => EVERBRIDGE_TO_DB_JOB_MAP[v] || v);
    } else if (attr.name === EVERBRIDGE_ATTR_NAMES.AREA) {
      attr.values = attr.values.map(
        (v) => EVERBRIDGE_TO_DB_LINE_MAP[Number(v)] || v
      );
    }
  }
};

export const getEverbridgeUserByEmail = async (
  email: string
): Promise<EverbridgeContact> => {
  const data = await fetchEverbridgeContacts();
  const contact = getContactFromEmail(data.page.data, email);
  convertEverbridgeAttributesToRecord(contact.contactAttributes || []);
  return contact;
};

export const getAttributeValues = (
  contact: EverbridgeContact,
  attributeName: string
): string[] => {
  return (
    contact.contactAttributes?.find((attr) => attr.name === attributeName)
      ?.values || []
  );
};

export const getEverbridgeName = (contact: EverbridgeContact): string => {
  return `${contact.firstName || ""} ${contact.lastName || ""}`.trim();
};

export const getEverbridgeContact = async (req: Request, res: Response) => {
  const email = req.body.email;

  if (!email) return res.status(400).json({ error: "Missing 'email'" });

  try {
    const contact = await getEverbridgeUserByEmail(email);
    return res.json(contact);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch Everbridge contacts" });
  }
};
