import { EvaluationClient } from "@/components/evaluation/evaluation-client";
import { PageSource } from "@/components/seo/page-source";
import { pageMetadata } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata("/evaluation");

export default function EvaluationPage() {
  return (
    <>
      <PageSource path="/evaluation" />
      <EvaluationClient />
    </>
  );
}
