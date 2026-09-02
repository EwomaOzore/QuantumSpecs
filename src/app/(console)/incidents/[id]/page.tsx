import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, severityTone, statusTone } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { formatStamp } from "@/lib/format";
import { getIncident } from "@/lib/queries/ops";

export const dynamic = "force-dynamic";

export default async function IncidentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const incident = await getIncident(id);
  if (!incident) notFound();

  return (
    <div className="px-6 py-5">
      <Link href="/incidents" className="text-[12px] text-qs-muted hover:text-qs-text">
        ← Incidents
      </Link>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-medium">{incident.title}</h1>
          <p className="mt-1 max-w-2xl text-[13px] text-qs-muted">{incident.summary}</p>
        </div>
        <div className="flex gap-1.5">
          <Badge tone={severityTone(incident.severity)}>{incident.severity}</Badge>
          <Badge tone={statusTone(incident.status)}>{incident.status}</Badge>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Card className="px-4 py-3 text-[13px]">
          <div className="text-[11px] uppercase tracking-[0.14em] text-qs-faint">Opened</div>
          <div className="mt-1">{formatStamp(incident.createdAt)}</div>
        </Card>
        <Card className="px-4 py-3 text-[13px]">
          <div className="text-[11px] uppercase tracking-[0.14em] text-qs-faint">Owner</div>
          <div className="mt-1">{incident.assignee ?? incident.createdBy}</div>
        </Card>
        <Card className="px-4 py-3 text-[13px]">
          <div className="text-[11px] uppercase tracking-[0.14em] text-qs-faint">Region</div>
          <div className="mt-1">{incident.region?.name ?? "Global"}</div>
        </Card>
      </div>
      <Card className="mt-4">
        <CardHeader title="Timeline" />
        <div className="px-4 py-3">
          <ol className="space-y-4">
            {incident.events.map((event) => (
              <li key={event.id} className="grid grid-cols-[140px_1fr] gap-4">
                <div className="font-mono text-[11px] text-qs-faint">{formatStamp(event.at)}</div>
                <div>
                  <div className="text-[12px] text-qs-muted">
                    {event.actor} · {event.kind}
                  </div>
                  <div className="mt-0.5 text-[13px]">{event.message}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Card>
    </div>
  );
}
