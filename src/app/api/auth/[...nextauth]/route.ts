import { handlers } from "@/auth";
import { clientKey, rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const { GET } = handlers;

export async function POST(request: Request) {
  const limited = rateLimit(clientKey(request, "login"), 8, 15 * 60 * 1000);
  if (!limited.ok) return rateLimitResponse(limited);
  return handlers.POST(request);
}
