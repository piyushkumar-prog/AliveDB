-- AlterTable
-- How to run this migration:
--   Local development (SQLite): npm run db:migrate
--   Production (Turso):         npm run db:migrate:prod (requires DATABASE_URL and DATABASE_AUTH_TOKEN in .env.local)
ALTER TABLE "projects" ADD COLUMN "supabaseAnonKey" TEXT;
