import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, isDbConfigured } from "@/db";
import { users } from "@/db/schema";
import { createSession, verifyPassword } from "@/lib/auth";

export async function POST(req: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: "Accounts open as soon as the database is connected. Browse destinations meanwhile." },
      { status: 503 },
    );
  }
  const body = await req.json().catch(() => null);
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }
  await createSession(user.id);
  return NextResponse.json({ ok: true });
}
