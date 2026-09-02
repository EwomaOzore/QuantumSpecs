import Link from "next/link";
import { Badge, severityTone, statusTone } from "@/components/ui/badge";
import { RegionFlag } from "@/components/ui/region-flag";
import { formatRelative } from "@/lib/format";
import { listIncidents } from "@/lib/queries/ops";

export const dynamic = "force-dynamic";

export default async function IncidentsPage() {
  const incidents = await listIncidents();
  const open = incidents.filter((i) => i.status !== "resolved").length;

  return (
    <div className="px-6 py-5">
      <h1 className="text-[18px] font-medium">Incidents</h1>
      <p className="mt-1 text-[13px] text-qs-muted">
        {open} active · {incidents.length} in the last week. Create new ones from the analyst.
      </p>
      <div className="mt-4 overflow-hidden rounded-lg border border-qs-border">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-qs-bg-2 text-[11px] uppercase tracking-wide text-qs-faint">
            <tr>
              <th className="px-4 py-2 font-medium">Incident</th>
              <th className="px-4 py-2 font-medium">Severity</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Region</th>
              <th className="px-4 py-2 font-medium">Owner</th>
              <th className="px-4 py-2 font-medium">Opened</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-qs-border">
            {incidents.map((inc) => (
              <tr key={inc.id} className="hover:bg-qs-hover">
                <td className="px-4 py-2.5">
                  <Link href={`/incidents/${inc.id}`} className="hover:text-qs-accent">
                    {inc.title}
                  </Link>
                  <div className="mt-0.5 max-w-xl truncate text-[11px] text-qs-faint">{inc.summary}</div>
                </td>
                <td className="px-4 py-2.5">
                  <Badge tone={severityTone(inc.severity)}>{inc.severity}</Badge>
                </td>
                <td className="px-4 py-2.5">
                  <Badge tone={statusTone(inc.status)}>{inc.status}</Badge>
                </td>
                <td className="px-4 py-2.5">
                  {inc.region ? (
                    <>
                      <RegionFlag code={inc.region.code} /> {inc.region.code}
                    </>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-2.5 text-qs-muted">{inc.assignee ?? inc.createdBy}</td>
                <td className="px-4 py-2.5 text-qs-muted">{formatRelative(inc.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
