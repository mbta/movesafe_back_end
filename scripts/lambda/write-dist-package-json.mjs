import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "../../dist");

await mkdir(distDir, { recursive: true });

await writeFile(
  path.join(distDir, "package.json"),
  JSON.stringify({ type: "module" }, null, 2),
  "utf8"
);
