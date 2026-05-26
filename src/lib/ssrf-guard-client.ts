// ============================================================
// AliveDB — SSRF Guard (Client-safe)
// Pure JavaScript — no Node.js dependencies. Safe for both
// client and server components.
// ============================================================

/**
 * RFC 1918 + special-purpose IP ranges that must be blocked.
 */
const BLOCKED_CIDRS = [
  /^127\./,
  /^::1$/,
  /^0\.0\.0\.0$/,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^fe80:/i,
  /^fc00:/i,
  /^fd[0-9a-f]{2}:/i,
  /^localhost$/i,
  /^.*\.localhost$/i,
  /^.*\.local$/i,
];

/**
 * Explicitly blocked hostnames (cloud metadata etc.)
 */
const BLOCKED_HOSTNAMES = new Set([
  "169.254.169.254",
  "metadata.google.internal",
  "metadata.google.com",
  "instance-data.ec2.internal",
  "169.254.170.2",
  "100.100.100.200",
]);

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

export class SsrfError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SsrfError";
  }
}

function isPrivateIp(ip: string): boolean {
  return BLOCKED_CIDRS.some((pattern) => pattern.test(ip));
}

/**
 * Synchronous URL validation — no DNS lookup.
 * Safe to use in client components and server components alike.
 */
export function validateUrlSync(rawUrl: string): { valid: boolean; error?: string } {
  let parsed: URL;

  try {
    parsed = new URL(rawUrl);
  } catch {
    return { valid: false, error: "Invalid URL format." };
  }

  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    return {
      valid: false,
      error: `Protocol '${parsed.protocol}' is not allowed. Use http:// or https://.`,
    };
  }

  const hostname = parsed.hostname.toLowerCase();

  if (BLOCKED_HOSTNAMES.has(hostname)) {
    return { valid: false, error: `Hostname '${hostname}' is not allowed.` };
  }

  if (isPrivateIp(hostname)) {
    return {
      valid: false,
      error: `'${hostname}' is a private/reserved address and cannot be used.`,
    };
  }

  return { valid: true };
}
