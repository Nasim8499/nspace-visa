import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/ProfileForm";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "My profile — Nspace Visa Agency" };

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/profile");
  return (
    <ProfileForm
      since={user.createdAt.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
      user={{
        name: user.name,
        email: user.email,
        phone: user.phone,
        nationality: user.nationality,
        passportNumber: user.passportNumber,
        passportExpiry: user.passportExpiry,
        dob: user.dob,
        city: user.city,
      }}
    />
  );
}
