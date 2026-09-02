type Bucket = number[];

const windows = new Map<string, Bucket>();

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterMs: number;
};

export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()): RateLimitResult {
  const cutoff = now - windowMs;
  const stamps = (windows.get(key) ?? []).filter((t) => t > cutoff);
  if (stamps.length >= limit) {
    const retryAfterMs = stamps[0]! + windowMs - now;
    windows.set(key, stamps);
    return { ok: false, remaining: 0, retryAfterMs: Math.max(0, retryAfterMs) };
  }
  stamps.push(now);
  windows.set(key, stamps);
  return { ok: true, remaining: limit - stamps.length, retryAfterMs: 0 };
}

export function rateLimitResponse(result: RateLimitResult) {
  return Response.json(
    { error: "Too many requests", retryAfterMs: result.retryAfterMs },
    {
      status: 429,
      headers: { "Retry-After": String(Math.ceil(result.retryAfterMs / 1000) || 1) },
    },
  );
}

export function clientKey(request: Request, suffix: string, userId?: string) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
  return `${suffix}:${userId ?? ip}`;
}
