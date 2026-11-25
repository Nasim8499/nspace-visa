import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Create account — Nspace Visa Agency" };

export default async function Register({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const dest = next && next.startsWith("/") ? next : "/dashboard";
  if (await getCurrentUser()) redirect(dest);
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-4 py-10">
      <AuthForm mode="register" next={dest} />
    </div>
  );
}
