import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, isDbConfigured } from "@/db";
import { users } from "@/db/schema";
import { createSession, hashPassword } from "@/lib/auth";

export async function POST(req: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: "Accounts open as soon as the database is connected. Browse destinations meanwhile." },
      { status: 503 },
    );
  }
  const body = await req.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");
  const phone = String(body?.phone ?? "").trim();

  if (name.length < 2) return NextResponse.json({ error: "Please enter your full name." }, { status: 400 });
  if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  if (password.length < 6) return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing.length) return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });

  const [user] = await db
    .insert(users)
    .values({ name, email, phone, passwordHash: hashPassword(password) })
    .returning({ id: users.id });
  await createSession(user.id);
  return NextResponse.json({ ok: true });
}
