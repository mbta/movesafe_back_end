import 'dotenv/config';
const serverless = require('serverless-http'); // eslint-disable-line

require("./database");

import app from "./app";

const isDevelopment: boolean = process.argv[2] === "--development";

if (isDevelopment) {
    app.listen(8080, () => {
        console.log(`Server is listening on port 8080`);
    });
}

export const handler = serverless(app);