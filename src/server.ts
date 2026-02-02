import "dotenv/config";
import serverless from "serverless-http";

import "./database/index.js";

import app from "./app.js";

const isDevelopment: boolean = process.argv[2] === "--development";

if (isDevelopment) {
  app.listen(8080, () => {
    console.log(`Server is listening on port 8080`);
  });
}

export const handler = serverless(app);
