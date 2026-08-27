import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

// Banco de testes isolado do dev.db usado em desenvolvimento/demonstração.
const TEST_DB_PATH = path.join(__dirname, "test.db");
const MIGRATION_SQL_PATH = path.join(
  __dirname,
  "..",
  "prisma",
  "migrations",
  "20260826225332_init",
  "migration.sql"
);

process.env.DATABASE_URL = `file:${TEST_DB_PATH}`;

if (fs.existsSync(TEST_DB_PATH)) {
  fs.unlinkSync(TEST_DB_PATH);
}

const db = new Database(TEST_DB_PATH);
db.exec(fs.readFileSync(MIGRATION_SQL_PATH, "utf-8"));
db.close();
