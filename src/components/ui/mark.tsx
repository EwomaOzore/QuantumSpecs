export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M7 15.5 L10 8.5 L12.2 13.2 L14 9.5 L17 15.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx="17" cy="7" r="1.15" fill="currentColor" />
    </svg>
  );
}
