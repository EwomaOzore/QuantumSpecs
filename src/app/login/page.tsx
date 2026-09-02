import type { Metadata } from "next";
import { Suspense } from "react";
import { Mark } from "@/components/ui/mark";
import { LoginForm } from "@/components/auth/login-form";
import { JsonLd } from "@/components/seo/json-ld";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata("/login");

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <div className="flex min-h-full items-center justify-center px-4">
      <JsonLd data={breadcrumbJsonLd("/login")} />
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-2.5">
          <Mark className="h-7 w-7 text-qs-accent" />
          <div>
            <p className="text-[15px] font-semibold tracking-tight">QuantumSpecs</p>
            <p className="text-[11px] uppercase tracking-[0.16em] text-qs-faint">Kora operations</p>
          </div>
        </div>
        <h1 className="text-[22px] font-medium tracking-tight">Sign in to QuantumSpecs</h1>
        <p className="mt-1 mb-4 text-[13px] text-qs-muted">Kora production operations console.</p>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
