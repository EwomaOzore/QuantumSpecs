import Link from "next/link";
import { PageSource } from "@/components/seo/page-source";
import { Badge, statusTone } from "@/components/ui/badge";
import { RegionFlag } from "@/components/ui/region-flag";
import { formatUsd } from "@/lib/format";
import { listCustomers } from "@/lib/queries/customers";
import { pageMetadata } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata("/customers");

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; region?: string; kyc?: string }>;
}) {
  const params = await searchParams;
  const customers = await listCustomers(params);

  return (
    <div className="px-6 py-5">
      <PageSource path="/customers" className="mb-3 px-0 pt-0" />
      <h1 className="text-[18px] font-medium">Customers</h1>
      <p className="mt-1 text-[13px] text-qs-muted">
        Kora merchants across NGN, GHS, KES, ZAR and GBP corridors.
      </p>
      <form className="mt-4 flex flex-wrap gap-2">
        <input
          name="q"
          defaultValue={params.q}
          placeholder="Search merchant"
          className="h-8 w-56 rounded-md border border-qs-border bg-qs-bg px-2.5 text-[13px]"
        />
        <select
          name="region"
          defaultValue={params.region ?? ""}
          className="h-8 rounded-md border border-qs-border bg-qs-bg px-2 text-[13px]"
        >
          <option value="">All regions</option>
          {["NG", "GH", "KE", "ZA", "GB"].map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          name="kyc"
          defaultValue={params.kyc ?? ""}
          className="h-8 rounded-md border border-qs-border bg-qs-bg px-2 text-[13px]"
        >
          <option value="">All KYC</option>
          <option value="verified">verified</option>
          <option value="pending">pending</option>
          <option value="review">review</option>
        </select>
        <button className="h-8 rounded-md border border-qs-border bg-qs-elevated px-3 text-[13px]" type="submit">
          Filter
        </button>
      </form>
      <div className="mt-4 overflow-hidden rounded-lg border border-qs-border">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-qs-bg-2 text-[11px] uppercase tracking-wide text-qs-faint">
            <tr>
              <th className="px-4 py-2 font-medium">Merchant</th>
              <th className="px-4 py-2 font-medium">Region</th>
              <th className="px-4 py-2 font-medium">Segment</th>
              <th className="px-4 py-2 font-medium">KYC</th>
              <th className="px-4 py-2 font-medium">Risk</th>
              <th className="px-4 py-2 font-medium">Volume / mo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-qs-border">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-qs-hover">
                <td className="px-4 py-2.5">
                  <Link href={`/customers/${c.id}`} className="text-qs-text hover:text-qs-accent">
                    {c.name}
                  </Link>
                  <div className="text-[11px] text-qs-faint">{c.email}</div>
                </td>
                <td className="px-4 py-2.5">
                  <RegionFlag code={c.region.code} /> {c.region.name}
                </td>
                <td className="px-4 py-2.5 capitalize text-qs-muted">{c.segment}</td>
                <td className="px-4 py-2.5">
                  <Badge tone={statusTone(c.kycStatus)}>{c.kycStatus}</Badge>
                </td>
                <td className="px-4 py-2.5 font-mono tabular">
                  <span className={c.riskScore > 0.6 ? "text-qs-danger" : "text-qs-muted"}>
                    {(c.riskScore * 100).toFixed(0)}
                  </span>
                </td>
                <td className="px-4 py-2.5 font-mono tabular">{formatUsd(c.monthlyVolumeUsd)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
