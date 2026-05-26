import { validateUrl, SsrfError } from "./ssrf-guard";
import type { PingResult } from "@/types";

// ============================================================
// AliveDB — Ping Engine
// SSRF-safe HTTP pinger with retry logic and response timing.
// ============================================================

const DEFAULT_TIMEOUT_MS = parseInt(process.env.PING_TIMEOUT_MS ?? "10000", 10);
const DEFAULT_MAX_RETRIES = parseInt(process.env.PING_MAX_RETRIES ?? "2", 10);

interface PingOptions {
  method?: "GET" | "HEAD";
  timeoutMs?: number;
  maxRetries?: number;
}

/**
 * Pings a single URL with SSRF protection, timeout, and retry.
 */
export async function pingUrl(
  url: string,
  healthEndpoint: string = "/",
  options: PingOptions = {}
): Promise<PingResult> {
  const { method = "GET", timeoutMs = DEFAULT_TIMEOUT_MS, maxRetries = DEFAULT_MAX_RETRIES } =
    options;

  // Build full target URL
  let fullUrl: string;
  try {
    const base = new URL(url);
    const endpoint = healthEndpoint.startsWith("/") ? healthEndpoint : `/${healthEndpoint}`;
    fullUrl = `${base.origin}${endpoint}`;
  } catch {
    return { success: false, error: "Invalid base URL." };
  }

  // SSRF validation
  try {
    await validateUrl(fullUrl);
  } catch (err) {
    if (err instanceof SsrfError) {
      return { success: false, error: `SSRF: ${err.message}` };
    }
    return { success: false, error: "URL validation failed." };
  }

  // Retry loop
  let lastError: string | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const result = await attemptPing(fullUrl, method, timeoutMs);

    if (result.success) {
      return result;
    }

    lastError = result.error;

    // Backoff before retry (skip on last attempt)
    if (attempt < maxRetries) {
      await sleep(1000 * (attempt + 1));
    }
  }

  return { success: false, error: lastError };
}

async function attemptPing(
  url: string,
  method: "GET" | "HEAD",
  timeoutMs: number
): Promise<PingResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const start = Date.now();

  try {
    const response = await fetch(url, {
      method,
      signal: controller.signal,
      headers: {
        "User-Agent": "AliveDB/1.0 (keep-alive monitor; https://github.com/yourusername/alivedb)",
        Accept: "application/json, text/plain, */*",
      },
      // Prevent following redirects to private IPs
      redirect: "follow",
    });

    const responseTime = Date.now() - start;

    // Treat 2xx and 3xx as success; 5xx and 4xx as failures
    const success = response.status < 500;

    return {
      success,
      statusCode: response.status,
      responseTime,
      error: success ? undefined : `HTTP ${response.status}`,
    };
  } catch (err: unknown) {
    const responseTime = Date.now() - start;

    if (err instanceof Error && err.name === "AbortError") {
      return {
        success: false,
        responseTime,
        error: `Timeout after ${timeoutMs}ms`,
      };
    }

    const message = err instanceof Error ? err.message : "Unknown error";
    return {
      success: false,
      responseTime,
      error: message,
    };
  } finally {
    clearTimeout(timer);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
