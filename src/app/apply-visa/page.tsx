import { redirect } from "next/navigation";
import { ApplyWizard } from "@/components/ApplyWizard";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Apply for a visa — Nspace Visa Agency" };

export default async function ApplyVisa({ searchParams }: { searchParams: Promise<{ destination?: string }> }) {
  const { destination } = await searchParams;
  const user = await getCurrentUser();
  const back = `/apply-visa${destination ? `?destination=${encodeURIComponent(destination)}` : ""}`;
  if (!user) redirect(`/register?next=${encodeURIComponent(back)}`);
  return (
    <div className="px-4 py-8 sm:px-6 sm:py-12">
      <ApplyWizard
        initial={destination ?? "australia"}
        user={{
          name: user.name,
          email: user.email,
          phone: user.phone,
          passportNumber: user.passportNumber,
          passportExpiry: user.passportExpiry,
          dob: user.dob,
        }}
      />
    </div>
  );
}
