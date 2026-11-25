import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { visaHistory } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { getCountry } from "@/lib/countries";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db
    .select()
    .from(visaHistory)
    .where(eq(visaHistory.userId, user.id))
    .orderBy(desc(visaHistory.issuedOn));
  return NextResponse.json({ history: rows });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json().catch(() => null);
  const country = getCountry(String(b?.destination ?? ""));
  if (!country) return NextResponse.json({ error: "Choose a country." }, { status: 400 });
  const issuedOn = String(b?.issuedOn ?? "").slice(0, 20);
  if (!issuedOn) return NextResponse.json({ error: "Issue date is required." }, { status: 400 });
  const outcome = ["approved", "rejected", "expired"].includes(b?.outcome) ? b.outcome : "approved";
  await db.insert(visaHistory).values({
    userId: user.id,
    destination: country.slug,
    visaType: String(b?.visaType || country.visaType).slice(0, 120),
    issuedOn,
    expiresOn: String(b?.expiresOn ?? "").slice(0, 20),
    outcome,
    notes: String(b?.notes ?? "").slice(0, 300),
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await db.delete(visaHistory).where(and(eq(visaHistory.id, id), eq(visaHistory.userId, user.id)));
  return NextResponse.json({ ok: true });
}
