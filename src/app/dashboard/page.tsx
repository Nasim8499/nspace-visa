import { redirect } from "next/navigation";
import { Dashboard } from "@/components/Dashboard";
import { getCurrentUser } from "@/lib/auth";
import { listApplications } from "@/lib/applications";

export const metadata = { title: "Dashboard — Nspace Visa Agency" };

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");
  const apps = await listApplications(user.id);
  const fields = [user.name, user.phone, user.passportNumber, user.passportExpiry, user.dob, user.city];
  const completeness = Math.round((fields.filter(Boolean).length / fields.length) * 100);
  return <Dashboard name={user.name} initial={apps} completeness={completeness} />;
}
