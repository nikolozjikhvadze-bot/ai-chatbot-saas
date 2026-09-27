import "server-only";
import { createHash } from "node:crypto";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const policies = {
  preflight: { limit: 120, window: "1 m" },
  publicChatIp: { limit: 60, window: "1 m" },
  publicChatVisitor: { limit: 12, window: "1 m" },
  publicChatBot: { limit: 300, window: "1 h" },
  relayClient: { limit: 20, window: "1 m" },
  relayIp: { limit: 60, window: "1 m" },
  relayBot: { limit: 500, window: "1 h" },
  aiAnalyzeHour: { limit: 3, window: "1 h" },
  aiAnalyzeDay: { limit: 10, window: "1 d" },
  projectChatMinute: { limit: 20, window: "1 m" },
  projectChatDay: { limit: 200, window: "1 d" },
  ingestHour: { limit: 3, window: "1 h" },
  ingestDay: { limit: 10, window: "1 d" },
  checkoutHour: { limit: 5, window: "1 h" },
  authenticatedRead: { limit: 90, window: "1 m" },
  authenticatedWrite: { limit: 30, window: "1 m" },
  accountWrite: { limit: 10, window: "1 h" },
  stripeWebhookIp: { limit: 300, window: "1 m" },
} as const;

export type RateLimitPolicy = keyof typeof policies;
export type RateLimitCheck = { policy: RateLimitPolicy; key: string };

let redis: Redis | undefined;
const limiters = new Map<RateLimitPolicy, Ratelimit>();
let outageLogged = false;

function getLimiter(policy: RateLimitPolicy): Ratelimit {
  let limiter = limiters.get(policy);
  if (!limiter) {
    redis ??= Redis.fromEnv();
    const { limit, window } = policies[policy];
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, window),
      analytics: false,
      prefix: `api:${policy}`,
    });
    limiters.set(policy, limiter);
  }
  return limiter;
}

/** Prefer headers set by the hosting proxy; never use this value as authentication. */
export function getClientIp(request: Request): string {
  const headers = request.headers;
  const ip =
    headers.get("x-real-ip") ??
    headers.get("cf-connecting-ip") ??
    headers.get("x-forwarded-for")?.split(",").at(-1)?.trim();
  return ip && ip.length <= 128 ? ip : "unknown";
}

export async function checkRateLimits(checks: RateLimitCheck[]) {
  try {
    for (const { policy, key } of checks) {
      const hashedKey = createHash("sha256").update(key).digest("hex");
      const result = await getLimiter(policy).limit(hashedKey);
      if (!result.success) {
        return {
          success: false,
          retryAfter: Math.max(1, Math.ceil((result.reset - Date.now()) / 1000)),
        };
      }
    }
    return { success: true, retryAfter: 0 };
  } catch (error) {
    // Fail closed: a Redis outage must not silently make paid endpoints unlimited.
    if (!outageLogged) {
      console.error("[rate-limit] Upstash unavailable; API requests are being denied", error);
      outageLogged = true;
    }
    return { success: false, retryAfter: 60 };
  }
}

export function rateLimitResponse(retryAfter: number, headers?: HeadersInit) {
  const responseHeaders = new Headers(headers);
  responseHeaders.set("Retry-After", String(retryAfter));
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    { status: 429, headers: responseHeaders },
  );
}