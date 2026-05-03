import { Router, Request, Response } from "express";
import { AdminLoginBody } from "@workspace/api-zod";

const router = Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "nano-admin-2024";

// POST /api/admin/auth/login
router.post("/admin/auth/login", (req: Request, res: Response) => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Password required" });
    return;
  }

  if (parsed.data.password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  (req.session as typeof req.session & { adminAuthenticated?: boolean }).adminAuthenticated = true;
  res.json({ authenticated: true });
});

// POST /api/admin/auth/logout
router.post("/admin/auth/logout", (req: Request, res: Response) => {
  req.session.destroy(() => {
    res.json({ authenticated: false });
  });
});

// GET /api/admin/auth/me
router.get("/admin/auth/me", (req: Request, res: Response) => {
  const authenticated = !!(req.session as typeof req.session & { adminAuthenticated?: boolean }).adminAuthenticated;
  res.json({ authenticated });
});

export default router;
