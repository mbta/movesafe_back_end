import express, { Express } from "express";
var cors = require('cors');

import routes from "./routes";

const app: Express = express();

app.use(express.json({ limit: '80mb' }));
app.use(cors({ origin: '*' }));

app.use("/api", routes);

app.use((_: express.Request, res: express.Response) => {
    res.status(404).send();
});

app.use((err: any, _: express.Request, res: express.Response) => { // eslint-disable-line
    console.log(err)
    res.status(err.status || 500).send(err);
});

export default app;