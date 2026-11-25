import { db, isDbConfigured } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isDbConfigured()) {
    return Response.json({ ok: true, app: "up", database: "not_configured" });
  }
  try {
    await db.execute(sql`select 1`);
    return Response.json({ ok: true, app: "up", database: "up" });
  } catch {
    return Response.json({ ok: true, app: "up", database: "unreachable" }, { status: 200 });
  }
}
