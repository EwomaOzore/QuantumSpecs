"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/";
  const [email, setEmail] = useState("ewoma@kora.pay");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="rounded-lg border border-qs-border bg-qs-surface p-5"
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        setError(null);
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
          callbackUrl,
        });
        setPending(false);
        if (result?.error) {
          setError("Could not sign in. Use kora-ops locally, or the CONSOLE_PASSWORD set for this environment.");
          return;
        }
        window.location.href = callbackUrl;
      }}
    >
      <div className="text-[15px] font-medium">Sign in</div>
      <p className="mt-1 text-[13px] text-qs-muted">Use a Kora team email and the console password.</p>
      <label htmlFor="email" className="mt-4 block text-[11px] uppercase tracking-[0.14em] text-qs-faint">Email</label>
      <Input
        id="email"
        name="email"
        type="email"
        autoComplete="username"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mt-1 h-10"
        required
      />
      <label htmlFor="password" className="mt-3 block text-[11px] uppercase tracking-[0.14em] text-qs-faint">Password</label>
      <Input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mt-1 h-10"
        required
      />
      {error ? <p className="mt-3 text-[13px] text-qs-danger">{error}</p> : null}
      <Button variant="primary" className="mt-4 w-full" size="lg" type="submit" disabled={pending}>
        {pending ? "Signing in…" : "Continue"}
      </Button>
    </form>
  );
}
