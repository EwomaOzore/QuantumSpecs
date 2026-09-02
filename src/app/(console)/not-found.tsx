import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";

export const metadata: Metadata = {
  title: "Not found",
  description: "That Kora record is not in this QuantumSpecs workspace.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="px-6 py-10">
      <Breadcrumbs path="/incidents" extra={{ label: "Not found" }} />
      <h1 className="mt-3 text-[20px] font-medium">Record not found</h1>
      <p className="mt-2 max-w-xl text-[13px] text-qs-muted">
        That incident, merchant, or investigation is not in the Kora production workspace.
      </p>
      <nav aria-label="Related pages" className="mt-5 flex flex-wrap gap-4 text-[13px]">
        <Link href="/" className="text-qs-accent hover:underline">
          Command
        </Link>
        <Link href="/incidents" className="text-qs-accent hover:underline">
          Incidents
        </Link>
        <Link href="/customers" className="text-qs-accent hover:underline">
          Customers
        </Link>
        <Link href="/agent/runs" className="text-qs-accent hover:underline">
          Investigations
        </Link>
      </nav>
    </div>
  );
}
