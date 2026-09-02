import { OpsFilterBar } from "@/components/ops/filter-bar";
import { IncidentsBoard } from "@/components/ops/incidents-board";

export const dynamic = "force-dynamic";

export default function IncidentsPage() {
  return (
    <div>
      <OpsFilterBar />
      <IncidentsBoard />
    </div>
  );
}
