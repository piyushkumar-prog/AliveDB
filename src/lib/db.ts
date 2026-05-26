import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL ?? "";

  // Turso / LibSQL (production)
  if (databaseUrl.startsWith("libsql://") || databaseUrl.startsWith("wss://")) {
    const authToken = process.env.DATABASE_AUTH_TOKEN;
    const adapter = new PrismaLibSQL({
      url: databaseUrl,
      authToken,
    });
    return new PrismaClient({ adapter });
  }

  // SQLite file (local dev / Docker)
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}


// Singleton — prevent multiple Prisma instances during Next.js hot reload
const prisma = globalThis.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}

export { prisma };
export default prisma;
