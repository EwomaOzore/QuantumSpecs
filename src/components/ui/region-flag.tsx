const FLAGS: Record<string, string> = {
  NG: "🇳🇬",
  GH: "🇬🇭",
  KE: "🇰🇪",
  ZA: "🇿🇦",
  GB: "🇬🇧",
};

export function RegionFlag({ code, className }: { code: string; className?: string }) {
  return (
    <span className={className} title={code}>
      {FLAGS[code] ?? code}
    </span>
  );
}
