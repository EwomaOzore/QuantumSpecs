"use client";

import { Badge, severityTone, statusTone } from "@/components/ui/badge";
import { formatRelative } from "@/lib/format";
import { getOpsIncidents } from "@/lib/ops-network";
import { useOpsFilters } from "@/lib/use-ops-filters";

export function IncidentsBoard() {
  const { filters, hub } = useOpsFilters();
  const incidents = getOpsIncidents().filter((inc) => {
    if (filters.city && inc.citySlug !== filters.city) return false;
    if (filters.region && inc.regionSlug !== filters.region) return false;
    if (filters.status && inc.status !== filters.status) return false;
    if (filters.type && inc.type !== filters.type) return false;
    if (filters.q) {
      const q = filters.q.toLowerCase();
      if (!`${inc.title} ${inc.city} ${inc.country}`.toLowerCase().includes(q)) return false;
    }
    return true;
  });
  const open = incidents.filter((i) => i.status !== "resolved").length;

  return (
    <div className="px-6 py-5">
      <h1 className="text-[18px] font-medium">Incidents</h1>
      <p className="mt-1 text-[13px] text-qs-muted">
        {hub.name} · {open} active · {incidents.length} matching filters
      </p>
      <div className="mt-4 overflow-hidden rounded-lg border border-qs-border">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-qs-bg-2 text-[11px] uppercase tracking-wide text-qs-faint">
            <tr>
              <th className="px-4 py-2 font-medium">Incident</th>
              <th className="px-4 py-2 font-medium">Severity</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">City</th>
              <th className="px-4 py-2 font-medium">Type</th>
              <th className="px-4 py-2 font-medium">Owner</th>
              <th className="px-4 py-2 font-medium">Opened</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-qs-border">
            {incidents.slice(0, 80).map((inc) => (
              <tr key={inc.id} className="hover:bg-qs-hover">
                <td className="px-4 py-2.5">{inc.title}</td>
                <td className="px-4 py-2.5">
                  <Badge tone={severityTone(inc.severity)}>{inc.severity}</Badge>
                </td>
                <td className="px-4 py-2.5">
                  <Badge tone={statusTone(inc.status)}>{inc.status}</Badge>
                </td>
                <td className="px-4 py-2.5">{inc.city}</td>
                <td className="px-4 py-2.5 text-qs-muted">{inc.type}</td>
                <td className="px-4 py-2.5 text-qs-muted">{inc.owner}</td>
                <td className="px-4 py-2.5 text-qs-muted">{formatRelative(inc.openedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
