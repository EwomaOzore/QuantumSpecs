import Link from "next/link";
import { breadcrumbItems } from "@/lib/site";

export function Breadcrumbs({
  path,
  extra,
}: {
  path: string;
  extra?: { label: string; href?: string };
}) {
  const items = breadcrumbItems(path, extra);
  return (
    <nav aria-label="Breadcrumb" className="text-[12px] text-qs-faint">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.path}-${item.name}`} className="flex items-center gap-1">
              {index > 0 ? <span aria-hidden>/</span> : null}
              {last ? (
                <span className="text-qs-muted" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link href={item.path} className="hover:text-qs-text">
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
