import path from "node:path";

// Vercel's function filesystem is read-only except for /tmp. Existing media is
// copied into the static build; new uploads use /tmp until persistent storage
// is configured for the deployment.
export const uploadDir =
  process.env.UPLOAD_DIR ||
  (process.env.VERCEL === "1"
    ? path.join("/tmp", "niky-store-uploads")
    : path.join(process.cwd(), "uploads"));
