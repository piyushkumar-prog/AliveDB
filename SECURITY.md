# Security Policy

## Supported Versions

| Version | Supported |
|---|---|
| 0.1.x | ✅ |

---

## Reporting Vulnerabilities

**Do not report security vulnerabilities through public GitHub issues.**

Please report security concerns privately using GitHub's Private Vulnerability Reporting feature: **https://github.com/piyushkumar-prog/AliveDB/security/advisories/new**

Include in your report:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested remediation (if known)

We aim to respond within **48 hours** and provide a fix within **7 days** for critical issues.

---

## SSRF Protection

AliveDB includes robust Server-Side Request Forgery (SSRF) protection because it makes outbound HTTP requests based on user-supplied URLs.

### What is blocked:

| Range | Description |
|---|---|
| `127.0.0.0/8` | IPv4 loopback |
| `::1` | IPv6 loopback |
| `10.0.0.0/8` | Private network (RFC 1918) |
| `172.16.0.0/12` | Private network (RFC 1918) |
| `192.168.0.0/16` | Private network (RFC 1918) |
| `169.254.0.0/16` | Link-local (cloud metadata) |
| `169.254.169.254` | AWS/GCP/Azure metadata endpoint |
| `metadata.google.internal` | GCP metadata hostname |
| `file://`, `ftp://` | Non-HTTP protocols |

### DNS rebinding protection:

AliveDB resolves the hostname via DNS before making the request and verifies that none of the resolved IP addresses fall within blocked ranges.

---

## Safe Self-Hosting Recommendations

1. **Change `CRON_SECRET`** — Generate a strong random secret:
   ```bash
   openssl rand -base64 32
   ```

2. **Never expose AliveDB to the public internet** — It is designed for trusted personal use. Deploy it behind authentication if you need multi-user access.

3. **Use HTTPS in production** — Always deploy behind a reverse proxy with TLS (Nginx, Caddy, Vercel, etc.)

4. **Keep dependencies updated** — Run `npm audit` regularly and update dependencies.

5. **Rotate secrets periodically** — Update `CRON_SECRET` and database credentials on a schedule.

6. **Limit network access** — If running in Docker, restrict outbound connections using firewall rules if possible.

---

## Responsible Disclosure

We follow a coordinated disclosure process:

1. Reporter submits vulnerability privately
2. We acknowledge within 48 hours
3. We investigate and develop a fix
4. We release a patch and credit the reporter (with permission)
5. Public disclosure after patch is released

Thank you for helping keep AliveDB and its users safe.
