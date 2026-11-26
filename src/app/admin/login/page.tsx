import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { site } from "@/lib/site";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Admin login", robots: { index: false, follow: false } };

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");

  return (
    <div className="grid min-h-screen place-items-center bg-slate-100 px-4">
      <div className="card w-full max-w-sm p-8">
        <div className="mb-6 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-500 text-2xl text-white">🔐</span>
          <h1 className="mt-4 text-xl font-extrabold">{site.name} Admin</h1>
          <p className="mt-1 text-sm text-slate-500">Enter your admin password</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
