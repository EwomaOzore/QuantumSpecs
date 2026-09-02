import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-lg border border-qs-border bg-qs-surface", className)}
      {...props}
    />
  );
}

export function CardHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-qs-border px-4 py-3">
      <div>
        <h2 className="text-[13px] font-medium text-qs-text">{title}</h2>
        {description ? <p className="mt-0.5 text-[12px] text-qs-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
