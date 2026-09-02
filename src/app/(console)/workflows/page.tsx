import { WorkflowsClient } from "@/components/workflows/workflows-client";
import { PageSource } from "@/components/seo/page-source";
import { pageMetadata } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata("/workflows");

export default function WorkflowsPage() {
  return (
    <>
      <PageSource path="/workflows" />
      <WorkflowsClient />
    </>
  );
}
