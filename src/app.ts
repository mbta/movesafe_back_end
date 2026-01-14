import cors from "cors";
import express, { Request, Response } from "express";
import routes from "./routes";

const app = express();

interface HttpError extends Error {
  status?: number;
}

app.use(express.json({ limit: "80mb" }));
app.use(cors({ origin: "*" }));

app.use("/api", routes);

app.use((_, res: Response) => {
  res.status(404).send();
});

app.use((err: HttpError, req: Request, res: Response) => {
  res.status(err.status || 500).send(err);
});

export default app;
