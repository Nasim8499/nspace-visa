import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { applicationEvents, applications } from "@/db/schema";
import { STAGES, getCountry } from "@/lib/countries";

export type AppEvent = {
  id: number;
  status: string;
  note: string;
  createdAt: string;
};

export type AppView = {
  id: string;
  ref: string;
  destination: string;
  destinationName: string;
  iso: string;
  visaType: string;
  travelers: number;
  travelDate: string;
  fullName: string;
  amountBdt: number;
  paymentMethod: string;
  status: string;
  stageIndex: number;
  progress: number;
  createdAt: string;
  events: AppEvent[];
};

/** Advance applications through demo stages based on elapsed time (live tracking). */
async function advance(app: typeof applications.$inferSelect, existing: string[]) {
  const elapsed = (Date.now() - app.createdAt.getTime()) / 1000;
  let latest = app.status;
  for (const stage of STAGES) {
    if (elapsed >= stage.at) {
      latest = stage.key;
      if (!existing.includes(stage.key)) {
        await db.insert(applicationEvents).values({
          applicationId: app.id,
          status: stage.key,
          note: stage.note,
          createdAt: new Date(app.createdAt.getTime() + stage.at * 1000),
        });
        existing.push(stage.key);
      }
    }
  }
  if (latest !== app.status) {
    await db
      .update(applications)
      .set({ status: latest, updatedAt: new Date() })
      .where(eq(applications.id, app.id));
  }
  return latest;
}

export async function listApplications(userId: string, onlyId?: string): Promise<AppView[]> {
  const rows = await db
    .select()
    .from(applications)
    .where(
      onlyId
        ? and(eq(applications.userId, userId), eq(applications.id, onlyId))
        : eq(applications.userId, userId),
    )
    .orderBy(desc(applications.createdAt));
  if (!rows.length) return [];

  const evs = await db
    .select()
    .from(applicationEvents)
    .where(inArray(applicationEvents.applicationId, rows.map((r) => r.id)))
    .orderBy(asc(applicationEvents.createdAt));

  const out: AppView[] = [];
  for (const app of rows) {
    const mine = evs.filter((e) => e.applicationId === app.id);
    const keys = mine.map((e) => e.status);
    const before = keys.length;
    const status = await advance(app, keys);
    let events = mine;
    if (keys.length !== before) {
      events = await db
        .select()
        .from(applicationEvents)
        .where(eq(applicationEvents.applicationId, app.id))
        .orderBy(asc(applicationEvents.createdAt));
    }
    const stageIndex = Math.max(0, STAGES.findIndex((s) => s.key === status));
    const country = getCountry(app.destination);
    out.push({
      id: app.id,
      ref: app.ref,
      destination: app.destination,
      destinationName: country?.name ?? app.destination,
      iso: country?.iso ?? "un",
      visaType: app.visaType,
      travelers: app.travelers,
      travelDate: app.travelDate,
      fullName: app.fullName,
      amountBdt: app.amountBdt,
      paymentMethod: app.paymentMethod,
      status,
      stageIndex,
      progress: Math.round(((stageIndex + 1) / STAGES.length) * 100),
      createdAt: app.createdAt.toISOString(),
      events: events.map((e) => ({
        id: e.id,
        status: e.status,
        note: e.note,
        createdAt: e.createdAt.toISOString(),
      })),
    });
  }
  return out;
}
