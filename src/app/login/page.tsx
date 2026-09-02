import { Suspense } from "react";
import { Mark } from "@/components/ui/mark";
import { LoginForm } from "@/components/auth/login-form";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <div className="flex min-h-full items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-2.5">
          <Mark className="h-7 w-7 text-qs-accent" />
          <div>
            <div className="text-[15px] font-semibold tracking-tight">QuantumSpecs</div>
            <div className="text-[11px] uppercase tracking-[0.16em] text-qs-faint">Kora operations</div>
          </div>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
