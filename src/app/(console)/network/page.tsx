import { OpsFilterBar } from "@/components/ops/filter-bar";
import { NetworkTable } from "@/components/ops/network-table";

export default function NetworkPage() {
  return (
    <div>
      <OpsFilterBar />
      <NetworkTable />
    </div>
  );
}
