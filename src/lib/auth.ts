import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { and, eq, gt } from "drizzle-orm";
import { db, isDbConfigured } from "@/db";
import { sessions, users } from "@/db/schema";

const COOKIE = "nspace_session";
const MAX_AGE = 60 * 60 * 24 * 30;

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const a = Buffer.from(hash, "hex");
  const b = scryptSync(password, salt, 64);
  return a.length === b.length && timingSafeEqual(a, b);
}

const sha = (s: string) => createHash("sha256").update(s).digest("hex");

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  await db.insert(sessions).values({
    tokenHash: sha(token),
    userId,
    expiresAt: new Date(Date.now() + MAX_AGE * 1000),
  });
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await db.delete(sessions).where(eq(sessions.tokenHash, sha(token)));
  jar.delete(COOKIE);
}

export type SafeUser = Omit<typeof users.$inferSelect, "passwordHash">;

export async function getCurrentUser(): Promise<SafeUser | null> {
  /* without a database there are no sessions to read; the site stays usable */
  if (!isDbConfigured()) return null;
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      nationality: users.nationality,
      passportNumber: users.passportNumber,
      passportExpiry: users.passportExpiry,
      dob: users.dob,
      city: users.city,
      createdAt: users.createdAt,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.tokenHash, sha(token)), gt(sessions.expiresAt, new Date())))
      .limit(1);
    return rows[0] ?? null;
  } catch {
    return null;
  }
}
