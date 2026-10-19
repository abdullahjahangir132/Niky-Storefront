// @ts-nocheck
import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";
import crypto from "crypto";

const router = Router();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "nano-shoes-salt-2024").digest("hex");
}

function mapUser(u: typeof usersTable.$inferSelect) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    avatar: u.avatar,
    isActive: u.isActive,
    createdAt: u.createdAt.toISOString(),
  };
}

// POST /api/auth/register
router.post("/auth/register", async (req, res) => {
  const { name, email, password, confirmPassword, phone = "" } = req.body;

  if (!name || !email || !password || !confirmPassword) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }
  if (password !== confirmPassword) {
    res.status(400).json({ error: "Passwords do not match" });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters" });
    return;
  }

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const passwordHash = hashPassword(password);
  const [user] = await db
    .insert(usersTable)
    .values({ name, email: email.toLowerCase(), phone, passwordHash })
    .returning();

  req.session.userId = user.id;

  res.status(201).json({ user: mapUser(user), message: "Account created successfully" });
});

// POST /api/auth/login
router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);
  if (!user || user.passwordHash !== hashPassword(password)) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  if (!user.isActive) {
    res.status(401).json({ error: "Account is disabled" });
    return;
  }

  req.session.userId = user.id;

  res.json({ user: mapUser(user), message: "Logged in successfully" });
});

// POST /api/auth/logout
router.post("/auth/logout", (req, res) => {
  req.session.userId = undefined;
  res.json({ message: "Logged out" });
});

// GET /api/auth/me
router.get("/auth/me", async (req, res) => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId)).limit(1);
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  res.json(mapUser(user));
});

// PUT /api/auth/profile
router.put("/auth/profile", async (req, res) => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const { name, phone, avatar } = req.body;
  const updates: Partial<typeof usersTable.$inferInsert> = {};
  if (name) updates.name = name;
  if (phone !== undefined) updates.phone = phone;
  if (avatar !== undefined) updates.avatar = avatar;

  const [user] = await db
    .update(usersTable)
    .set(updates)
    .where(eq(usersTable.id, req.session.userId))
    .returning();

  res.json(mapUser(user));
});

// PUT /api/auth/change-password
router.put("/auth/change-password", async (req, res) => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const { currentPassword, newPassword, confirmPassword } = req.body;
  if (newPassword !== confirmPassword) {
    res.status(400).json({ error: "Passwords do not match" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId)).limit(1);
  if (!user || user.passwordHash !== hashPassword(currentPassword)) {
    res.status(400).json({ error: "Wrong current password" });
    return;
  }

  await db.update(usersTable).set({ passwordHash: hashPassword(newPassword) }).where(eq(usersTable.id, req.session.userId));
  res.json({ message: "Password changed successfully" });
});

export default router;
