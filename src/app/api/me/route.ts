import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json({ user });
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const s = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);
  const name = s(b.name, 120);
  if (name.length < 2) return NextResponse.json({ error: "Name is too short." }, { status: 400 });
  await db
    .update(users)
    .set({
      name,
      phone: s(b.phone, 40),
      nationality: s(b.nationality, 80) || "Bangladesh",
      passportNumber: s(b.passportNumber, 40).toUpperCase(),
      passportExpiry: s(b.passportExpiry, 20),
      dob: s(b.dob, 20),
      city: s(b.city, 80),
    })
    .where(eq(users.id, user.id));
  return NextResponse.json({ ok: true });
}
