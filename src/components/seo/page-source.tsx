import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd } from "@/lib/site";

export function PageSource({
  path,
  extra,
  className = "px-6 pt-4",
}: {
  path: string;
  extra?: { label: string; href?: string };
  className?: string;
}) {
  return (
    <div className={className}>
      <JsonLd data={breadcrumbJsonLd(path, extra)} />
      <Breadcrumbs path={path} extra={extra} />
    </div>
  );
}
