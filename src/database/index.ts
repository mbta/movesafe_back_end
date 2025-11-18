import {
    GetSecretValueCommand,
    SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";
import { Config, Dialect } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import { DeepWriteable } from "sequelize/types/utils";
import * as models from "../models";

interface ISecret {
    username: string;
    password: string;
    host: string;
    engine: string;
}

const dbName: string = process.env.DB_NAME as string;
const dbDialect: string = process.env.DB_DIALECT as string;
const secretRegion: string = process.env.AWS_REGION as string;
const secretName: string = process.env.SECRET_NAME as string;
const dbSecretName: string = process.env.SECRET_NAME_DB as string;
const secretVersion: string = process.env.SECRET_VERSION_STAGE as string;

const sequelizeConnection: Sequelize = new Sequelize({
    dialect: dbDialect as Dialect,
    models: Object.values(models),
    hooks: {
        beforeConnect: async (config: DeepWriteable<Config>): Promise<void> => {
            const client = new SecretsManagerClient({
                region: secretRegion,
            });

            let response = await client.send(
                new GetSecretValueCommand({
                    SecretId: secretName,
                    VersionStage: secretVersion,
                })
            );

            if (!response.SecretString) {
                throw new Error("Error retrieving secrets");
            }

            let dbResponse = await client.send(
                new GetSecretValueCommand({
                    SecretId: dbSecretName,
                    VersionStage: secretVersion,
                })
            );

            if (!dbResponse.SecretString) {
                throw new Error("Error retrieving DB secrets");
            }

            const secret: ISecret = JSON.parse(response.SecretString);
            const dbSecret: ISecret = JSON.parse(dbResponse.SecretString);

            config.database = dbName;
            config.username = dbSecret.username;
            config.password = dbSecret.password;
            config.host = secret.host;
        },
    },
});

export default sequelizeConnection;
