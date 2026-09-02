export function PageLoader({ label = "Loading Kora telemetry…" }: { label?: string }) {
  return (
    <div
      className="flex h-full min-h-[calc(100dvh-3rem)] w-full flex-col items-center justify-center gap-3"
      role="status"
      aria-live="polite"
    >
      <span className="relative inline-flex h-9 w-9" aria-hidden>
        <span className="absolute inset-0 rounded-full border border-qs-border" />
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-qs-accent" />
      </span>
      <span className="text-[12px] text-qs-faint">{label}</span>
    </div>
  );
}
