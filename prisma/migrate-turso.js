const { createClient } = require("@libsql/client");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

async function main() {
  // Load environment variables from .env.local and .env if present
  const dotenvFiles = [".env.local", ".env"];
  for (const file of dotenvFiles) {
    const envPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      content.split(/\r?\n/).forEach(line => {
        line = line.trim();
        if (!line || line.startsWith("#")) return;
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          let val = match[2].trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      });
    }
  }

  const url = process.env.DATABASE_URL;
  const authToken = process.env.DATABASE_AUTH_TOKEN;

  if (!url) {
    console.error("Error: DATABASE_URL is not set.");
    process.exit(1);
  }

  // Fallback to standard prisma migrate deploy if not a Turso/LibSQL URL
  if (!url.startsWith("libsql://") && !url.startsWith("wss://")) {
    console.log("DATABASE_URL is not a Turso/LibSQL URL. Falling back to prisma migrate deploy...");
    try {
      execSync("npx prisma migrate deploy", { stdio: "inherit" });
    } catch (err) {
      console.error("Prisma migrate deploy failed:", err);
      process.exit(1);
    }
    return;
  }

  const client = createClient({ url, authToken });

  // Create table to track applied migrations
  await client.execute(`
    CREATE TABLE IF NOT EXISTS _prisma_migrations_turso (
      id TEXT PRIMARY KEY,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Check if projects table already exists (for pre-existing databases)
  const projectsTableCheck = await client.execute(`
    SELECT name FROM sqlite_master WHERE type='table' AND name='projects'
  `);
  
  if (projectsTableCheck.rows.length > 0) {
    // If projects table exists, make sure initial migration is marked as applied
    await client.execute(`
      INSERT OR IGNORE INTO _prisma_migrations_turso (id) VALUES ('20250526000000_init')
    `);
  }

  // Get all migration directories
  const migrationsDir = path.join(__dirname, "migrations");
  if (!fs.existsSync(migrationsDir)) {
    console.log("No migrations found.");
    return;
  }

  const dirs = fs.readdirSync(migrationsDir)
    .filter(f => fs.statSync(path.join(migrationsDir, f)).isDirectory())
    .sort();

  for (const dir of dirs) {
    const migrationFile = path.join(migrationsDir, dir, "migration.sql");
    if (fs.existsSync(migrationFile)) {
      // Check if already applied
      const row = await client.execute({
        sql: "SELECT 1 FROM _prisma_migrations_turso WHERE id = ?",
        args: [dir]
      });

      if (row.rows.length === 0) {
        console.log(`Applying migration ${dir}...`);
        const sql = fs.readFileSync(migrationFile, "utf8");
        
        // Execute SQL statements
        await client.executeMultiple(sql);
        
        // Record as applied
        await client.execute({
          sql: "INSERT INTO _prisma_migrations_turso (id) VALUES (?)",
          args: [dir]
        });
        console.log(`Successfully applied ${dir}`);
      } else {
        console.log(`Migration ${dir} already applied.`);
      }
    }
  }

  console.log("All migrations checked and applied.");
  client.close();
}

main().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
