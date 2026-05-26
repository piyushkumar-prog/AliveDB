// ============================================================
// AliveDB — SSRF Guard (Server-only)
// DNS lookup requires Node.js runtime — never import this in client components.
// For client-side validation, use validateUrlSync from ssrf-guard-client.ts
// ============================================================

import { lookup } from "dns/promises";
import { validateUrlSync, SsrfError } from "./ssrf-guard-client";

export { SsrfError, validateUrlSync } from "./ssrf-guard-client";

/**
 * Full async URL validation with DNS resolution check.
 * Server-only — uses Node.js dns module.
 *
 * @throws {SsrfError} if URL is unsafe
 */
export async function validateUrl(rawUrl: string): Promise<URL> {
  // Run sync checks first (protocol, private IP blocklist)
  const syncResult = validateUrlSync(rawUrl);
  if (!syncResult.valid) {
    throw new SsrfError(syncResult.error ?? "URL validation failed.");
  }

  const parsed = new URL(rawUrl);
  const hostname = parsed.hostname.toLowerCase();

  // DNS resolution check — resolve and verify all IPs
  try {
    const addresses = await lookup(hostname, { all: true });
    for (const { address } of addresses) {
      const check = validateUrlSync(`http://${address}`);
      if (!check.valid) {
        throw new SsrfError(
          `Hostname '${hostname}' resolves to a blocked IP address '${address}'.`
        );
      }
    }
  } catch (err) {
    if (err instanceof SsrfError) throw err;
    // DNS lookup failure — let the ping engine handle actual connection errors
  }

  return parsed;
}
