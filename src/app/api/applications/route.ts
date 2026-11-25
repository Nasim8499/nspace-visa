import { NextResponse } from "next/server";
import { db } from "@/db";
import { applicationEvents, applications } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { listApplications } from "@/lib/applications";
import { STAGES, getCountry, totalFeeBdt } from "@/lib/countries";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const apps = await listApplications(user.id);
  return NextResponse.json({ applications: apps, serverTime: Date.now() });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in to apply." }, { status: 401 });
  const b = await req.json().catch(() => null);
  const country = getCountry(String(b?.destination ?? ""));
  if (!country) return NextResponse.json({ error: "Unknown destination." }, { status: 400 });

  const s = (v: unknown, max = 120) => String(v ?? "").trim().slice(0, max);
  const travelers = Math.min(10, Math.max(1, Number(b?.travelers) || 1));
  const required = {
    fullName: s(b?.fullName),
    passportNumber: s(b?.passportNumber, 40).toUpperCase(),
    passportExpiry: s(b?.passportExpiry, 20),
    dob: s(b?.dob, 20),
    email: s(b?.email, 200),
    phone: s(b?.phone, 40),
    travelDate: s(b?.travelDate, 20),
  };
  for (const [k, v] of Object.entries(required)) {
    if (!v) return NextResponse.json({ error: `Missing field: ${k}` }, { status: 400 });
  }
  if (new Date(required.travelDate).getTime() < Date.now() - 86400000) {
    return NextResponse.json({ error: "Travel date cannot be in the past." }, { status: 400 });
  }

  const ref = "NSP-" + Math.random().toString(36).slice(2, 8).toUpperCase() + Date.now().toString().slice(-3);
  const [app] = await db
    .insert(applications)
    .values({
      ref,
      userId: user.id,
      destination: country.slug,
      visaType: country.visaType,
      travelers,
      ...required,
      purpose: s(b?.purpose, 40) || "Tourism",
      paymentMethod: s(b?.paymentMethod, 30) || "bKash",
      amountBdt: totalFeeBdt(country, travelers),
    })
    .returning();
  await db.insert(applicationEvents).values({
    applicationId: app.id,
    status: STAGES[0].key,
    note: STAGES[0].note,
  });
  return NextResponse.json({ ok: true, id: app.id, ref });
}
