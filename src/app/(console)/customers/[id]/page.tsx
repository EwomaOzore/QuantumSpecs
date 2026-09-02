import { notFound } from "next/navigation";
import { PageSource } from "@/components/seo/page-source";
import { Badge, statusTone } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { RegionFlag } from "@/components/ui/region-flag";
import { formatMoney, formatRelative, formatUsd } from "@/lib/format";
import { getCustomer } from "@/lib/queries/customers";
import { pageMetadata } from "@/lib/site";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const data = await getCustomer(id);
  if (!data) return pageMetadata("/customers", { title: "Merchant not found" });
  return pageMetadata("/customers", {
    title: data.customer.name,
    description: `${data.customer.company} · ${data.customer.region.name} · ${data.customer.email}`,
    path: `/customers/${id}`,
  });
}

export default async function CustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getCustomer(id);
  if (!data) notFound();
  const { customer, transactions, failed, total } = data;

  return (
    <div className="px-6 py-5">
      <PageSource path="/customers" extra={{ label: customer.name }} className="mb-3 px-0 pt-0" />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-medium">{customer.name}</h1>
          <p className="mt-1 text-[13px] text-qs-muted">
            {customer.company} · {customer.email}
          </p>
        </div>
        <Badge tone={statusTone(customer.kycStatus)}>{customer.kycStatus}</Badge>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <Card className="px-4 py-3">
          <div className="text-[11px] uppercase tracking-[0.14em] text-qs-faint">Region</div>
          <div className="mt-1 text-[14px]">
            <RegionFlag code={customer.region.code} /> {customer.region.name} · {customer.region.currency}
          </div>
        </Card>
        <Card className="px-4 py-3">
          <div className="text-[11px] uppercase tracking-[0.14em] text-qs-faint">Monthly volume</div>
          <div className="mt-1 font-mono text-[16px]">{formatUsd(customer.monthlyVolumeUsd)}</div>
        </Card>
        <Card className="px-4 py-3">
          <div className="text-[11px] uppercase tracking-[0.14em] text-qs-faint">Risk score</div>
          <div className={`mt-1 font-mono text-[16px] ${customer.riskScore > 0.6 ? "text-qs-danger" : ""}`}>
            {(customer.riskScore * 100).toFixed(0)}
          </div>
        </Card>
        <Card className="px-4 py-3">
          <div className="text-[11px] uppercase tracking-[0.14em] text-qs-faint">Observed txns</div>
          <div className="mt-1 font-mono text-[16px]">
            {total} <span className="text-[12px] text-qs-muted">({failed} failed)</span>
          </div>
        </Card>
      </div>
      <Card className="mt-4">
        <CardHeader title="Recent checkouts" />
        <table className="w-full text-left text-[13px]">
          <thead className="text-[11px] uppercase tracking-wide text-qs-faint">
            <tr>
              <th className="px-4 py-2 font-medium">When</th>
              <th className="px-4 py-2 font-medium">Amount</th>
              <th className="px-4 py-2 font-medium">Provider</th>
              <th className="px-4 py-2 font-medium">Channel</th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-qs-border">
            {transactions.map((t) => (
              <tr key={t.id}>
                <td className="px-4 py-2 text-qs-muted">{formatRelative(t.createdAt)}</td>
                <td className="px-4 py-2 font-mono tabular">{formatMoney(t.amount, t.currency)}</td>
                <td className="px-4 py-2">{t.provider.name}</td>
                <td className="px-4 py-2 capitalize">{t.channel}</td>
                <td className="px-4 py-2">
                  <Badge tone={statusTone(t.status)}>{t.status}</Badge>
                  {t.errorCode ? <span className="ml-2 font-mono text-[11px] text-qs-faint">{t.errorCode}</span> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
