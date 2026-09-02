import { Badge, statusTone } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { RegionFlag } from "@/components/ui/region-flag";
import { PROVIDERS, REGIONS, TENANT } from "@/lib/constants";
import { formatRelative } from "@/lib/format";
import { listNotifications, listRoutes, listTeam } from "@/lib/queries/ops";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [team, routes, notifications] = await Promise.all([
    listTeam(),
    listRoutes(),
    listNotifications(),
  ]);

  return (
    <div className="px-6 py-5">
      <h1 className="text-[18px] font-medium">Settings</h1>
      <p className="mt-1 text-[13px] text-qs-muted">
        {TENANT.legalName} · production
      </p>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Workspace" description="Tenant and environment" />
          <dl className="grid grid-cols-2 gap-3 px-4 py-3 text-[13px]">
            <div>
              <dt className="text-qs-faint">Tenant</dt>
              <dd>{TENANT.name}</dd>
            </div>
            <div>
              <dt className="text-qs-faint">Environment</dt>
              <dd>{TENANT.environment}</dd>
            </div>
            <div>
              <dt className="text-qs-faint">AI model</dt>
              <dd className="font-mono">{process.env.AI_MODEL ?? "gpt-4o"}</dd>
            </div>
            <div>
              <dt className="text-qs-faint">LLM key</dt>
              <dd>{process.env.OPENAI_API_KEY ? "configured" : "local analyst fallback"}</dd>
            </div>
          </dl>
        </Card>
        <Card>
          <CardHeader title="Regions" />
          <div className="divide-y divide-qs-border">
            {REGIONS.map((r) => (
              <div key={r.code} className="flex items-center justify-between px-4 py-2 text-[13px]">
                <span>
                  <RegionFlag code={r.code} /> {r.name}
                </span>
                <span className="font-mono text-qs-muted">
                  {r.currency} · {r.timezone}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader title="Payment routes" description="Disable from the analyst when a provider is burning" />
        <table className="w-full text-left text-[13px]">
          <thead className="text-[11px] uppercase tracking-wide text-qs-faint">
            <tr>
              <th className="px-4 py-2 font-medium">Provider</th>
              <th className="px-4 py-2 font-medium">Region</th>
              <th className="px-4 py-2 font-medium">Type</th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-qs-border">
            {routes.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-2">{r.provider?.name ?? r.providerId}</td>
                <td className="px-4 py-2">
                  <RegionFlag code={r.regionCode} /> {r.regionCode}
                </td>
                <td className="px-4 py-2 capitalize text-qs-muted">{r.provider?.type}</td>
                <td className="px-4 py-2">
                  <Badge tone={r.enabled ? "success" : "danger"}>{r.enabled ? "enabled" : "disabled"}</Badge>
                  {r.disabledReason ? (
                    <span className="ml-2 text-[11px] text-qs-faint">{r.disabledReason}</span>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Team" />
          <div className="divide-y divide-qs-border">
            {team.map((m) => (
              <div key={m.id} className="flex items-center justify-between px-4 py-2.5 text-[13px]">
                <div>
                  <div>{m.name}</div>
                  <div className="text-[11px] text-qs-faint">
                    {m.role} · {m.team}
                  </div>
                </div>
                <Badge tone={statusTone(m.status)}>{m.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title="Recent notifications" />
          {notifications.length === 0 ? (
            <p className="px-4 py-6 text-[13px] text-qs-muted">
              Inbox is empty. Pages from workflows and the analyst land here.
            </p>
          ) : (
            <div className="divide-y divide-qs-border">
              {notifications.map((n) => (
                <div key={n.id} className="px-4 py-2.5 text-[13px]">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{n.team}</span>
                    <Badge>{n.channel}</Badge>
                    <Badge tone={n.readAt ? "neutral" : "accent"}>{n.readAt ? "read" : "unread"}</Badge>
                    <span className="ml-auto text-[11px] text-qs-faint">{formatRelative(n.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-[12px] text-qs-muted">{n.message}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader title="Integrations" description="Payment providers and paging for this workspace" />
        <div className="grid gap-2 px-4 py-3 sm:grid-cols-3">
          {[...PROVIDERS.map((p) => p.name), "Slack", "PagerDuty", "Linear"].map((name) => (
            <div key={name} className="rounded-md border border-qs-border px-3 py-2 text-[13px]">
              {name}
              <div className="text-[11px] text-qs-faint">connected · sandbox</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
