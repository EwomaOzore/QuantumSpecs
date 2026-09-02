import type { Metadata } from "next";
import Link from "next/link";
import { Mark } from "@/components/ui/mark";

export const metadata: Metadata = {
  title: "Page not found",
  description: "That QuantumSpecs route is not in this workspace.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-6 py-16">
      <Mark className="h-8 w-8 text-qs-accent" />
      <p className="mt-4 font-mono text-[12px] uppercase tracking-[0.16em] text-qs-faint">404</p>
      <h1 className="mt-2 text-[22px] font-medium">This desk has no such page</h1>
      <p className="mt-2 max-w-md text-center text-[13px] text-qs-muted">
        The route is missing, retired, or never existed. Jump back to a live ops view.
      </p>
      <nav aria-label="Recovery" className="mt-6 flex flex-wrap justify-center gap-3 text-[13px]">
        <Link href="/" className="text-qs-accent hover:underline">
          Command
        </Link>
        <Link href="/globe" className="text-qs-accent hover:underline">
          Globe
        </Link>
        <Link href="/incidents" className="text-qs-accent hover:underline">
          Incidents
        </Link>
        <Link href="/login" className="text-qs-muted hover:text-qs-text">
          Sign in
        </Link>
      </nav>
    </div>
  );
}
