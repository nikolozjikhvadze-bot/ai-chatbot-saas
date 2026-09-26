import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const relayRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, "60 s"),
  analytics: true,
  prefix: "relay",
});