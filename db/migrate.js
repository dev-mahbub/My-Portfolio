/**
 * Run database migrations against the configured PostgreSQL instance.
 * Usage:  npm run db:migrate
 */

import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config({ path: ".env.local" });
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL || DATABASE_URL.includes("YOUR_PASSWORD")) {
  console.error(
    "\n❌ DATABASE_URL is not set. Please configure it in `.env.local`.\n" +
      "   Example: DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/portfolio_db\n",
  );
  process.exit(1);
}

// We connect to the default 'postgres' DB first to ensure the target DB exists.
function parseConn(url) {
  try {
    const u = new URL(DATABASE_URL);
    return {
      host: u.hostname,
      port: u.port || "5432",
      user: u.username,
      password: u.password,
      database: (u.pathname || "/postgres").replace(/^\//, ""),
    };
  } catch {
    return null;
  }
}

async function ensureDatabase() {
  const cfg = parseConn(DATABASE_URL);
  if (!cfg) throw new Error("Invalid DATABASE_URL");
  const targetDb = cfg.database;
  // connect to maintenance db
  const admin = new Pool({ ...cfg, database: "postgres" });
  try {
    const exists = await admin.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [targetDb],
    );
    if (exists.rowCount === 0) {
      await admin.query(`CREATE DATABASE "${targetDb}"`);
      console.log(`✅ Created database "${targetDb}"`);
    } else {
      console.log(`ℹ️  Database "${targetDb}" already exists`);
    }
  } finally {
    await admin.end();
  }
}

async function runMigrations() {
  const pool = new Pool({ connectionString: DATABASE_URL });
  const migrationsDir = path.join(process.cwd(), "db", "migrations");
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  console.log(`\n📦 Running ${files.length} migration(s)...\n`);
  for (const file of files) {
    const sqlPath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(sqlPath, "utf-8");
    try {
      await pool.query(sql);
      console.log(`✅ Applied: ${file}`);
    } catch (e) {
      console.error(`❌ Failed: ${file}\n   ${e.message}`);
      throw e;
    }
  }
  await pool.end();
}

async function main() {
  try {
    await ensureDatabase();
    await runMigrations();
    console.log("\n🎉 Migrations complete.\n");
    process.exit(0);
  } catch (e) {
    console.error("\n💥 Migration failed:", e.message, "\n");
    process.exit(1);
  }
}

main();
