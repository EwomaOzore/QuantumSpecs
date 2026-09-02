import { formatDistanceToNowStrict, format as formatDate } from "date-fns";
import { FX_TO_USD } from "./constants";

const numberFmt = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 });
const compactFmt = new Intl.NumberFormat("en-GB", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const usdFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const usdPrecise = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

export function formatInt(n: number) {
  return numberFmt.format(Math.round(n));
}

export function formatCompact(n: number) {
  return compactFmt.format(n);
}

export function formatUsd(n: number, precise = false) {
  return (precise ? usdPrecise : usdFmt).format(n);
}

export function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "NGN" ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency} ${formatInt(amount)}`;
  }
}

export function toUsd(amount: number, currency: string) {
  return amount * (FX_TO_USD[currency] ?? 1);
}

export function formatPercent(n: number, digits = 2) {
  return `${n.toFixed(digits)}%`;
}

export function formatLatency(ms: number) {
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`;
  return `${Math.round(ms)}ms`;
}

export function formatRelative(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNowStrict(d, { addSuffix: true });
}

export function formatUtc(date: Date | string, pattern = "HH:mm") {
  const d = typeof date === "string" ? new Date(date) : date;
  return `${formatDate(d, pattern)} UTC`;
}

export function formatStamp(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDate(d, "dd MMM yyyy HH:mm");
}

export function greeting(now = new Date()) {
  const h = now.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
