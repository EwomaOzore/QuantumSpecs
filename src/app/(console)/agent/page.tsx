import { AgentWorkbench } from "@/components/agent/workbench";

export const dynamic = "force-dynamic";

export default async function AgentPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  return (
    <div>
      <div className="border-b border-qs-border px-6 py-4">
        <h1 className="text-[18px] font-medium">Operations analyst</h1>
        <p className="mt-1 text-[13px] text-qs-muted">
          The analyst queries Kora telemetry, then shows evidence and actions you can run.
        </p>
      </div>
      <AgentWorkbench initialQuery={q} />
    </div>
  );
}
