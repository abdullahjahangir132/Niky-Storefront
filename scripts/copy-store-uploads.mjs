import { cp, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(workspaceRoot, "artifacts", "api-server", "uploads");
const destination = path.join(
  workspaceRoot,
  "artifacts",
  "niky-store",
  "dist",
  "public",
  "api",
  "uploads",
);

await mkdir(path.dirname(destination), { recursive: true });
await cp(source, destination, { recursive: true, force: true });
console.log(`Copied storefront media from ${path.relative(workspaceRoot, source)} to build output.`);
