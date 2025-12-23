import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";
import axios, { AxiosResponse } from "axios";
import { Request, Response } from "express";
import qs from "qs";
import { Line, User } from "../models";

interface ICreateUser {
  username: string;
  name: string;
  badge_number: string;
  enabled: boolean;
  groups: string[];
}

interface ICreateTokenResponse {
  access_token: string;
}

interface ISecret {
  KEY_CLOAK_CLIENT_ID: string;
  KEY_CLOAK_CLIENT_SECRET: string;
}

const secretRegion: string = process.env.AWS_REGION as string;
const secretName: string = process.env.SECRET_NAME as string;
const secretVersion: string = process.env.SECRET_VERSION_STAGE as string;

const getKeyCloakAuthToken = async (): Promise<string> => {
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

  const authData: string = qs.stringify({
    grant_type: process.env.KEY_CLOAK_GRANT_TYPE,
    client_id: secret.KEY_CLOAK_CLIENT_ID,
    client_secret: secret.KEY_CLOAK_CLIENT_SECRET,
  });

  const createTokenResponse: AxiosResponse<ICreateTokenResponse> =
    await axios.post(
      `${process.env.KEY_CLOAK_ADDRESS}/realms/${process.env.KEY_CLOAK_REALM}/protocol/openid-connect/token`,
      authData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

  if (createTokenResponse.status !== 200) {
    throw new Error("Failed to create user");
  }

  const token: string = createTokenResponse.data.access_token;
  return token;
};

export const create = async (req: Request, res: Response) => {
  try {
    const user: ICreateUser = req.body;

    const token: string = await getKeyCloakAuthToken();

    const createUserResponse: AxiosResponse<void> = await axios.post(
      `${process.env.KEY_CLOAK_ADDRESS}/admin/realms/${process.env.KEY_CLOAK_REALM}/users`,
      {
        username: user.username,
        enabled: user.enabled,
        groups: user.groups,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (createUserResponse.status !== 201) {
      return res.status(400).json({ message: "Failed to create user" });
    }

    const usersResponse = await axios.get(
      `${process.env.KEY_CLOAK_ADDRESS}/admin/realms/${process.env.KEY_CLOAK_REALM}/users`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const keyCloakUser = usersResponse.data.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (e: any) => e.username === user.username
    );

    if (!keyCloakUser) {
      return res.status(400).json({ message: "Failed to create user" });
    }

    const usersGroupSplit: string[] = user.groups[0]?.split(" ");
    let usersLine: string = "";
    let usersRole: string = "";

    if (!usersGroupSplit?.length) {
      return res
        .status(400)
        .json({ message: "Could not determine users group" });
    }

    if (usersGroupSplit.length > 3) {
      usersRole = usersGroupSplit[0] + " " + usersGroupSplit[1];
      usersLine = usersGroupSplit[2] + " " + usersGroupSplit[3];
    } else {
      usersRole = usersGroupSplit[0];
      usersLine = usersGroupSplit[1] + " " + usersGroupSplit[2];
    }

    const databaseUser = await User.create({
      username: user.username,
      name: user.name,
      badge_number: user.badge_number,
      key_cloak_id: keyCloakUser.id,
      line: usersLine,
      role: usersRole,
    });

    return res.json(databaseUser);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "internal server error", error: err });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const user: ICreateUser = req.body;
    const { id } = req.params;

    const token: string = await getKeyCloakAuthToken();

    const updateUserResponse: AxiosResponse<void> = await axios.put(
      `${process.env.KEY_CLOAK_ADDRESS}/admin/realms/${process.env.KEY_CLOAK_REALM}/users/${id}`,
      {
        username: user.username,
        enabled: user.enabled,
        groups: user.groups,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (updateUserResponse.status !== 200) {
      return res.status(400).json({ message: "Failed to create user" });
    }

    const usersResponse = await axios.get(
      `${process.env.KEY_CLOAK_ADDRESS}/admin/realms/${process.env.KEY_CLOAK_REALM}/users`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const keyCloakUser = usersResponse.data.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (e: any) => e.username === user.username
    );

    if (!keyCloakUser) {
      return res.status(400).json({ message: "Failed to create user" });
    }

    const usersGroupSplit: string[] = user.groups[0]?.split(" ");
    let usersLine: string = "";
    let usersRole: string = "";

    if (!usersGroupSplit?.length) {
      return res
        .status(400)
        .json({ message: "Could not determine users group" });
    }

    if (usersGroupSplit.length > 3) {
      usersRole = usersGroupSplit[0] + " " + usersGroupSplit[1];
      usersLine = usersGroupSplit[2] + " " + usersGroupSplit[3];
    } else {
      usersRole = usersGroupSplit[0];
      usersLine = usersGroupSplit[1] + " " + usersGroupSplit[2];
    }

    const databaseUser = await User.findByPk(id);

    if (!databaseUser) {
      return res.status(400).json({ message: "Failed to create user" });
    }

    databaseUser.username = user.username;
    databaseUser.name = user.name;
    databaseUser.line = usersLine;
    databaseUser.role = usersRole;

    const updatedUser: User = await databaseUser.save();

    return res.json(updatedUser);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "internal server error", error: err });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const token: string = await getKeyCloakAuthToken();

    const deleteUserResponse: AxiosResponse<void> = await axios.delete(
      `${process.env.KEY_CLOAK_ADDRESS}/admin/realms/${process.env.KEY_CLOAK_REALM}/users/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (deleteUserResponse.status !== 200) {
      return res.status(400).json({ message: "Failed to delete user" });
    }

    return res.status(204).send();
  } catch (err) {
    return res
      .status(500)
      .json({ message: "internal server error", error: err });
  }
};

export const getAllYardMotorPersonsByLine = async (
  req: Request,
  res: Response
) => {
  try {
    const { line_id } = req.query;

    if (!line_id || typeof line_id !== "string") {
      return res
        .status(400)
        .json({ message: "Missing line_id query parameter" });
    }

    const line: Line | null = await Line.findByPk(line_id);

    if (!line) {
      return res
        .status(400)
        .json({ message: "Could not find line with provided id" });
    }

    const users: User[] = await User.findAll({
      where: {
        role: "Yard MotorPerson",
        line: line.name,
      },
      attributes: ["id", "name", "badge_number"],
    });

    return res.json(users);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "internal server error", error: err });
  }
};

export const getAllYardMotorPersons = async (_: Request, res: Response) => {
  try {
    const users: User[] = await User.findAll({
      where: {
        role: "Yard MotorPerson",
      },
      attributes: ["id", "name", "badge_number"],
    });

    return res.json(users);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "internal server error", error: err });
  }
};

export const getAllYardMasters = async (_: Request, res: Response) => {
  try {
    const users: User[] = await User.findAll({
      where: {
        role: "Yardmaster",
      },
      attributes: ["id", "name", "badge_number"],
    });

    return res.json(users);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "internal server error", error: err });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    if (req.headers["authorization"] !== process.env.ROUTINE_SECRET) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const users: User[] = await User.findAll({
      attributes: [
        "id",
        "name",
        "badge_number",
        "username",
        "line",
        "role",
        "key_cloak_id",
      ],
    });

    return res.json(users);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "internal server error", error: err });
  }
};
