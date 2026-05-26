# Contributing to AliveDB

Thank you for your interest in contributing to AliveDB. This document outlines how to get started, our coding conventions, and the pull request process.

---

## Local Development Setup

**Prerequisites:**
- Node.js 20+
- npm 10+
- Git

```bash
# 1. Fork and clone
git clone https://github.com/yourusername/alivedb.git
cd alivedb

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env.local

# 4. Run database migrations
npm run db:migrate

# 5. Start development server
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

---

## Branch Naming

| Type | Pattern | Example |
|---|---|---|
| Feature | `feat/short-description` | `feat/custom-headers` |
| Bug fix | `fix/short-description` | `fix/ssrf-dns-check` |
| Docs | `docs/short-description` | `docs/vercel-guide` |
| Refactor | `refactor/short-description` | `refactor/ping-engine` |
| Chore | `chore/short-description` | `chore/update-deps` |

---

## Commit Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

[optional body]
[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
```
feat(ping): add support for custom request headers
fix(ssrf): resolve DNS rebinding vulnerability in IPv6
docs(readme): add Railway deployment guide
chore(deps): update prisma to 6.9.0
```

---

## Pull Request Workflow

1. **Create a branch** from `main` using the naming convention above
2. **Make your changes** — keep PRs focused and small
3. **Test your changes** locally
4. **Run type checks:** `npx tsc --noEmit`
5. **Open a PR** with a clear title and description
6. **Reference any related issues** using `Closes #123`
7. Wait for review — we aim to review within 3 business days

---

## Code Style

- **TypeScript strict mode** — All code must pass `tsc --noEmit` with zero errors
- **No `any` types** — Use proper TypeScript types throughout
- **Zod validation** — All API inputs must be validated with Zod schemas
- **Error handling** — Never silently swallow errors; log them appropriately
- **Comments** — Add JSDoc comments to exported functions
- **Imports** — Use `@/*` alias for `src/` imports

---

## Folder Structure

```
src/
├── app/            # Next.js pages and API routes
├── components/     # React components
│   ├── layout/     # Sidebar, header
│   ├── projects/   # Project-related components
│   ├── dashboard/  # Dashboard widgets
│   ├── analytics/  # Charts
│   └── ui/         # Generic UI primitives
├── lib/            # Core business logic (non-React)
└── types/          # Shared TypeScript interfaces
```

---

## Security Contributions

If you are fixing a security vulnerability, please follow the process in [SECURITY.md](./SECURITY.md) and do **not** open a public issue.

---

## License

By contributing to AliveDB, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
