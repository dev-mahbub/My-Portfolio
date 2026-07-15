/**
 * Seed the database: admin user, portfolio content sections,
 * and a default ATS-friendly downloadable CV PDF.
 * Usage:  npm run db:seed   (run after db:migrate)
 *
 * Idempotent: re-running updates existing rows instead of duplicating.
 */

import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { Pool } from "pg";
import { buildAtsCvFromData } from "../lib/cvPdf.js";
import { SEED_DATA } from "../lib/seedData.js";

dotenv.config({ path: ".env.local" });
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL || DATABASE_URL.includes("YOUR_PASSWORD")) {
  console.error(
    "\n❌ DATABASE_URL is not set. Configure it in `.env.local` first.\n",
  );
  process.exit(1);
}

const ADMIN_USERNAME = process.env.SEED_ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "adminpass123";
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "mahbub.devs@gmail.com";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

async function upsertUser(pool) {
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const res = await pool.query(
    `INSERT INTO users (username, email, password_hash, role)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (username) DO UPDATE
       SET email = EXCLUDED.email,
           password_hash = EXCLUDED.password_hash
     RETURNING id, username`,
    [ADMIN_USERNAME, ADMIN_EMAIL, hash],
  );
  const u = res.rows[0];
  console.log(`✅ Admin user: ${u.username} (id=${u.id})`);
  return u;
}

async function upsertSection(pool, userId, section, value) {
  await pool.query(
    `INSERT INTO dashboard_content (section, value, updated_by)
     VALUES ($1, $2::jsonb, $3)
     ON CONFLICT (section) DO UPDATE
       SET value = EXCLUDED.value,
           updated_by = EXCLUDED.updated_by`,
    [section, JSON.stringify(value), userId],
  );
  console.log(`   • section '${section}' seeded`);
}

async function seedContent(pool, userId) {
  const sections = Object.entries(SEED_DATA);
  for (const [section, value] of sections) {
    await upsertSection(pool, userId, section, value);
  }
  console.log(`✅ Content sections: ${sections.length}`);
}

async function seedDefaultCvPdf(pool, userId, data) {
  if (!fs.existsSync(UPLOADS_DIR))
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });

  const pdfBytes = await buildAtsCvFromData(data);
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `cv-ats-${stamp}.pdf`;
  const dest = path.join(UPLOADS_DIR, filename);
  fs.writeFileSync(dest, Buffer.from(pdfBytes));

  // Deactivate previous active CVs of kind 'cv'
  await pool.query(
    `UPDATE public_files SET is_active = FALSE WHERE kind = 'cv'`,
  );

  const url = `/uploads/${filename}`;
  await pool.query(
    `INSERT INTO public_files
       (kind, filename, original_name, url, mime_type, size_bytes, is_active, uploaded_by)
     VALUES ('cv', $1, $2, $3, 'application/pdf', $4, TRUE, $5)`,
    [
      filename,
      `${data.profile?.name || "CV"} - ATS Resume.pdf`,
      url,
      pdfBytes.length,
      userId,
    ],
  );
  console.log(`✅ Default ATS-friendly CV PDF: ${url}`);
}

async function main() {
  const pool = new Pool({ connectionString: DATABASE_URL });
  try {
    console.log("\n🌱 Seeding database...\n");
    const user = await upsertUser(pool);
    await seedContent(pool, user.id);
    await seedDefaultCvPdf(pool, user.id, SEED_DATA);
    console.log("\n🎉 Seed complete.\n");
    console.log(
      `   Login: username='${ADMIN_USERNAME}'  password='********' (from .env.local)\n`,
    );
  } catch (e) {
    console.error("\n💥 Seed failed:", e.message, "\n");
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
