import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Badge({
  className,
  tone = "neutral",
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "accent" | "danger" | "warning" | "success" | "info";
}) {
  const tones = {
    neutral: "bg-qs-elevated text-qs-muted border-qs-border",
    accent: "bg-[rgba(46,230,214,0.12)] text-qs-accent border-[rgba(46,230,214,0.25)]",
    danger: "bg-[rgba(240,113,120,0.12)] text-qs-danger border-[rgba(240,113,120,0.25)]",
    warning: "bg-[rgba(232,184,74,0.12)] text-qs-warning border-[rgba(232,184,74,0.25)]",
    success: "bg-[rgba(62,207,142,0.12)] text-qs-success border-[rgba(62,207,142,0.25)]",
    info: "bg-[rgba(107,164,248,0.12)] text-qs-info border-[rgba(107,164,248,0.25)]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[11px] font-medium tracking-wide",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

export function severityTone(severity: string) {
  if (severity === "sev1") return "danger" as const;
  if (severity === "sev2") return "warning" as const;
  if (severity === "sev3") return "info" as const;
  return "neutral" as const;
}

export function statusTone(status: string) {
  if (["open", "failed", "error", "rolled_back"].includes(status)) return "danger" as const;
  if (["investigating", "pending", "review", "suggested"].includes(status)) return "warning" as const;
  if (["resolved", "succeeded", "ok", "live", "verified", "sent"].includes(status))
    return "success" as const;
  if (["mitigated", "fired"].includes(status)) return "info" as const;
  return "neutral" as const;
}
