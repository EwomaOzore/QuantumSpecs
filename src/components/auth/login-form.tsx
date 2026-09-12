"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm({
  email: initialEmail,
  password: initialPassword,
}: {
  email: string;
  password: string;
}) {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/";
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState(initialPassword);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      method="post"
      action="/login"
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
        if (result?.status === 429) {
          setError(
            "Too many sign-in attempts. Wait a few minutes and try again.",
          );
          return;
        }
        if (result?.error) {
          setError("Could not sign in. Check the desk email and password.");
          return;
        }
        window.location.href = callbackUrl;
      }}
    >
      <p className="text-[13px] text-qs-muted">
        Demo desk credentials are filled in. Continue to open Command.
      </p>
      <div className="mt-3 rounded-md border border-qs-border bg-qs-bg px-3 py-2 font-mono text-[12px]">
        <div className="flex items-center justify-between gap-3">
          <span className="text-qs-faint">Email</span>
          <span className="truncate text-qs-text">{initialEmail}</span>
        </div>
        <div className="mt-1 flex items-center justify-between gap-3">
          <span className="text-qs-faint">Password</span>
          <span className="text-qs-text">{initialPassword}</span>
        </div>
      </div>
      <label
        htmlFor="email"
        className="mt-4 block text-[11px] uppercase tracking-[0.14em] text-qs-faint"
      >
        Email
      </label>
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
      <label
        htmlFor="password"
        className="mt-3 block text-[11px] uppercase tracking-[0.14em] text-qs-faint"
      >
        Password
      </label>
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
      {error ? (
        <p className="mt-3 text-[13px] text-qs-danger">{error}</p>
      ) : null}
      <Button
        variant="primary"
        className="mt-4 w-full"
        size="lg"
        type="submit"
        disabled={pending}
      >
        {pending ? "Signing in…" : "Continue"}
      </Button>
    </form>
  );
}
